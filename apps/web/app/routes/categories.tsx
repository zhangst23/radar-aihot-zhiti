import { useLoaderData } from "react-router";
import { SITE } from "@aihot/site";
import type { Route } from "./+types/categories";
import type { CategoryIndexResponse } from "@aihot/contracts/site";
import { apiGet, cachedPage } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { breadcrumbLd, pageMeta, siteUrl } from "../lib/seo";
import { IconChevronRight } from "../components/icons";
import { IntentLink } from "../components/ui/IntentLink";
import { PhoneBar } from "../components/shell/PhoneBar";
import { navUp } from "../components/shell/nav";
import type { Screen } from "../components/shell/screens";

const UP = navUp("/categories");
export const handle: Screen = { home: UP.tab, name: "品类" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

export async function loader({ request }: { request: Request }) {
  return cachedPage(300, await apiGet<CategoryIndexResponse>("/api/site/categories", { signal: request.signal }));
}

export function meta({ loaderData }: Route.MetaArgs) {
  const base = siteUrl();
  const categories = loaderData?.categories ?? [];
  const indexed = categories.filter((c) => c.indexable);
  const named = indexed.slice(0, 6).map((c) => c.label).join("、");
  return pageMeta({
    title: "原料品类：按一级与二级分类浏览",
    description: `按原料品类浏览${named ? `：${named}等` : ""}${categories.length} 个一级分类，每个分类下有细分入口；只列出有实际报道的页面。`,
    path: "/categories",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "@id": `${base}/categories#collection`,
        url: `${base}/categories`,
        name: "原料品类",
        inLanguage: SITE.locale,
        isPartOf: { "@id": `${base}/#website` },
        mainEntity: {
          "@type": "ItemList",
          numberOfItems: indexed.length,
          itemListElement: indexed.map((c, i) => ({ "@type": "ListItem", position: i + 1, name: c.label, url: `${base}/category/${c.key}` })),
        },
      },
      breadcrumbLd([{ name: SITE.name, path: "/" }, { name: "品类", path: "/categories" }]),
    ],
  });
}

export default function CategoriesRoute() {
  const { categories } = useLoaderData<typeof loader>();
  return (
    <div className="pb-6">
      <PhoneBar back={{ to: "/", label: "精选" }} title="品类" />
      <header className="pb-5 pt-3 lg:pt-1">
        <h1 data-page-title="" className="text-[24px] font-bold leading-[1.3] tracking-[-0.01em] text-ink lg:text-[26px]">原料品类</h1>
        <p className="mt-1.5 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-3">
          按一级分类和二级入口浏览。二级页面只在该分类下有实际报道时开放；没有内容的分类不会生成可索引页面。
        </p>
      </header>
      <div className="grid gap-3 lg:grid-cols-2">
        {categories.map((category) => (
          <section key={category.key} className="rounded-panel border border-line bg-surface p-4">
            <div className="flex items-baseline justify-between gap-3">
              {category.indexable ? (
                <IntentLink to={`/category/${category.key}`} className="flex items-center gap-1 text-[16px] font-semibold text-ink hover:text-accent">
                  {category.label}
                  <IconChevronRight size={14} className="text-ink-4" />
                </IntentLink>
              ) : (
                <span className="text-[16px] font-semibold text-ink-3">{category.label}</span>
              )}
              <span className="num shrink-0 text-[12px] text-ink-4">{category.total} 条</span>
            </div>
            <p className="mt-1 text-[12.5px] leading-relaxed text-ink-3">{category.definition}</p>
            {category.subcategories.length > 0 && (
              <ul className="mt-2.5 flex flex-wrap gap-1.5">
                {category.subcategories.map((sub) =>
                  sub.indexable ? (
                    <li key={sub.key}>
                      <IntentLink
                        to={`/category/${category.key}/${sub.key}`}
                        className="inline-flex items-baseline gap-1 rounded-full bg-bg-sunk px-2.5 py-1 text-[12px] text-ink-2 hover:text-accent"
                      >
                        {sub.label}
                        <span className="num text-[10.5px] text-ink-4">{sub.total}</span>
                      </IntentLink>
                    </li>
                  ) : (
                    <li key={sub.key} className="inline-flex items-baseline gap-1 rounded-full border border-line-soft px-2.5 py-1 text-[12px] text-ink-4">
                      {sub.label}
                    </li>
                  ),
                )}
              </ul>
            )}
          </section>
        ))}
      </div>
    </div>
  );
}
