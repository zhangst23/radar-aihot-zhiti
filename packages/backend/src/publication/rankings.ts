// 专题 · 亚马逊榜单的公开读取层：启用中的榜单和每个榜单的最新快照，附上一次快照的名次用于涨跌标记，
// 以及可供回看的历史日期。历史页按 (list_id, collected_on) 读同一张表，公开页只读。
import type { RankingsResponse, RankingItemSummary, RankingListSummary } from "@aihot/contracts/site";
import { sql } from "../db.ts";

interface ListRow {
  id: string;
  name: string;
  url: string;
}

interface ItemRow {
  list_id: string;
  day: string;
  rank: number;
  asin: string | null;
  title: string;
  url: string;
  price: string | null;
  rating: string | null;
  reviews: number | null;
  analysis: string | null;
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const isRankingDate = (value: string) => ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

/** 历史入口列出全部有快照的日期。 */

async function snapshot(listId: string, day?: string): Promise<{ day: string; rows: ItemRow[] } | null> {
  const picked = day
    ? [day]
    : await sql<{ day: string }[]>`
        SELECT to_char(max(collected_on), 'YYYY-MM-DD') AS day FROM ranking_items WHERE list_id = ${listId}`
        .then((rows) => rows.map((row) => row.day).filter(Boolean) as string[]);
  const current = picked[0];
  if (!current) return null;
  const rows = await sql<ItemRow[]>`
    SELECT list_id, to_char(collected_on, 'YYYY-MM-DD') AS day, rank, asin, title, url, price, rating, reviews, analysis
    FROM ranking_items WHERE list_id = ${listId} AND collected_on = ${current} ORDER BY rank`;
  // 早先采集的快照可能还没有分析（当时没开模型，或分析额度用在更早的一天）：同一种产品只要以后
  //（或以前）分析过，就复用最近的一次结论，不因为回看旧榜单再花一次模型调用。
  const missing = rows.filter((row) => !row.analysis && row.asin).map((row) => row.asin!);
  if (missing.length) {
    const known = await sql<{ asin: string; analysis: string }[]>`
      SELECT DISTINCT ON (asin) asin, analysis FROM ranking_items
      WHERE asin = ANY(${missing}::text[]) AND analysis IS NOT NULL
      ORDER BY asin, collected_on DESC`;
    const byAsin = new Map(known.map((row) => [row.asin, row.analysis]));
    for (const row of rows) if (!row.analysis && row.asin) row.analysis = byAsin.get(row.asin) ?? null;
  }
  return { day: current, rows };
}

/** The day before this snapshot for the same list (null when there is none). */
async function previousDay(listId: string, day: string): Promise<string | null> {
  const [row] = await sql<{ day: string | null }[]>`
    SELECT to_char(max(collected_on), 'YYYY-MM-DD') AS day FROM ranking_items
    WHERE list_id = ${listId} AND collected_on < ${day}`;
  return row?.day ?? null;
}

/** Snapshot days of a list, newest first, the newest one left out (it is the page's own list). */
async function historyOf(listId: string, latest: string): Promise<string[]> {
  const rows = await sql<{ day: string }[]>`
    SELECT DISTINCT to_char(collected_on, 'YYYY-MM-DD') AS day FROM ranking_items
    WHERE list_id = ${listId} AND collected_on < ${latest}
    ORDER BY day DESC`;
  return rows.map((row) => row.day);
}

function toSummary(list: ListRow, current: { day: string; rows: ItemRow[] }, previous: string[]): RankingListSummary {
  const rankOf = new Map<string, number>();
  for (const row of current.rows) rankOf.set(row.asin ?? row.url, row.rank);
  return {
    ...list,
    collectedOn: current.day,
    history: previous,
    items: current.rows.map((row): RankingItemSummary => ({
      rank: row.rank,
      previousRank: null,
      asin: row.asin,
      title: row.title,
      url: row.url,
      price: row.price,
      rating: row.rating,
      reviews: row.reviews,
      analysis: row.analysis,
    })),
  };
}

/** Every enabled list with its newest snapshot; a list without one yet comes back with no items. */
export async function loadRankings(): Promise<RankingsResponse> {
  const lists = await sql<ListRow[]>`SELECT id, name, url FROM ranking_lists WHERE enabled ORDER BY position, id`;
  const out: RankingListSummary[] = [];
  for (const list of lists) {
    const current = await snapshot(list.id);
    if (!current) {
      out.push({ ...list, collectedOn: null, history: [], items: [] });
      continue;
    }
    const before = await previousDay(list.id, current.day);
    const previous = before ? await snapshot(list.id, before) : null;
    const history = await historyOf(list.id, current.day);
    const once = toSummary(list, current, history);
    // 涨跌按上一次快照的同一 ASIN 名次算。
    const rankOf = new Map<string, number>();
    for (const row of previous?.rows ?? []) rankOf.set(row.asin ?? row.url, row.rank);
    out.push({ ...once, items: once.items.map((item) => ({ ...item, previousRank: rankOf.get(item.asin ?? item.url) ?? null })) });
  }
  return { lists: out };
}

/** One list's snapshot of one day, for the history page; null when that day has no snapshot. */
export async function loadRankingSnapshot(listId: string, date: string): Promise<RankingListSummary | null> {
  if (!isRankingDate(date)) return null;
  const [list] = await sql<ListRow[]>`SELECT id, name, url FROM ranking_lists WHERE id = ${listId}`;
  if (!list) return null;
  const current = await snapshot(list.id, date);
  if (!current || !current.rows.length) return null;
  const before = await previousDay(list.id, current.day);
  const previous = before ? await snapshot(list.id, before) : null;
  const rankOf = new Map<string, number>();
  for (const row of previous?.rows ?? []) rankOf.set(row.asin ?? row.url, row.rank);
  const once = toSummary(list, current, []);
  return { ...once, items: once.items.map((item) => ({ ...item, previousRank: rankOf.get(item.asin ?? item.url) ?? null })) };
}
