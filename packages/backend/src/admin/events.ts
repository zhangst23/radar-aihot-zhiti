// Admin edits of the trade-show calendar (专题 · 展会): every change is audited with the row before and after.
import { z } from "zod";
import { CATEGORY_KEYS, type CategoryKey } from "@aihot/contracts/taxonomy";
import { audit } from "../audit.ts";
import { sql } from "../db.ts";
import { isIsoDate, storedEvents, type StoredEvent } from "../publication/events.ts";

const date = z.string().trim().refine(isIsoDate, "日期须为 YYYY-MM-DD");
const fields = {
  name: z.string().trim().min(1).max(200),
  start: date,
  end: date,
  city: z.string().trim().min(1).max(100),
  country: z.string().trim().min(1).max(100),
  venue: z.string().trim().max(200).nullable(),
  note: z.string().trim().max(500).nullable(),
  categories: z.array(z.enum(CATEGORY_KEYS as unknown as [string, ...string[]])).max(14).transform((list) => list as CategoryKey[]),
  website: z.string().trim().url().max(500),
  source: z.string().trim().url().max(500),
  checkedAt: date.nullable(),
};

const CREATE = z.object(fields).strict();
const PATCH = z.object(fields).partial().strict();

const ordered = (start: string, end: string) => {
  if (end < start) throw Object.assign(new Error("结束日期不能早于开始日期"), { statusCode: 400 });
  return { start, end };
};

export async function adminEvents(): Promise<StoredEvent[]> {
  return storedEvents();
}

export async function createEvent(input: unknown, actor: string): Promise<StoredEvent> {
  const v = CREATE.parse(input);
  ordered(v.start, v.end);
  const id = `evt-${crypto.randomUUID().slice(0, 8)}`;
  await sql`
    INSERT INTO industry_events (id, name, starts_on, ends_on, city, country, venue, note, categories, website, source, checked_on)
    VALUES (${id}, ${v.name}, ${v.start}, ${v.end}, ${v.city}, ${v.country}, ${v.venue}, ${v.note}, ${v.categories},
            ${v.website}, ${v.source}, ${v.checkedAt})`;
  const created = { id, ...v } satisfies StoredEvent;
  await audit(actor, "event.create", `event:${id}`, null, null, created);
  return created;
}

export async function updateEvent(id: string, input: unknown, actor: string): Promise<StoredEvent | null> {
  const patch = PATCH.parse(input);
  const before = (await storedEvents()).find((event) => event.id === id);
  if (!before) return null;
  const next: StoredEvent = { ...before, ...patch };
  ordered(next.start, next.end);
  await sql`
    UPDATE industry_events SET name = ${next.name}, starts_on = ${next.start}, ends_on = ${next.end}, city = ${next.city},
           country = ${next.country}, venue = ${next.venue}, note = ${next.note}, categories = ${next.categories},
           website = ${next.website}, source = ${next.source}, checked_on = ${next.checkedAt}, updated_at = now()
    WHERE id = ${id}`;
  await audit(actor, "event.update", `event:${id}`, null, before, next);
  return next;
}

export async function deleteEvent(id: string, actor: string): Promise<boolean> {
  const before = (await storedEvents()).find((event) => event.id === id);
  if (!before) return false;
  await sql`DELETE FROM industry_events WHERE id = ${id}`;
  await audit(actor, "event.delete", `event:${id}`, null, before, null);
  return true;
}
