// 专题 · 亚马逊榜单的公开读取层：启用中的榜单和每个榜单的最新快照，附上一次快照的名次用于涨跌标记。
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
}

async function snapshot(listId: string, day?: string): Promise<{ day: string; rows: ItemRow[] } | null> {
  const picked = day
    ? [day]
    : await sql<{ day: string }[]>`SELECT to_char(max(collected_on), 'YYYY-MM-DD') AS day FROM ranking_items WHERE list_id = ${listId}`.then((rows) => rows.map((r) => r.day).filter(Boolean) as string[]);
  const current = picked[0];
  if (!current) return null;
  const rows = await sql<ItemRow[]>`
    SELECT list_id, to_char(collected_on, 'YYYY-MM-DD') AS day, rank, asin, title, url, price, rating, reviews
    FROM ranking_items WHERE list_id = ${listId} AND collected_on = ${current} ORDER BY rank`;
  return { day: current, rows };
}

/** The day before this snapshot for the same list (null when there is none). */
async function previousDay(listId: string, day: string): Promise<string | null> {
  const [row] = await sql<{ day: string | null }[]>`
    SELECT to_char(max(collected_on), 'YYYY-MM-DD') AS day FROM ranking_items
    WHERE list_id = ${listId} AND collected_on < ${day}`;
  return row?.day ?? null;
}

/** Every enabled list with its newest snapshot; a list without one yet comes back with no items. */
export async function loadRankings(): Promise<RankingsResponse> {
  const lists = await sql<ListRow[]>`SELECT id, name, url FROM ranking_lists WHERE enabled ORDER BY position, id`;
  const out: RankingListSummary[] = [];
  for (const list of lists) {
    const current = await snapshot(list.id);
    if (!current) {
      out.push({ ...list, collectedOn: null, items: [] });
      continue;
    }
    const before = await previousDay(list.id, current.day);
    const previous = before ? await snapshot(list.id, before) : null;
    const rankOf = new Map<string, number>();
    for (const row of previous?.rows ?? []) rankOf.set(row.asin ?? row.url, row.rank);
    const items = current.rows.map((row): RankingItemSummary => ({
      rank: row.rank,
      previousRank: rankOf.get(row.asin ?? row.url) ?? null,
      asin: row.asin,
      title: row.title,
      url: row.url,
      price: row.price,
      rating: row.rating,
      reviews: row.reviews,
    }));
    out.push({ ...list, collectedOn: current.day, items });
  }
  return { lists: out };
}
