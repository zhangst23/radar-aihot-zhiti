// The home page's industry modules (PRD §7.2). Every figure and list is the overview read from the
// public layer; an empty module says so rather than showing an example.
import { Link } from "react-router";
import type { FeedItemSummary, HomeOverview, IndustryEventSummary } from "@aihot/contracts/site";
import { CATEGORY_LABELS } from "@aihot/contracts/taxonomy";
import { ENTITIES } from "@aihot/industry/taxonomy";
import { monthDay, monthDayTime } from "../../lib/format";
import { Badge } from "../../components/ui/Badge";

const STAT_LABELS: Array<[keyof HomeOverview["stats"], string]> = [
  ["today", "今日更新"],
  ["week", "近 7 天"],
  ["regulatory", "法规动向"],
  ["supply", "供应风险"],
  ["launches", "原料发布"],
  ["upcomingEvents", "即将开展"],
];

/** Importance from the two scores' average: a reading aid, not a second score. */
function importance(score: number | null): { label: string; tone: "hot" | "amber" | "neutral" } | null {
  if (score === null) return null;
  if (score >= 85) return { label: "高", tone: "hot" };
  if (score >= 72) return { label: "中", tone: "amber" };
  return { label: "一般", tone: "neutral" };
}

function EventLine({ event }: { event: IndustryEventSummary }) {
  const date = event.start === event.end ? monthDay(event.start) : `${monthDay(event.start)}–${monthDay(event.end)}`;
  return (
    <li className="flex items-baseline gap-2 text-[13px] leading-relaxed">
      <span className="num w-[92px] shrink-0 text-ink-4">{date}</span>
      <span className="min-w-0">
        <Link to="/events" className="font-medium text-ink-2 hover:text-accent">{event.name.replace(/\s+\d{4}$/u, "")}</Link>
        <span className="text-ink-4"> · {event.city}</span>
      </span>
    </li>
  );
}

function Panel({ title, to, children, empty }: { title: string; to: string; children: React.ReactNode; empty: boolean }) {
  return (
    <section className="rounded-panel border border-line bg-surface p-4">
      <header className="mb-2 flex items-baseline justify-between gap-3">
        <h2 className="text-[14px] font-semibold text-ink">{title}</h2>
        <Link to={to} className="text-[12px] text-ink-4 hover:text-accent">全部</Link>
      </header>
      {empty ? <p className="py-3 text-[13px] text-ink-4">暂时还没有内容。</p> : children}
    </section>
  );
}

function ItemLines({ items, showScore = true }: { items: FeedItemSummary[]; showScore?: boolean }) {
  return (
    <ul className="divide-y divide-line-soft">
      {items.map((item) => {
        const level = showScore ? importance(item.score) : null;
        return (
          <li key={item.id} className="py-2 first:pt-0 last:pb-0">
            <Link to={`/items/${item.id}`} className="block text-[13.5px] font-medium leading-snug text-ink-2 hover:text-accent">
              {item.title}
            </Link>
            <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-4">
              {item.category && <span>{CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ?? item.category}</span>}
              {level && <Badge tone={level.tone}>{level.label}</Badge>}
              {item.score !== null && <span className="num">{item.score} 分</span>}
              <span>{monthDayTime(item.timelineAt)}</span>
              <span className="truncate">{item.source.name}</span>
            </p>
          </li>
        );
      })}
    </ul>
  );
}

export function HomeOverviewModules({ data }: { data: HomeOverview }) {
  const hasNews = data.breaking.length > 0;
  const panels: React.ReactNode[] = [];
  if (data.regulatory.length) panels.push(<Panel key="regulatory" title="法规雷达" to="/category/regulatory" empty={false}><ItemLines items={data.regulatory} /></Panel>);
  if (data.supply.length) panels.push(<Panel key="supply" title="供应链观察" to="/category/supply" empty={false}><ItemLines items={data.supply} /></Panel>);
  if (data.innovation.length) panels.push(<Panel key="innovation" title="创新雷达" to="/categories" empty={false}><ItemLines items={data.innovation} /></Panel>);
  if (data.companies.length) panels.push(
    <Panel key="companies" title="企业动态" to="/topics" empty={false}>
      <ul className="divide-y divide-line-soft">
        {data.companies.map((company) => (
          <li key={company.slug} className="py-2 first:pt-0 last:pb-0">
            <Link to={`/topics/${company.slug}`} className="flex items-baseline justify-between gap-2 text-[13.5px] font-medium text-ink-2 hover:text-accent">
              <span className="truncate">{company.name}</span>
              <span className="num shrink-0 text-[11.5px] text-ink-4">近 30 天 {company.count}</span>
            </Link>
            {company.latest && <p className="mt-0.5 line-clamp-1 text-[12px] text-ink-4">{company.latest.title}</p>}
          </li>
        ))}
      </ul>
    </Panel>,
  );
  if (data.trending.length) panels.push(
    <Panel key="trending" title="热门原料" to="/all" empty={false}>
      <ul className="flex flex-wrap gap-1.5">
        {data.trending.map((tag) => (
          <li key={tag.tag}>
            <Link to={`/all?tag=${encodeURIComponent(tag.tag)}`} className="inline-flex items-baseline gap-1 rounded-full bg-bg-sunk px-2.5 py-1 text-[12.5px] text-ink-2 hover:text-accent">
              {tag.tag}
              <span className="num text-[11px] text-ink-4">{tag.recent}{tag.previous !== tag.recent ? ` / ${tag.previous}` : ""}</span>
            </Link>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-[11.5px] text-ink-4">本周提及 / 上周提及，只统计已收录的公开报道。</p>
    </Panel>,
  );
  if (data.events.length) panels.push(
    <Panel key="events" title="展会日历" to="/events" empty={false}>
      <ul>{data.events.map((event) => <EventLine key={event.id} event={event} />)}</ul>
    </Panel>,
  );
  return (
    <div className="mb-7">
      <section aria-label="全球原料脉搏" className="mb-4 grid grid-cols-3 gap-2 lg:grid-cols-6">
        {STAT_LABELS.map(([key, label]) => (
          <div key={key} className="rounded-card border border-line bg-surface px-3 py-2.5">
            <p className="text-[11.5px] text-ink-4">{label}</p>
            <p className="num mt-0.5 text-[22px] font-semibold leading-none text-ink">{data.stats[key].toLocaleString("zh-CN")}</p>
          </div>
        ))}
      </section>

      {hasNews && (
        <section className="mb-4 rounded-panel border border-line bg-surface p-4">
          <header className="mb-2 flex items-baseline justify-between gap-3">
            <h2 className="text-[15px] font-semibold text-ink">重大行业新闻</h2>
            <Link to="/all" className="text-[12px] text-ink-4 hover:text-accent">全部动态</Link>
          </header>
          <ol className="divide-y divide-line-soft">
            {data.breaking.map((item, index) => {
              const ingredients = item.tags.filter((t) => !t.startsWith("entity:")).slice(0, 3);
              const companies = item.tags.filter((t) => t.startsWith("entity:")).map((t) => ENTITIES[t.slice(7)]?.name).filter(Boolean).slice(0, 2);
              return (
                <li key={item.id} className="flex gap-3 py-2.5 first:pt-0 last:pb-0">
                  <span className="num mt-0.5 w-4 shrink-0 text-[13px] font-semibold text-ink-4">{index + 1}</span>
                  <div className="min-w-0">
                    <Link to={`/items/${item.id}`} className="text-[15px] font-semibold leading-snug text-ink hover:text-accent">{item.title}</Link>
                    {item.summary && <p className="mt-1 line-clamp-2 text-[12.5px] leading-relaxed text-ink-3">{item.summary}</p>}
                    {(ingredients.length > 0 || companies.length > 0) && (
                      <p className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[11px]">
                        {ingredients.map((t) => (
                          <Link key={t} to={`/all?tag=${encodeURIComponent(t)}`} className="rounded-full bg-bg-sunk px-2 py-0.5 text-ink-3 hover:text-accent">#{t}</Link>
                        ))}
                        {companies.map((name) => <span key={name} className="rounded-full border border-line-soft px-2 py-0.5 text-ink-4">{name}</span>)}
                      </p>
                    )}
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11.5px] text-ink-4">
                      {item.category && <span>{CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS] ?? item.category}</span>}
                      {item.score !== null && <span className="num">{item.score} 分</span>}
                      <span>{monthDayTime(item.timelineAt)}</span>
                      <span>{item.source.name}</span>
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </section>
      )}

      {panels.length > 0 && (
        <div className="grid gap-4 xl:grid-cols-3">
          {panels}
        </div>
      )}
    </div>
  );
}
