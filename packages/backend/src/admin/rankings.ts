// 后台维护“专题 · 亚马逊榜单”的榜单定义：增删改查、立即采集，每次改动写审计。
import { z } from "zod";
import { audit } from "../audit.ts";
import { sql } from "../db.ts";
import { collectRankingById } from "../rankings/collect.ts";

const fields = {
  name: z.string().trim().min(1).max(120),
  url: z.string().trim().url().max(500),
  position: z.number().int().min(0).max(999),
  enabled: z.boolean(),
  interval_minutes: z.number().int().min(60).max(10080),
};

const CREATE = z.object(fields).strict();
const PATCH = z.object(fields).partial().strict();

export interface AdminRankingRow {
  id: string;
  name: string;
  url: string;
  position: number;
  enabled: boolean;
  interval_minutes: number;
  last_fetched_at: string | null;
  last_error: string | null;
  collected_on: string | null;
  items: number;
}

export async function adminRankings(): Promise<AdminRankingRow[]> {
  return sql<AdminRankingRow[]>`
    SELECT l.id, l.name, l.url, l.position, l.enabled, l.interval_minutes,
           to_char(l.last_fetched_at, 'YYYY-MM-DD HH24:MI') AS last_fetched_at,
           l.last_error,
           (SELECT to_char(max(collected_on), 'YYYY-MM-DD') FROM ranking_items WHERE list_id = l.id) AS collected_on,
           (SELECT count(*)::int FROM ranking_items i WHERE i.list_id = l.id
              AND i.collected_on = (SELECT max(collected_on) FROM ranking_items WHERE list_id = l.id)) AS items
    FROM ranking_lists l ORDER BY l.position, l.id`;
}

export async function createRanking(input: unknown, actor: string): Promise<AdminRankingRow> {
  const v = CREATE.parse(input);
  const id = `rk-${crypto.randomUUID().slice(0, 8)}`;
  await sql`
    INSERT INTO ranking_lists (id, name, url, position, enabled, interval_minutes)
    VALUES (${id}, ${v.name}, ${v.url}, ${v.position}, ${v.enabled}, ${v.interval_minutes})`;
  await audit(actor, "ranking.create", `ranking:${id}`, null, null, { id, ...v });
  return (await adminRankings()).find((row) => row.id === id)!;
}

export async function updateRanking(id: string, input: unknown, actor: string): Promise<AdminRankingRow | null> {
  const patch = PATCH.parse(input);
  const before = (await adminRankings()).find((row) => row.id === id);
  if (!before) return null;
  const next = { ...before, ...patch };
  await sql`
    UPDATE ranking_lists SET name = ${next.name}, url = ${next.url}, position = ${next.position},
           enabled = ${next.enabled}, interval_minutes = ${next.interval_minutes}, updated_at = now()
    WHERE id = ${id}`;
  await audit(actor, "ranking.update", `ranking:${id}`, null, before, next);
  return (await adminRankings()).find((row) => row.id === id) ?? null;
}

export async function deleteRanking(id: string, actor: string): Promise<boolean> {
  const before = (await adminRankings()).find((row) => row.id === id);
  if (!before) return false;
  await sql`DELETE FROM ranking_lists WHERE id = ${id}`;
  await audit(actor, "ranking.delete", `ranking:${id}`, null, before, null);
  return true;
}

/** 立即采集一次（人工触发）：结果写回 last_error / last_fetched_at。 */
export async function collectRankingNow(id: string, actor: string) {
  const result = await collectRankingById(id);
  if (!result) return null;
  await audit(actor, "ranking.collect", `ranking:${id}`, null, null, result);
  return result;
}
