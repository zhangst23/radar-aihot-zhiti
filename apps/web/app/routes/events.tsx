import { Link, useLoaderData } from "react-router";
import { SITE } from "@aihot/site";
import type { Route } from "./+types/events";
import type { EventsResponse, IndustryEventSummary } from "@aihot/contracts/site";
import { CATEGORY_LABELS } from "@aihot/contracts/taxonomy";
import { CATEGORIES } from "@aihot/industry/taxonomy";
import { apiGet, cachedPage } from "../lib/api.server";
import { pageReuse } from "../lib/page-reuse";
import { breadcrumbLd, pageMeta, siteUrl } from "../lib/seo";
import { Badge } from "../components/ui/Badge";
import { PhoneBar } from "../components/shell/PhoneBar";
import { IconChevronRight } from "../components/icons";
import { navUp } from "../components/shell/nav";
import type { Screen } from "../components/shell/screens";

const UP = navUp("/events");
export const handle: Screen = { home: UP.tab, name: "展会" };
export { pageHeaders as headers } from "../lib/api.server";
export const { clientLoader, shouldRevalidate } = pageReuse<typeof loader>();

export interface EventFilters {
  month: string | null;
  country: string | null;
  category: string | null;
  q: string | null;
  scope: "upcoming" | "past" | "all";
}

export function readEventFilters(params: URLSearchParams): EventFilters {
  const month = params.get("month");
  const scope = params.get("scope");
  return {
    month: month && /^\d{4}-(0[1-9]|1[0-2])$/.test(month) ? month : null,
    country: params.get("country")?.trim() || null,
    category: CATEGORIES.some((c) => c.key === params.get("category")) ? params.get("category") : null,
    q: params.get("q")?.trim().slice(0, 100) || null,
    scope: scope === "all" || scope === "past" ? scope : "upcoming",
  };
}

function queryString(f: EventFilters): string {
  const sp = new URLSearchParams();
  if (f.month) sp.set("month", f.month);
  if (f.country) sp.set("country", f.country);
  if (f.category) sp.set("category", f.category);
  if (f.q) sp.set("q", f.q);
  if (f.scope !== "upcoming") sp.set("scope", f.scope);
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export async function loader({ request }: Route.LoaderArgs) {
  const filters = readEventFilters(new URL(request.url).searchParams);
  const data = await apiGet<EventsResponse>(`/api/site/events${queryString(filters)}`, { signal: request.signal });
  return cachedPage(300, { data, filters });
}

const md = (iso: string) => `${Number(iso.slice(5, 7))}月${Number(iso.slice(8, 10))}日`;
function range(event: IndustryEventSummary): string {
  return event.start === event.end ? md(event.start) : `${md(event.start)}–${event.end.slice(0, 4) === event.start.slice(0, 4) ? md(event.end) : `${event.end.slice(0, 4)}年${md(event.end)}`}`;
}
const STATUS: Record<IndustryEventSummary["status"], { label: string; tone: "ok" | "amber" | "neutral" }> = {
  upcoming: { label: "即将开始", tone: "ok" },
  ongoing: { label: "进行中", tone: "amber" },
  past: { label: "已结束", tone: "neutral" },
};

function eventLd(event: IndustryEventSummary) {
  const base = siteUrl();
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    "@id": `${base}/events#${event.id}`,
    name: event.name,
    startDate: event.start,
    endDate: event.end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    url: event.website,
    location: {
      "@type": "Place",
      name: event.venue ?? event.city,
      address: { "@type": "PostalAddress", addressLocality: event.city, addressCountry: event.country },
    },
  };
}

export function meta({ loaderData }: Route.MetaArgs) {
  const filtered = loaderData ? !!queryString(loaderData.filters) : false;
  const events = loaderData?.data.events ?? [];
  return pageMeta({
    title: "全球原料展会日历：CPHI、Fi、in-cosmetics、SupplySide",
    description: "已核实的国际原料与配料展会：日期、城市、场馆和官网。按月份、国家、行业筛选；没有核实日期的展会不收录。",
    path: "/events",
    noindex: filtered,
    jsonLd: [
      ...events.map(eventLd),
      breadcrumbLd([{ name: SITE.name, path: "/" }, { name: "展会", path: "/events" }]),
    ],
  });
}

export default function EventsRoute() {
  const { data, filters } = useLoaderData<typeof loader>();
  const months = new Map<string, IndustryEventSummary[]>();
  for (const event of data.events) {
    const key = event.start.slice(0, 7);
    months.set(key, [...(months.get(key) ?? []), event]);
  }
  return (
    <div className="pb-6">
      <PhoneBar back={{ to: "/", label: "精选" }} title="展会日历" />
      <header className="pb-4 pt-3 lg:pt-1">
        <h1 data-page-title="" className="text-[24px] font-bold leading-[1.3] tracking-[-0.01em] text-ink lg:text-[26px]">全球原料展会日历</h1>
        <p className="mt-1.5 max-w-[70ch] text-[13.5px] leading-relaxed text-ink-3">
          国际原料、食品配料、医药与化妆品原料展会。日期、场馆和官网按主办方页面核对（最近一次 {data.checkedAt}）；没有核实日期的展会不收录。
        </p>
      </header>

      <form method="get" action="/events" className="mb-5 flex flex-wrap items-end gap-2 rounded-panel border border-line bg-surface p-3">
        <label className="flex flex-col gap-1 text-[11.5px] text-ink-4">
          月份
          <input type="month" name="month" defaultValue={filters.month ?? ""} className="h-9 rounded-control border border-line bg-bg px-2 text-[13px] text-ink" />
        </label>
        <label className="flex flex-col gap-1 text-[11.5px] text-ink-4">
          国家/地区
          <select name="country" defaultValue={filters.country ?? ""} className="h-9 rounded-control border border-line bg-bg px-2 text-[13px] text-ink">
            <option value="">全部</option>
            {data.countries.map((country) => <option key={country} value={country}>{country}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11.5px] text-ink-4">
          行业
          <select name="category" defaultValue={filters.category ?? ""} className="h-9 rounded-control border border-line bg-bg px-2 text-[13px] text-ink">
            <option value="">全部</option>
            {CATEGORIES.map((category) => <option key={category.key} value={category.key}>{category.label}</option>)}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-[11.5px] text-ink-4">
          状态
          <select name="scope" defaultValue={filters.scope} className="h-9 rounded-control border border-line bg-bg px-2 text-[13px] text-ink">
            <option value="upcoming">即将开始与进行中</option>
            <option value="all">全部</option>
            <option value="past">已结束</option>
          </select>
        </label>
        <label className="flex min-w-[160px] flex-1 flex-col gap-1 text-[11.5px] text-ink-4">
          展会名称或城市
          <input name="q" defaultValue={filters.q ?? ""} placeholder="例如 CPHI、Bangkok" className="h-9 rounded-control border border-line bg-bg px-2 text-[13px] text-ink" />
        </label>
        <button type="submit" className="h-9 rounded-full bg-ink px-4 text-[13px] font-semibold text-bg">筛选</button>
        {queryString(filters) && <Link to="/events" className="h-9 px-2 text-[13px] leading-9 text-ink-3 hover:text-accent">清除</Link>}
      </form>

      {data.events.length === 0 ? (
        <div className="rounded-panel border border-line bg-surface p-6 text-center text-[13px] text-ink-4">
          没有符合筛选的展会。试试清除筛选，或换一个月份。
        </div>
      ) : (
        <div className="space-y-6">
          {[...months.entries()].map(([month, events]) => (
            <section key={month} aria-label={month}>
              <h2 className="mb-2 text-[15px] font-semibold text-ink">
                <span className="num">{month.slice(0, 4)}</span> 年 <span className="num">{Number(month.slice(5, 7))}</span> 月
              </h2>
              <ul className="divide-y divide-line-soft rounded-panel border border-line bg-surface">
                {events.map((event) => (
                  <li key={event.id} className="flex flex-col gap-1.5 p-4 sm:flex-row sm:items-baseline sm:gap-4">
                    <span className="num w-[118px] shrink-0 text-[13px] font-semibold text-ink-2">{range(event)}</span>
                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <a href={event.website} target="_blank" rel="noopener noreferrer nofollow" className="text-[15px] font-semibold text-ink hover:text-accent">
                          {event.name}
                        </a>
                        <Badge tone={STATUS[event.status].tone}>{STATUS[event.status].label}</Badge>
                      </span>
                      <span className="mt-1 block text-[12.5px] text-ink-4">
                        {event.city} · {event.country}{event.venue ? ` · ${event.venue}` : ""}
                      </span>
                      {event.note && <span className="mt-0.5 block text-[11.5px] text-ink-4">{event.note}</span>}
                      <span className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        {event.categories.map((key) => (
                          <Link key={key} to={`/events?category=${key}`} className="rounded-full bg-bg-sunk px-2 py-0.5 text-[11px] text-ink-3 hover:text-accent">
                            {CATEGORY_LABELS[key]}
                          </Link>
                        ))}
                      </span>
                    </span>
                    <a href={event.website} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex shrink-0 items-center gap-0.5 text-[12px] text-ink-4 hover:text-accent">
                      官网 <IconChevronRight size={12} />
                    </a>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
