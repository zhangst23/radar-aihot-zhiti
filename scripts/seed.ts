// Seeds a fresh site from the industry pack: the demo sources (industry/sources.json) and the trade-show
// calendar (industry/events.json), only the rows not there yet, so admin edits are never undone. Topics need
// no seeding: they are read from industry/topics.json.
// Re-runnable:  node --env-file=.env scripts/seed.ts
import { readFileSync } from "node:fs";
import path from "node:path";
import { REPO_ROOT } from "@aihot/backend/config";
import { closeDb, sql } from "@aihot/backend/db";
import { assertSupportedConfig } from "@aihot/backend/sources/config-keys";

interface SeedSource {
  id: string;
  name: string;
  kind:
    "rss" | "web_list" | "json_list" | "x_search" | "mp_account" | "external";
  config: Record<string, unknown>;
  tier?: string;
  owner_entity_id?: string | null;
  participation_mode?: string;
  interval_minutes?: number;
  tags?: string[];
  site_fulltext?: boolean;
  syndicate_fulltext?: boolean;
  enabled?: boolean;
}

interface SeedEvent {
  id: string;
  name: string;
  start: string;
  end: string;
  city: string;
  country: string;
  venue?: string | null;
  note?: string | null;
  categories?: string[];
  website: string;
  source: string;
}

const { sources } = JSON.parse(
  readFileSync(path.join(REPO_ROOT, "industry/sources.json"), "utf8"),
) as { sources: SeedSource[] };
let added = 0;
for (const s of sources) {
  assertSupportedConfig(s.kind, s.config);
  const tier = s.tier ?? "T2";
  // First-party means a T1 source, as the admin sets it.
  const inserted = await sql`
    INSERT INTO sources (id, name, kind, config, tier, first_party, owner_entity_id, participation_mode, interval_minutes, tags, site_fulltext, syndicate_fulltext, enabled, next_fetch_at)
    VALUES (${s.id}, ${s.name}, ${s.kind}, ${sql.json(s.config as never)}, ${tier}, ${tier === "T1"}, ${s.owner_entity_id ?? null},
            ${s.participation_mode ?? "editorial"}, ${s.interval_minutes ?? 60}, ${s.tags ?? []}, ${s.site_fulltext ?? false}, ${s.syndicate_fulltext ?? false},
            ${s.enabled ?? true}, now())
    ON CONFLICT (id) DO NOTHING RETURNING id`;
  added += inserted.length;
}
console.log(`sources: ${added} added, ${sources.length - added} already there`);

const { checkedAt, events } = JSON.parse(
  readFileSync(path.join(REPO_ROOT, "industry/events.json"), "utf8"),
) as {
  checkedAt?: string;
  events: SeedEvent[];
};
let addedEvents = 0;
for (const e of events) {
  const inserted = await sql`
    INSERT INTO industry_events (id, name, starts_on, ends_on, city, country, venue, note, categories, website, source, checked_on)
    VALUES (${e.id}, ${e.name}, ${e.start}, ${e.end}, ${e.city}, ${e.country}, ${e.venue ?? null}, ${e.note ?? null},
            ${e.categories ?? []}, ${e.website}, ${e.source}, ${checkedAt ?? null})
    ON CONFLICT (id) DO NOTHING RETURNING id`;
  addedEvents += inserted.length;
}
console.log(
  `events: ${addedEvents} added, ${events.length - addedEvents} already there`,
);
await closeDb();
