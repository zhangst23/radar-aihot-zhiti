// The home page's overview: every number and list comes from the public read layer at read time.
// There is no stored "pulse": a figure the database cannot support is left at zero, and a module with
// nothing to show renders its empty state rather than an example.
import type { HomeOverview, FeedItemSummary } from "@aihot/contracts/site";
import { beijingDate, beijingMidnight } from "@aihot/contracts/time";
import { TOPIC_TAGS } from "@aihot/industry/taxonomy";
import { sql } from "../db.ts";
import { ITEM_COLUMNS, ITEM_FROM, toFeedItemSummary, type ItemRow } from "./items.ts";
import { browsedCondition, seatedCondition } from "./scope.ts";
import { TOPICS } from "./topics.ts";
import { listEvents } from "./events.ts";

const DAY = 24 * 60 * 60 * 1000;
const TOPIC_TAG_NAMES = TOPIC_TAGS as unknown as string[];

/** A few recent reports under one predicate, one row per report, newest first. */
async function listFeed(where: ReturnType<typeof sql>, limit: number, now: Date): Promise<FeedItemSummary[]> {
  const rows = await sql<ItemRow[]>`
    WITH page AS (
      SELECT p.article_id FROM publications p
      WHERE ${where}
      ORDER BY p.timeline_at DESC, p.article_id DESC
      LIMIT ${limit})
    SELECT ${ITEM_COLUMNS} ${ITEM_FROM}
    WHERE p.article_id IN (SELECT article_id FROM page)
    ORDER BY p.timeline_at DESC, p.article_id DESC`;
  return rows.map(toFeedItemSummary);
}

export async function loadHomeOverview(now = new Date()): Promise<HomeOverview> {
  const today = beijingMidnight(beijingDate(now));
  const weekAgo = new Date(+now - 7 * DAY);
  const fortnightAgo = new Date(+now - 14 * DAY);
  const monthAgo = new Date(+now - 30 * DAY);
  const innovationCategories = ["natural", "food-additives", "functional", "cosmetic", "biotech"];
  const innovationTags = ["原料发布", "研究/临床", "合成生物", "精准发酵", "替代蛋白"];

  const [statsRow, breaking, regulatory, supply, innovation, companyRows, trendRows, events] = await Promise.all([
    sql<{ today: number; week: number; regulatory: number; supply: number; launches: number }[]>`
      SELECT
        count(*) FILTER (WHERE p.timeline_at >= ${today})::int AS today,
        count(*) FILTER (WHERE p.timeline_at >= ${weekAgo})::int AS week,
        count(*) FILTER (WHERE p.timeline_at >= ${weekAgo} AND p.category = 'regulatory')::int AS regulatory,
        count(*) FILTER (WHERE p.timeline_at >= ${weekAgo} AND p.category = 'supply')::int AS supply,
        count(*) FILTER (WHERE p.timeline_at >= ${weekAgo} AND p.tags @> ${["原料发布"]}::text[])::int AS launches
      FROM publications p WHERE ${browsedCondition(now)}`,
    listFeed(sql`${seatedCondition(now)}`, 6, now),
    listFeed(sql`${browsedCondition(now)} AND p.category = 'regulatory'`, 5, now),
    listFeed(sql`${browsedCondition(now)} AND p.category = 'supply'`, 5, now),
    listFeed(sql`${browsedCondition(now)} AND p.category = ANY(${innovationCategories}::text[])
      AND p.tags && ${innovationTags}::text[]`, 5, now),
    sql<{ tag: string; n: number; latest_title: string | null; latest_at: Date | null }[]>`
      SELECT t.tag, count(*)::int AS n,
        (array_agg(p.title ORDER BY p.timeline_at DESC))[1] AS latest_title,
        max(p.timeline_at) AS latest_at
      FROM publications p CROSS JOIN LATERAL unnest(p.tags) AS t(tag)
      WHERE ${browsedCondition(now)} AND p.timeline_at >= ${monthAgo} AND t.tag LIKE 'entity:%'
      GROUP BY t.tag ORDER BY n DESC, t.tag LIMIT 8`,
    sql<{ tag: string; recent: number; previous: number }[]>`
      SELECT t.tag,
        count(*) FILTER (WHERE p.timeline_at >= ${weekAgo})::int AS recent,
        count(*) FILTER (WHERE p.timeline_at >= ${fortnightAgo} AND p.timeline_at < ${weekAgo})::int AS previous
      FROM publications p CROSS JOIN LATERAL unnest(p.tags) AS t(tag)
      WHERE ${browsedCondition(now)} AND p.timeline_at >= ${fortnightAgo} AND t.tag = ANY(${TOPIC_TAG_NAMES}::text[])
      GROUP BY t.tag ORDER BY recent DESC, previous ASC, t.tag LIMIT 10`,
    Promise.resolve(listEvents({ scope: "upcoming" }, now)),
  ]);

  const stats = statsRow[0] ?? { today: 0, week: 0, regulatory: 0, supply: 0, launches: 0 };
  const companies = companyRows.flatMap((row) => {
    const id = row.tag.slice("entity:".length);
    const topic = TOPICS.find((t) => t.group === "company" && t.entityId === id);
    if (!topic) return [];
    return [{
      slug: topic.slug,
      name: topic.name,
      count: Number(row.n),
      latest: row.latest_title && row.latest_at ? { title: row.latest_title, at: row.latest_at.toISOString() } : null,
    }];
  }).slice(0, 6);

  return {
    stats: { ...stats, upcomingEvents: events.total },
    breaking,
    regulatory,
    supply,
    innovation,
    companies,
    trending: trendRows.filter((row) => row.recent > 0).map((row) => ({ tag: row.tag, recent: Number(row.recent), previous: Number(row.previous) })),
    events: events.events.slice(0, 4),
  };
}
