// The home page's overview: every figure comes from the listed scope at the given clock, an empty
// database shows zeros, and the trade-show calendar only knows the verified store.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { after, test } from "node:test";
import { REPO_ROOT } from "@aihot/backend/config";
import { closeDb, sql } from "@aihot/backend/db";
import { loadHomeOverview } from "@aihot/backend/publication/overview";
import { listEvents } from "@aihot/backend/publication/events";

const T = `overview-${tag()}`;
const SOURCE = `src-${T}`;
// Far enough ahead that the other test files' rows (published at the real clock) fall outside every
// seven- and thirty-day window, so the counts below are this fixture's alone.
const now = new Date("2027-06-01T04:00:00Z");
const at = (hours: number) => new Date(+now - hours * 60 * 60 * 1000);

after(async () => {
  await closeDb();
});

/** The calendar now lives in industry_events: seed it from the pack the way scripts/seed.ts does. */
async function seedEvents() {
  const { checkedAt, events } = JSON.parse(
    readFileSync(path.join(REPO_ROOT, "industry/events.json"), "utf8"),
  ) as {
    checkedAt?: string;
    events: Array<{
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
    }>;
  };
  for (const e of events) {
    await sql`INSERT INTO industry_events (id, name, starts_on, ends_on, city, country, venue, note, categories, website, source, checked_on)
      VALUES (${e.id}, ${e.name}, ${e.start}, ${e.end}, ${e.city}, ${e.country}, ${e.venue ?? null}, ${e.note ?? null},
              ${e.categories ?? []}, ${e.website}, ${e.source}, ${checkedAt ?? null})
      ON CONFLICT (id) DO NOTHING`;
  }
}

let n = 0;
async function add(
  hours: number,
  options: {
    category?: string;
    tags?: string[];
    selected?: boolean;
    seat?: boolean;
    score?: number;
    title?: string;
  } = {},
) {
  n += 1;
  const id = `${T}-${n}`;
  const time = at(hours);
  await sql`INSERT INTO sources (id, name, kind, tier) VALUES (${SOURCE}, 'Overview fixture', 'rss', 'T1')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO articles (id, source_id, identity_key, url, title, discovered_at, timeline_at)
    VALUES (${id}, ${SOURCE}, ${id}, ${`https://example.org/${id}`}, ${options.title ?? `Fixture ${n}`}, ${time}, ${time})`;
  await sql`INSERT INTO publications (article_id, title, source_id, channel, category, tags, url, discovered_at, timeline_at, sort_at,
      selected, seat, eligible, visibility, visible_after, search_text, score)
    VALUES (${id}, ${options.title ?? `Fixture ${n}`}, ${SOURCE}, 'news', ${options.category ?? "natural"}, ${options.tags ?? ["原料发布"]},
      ${`https://example.org/${id}`}, ${time}, ${time}, ${time}, ${options.selected ?? false}, ${options.seat ?? false}, true, 'public',
      ${time}, ${`fixture ${n}`}, ${options.score ?? 70})`;
  return id;
}

test("overview counts, lists and companies come from the listed scope", async () => {
  const breakingA = await add(1, {
    selected: true,
    seat: true,
    tags: ["原料发布", "植物提取物"],
    score: 88,
    title: "Givaudan 发布新提取物",
  });
  const breakingB = await add(2, {
    selected: true,
    seat: true,
    tags: ["原料发布", "植物提取物"],
    score: 75,
    title: "IFF 公布季度业绩",
  });
  const regulatory = await add(48, {
    category: "regulatory",
    tags: ["法规/批准", "新原料批准"],
  });
  const supply = await add(72, {
    category: "supply",
    tags: ["供应/价格", "价格行情"],
  });
  const innovation = await add(48, {
    category: "functional",
    tags: ["原料发布", "益生菌"],
  });
  await add(72, {
    category: "market",
    tags: ["企业动态", "entity:givaudan"],
    title: "Givaudan 收购原料业务",
  });
  await add(96, {
    category: "market",
    tags: ["企业动态", "entity:givaudan"],
    title: "Givaudan 扩建工厂",
  });
  // Last week's mention of the same ingredient, for the comparison count.
  await add(9 * 24, { category: "natural", tags: ["植物提取物"] });

  const data = await loadHomeOverview(now);
  assert.deepEqual(
    data.stats,
    {
      today: 2,
      week: 7,
      regulatory: 1,
      supply: 1,
      launches: 3,
      upcomingEvents: 6,
    },
    "today, the week, each category and the launch tag, with the verified calendar",
  );

  assert.deepEqual(
    data.breaking.slice(0, 2).map((item) => item.id),
    [breakingA, breakingB],
    "one card per fact, newest first",
  );
  assert.ok(data.regulatory.some((item) => item.id === regulatory));
  assert.ok(data.supply.some((item) => item.id === supply));
  assert.ok(data.innovation.some((item) => item.id === innovation));

  const givaudan = data.companies.find(
    (company) => company.slug === "givaudan",
  )!;
  assert.equal(givaudan.count, 2, "only this window's company mentions");
  assert.equal(givaudan.latest?.title, "Givaudan 收购原料业务");

  const botanical = data.trending.find((row) => row.tag === "植物提取物")!;
  assert.deepEqual(
    { recent: botanical.recent, previous: botanical.previous },
    { recent: 2, previous: 1 },
  );
});

test("the calendar filters by month, country, industry, name and status without inventing dates", async () => {
  await seedEvents();
  const upcoming = await listEvents({}, new Date("2026-11-16T04:00:00Z"));
  assert.equal(
    upcoming.events[0]?.id,
    "fi-europe-2026",
    "the soonest show first",
  );
  assert.equal(upcoming.events[0]?.start, "2026-11-17");
  assert.equal(upcoming.events[0]?.status, "upcoming");

  const april = await listEvents(
    { from: "2027-04-01", to: "2027-04-30" },
    new Date("2026-11-16T04:00:00Z"),
  );
  assert.deepEqual(
    april.events.map((event) => event.id),
    ["in-cosmetics-global-2027", "cphi-japan-2027", "cphi-middle-east-2027"],
  );

  const china = await listEvents(
    { country: "中国" },
    new Date("2026-11-16T04:00:00Z"),
  );
  assert.deepEqual(
    china.events.map((event) => event.id),
    ["cphi-china-2027", "hifi-asia-china-2027"],
  );

  const cosmetic = await listEvents(
    { category: "cosmetic" },
    new Date("2026-11-16T04:00:00Z"),
  );
  assert.equal(cosmetic.events.length, 4);

  const cphi = await listEvents(
    { q: "cphi" },
    new Date("2026-11-16T04:00:00Z"),
  );
  assert.deepEqual(
    cphi.events.map((event) => event.id),
    [
      "cphi-india-2026",
      "cphi-japan-2027",
      "cphi-middle-east-2027",
      "cphi-americas-2027",
      "cphi-china-2027",
    ],
  );

  const past = await listEvents(
    { scope: "past" },
    new Date("2027-12-31T04:00:00Z"),
  );
  assert.equal(past.events.length, 15);
  assert.equal(
    past.events[0]?.id,
    "in-cosmetics-asia-2027",
    "the most recently finished first",
  );

  assert.equal(
    (await listEvents({ q: "vitafoods" }, new Date("2026-11-16T04:00:00Z")))
      .events.length,
    0,
    "no entry without a verified date",
  );
  assert.ok(
    (await listEvents({}, new Date("2026-11-16T04:00:00Z"))).countries.includes(
      "中国",
    ),
  );

  // The store only holds dated, official entries: no approximate months, no missing site.
  for (const event of (
    await listEvents({ scope: "all" }, new Date("2026-11-16T04:00:00Z"))
  ).events) {
    assert.match(event.start, /^\d{4}-\d{2}-\d{2}$/);
    assert.match(event.end, /^\d{4}-\d{2}-\d{2}$/);
    assert.ok(event.end >= event.start, `${event.id}: end after start`);
    assert.match(event.website, /^https:\/\//, `${event.id}: official site`);
  }
});

test("a clock past every window gives zeros instead of example content", async () => {
  const empty = await loadHomeOverview(new Date("2099-01-01T04:00:00Z"));
  assert.deepEqual(empty.stats, {
    today: 0,
    week: 0,
    regulatory: 0,
    supply: 0,
    launches: 0,
    upcomingEvents: 0,
  });
  assert.deepEqual(empty.trending, []);
  assert.deepEqual(empty.companies, []);
});
