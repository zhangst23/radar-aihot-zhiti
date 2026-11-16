// Topic pages: which articles a topic takes, and their counts.
// Written before the code, from the ways it can go wrong:
// - a company topic takes an article about another company that only mentions it (several subjects,
//   its name nowhere in the title), or drops one about it whose title names it in English, in another
//   case, next to Chinese text, or only by a product (it is the article's only subject);
// - a Latin name matches inside another word ("DIFFERENT" is not IFF); a headline naming a company
//   that is not a subject of the article gets in;
// - a technical-direction topic stops taking its tags;
// - withdrawn or not yet released articles appear in a list or a count;
// - an article or story page names a topic its reports do not belong to;
// - an article page cannot tell which of its tags are a topic's own, so they link to filtered lists;
// - a topic without content has no page, or an unknown slug or a page past the end has one.
import { tag } from "./setup.ts";
import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { after, before, test } from "node:test";
import { closeDb, sql } from "@aihot/backend/db";
import { upsertMaterial } from "@aihot/backend/content/materials";
import { stopBoss } from "@aihot/backend/jobs/queue";
import { publishArticle } from "@aihot/backend/publication/publish";
import { TOPICS, loadTopicPage, listTopicSummaries, topicsOfStory } from "@aihot/backend/publication/topics";
import { buildApp } from "../apps/api/src/app.ts";

const T = tag();
const OFFICIAL = `test-topics-official-${T}`;
const MEDIA = `test-topics-media-${T}`;
const app = await buildApp();

before(async () => {
  await sql`INSERT INTO sources (id, name, kind, tier, participation_mode, first_party, next_fetch_at) VALUES
    (${OFFICIAL}, 'Official', 'rss', 'T1', 'editorial', true, '2100-01-01'),
    (${MEDIA}, 'Media', 'rss', 'T2', 'editorial', false, '2100-01-01')`;
});
after(async () => {
  await app.close();
  await stopBoss();
  await closeDb();
});

let n = 0;
interface Report {
  source?: string;
  at: Date;
  title: string;
  originalTitle?: string;
  subjects?: string[];
  tags?: string[];
  score?: number;
  selected?: boolean;
  fact?: number;
  category?: string;
}

/** The first tag of a category, as the structure step writes it. */
const CATEGORY_TAG: Record<string, string> = {
  regulatory: "法规/批准",
  supply: "供应/价格",
  market: "企业动态",
  natural: "原料发布",
  cosmetic: "原料发布",
  pharma: "原料发布",
  research: "研究/临床",
  events: "展会/活动",
};

/** A published report; `fact` links it to a fact before publishing, as grouping would. */
async function report(r: Report): Promise<string> {
  n += 1;
  const { articleId } = await upsertMaterial({
    sourceId: r.source ?? MEDIA, url: `https://example.com/topics-${T}-${n}`, title: r.originalTitle ?? r.title, bodyText: "body", bodyHtml: "<p>body</p>", bodyStatus: "ok", via: "fetch", publishedAt: r.at,
  });
  await sql`UPDATE articles SET discovered_at = ${r.at}, timeline_at = ${r.at}, grouped_at = now() WHERE id = ${articleId}`;
  const category = r.category ?? "regulatory";
  await sql`INSERT INTO analyses (article_id, input_revision, origin, relevance, category, title_zh, summary_zh, score, selected, subjects, tags)
            VALUES (${articleId}, 1, 'rule', 'pass', ${category}, ${r.title}, ${`摘要 ${n}`}, ${r.score ?? 80}, ${r.selected ?? true}, ${r.subjects ?? []}, ${[CATEGORY_TAG[category], ...(r.tags ?? [])]})`;
  if (r.fact) await sql`INSERT INTO fact_articles (fact_id, article_id, role) VALUES (${r.fact}, ${articleId}, 'report')`;
  await publishArticle(articleId, { releasedAt: new Date(r.at.getTime() + 60_000) });
  return articleId;
}

async function story(title: string): Promise<{ id: number; publicId: string }> {
  const publicId = randomUUID();
  const [s] = await sql<{ id: number }[]>`INSERT INTO stories (public_id, title, first_report_at, latest_at) VALUES (${publicId}, ${title}, now(), now()) RETURNING id`;
  return { id: s!.id, publicId };
}

async function fact(storyId: number | null, title: string): Promise<number> {
  const [f] = await sql<{ id: number }[]>`INSERT INTO facts (public_id, story_id, title) VALUES (${`f-${T}-${randomUUID()}`}, ${storyId}, ${title}) RETURNING id`;
  return f!.id;
}

const hoursAgo = (h: number) => new Date(Date.now() - h * 3600_000);
const ids = (items: Array<{ id: string }>) => items.map((i) => i.id);
const page = async (slug: string, p = 1) => {
  const data = await loadTopicPage(slug, p, new Date());
  assert.ok(data, `${slug} page ${p}`);
  return data;
};
/** Every article of a topic, over all its pages. */
async function members(slug: string): Promise<string[]> {
  const first = await page(slug);
  const out = ids(first.items);
  for (let p = 2; p <= first.pageCount; p++) out.push(...ids((await page(slug, p)).items));
  return out;
}

test("a company topic takes the articles about it, not the ones that only mention it", async () => {
  const about = await report({ at: hoursAgo(30), title: `Givaudan 推出新提取物 ${T}`, subjects: ["givaudan"] });
  const product = await report({ at: hoursAgo(31), title: `NovaSOL 新版上线 ${T}`, subjects: ["givaudan"] });
  const english = await report({ at: hoursAgo(32), title: `新原料发布 ${T}`, originalTitle: `Givaudan launches an extract ${T}`, subjects: ["givaudan", "iff"] });
  const subpoena = await report({ at: hoursAgo(33), title: `欧盟委员会向 Symrise 发出问询 ${T}`, subjects: ["symrise", "givaudan", "basf"] });
  const lowerCase = await report({ at: hoursAgo(34), title: `givaudan 公布新的合规框架 ${T}`, subjects: ["givaudan", "basf"] });
  const pact = await report({ at: hoursAgo(35), title: `二十余家香料企业签署可持续协议 ${T}`, subjects: ["iff", "givaudan", "basf"] });
  const metadata = await report({ at: hoursAgo(36), title: `DIFFERENT 标准发布，Symrise 参与 ${T}`, subjects: ["iff", "givaudan"] });
  const adjacent = await report({ at: hoursAgo(37), title: `发布IFF的新原料 ${T}`, subjects: ["iff", "givaudan"] });
  const headline = await report({ at: hoursAgo(38), title: `Givaudan 被一篇盘点提到 ${T}`, subjects: ["basf"] });
  const botanical = await report({ at: hoursAgo(39), title: `植物提取物新品发布 ${T}`, tags: ["植物提取物"] });

  const givaudan = await members("givaudan");
  for (const id of [about, product, english, lowerCase]) assert.ok(givaudan.includes(id), "about Givaudan");
  for (const id of [subpoena, pact, metadata, headline, adjacent]) assert.ok(!givaudan.includes(id), "only mentions Givaudan");
  const symrise = await members("symrise");
  assert.ok(symrise.includes(subpoena), "Symrise named in the title");
  for (const id of [english, pact]) assert.ok(!symrise.includes(id), "only mentions Symrise");
  const iff = await members("iff");
  assert.ok(iff.includes(adjacent), "IFF next to Chinese text");
  assert.ok(!iff.includes(metadata), "DIFFERENT is not IFF");
  for (const id of [english, pact]) assert.ok(!iff.includes(id), "only mentions IFF");
  assert.ok((await members("botanical-extracts")).includes(botanical), "a field topic takes its tag");

  // The article page names the topics it belongs to.
  const topicsOf = async (id: string) => {
    const res = await app.inject({ method: "GET", url: `/api/site/items/${id}` });
    return (JSON.parse(res.body) as { topics: Array<{ slug: string }> }).topics.map((t) => t.slug);
  };
  assert.deepEqual(await topicsOf(about), ["givaudan", "regulation"]);
  assert.deepEqual(await topicsOf(subpoena), ["symrise", "regulation"]);
  assert.deepEqual(await topicsOf(pact), ["regulation"]);
  assert.deepEqual(await topicsOf(botanical), ["botanical-extracts", "regulation"]);
});

test("an article page says which of its tags are a topic's own", async () => {
  // A field's or a form's tags, and the tag cards show for a company (its subject tag is never shown).
  const id = await report({ at: hoursAgo(3), title: `Givaudan 推出植物提取物 ${T}`, subjects: ["givaudan", "iff"], tags: ["植物提取物", "企业动态", "Givaudan", "IFF", "提取物"] });
  const res = await app.inject({ method: "GET", url: `/api/site/items/${id}` });
  const body = JSON.parse(res.body) as { tags: string[]; tagTopics: Record<string, string>; topics: Array<{ slug: string }> };
  assert.deepEqual(body.tags, ["法规/批准", "植物提取物", "企业动态", "Givaudan", "IFF", "提取物"]);
  assert.deepEqual(body.tagTopics, { "法规/批准": "regulation", "植物提取物": "botanical-extracts", 企业动态: "company-news", Givaudan: "givaudan", IFF: "iff" });
  // The company its title does not name is a topic of the tag, not of the article.
  assert.deepEqual(body.topics.map((t) => t.slug), ["givaudan", "botanical-extracts", "regulation", "company-news"]);
});

test("renaming a company topic keeps its old full name usable for search", async () => {
  const id = await report({ at: hoursAgo(2), title: `NovaSOL 新配方上线 ${T}`, subjects: ["givaudan"], selected: false });
  for (const query of ["Givaudan 奇华顿", "奇华顿"]) {
    const res = await app.inject({ method: "GET", url: `/api/site/pool?q=${encodeURIComponent(query)}` });
    assert.equal(res.statusCode, 200);
    assert.ok(ids(JSON.parse(res.body).items).includes(id), "full company names must still find subject-tagged reports");
  }
});

test("a story page names the topics of its reports", async () => {
  const launch = await story(`植物提取物新规格发布 ${T}`);
  await report({ source: OFFICIAL, at: hoursAgo(26), title: `植物提取物新规格发布 ${T}`, tags: ["植物提取物"], fact: await fact(launch.id, "发布新规格") });
  assert.deepEqual(await topicsOfStory(launch.id), [{ slug: "botanical-extracts", name: "植物提取物" }, { slug: "regulation", name: "法规与批准" }]);
});

test("withdrawn articles stay out of lists and counts", async () => {
  const kept = await report({ at: hoursAgo(5), title: `Cargill 发布新规格 ${T}`, subjects: ["cargill"] });
  const withdrawn = await report({ at: hoursAgo(4), title: `Cargill 撤回的消息 ${T}`, subjects: ["cargill"] });
  await sql`UPDATE publications SET visibility = 'withdrawn' WHERE article_id = ${withdrawn}`;

  const data = await page("cargill");
  assert.deepEqual(ids(data.items), [kept]);
  assert.equal(data.topic.total, 1);
  const summary = (await listTopicSummaries()).topics.find((t) => t.slug === "cargill")!;
  assert.equal(summary.latest?.title, `Cargill 发布新规格 ${T}`, "the index shows the newest public article");
});

test("every topic has a page; unknown topics and pages past the end have none", async () => {
  const empty = await page("lonza");
  assert.equal(empty.topic.indexable, false, "a topic without content is not indexed");
  assert.deepEqual(empty.items, []);
  assert.equal(await loadTopicPage("not-a-topic", 1, new Date()), null);
  assert.equal(await loadTopicPage("lonza", 2, new Date()), null);
  const index = await app.inject({ method: "GET", url: "/api/site/topics" });
  const body = JSON.parse(index.body) as { groups: Array<{ key: string }>; topics: Array<{ slug: string }> };
  assert.deepEqual(body.groups.map((g) => g.key), ["company", "field", "genre"]);
  assert.deepEqual(body.topics.map((t) => t.slug).sort(), TOPICS.map((t) => t.slug).sort(), "the index lists every topic");
});
