// Category pages: the site's first-level categories and their second-level entries. A second-level
// page is its category plus one topic tag, so it reads through the same pool predicate as every list
// and cannot drift from the filters. Counts follow the same listed scope; empty pages are not indexed.
import { CATEGORIES, SUBCATEGORIES, TOPIC_TAGS } from "@aihot/industry/taxonomy";
import type { CategoryIndexResponse, CategoryPageResponse, CategorySummary, SubcategorySummary } from "@aihot/contracts/site";
import { sql } from "../db.ts";
import { browsedCondition, seatedCondition } from "./scope.ts";
import { loadPool, POOL_PAGE_SIZE } from "./pool.ts";

const TAG_NAMES = TOPIC_TAGS as unknown as string[];

interface CountRow { category: string; n: number }
interface TagCountRow { category: string; tag: string; n: number }

async function categoryCounts(now: Date): Promise<Map<string, number>> {
  const rows = await sql<CountRow[]>`
    SELECT p.category, count(*)::int AS n FROM publications p
    WHERE ${browsedCondition(now)} AND p.category IS NOT NULL
    GROUP BY p.category`;
  return new Map(rows.map((r) => [r.category, Number(r.n)]));
}

async function tagCounts(now: Date): Promise<Map<string, number>> {
  const rows = await sql<TagCountRow[]>`
    SELECT p.category, t.tag, count(*)::int AS n
    FROM publications p CROSS JOIN LATERAL unnest(p.tags) AS t(tag)
    WHERE ${browsedCondition(now)} AND p.category IS NOT NULL AND t.tag = ANY(${TAG_NAMES}::text[])
    GROUP BY p.category, t.tag`;
  return new Map(rows.map((r) => [`${r.category}\u0000${r.tag}`, Number(r.n)]));
}

async function recentCategoryCounts(now: Date): Promise<Map<string, number>> {
  const since = new Date(+now - 30 * 24 * 60 * 60 * 1000);
  const rows = await sql<CountRow[]>`
    SELECT p.category, count(*)::int AS n FROM publications p
    WHERE ${seatedCondition(now)} AND p.timeline_at >= ${since} AND p.category IS NOT NULL
    GROUP BY p.category`;
  return new Map(rows.map((r) => [r.category, Number(r.n)]));
}

async function recentTagCounts(now: Date): Promise<Map<string, number>> {
  const since = new Date(+now - 30 * 24 * 60 * 60 * 1000);
  const rows = await sql<TagCountRow[]>`
    SELECT p.category, t.tag, count(*)::int AS n
    FROM publications p CROSS JOIN LATERAL unnest(p.tags) AS t(tag)
    WHERE ${seatedCondition(now)} AND p.timeline_at >= ${since} AND p.category IS NOT NULL AND t.tag = ANY(${TAG_NAMES}::text[])
    GROUP BY p.category, t.tag`;
  return new Map(rows.map((r) => [`${r.category}\u0000${r.tag}`, Number(r.n)]));
}

/** Every category with its second-level entries and their current counts. */
export async function loadCategoryIndex(now = new Date()): Promise<CategoryIndexResponse> {
  const [total, byTag, recent, recentByTag] = await Promise.all([
    categoryCounts(now), tagCounts(now), recentCategoryCounts(now), recentTagCounts(now),
  ]);
  const categories = CATEGORIES.map((category): CategorySummary => {
    const totalFor = total.get(category.key) ?? 0;
    const subcategories = (SUBCATEGORIES[category.key] ?? []).map((sub): SubcategorySummary => {
      const count = byTag.get(`${category.key}\u0000${sub.tag}`) ?? 0;
      return {
        key: sub.key,
        label: sub.label,
        tag: sub.tag,
        total: count,
        recent: recentByTag.get(`${category.key}\u0000${sub.tag}`) ?? 0,
        indexable: count > 0,
      };
    });
    return {
      key: category.key,
      label: category.label,
      section: category.section,
      definition: category.blurb,
      total: totalFor,
      recent: recent.get(category.key) ?? 0,
      indexable: totalFor > 0,
      subcategories,
    };
  });
  return { categories };
}

/**
 * One page of a category or a second-level entry. `null` for an unknown category or subcategory;
 * a page past the end comes back with no items so the route can answer 404 without a second read.
 */
export async function loadCategoryPage(
  categoryKey: string, subKey: string | null, page: number, now = new Date(),
): Promise<CategoryPageResponse | null> {
  const category = CATEGORIES.find((c) => c.key === categoryKey);
  if (!category) return null;
  const subs = SUBCATEGORIES[category.key] ?? [];
  const sub = subKey ? subs.find((s) => s.key === subKey) : null;
  if (subKey && !sub) return null;

  const index = await loadCategoryIndex(now);
  const summary = index.categories.find((c) => c.key === category.key)!;
  const subcategory = sub ? summary.subcategories.find((s) => s.key === sub.key)! : null;

  const pool = await loadPool({ channel: "all", category: category.key, tag: sub?.tag ?? null, q: null, tab: "time", page, now });
  return {
    category: summary,
    subcategory,
    items: pool.items,
    page: pool.page,
    pageCount: pool.pageCount,
    pageSize: POOL_PAGE_SIZE,
    total: pool.total,
  };
}

/** The category and subcategory paths that have content, for discovery and navigation. */
export async function categoryPageCounts(now = new Date()): Promise<Array<{ path: string; indexable: boolean; revision: string }>> {
  const index = await loadCategoryIndex(now);
  const out: Array<{ path: string; indexable: boolean; revision: string }> = [];
  for (const category of index.categories) {
    if (category.indexable) {
      out.push({ path: `/category/${category.key}`, indexable: true, revision: String(category.total) });
    }
    for (const sub of category.subcategories) {
      if (!sub.indexable) continue;
      out.push({ path: `/category/${category.key}/${sub.key}`, indexable: true, revision: String(sub.total) });
    }
  }
  return out;
}
