import { Link, useLoaderData } from "react-router";
import type { Route } from "./+types/ranking-day";
import type { RankingListSummary } from "@aihot/contracts/site";
import { apiGet, cachedPage } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { pageMeta } from "../lib/seo";
import { PhoneBar } from "../components/shell/PhoneBar";
import { RankingList } from "../features/rankings/RankingList";
import { navUp } from "../components/shell/nav";
import type { Screen } from "../components/shell/screens";

const UP = navUp("/rankings");
export const handle: Screen = { home: UP.tab, name: "历史榜单" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

export async function loader({ params }: Route.LoaderArgs) {
  const { listId, date } = params;
  return cachedPage(3600, await apiGet<RankingListSummary>(`/api/site/rankings/${encodeURIComponent(listId)}/${encodeURIComponent(date)}`));
}

export function meta({ loaderData, params }: Route.MetaArgs) {
  const list = loaderData as RankingListSummary | undefined;
  return pageMeta({
    title: list ? `${list.collectedOn} ${list.name}：亚马逊历史榜单` : "亚马逊历史榜单",
    description: list
      ? `${list.collectedOn} 采集的亚马逊${list.name}，共 ${list.items.length} 条，含名次、价格、评分与 AI 选品分析。`
      : "亚马逊历史榜单。",
    path: `/rankings/${encodeURIComponent(params.listId ?? "")}/${encodeURIComponent(params.date ?? "")}`,
  });
}

export default function RankingDayRoute() {
  const list = useLoaderData<typeof loader>() as RankingListSummary;
  return (
    <div className="pb-6">
      <PhoneBar back={{ to: "/rankings", label: "亚马逊榜单" }} title="历史榜单" />
      <header className="pb-4 pt-3 lg:pt-1">
        <p className="text-[12px] text-ink-4">
          <Link to={`/rankings?list=${encodeURIComponent(list.id)}`} className="hover:text-accent">← 回到最新榜单</Link>
        </p>
        <h1 data-page-title="" className="mt-2 text-[22px] font-bold leading-[1.3] tracking-[-0.01em] text-ink lg:text-[24px]">
          <span className="num">{list.collectedOn}</span> {list.name}
        </h1>
        <p className="mt-1.5 max-w-[70ch] text-[13px] leading-relaxed text-ink-3">
          这一天采集的亚马逊榜单快照，名次与涨跌相对前一天。产品信息可能已经变化，以亚马逊当前页面为准。
        </p>
      </header>
      <RankingList list={list} />
    </div>
  );
}
