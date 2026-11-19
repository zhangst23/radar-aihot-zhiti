import type { RankingItemSummary, RankingListSummary } from "@aihot/contracts/site";

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

/** 一个榜单的名次表：名次、涨跌、标题、价格与评分，标题下是 AI 选品分析。 */
export function RankingList({ list }: { list: RankingListSummary }) {
  if (!list.items.length) {
    return (
      <p className="rounded-panel border border-line bg-surface p-6 text-center text-[13px] text-ink-4">
        这一天没有快照。每日采集一次，也可以在后台“专题 · 亚马逊榜单”里立即采集。
      </p>
    );
  }
  return (
    <ol className="divide-y divide-line-soft rounded-panel border border-line bg-surface">
      {list.items.map((item) => (
        <li key={`${item.rank}-${item.asin ?? item.url}`} className="flex items-baseline gap-3 p-3.5">
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
            {item.analysis && (
              <span className="mt-1.5 block rounded-tile bg-bg-sunk px-2.5 py-1.5 text-[12px] leading-relaxed text-ink-3">
                <span className="mr-1 text-[11px] font-medium text-ink-4">AI 选品分析</span>
                {item.analysis}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
