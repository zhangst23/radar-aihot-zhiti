// 亚马逊 Best Sellers 榜单的采集：每个榜单每天一个快照（ranking_items），列表定义在 ranking_lists。
// 和网页列表抓取（sources/listing-fetch.ts）一样走 guardedFetch：超时、体积上限、代理和一次重试都在那里；
// 这里只加浏览器请求头，尽量拿到正常页面而不是验证码页，拿不到就写 last_error，不动上一次的快照。
import { beijingDate } from "@aihot/contracts/time";
import { sql } from "../db.ts";
import { fetchListing } from "../sources/listing-fetch.ts";

export interface RankingItem {
  rank: number;
  asin: string | null;
  title: string;
  url: string;
  price: string | null;
  rating: string | null;
  reviews: number | null;
}

export interface RankingListRow {
  id: string;
  name: string;
  url: string;
  position: number;
  enabled: boolean;
  interval_minutes: number;
  last_fetched_at: string | null;
  last_error: string | null;
}

/** A desktop browser's: Amazon serves its bot check to the crawler UA the engine uses elsewhere. */
const BROWSER = {
  "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
  accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
  "accept-language": "en-US,en;q=0.9",
  "cache-control": "no-cache",
  "upgrade-insecure-requests": "1",
};

const ENTITIES: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", "#x27": "'", nbsp: " " };
const decode = (text: string) => text.replace(/&(#x?[0-9a-f]+|[a-z]+);/gi, (whole, code: string) => ENTITIES[code.toLowerCase()] ?? whole);
const plain = (html: string) => decode(html.replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();

const MAX_ITEMS = 100;

/** Whether the response is Amazon's robot check instead of the list. */
export const isBlockedPage = (html: string) => /Enter the characters you see below|api\/captcha|Robot Check|automated access to Amazon data/i.test(html);

/**
 * One Best Sellers page to items, newest markup first and older containers as a fallback. Ranks come from the
 * page's own badge (`#1`), else from the container order.
 */
export function parseBestSellers(html: string, base: string): RankingItem[] {
  const chunks = html.includes('id="gridItemRoot"')
    ? html.split('id="gridItemRoot"').slice(1)
    : html.split(/data-asin="/).slice(1);
  const items: RankingItem[] = [];
  const seen = new Set<string>();
  for (const chunk of chunks) {
    const asin = /^([A-Z0-9]{10})"/.exec(chunk)?.[1] ?? /data-asin="([A-Z0-9]{10})"/.exec(chunk)?.[1] ?? /\/dp\/([A-Z0-9]{10})/.exec(chunk)?.[1] ?? null;
    const anchor = /href="([^"]*\/dp\/[^"?]+)/.exec(chunk)?.[1];
    if (!anchor) continue;
    const title = plain(/<a[^>]*class="[^"]*a-link-normal[^"]*"[^>]*>([\s\S]{0,800}?)<\/a>/.exec(chunk)?.[1] ?? "")
      || decode(/<img[^>]*alt="([^"]{3,300})"/.exec(chunk)?.[1] ?? "");
    if (!title) continue;
    const key = asin ?? anchor;
    if (seen.has(key)) continue;
    seen.add(key);
    const rank = Number(/zg-bdg-text[^>]*>\s*#?(\d+)/.exec(chunk)?.[1]) || items.length + 1;
    const price = /<span class="a-offscreen">\s*([^<]{1,24}?)\s*<\/span>/.exec(chunk)?.[1] ?? /\$\s?[\d,]+(?:\.\d{2})?/.exec(chunk)?.[0] ?? null;
    const rating = /([\d.]+) out of 5 stars/.exec(chunk)?.[1] ?? null;
    const reviews = Number((/([\d,]+)\s*<\/span>\s*<\/a>/.exec(chunk)?.[1] ?? /([\d,]+)\s*ratings?/.exec(chunk)?.[1] ?? "").replace(/,/g, "")) || null;
    items.push({ rank, asin, title, url: new URL(anchor, base).toString().split("?")[0]!, price: price ? decode(price) : null, rating, reviews });
    if (items.length >= MAX_ITEMS) break;
  }
  return items.sort((a, b) => a.rank - b.rank).map((item, index) => ({ ...item, rank: index + 1 }));
}

/** Reads one list and stores today's snapshot; a failure keeps the previous one and records why. */
export async function collectRanking(list: RankingListRow, now = new Date()): Promise<{ saved: number; error: string | null }> {
  const day = beijingDate(now);
  try {
    const res = await fetchListing(list.url, { timeoutMs: 30_000, maxBytes: 8 * 1024 * 1024, headers: BROWSER });
    if (res.status !== 200) throw new Error(`HTTP ${res.status}`);
    const html = await res.text();
    if (isBlockedPage(html)) throw new Error("被反爬拦截（验证码页）");
    const items = parseBestSellers(html, list.url);
    if (!items.length) throw new Error("页面里解析不到条目（结构变化或被拦截）");
    await sql.begin(async (tx) => {
      await tx`DELETE FROM ranking_items WHERE list_id = ${list.id} AND collected_on = ${day}`;
      for (const item of items) {
        await tx`INSERT INTO ranking_items (list_id, collected_on, rank, asin, title, url, price, rating, reviews)
                 VALUES (${list.id}, ${day}, ${item.rank}, ${item.asin}, ${item.title}, ${item.url},
                         ${item.price}, ${item.rating}, ${item.reviews})`;
      }
    });
    await sql`UPDATE ranking_lists SET last_fetched_at = now(), last_error = null,
                     next_fetch_at = now() + (${list.interval_minutes} * interval '1 minute'), updated_at = now()
              WHERE id = ${list.id}`;
    return { saved: items.length, error: null };
  } catch (error) {
    const message = String((error as Error).message).slice(0, 300);
    // A blocked or broken page is retried in six hours rather than at the next daily slot.
    await sql`UPDATE ranking_lists SET last_error = ${message}, next_fetch_at = now() + interval '6 hours', updated_at = now()
              WHERE id = ${list.id}`;
    return { saved: 0, error: message };
  }
}

/** The lists whose interval is due, one after another with a pause so a batch does not look like a scrape. */
export async function collectDueRankings(now = new Date()): Promise<Array<{ id: string; saved: number; error: string | null }>> {
  const due = await sql<RankingListRow[]>`
    SELECT id, name, url, position, enabled, interval_minutes, last_fetched_at, last_error
    FROM ranking_lists WHERE enabled AND next_fetch_at <= now() ORDER BY position, id`;
  const results = [];
  for (const [index, list] of due.entries()) {
    if (index) await new Promise((resolve) => setTimeout(resolve, 2000 + Math.random() * 3000));
    results.push({ id: list.id, ...(await collectRanking(list, now)) });
  }
  return results;
}

export async function collectRankingById(id: string, now = new Date()) {
  const [list] = await sql<RankingListRow[]>`
    SELECT id, name, url, position, enabled, interval_minutes, last_fetched_at, last_error FROM ranking_lists WHERE id = ${id}`;
  return list ? collectRanking(list, now) : null;
}
