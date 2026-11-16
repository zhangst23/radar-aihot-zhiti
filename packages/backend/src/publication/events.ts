// The industry's trade-show calendar: dates, venues and official sites from industry/events.json,
// checked against the organisers' pages on the date the file records. Read-only; no collected article
// can add an event on its own, so a wrong date never reaches the calendar through the pipeline.
import { readFileSync } from "node:fs";
import path from "node:path";
import type { CategoryKey } from "@aihot/contracts/taxonomy";
import type { EventsResponse, EventStatus, IndustryEventSummary } from "@aihot/contracts/site";
import { beijingDate } from "@aihot/contracts/time";
import { REPO_ROOT } from "../config.ts";

interface StoredEvent {
  id: string;
  name: string;
  start: string;
  end: string;
  city: string;
  country: string;
  venue: string | null;
  note?: string | null;
  categories: CategoryKey[];
  website: string;
  source: string;
}

interface Store {
  checkedAt: string;
  events: StoredEvent[];
}

const store = JSON.parse(readFileSync(path.join(REPO_ROOT, "industry/events.json"), "utf8")) as Store;

export interface EventQuery {
  /** Inclusive YYYY-MM-DD range; an event is kept when it overlaps it. */
  from?: string | null;
  to?: string | null;
  category?: string | null;
  country?: string | null;
  q?: string | null;
  scope?: "upcoming" | "past" | "all";
}

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
export const isIsoDate = (value: string) => ISO_DATE.test(value) && !Number.isNaN(Date.parse(`${value}T00:00:00Z`));

export function eventStatus(event: Pick<StoredEvent, "start" | "end">, now = new Date()): EventStatus {
  const today = beijingDate(now);
  if (today < event.start) return "upcoming";
  if (today > event.end) return "past";
  return "ongoing";
}

/** The calendar's entries, filtered and ordered; the same store for the page, the API and the sitemap. */
export function listEvents(query: EventQuery = {}, now = new Date()): EventsResponse {
  const scope = query.scope ?? "upcoming";
  const q = query.q?.trim().toLowerCase() ?? "";
  const events = store.events
    .filter((event) => {
      const status = eventStatus(event, now);
      if (scope === "upcoming" && status === "past") return false;
      if (scope === "past" && status !== "past") return false;
      if (query.from && event.end < query.from) return false;
      if (query.to && event.start > query.to) return false;
      if (query.category && !event.categories.includes(query.category as CategoryKey)) return false;
      if (query.country && event.country !== query.country) return false;
      if (q && ![event.name, event.city, event.country, event.venue ?? "", ...event.categories].join(" ").toLowerCase().includes(q)) return false;
      return true;
    })
    .map((event): IndustryEventSummary => ({
      id: event.id,
      name: event.name,
      start: event.start,
      end: event.end,
      city: event.city,
      country: event.country,
      venue: event.venue,
      note: event.note ?? null,
      categories: event.categories,
      website: event.website,
      status: eventStatus(event, now),
    }))
    // Upcoming first (soonest first), then what is on now, then the past (most recent first).
    .sort((a, b) => {
      const rank = (s: EventStatus) => (s === "upcoming" ? 0 : s === "ongoing" ? 1 : 2);
      return rank(a.status) - rank(b.status)
        || (a.status === "past" ? b.start.localeCompare(a.start) : a.start.localeCompare(b.start))
        || a.name.localeCompare(b.name);
    });
  return { checkedAt: store.checkedAt, events, total: events.length, countries: eventCountries() };
}

/** The countries the calendar knows, for the filter select. */
export function eventCountries(): string[] {
  return [...new Set(store.events.map((event) => event.country))].sort((a, b) => a.localeCompare(b, "zh-CN"));
}
