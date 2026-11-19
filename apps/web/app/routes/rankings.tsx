import { Link, useLoaderData, useSearchParams } from "react-router";
import type { Route } from "./+types/rankings";
import type { RankingsResponse } from "@aihot/contracts/site";
import { apiGet, cachedPage } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { pageMeta } from "../lib/seo";
import { PhoneBar } from "../components/shell/PhoneBar";
import { RankingList } from "../features/rankings/RankingList";
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
    description: `每日采集的亚马逊 Best Sellers${names ? `：${names}` : ""}，按名次列出产品与涨跌，附 AI 选品分析。数据来自亚马逊公开榜单，仅作品类观察参考。`,
    path: "/rankings",
  });
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
          每日采集的亚马逊 Best Sellers，按名次列出产品、价格与评分，并标出相对上一次快照的涨跌；
          每条下面的 AI 选品分析给出主打功效与核心成分，供选品参考。数据来自亚马逊公开榜单，价格与排名随时可能变化。
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
              <RankingList list={active} />
              {active.history.length > 0 && (
                <div className="mt-4 border-t border-line pt-3">
                  <div className="mb-1.5 text-[12px] text-ink-4">历史榜单</div>
                  <ul className="flex flex-wrap gap-1.5">
                    {active.history.map((day) => (
                      <li key={day}>
                        <Link
                          to={`/rankings/${active.id}/${day}`}
                          className="inline-flex items-baseline gap-1 rounded-full bg-bg-sunk px-2.5 py-1 text-[12px] text-ink-2 hover:text-accent"
                        >
                          <span className="num">{day}</span>
                          {active.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  );
}
