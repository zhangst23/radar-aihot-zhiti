import { useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/rankings";
import type { RankingsResponse, RankingItemSummary, RankingListSummary } from "@aihot/contracts/site";
import { apiGet, cachedPage } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { pageMeta } from "../lib/seo";
import { PhoneBar } from "../components/shell/PhoneBar";
import { navUp } from "../components/shell/nav";
import type { Screen } from "../components/shell/screens";

const UP = navUp("/rankings");
export const handle: Screen = { home: UP.tab, name: "亚马逊榜单" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

export async function loader({ request }: { request: Request }) {
  return cachedPage(300, await apiGet<RankingsResponse>("/api/site/rankings", { signal: request.signal }));
}

export function meta({ loaderData }: Route.MetaArgs) {
  const names = (loaderData?.lists ?? []).map((list) => list.name).join("、");
  return pageMeta({
    title: "亚马逊榜单：美妆个护、运动营养、减肥产品与膳食补充剂",
    description: `每日采集的亚马逊 Best Sellers${names ? `：${names}` : ""}，按名次列出产品与涨跌。数据来自亚马逊公开榜单，仅作品类观察参考。`,
    path: "/rankings",
  });
}

/** 名次变化：新上榜、上升、下降、不变。 */
function Delta({ item }: { item: RankingItemSummary }) {
  if (item.previousRank === null) return <span className="text-[11px] text-accent">新</span>;
  const change = item.previousRank - item.rank;
  if (change === 0) return <span className="num text-[11px] text-ink-4">—</span>;
  return (
    <span className={`num text-[11px] ${change > 0 ? "text-hot" : "text-ink-4"}`}>
      {change > 0 ? `↑${change}` : `↓${-change}`}
    </span>
  );
}

function ListTable({ list }: { list: RankingListSummary }) {
  if (!list.items.length) {
    return (
      <p className="rounded-panel border border-line bg-surface p-6 text-center text-[13px] text-ink-4">
        还没有采集到数据。每日采集一次，也可以在后台“专题 · 亚马逊榜单”里立即采集。
      </p>
    );
  }
  return (
    <ol className="divide-y divide-line-soft rounded-panel border border-line bg-surface">
      {list.items.map((item) => (
        <li key={item.rank} className="flex items-baseline gap-3 p-3.5">
          <span className="num w-7 shrink-0 text-[15px] font-semibold text-ink-2">{item.rank}</span>
          <span className="w-8 shrink-0"><Delta item={item} /></span>
          <span className="min-w-0 flex-1">
            <a href={item.url} target="_blank" rel="noopener noreferrer nofollow" className="text-[14px] leading-snug text-ink hover:text-accent">
              {item.title}
            </a>
            <span className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-ink-4">
              {item.price && <span className="num">{item.price}</span>}
              {item.rating && <span className="num">★ {item.rating}</span>}
              {item.reviews !== null && <span className="num">{item.reviews.toLocaleString("en-US")} 评分</span>}
            </span>
          </span>
        </li>
      ))}
    </ol>
  );
}

export default function RankingsRoute() {
  const { lists } = useLoaderData<typeof loader>() as RankingsResponse;
  const [params, setParams] = useSearchParams();
  const active = lists.find((list) => list.id === params.get("list")) ?? lists[0];
  return (
    <div className="pb-6">
      <PhoneBar back={{ to: "/", label: "精选" }} title="亚马逊榜单" />
      <header className="pb-4 pt-3 lg:pt-1">
        <h1 data-page-title="" className="text-[24px] font-bold leading-[1.3] tracking-[-0.01em] text-ink lg:text-[26px]">亚马逊榜单</h1>
        <p className="mt-1.5 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-3">
          每日采集的亚马逊 Best Sellers，按名次列出产品、价格与评分，并标出相对上一次快照的涨跌。
          数据来自亚马逊公开榜单，价格与排名随时可能变化，仅作品类观察参考。
        </p>
      </header>
      {lists.length === 0 ? (
        <p className="rounded-panel border border-line bg-surface p-6 text-center text-[13px] text-ink-4">还没有配置榜单。</p>
      ) : (
        <>
          <nav className="no-scrollbar mb-4 flex gap-1.5 overflow-x-auto" aria-label="榜单">
            {lists.map((list) => {
              const on = list.id === active?.id;
              return (
                <button
                  key={list.id}
                  type="button"
                  onClick={() => setParams({ list: list.id })}
                  className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] ${on ? "bg-ink text-bg" : "bg-bg-sunk text-ink-2 hover:text-accent"}`}
                >
                  {list.name}
                </button>
              );
            })}
          </nav>
          {active && (
            <section>
              <div className="mb-2 flex items-baseline justify-between gap-3">
                <h2 className="text-[15px] font-semibold text-ink">{active.name}</h2>
                <a href={active.url} target="_blank" rel="noopener noreferrer nofollow" className="text-[12px] text-ink-4 hover:text-accent">
                  亚马逊原榜{active.collectedOn ? ` · 采集于 ${active.collectedOn}` : ""}
                </a>
              </div>
              <ListTable list={active} />
            </section>
          )}
        </>
      )}
    </div>
  );
}
