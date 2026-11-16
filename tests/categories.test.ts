// Category pages: a second-level page is its first-level category plus one topic tag; counts follow the
// same listed scope as the list; a page past the end and an unknown category are 404; archives stay out
// of the index while their page 1 can be read.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { after, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { loadCategoryIndex, loadCategoryPage } from "@aihot/backend/publication/categories";
import { buildApp } from "../apps/api/src/app.ts";

const T = `category-${tag()}`;
const SOURCE = `src-${T}`;
const now = new Date("2099-01-01T04:00:00Z");
const id = (n: number) => `${T}-${n}`;

after(async () => { await closeDb(); });

async function add(n: number, options: { category: string; tags: string[]; age?: number; visibility?: string } = { category: "natural", tags: ["植物提取物"] }) {
  const at = new Date(+now - (options.age ?? n) * 60_000);
  await sql`INSERT INTO sources (id, name, kind, tier) VALUES (${SOURCE}, 'Category fixture', 'rss', 'T1')
    ON CONFLICT (id) DO NOTHING`;
  await sql`INSERT INTO articles (id, source_id, identity_key, url, title, discovered_at, timeline_at)
    VALUES (${id(n)}, ${SOURCE}, ${id(n)}, ${`https://example.org/${id(n)}`}, ${`Fixture ${n}`}, ${at}, ${at})`;
  await sql`INSERT INTO publications (article_id, title, source_id, channel, category, tags, url, discovered_at, timeline_at, sort_at,
      selected, eligible, visibility, visible_after, search_text, score)
    VALUES (${id(n)}, ${`Fixture ${n}`}, ${SOURCE}, 'news', ${options.category}, ${options.tags}, ${`https://example.org/${id(n)}`},
      ${at}, ${at}, ${at}, false, true, ${options.visibility ?? "public"}, ${at}, ${`fixture ${n}`}, 70)`;
}

test("a second-level page takes its category and tag, and nothing else", async () => {
  for (let n = 0; n < 42; n++) await add(n);
  await add(100, { category: "flavors", tags: ["植物提取物"], age: 1 });
  await add(101, { category: "natural", tags: ["精油"], age: 1 });
  await add(102, { category: "natural", tags: ["植物提取物"], age: 1, visibility: "withdrawn" });

  const first = (await loadCategoryPage("natural", "botanical-extracts", 1, now))!;
  assert.equal(first.subcategory?.tag, "植物提取物");
  assert.equal(first.items.length, 40);
  const firstIds = first.items.map((item) => item.id);
  for (let n = 0; n < 40; n++) assert.ok(firstIds.includes(id(n)), `page 1 holds ${n}`);
  assert.ok(!firstIds.includes(id(100)), "another category's same tag stays out");
  assert.ok(!firstIds.includes(id(101)), "another tag in the same category stays out");
  assert.ok(!firstIds.includes(id(102)), "a withdrawn report stays out");

  const second = (await loadCategoryPage("natural", "botanical-extracts", 2, now))!;
  const secondIds = second.items.map((item) => item.id);
  assert.ok(secondIds.includes(id(40)) && secondIds.includes(id(41)), "the rest is on page 2");

  // The first-level page still takes every tag of the category.
  const whole = (await loadCategoryPage("natural", null, 1, now))!;
  assert.ok(whole.items.some((item) => item.id === id(101)), "no tag filter on the category page");
  assert.ok(!whole.items.some((item) => item.id === id(100)), "another category stays out");

  const index = await loadCategoryIndex(now);
  const natural = index.categories.find((c) => c.key === "natural")!;
  const sub = natural.subcategories.find((s) => s.key === "botanical-extracts")!;
  assert.ok(sub.total >= 42);
  assert.equal(sub.indexable, true);
  assert.ok(natural.total >= 43, "the category counts every listed tag");
  assert.equal(natural.indexable, true);

  assert.equal(await loadCategoryPage("not-a-category", null, 1, now), null);
  assert.equal(await loadCategoryPage("natural", "not-a-sub", 1, now), null);
});

test("the category api rejects an unknown category and a page past the end", async () => {
  const app = await buildApp();
  try {
    const unknown = await app.inject({ method: "GET", url: "/api/site/categories/not-a-category" });
    assert.equal(unknown.statusCode, 400);
    const missing = await app.inject({ method: "GET", url: "/api/site/categories/natural/not-a-sub" });
    assert.equal(missing.statusCode, 404);
    const beyond = await app.inject({ method: "GET", url: "/api/site/categories/natural/page/49" });
    assert.equal(beyond.statusCode, 404);
    const index = await app.inject({ method: "GET", url: "/api/site/categories" });
    assert.equal(index.statusCode, 200);
    assert.ok((JSON.parse(index.body) as { categories: unknown[] }).categories.length >= 12);
  } finally {
    await app.close();
  }
});
