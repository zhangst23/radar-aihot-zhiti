import { Link, redirect, useLoaderData } from "react-router";
import { SITE } from "@aihot/site";
import type { Route } from "./+types/category";
import type { CategoryPageResponse } from "@aihot/contracts/site";
import { cachedPage, loadOr404 } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { breadcrumbLd, pageMeta, siteUrl } from "../lib/seo";
import { DayList, Pagination } from "../features/feed/DayList";
import { EmptyState } from "../components/ui/Page";
import { PhoneBar } from "../components/shell/PhoneBar";
import { IconArrowLeft } from "../components/icons";
import type { Screen } from "../components/shell/screens";

export const handle: Screen = { home: "me" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

const SLUG = /^[a-z0-9-]{1,60}$/;

function basePath(category: string, sub: string | null) {
  return `/category/${category}${sub ? `/${sub}` : ""}`;
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const category = params.category;
  const sub = params.sub ?? null;
  if (!SLUG.test(category) || (sub !== null && !SLUG.test(sub))) throw new Response("Not found", { status: 404 });
  const page = params.page ? Number(params.page) : 1;
  if (params.page !== undefined && (!/^\d+$/.test(params.page) || page < 1)) throw new Response("Not found", { status: 404 });
  if (params.page === "1") throw redirect(basePath(category, sub), 308);
  const data = await loadOr404<CategoryPageResponse>(`/api/site/categories/${category}${sub ? `/${sub}` : ""}?page=${page}`, { signal: request.signal });
  if (page > 1 && page > data.pageCount) throw new Response("Not found", { status: 404 });
  return cachedPage(60, { data, page });
}

export function meta({ loaderData }: Route.MetaArgs) {
  if (!loaderData) return pageMeta({ title: "分类不存在", path: "/categories", noindex: true });
  const { data, page } = loaderData;
  const { category, subcategory } = data;
  const base = basePath(category.key, subcategory?.key ?? null);
  const path = base;
  const label = subcategory ? `${subcategory.label} · ${category.label}` : category.label;
  const description = `${subcategory ? `${subcategory.label}：` : ""}${category.definition}`;
  const ld = [
    {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "@id": `${siteUrl()}${base}#collection`,
      url: `${siteUrl()}${base}`,
      name: label,
      description,
      inLanguage: SITE.locale,
      isPartOf: { "@id": `${siteUrl()}/#website` },
    },
    breadcrumbLd([
      { name: SITE.name, path: "/" },
      { name: "品类", path: "/categories" },
      { name: category.label, path: `/category/${category.key}` },
      ...(subcategory ? [{ name: subcategory.label, path: base }] : []),
    ]),
  ];
  return pageMeta({
    title: `${label} 最新动态`,
    description,
    path,
    noindex: page > 1 || (subcategory ? !subcategory.indexable : !category.indexable),
    jsonLd: ld,
  });
}

export default function CategoryRoute() {
  const { data, page } = useLoaderData<typeof loader>();
  const { category, subcategory, items, pageCount, total, pageSize } = data;
  const active = subcategory?.key ?? null;
  const base = basePath(category.key, active);
  const href = (p: number) => (p <= 1 ? base : `${base}/page/${p}`);
  const first = (page - 1) * pageSize + 1;
  const last = first + items.length - 1;
  return (
    <div className="pb-6">
      <PhoneBar back={{ to: subcategory ? `/category/${category.key}` : "/categories", label: subcategory ? category.label : "品类" }} title={subcategory?.label ?? category.label} />
      <Link to={subcategory ? `/category/${category.key}` : "/categories"} className="hidden items-center gap-1.5 py-2 text-[13px] text-ink-3 transition-colors hover:text-accent lg:inline-flex">
        <IconArrowLeft size={14} /> 返回{subcategory ? category.label : "品类"}
      </Link>
      <header className="pb-4 pt-3 lg:pt-1">
        <p className="text-[12px] font-semibold tracking-[0.08em] text-accent">{category.section}</p>
        <h1 data-page-title="" className="mt-1.5 text-[24px] font-bold leading-[1.3] tracking-[-0.01em] text-ink lg:text-[26px]">
          {subcategory?.label ?? category.label}
          <span className="ml-2 align-middle text-[13px] font-semibold text-ink-4">最新动态</span>
        </h1>
        <p className="mt-1.5 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-3">{category.definition}</p>
        <p className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1 text-[12.5px] text-ink-4">
          <span>共收录 <span className="num font-semibold text-ink-2">{total.toLocaleString("zh-CN")}</span> 条</span>
          <span>近 30 天精选 <span className="num font-semibold text-ink-2">{(subcategory ?? category).recent.toLocaleString("zh-CN")}</span> 条</span>
        </p>
      </header>

      <nav aria-label="二级分类" className="mb-4 flex flex-wrap gap-1.5">
        <Link
          to={`/category/${category.key}`}
          aria-current={active === null ? "page" : undefined}
          className={`rounded-full px-3 py-1.5 text-[12.5px] ${active === null ? "bg-ink font-semibold text-bg" : "bg-bg-sunk text-ink-3 hover:text-ink"}`}
        >
          全部
        </Link>
        {category.subcategories.map((sub) =>
          sub.indexable ? (
            <Link
              key={sub.key}
              to={`/category/${category.key}/${sub.key}`}
              aria-current={active === sub.key ? "page" : undefined}
              className={`inline-flex items-baseline gap-1 rounded-full px-3 py-1.5 text-[12.5px] ${active === sub.key ? "bg-ink font-semibold text-bg" : "bg-bg-sunk text-ink-3 hover:text-ink"}`}
            >
              {sub.label}
              <span className="num text-[10.5px] opacity-70">{sub.total}</span>
            </Link>
          ) : (
            <span key={sub.key} className="rounded-full border border-line-soft px-3 py-1.5 text-[12.5px] text-ink-4">{sub.label}</span>
          ),
        )}
      </nav>

      <h2 className="sr-only">{page === 1 ? `${subcategory?.label ?? category.label}的公开报道` : `归档 · 第 ${page} 页`}</h2>
      {items.length === 0 ? (
        <div className="lg:card">
          <EmptyState title="这个分类暂时还没有收录内容" />
        </div>
      ) : (
        <DayList items={items} headerAside={<span className="num whitespace-nowrap">第 {first}–{last} 条<span className="hidden sm:inline"> · 共 {total.toLocaleString("zh-CN")} 条</span></span>} />
      )}
      <Pagination page={page} pageCount={pageCount} href={href} />
    </div>
  );
}
