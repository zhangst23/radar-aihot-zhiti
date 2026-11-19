import { useState } from "react";
import { SITE } from "@aihot/site";
import { CATEGORIES } from "@aihot/industry/taxonomy";
import type { Route } from "./+types/events";
import { adminGet } from "../../lib/admin.server";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Badge, Button, Card, Field, Input } from "../../features/admin/ui";

interface EventRow {
  id: string;
  name: string;
  start: string;
  end: string;
  city: string;
  country: string;
  venue: string | null;
  note: string | null;
  categories: string[];
  website: string;
  source: string;
  checkedAt: string | null;
}

interface Draft {
  name: string;
  start: string;
  end: string;
  city: string;
  country: string;
  venue: string;
  note: string;
  categories: string[];
  website: string;
  source: string;
  checkedAt: string;
}

const EMPTY: Draft = { name: "", start: "", end: "", city: "", country: "", venue: "", note: "", categories: [], website: "", source: "", checkedAt: "" };

const draftOf = (event: EventRow): Draft => ({
  name: event.name,
  start: event.start,
  end: event.end,
  city: event.city,
  country: event.country,
  venue: event.venue ?? "",
  note: event.note ?? "",
  website: event.website,
  source: event.source,
  checkedAt: event.checkedAt ?? "",
  categories: [...event.categories],
});

/** The body every create and edit sends: blank optional fields are null, as the API expects. */
const payloadOf = (draft: Draft) => ({
  name: draft.name.trim(),
  start: draft.start,
  end: draft.end,
  city: draft.city.trim(),
  country: draft.country.trim(),
  venue: draft.venue.trim() || null,
  note: draft.note.trim() || null,
  categories: draft.categories,
  website: draft.website.trim(),
  source: draft.source.trim(),
  checkedAt: draft.checkedAt || null,
});

export async function loader({ request }: Route.LoaderArgs) {
  return adminGet<{ events: EventRow[] }>(request, "/api/admin/events");
}

export const meta: Route.MetaFunction = () => [{ title: `展会 · ${SITE.name} 后台` }];

function EventForm({ initial, submit, pending, label, onDone }: {
  initial: Draft;
  submit: (draft: Draft) => Promise<unknown>;
  pending: boolean | string | null;
  label: string;
  onDone?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));
  const toggle = (key: string) =>
    setDraft((d) => ({ ...d, categories: d.categories.includes(key) ? d.categories.filter((k) => k !== key) : [...d.categories, key] }));
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const done = await submit(draft);
        if (done !== null) {
          setDraft(label === "保存" ? draft : EMPTY);
          onDone?.();
        }
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="展会名称">
          <Input required value={draft.name} onChange={(e) => set("name", e.target.value)} placeholder="Fi Europe 2027" />
        </Field>
        <Field label="城市">
          <Input required value={draft.city} onChange={(e) => set("city", e.target.value)} placeholder="法兰克福" />
        </Field>
        <Field label="开始日期">
          <Input required type="date" value={draft.start} onChange={(e) => set("start", e.target.value)} />
        </Field>
        <Field label="结束日期">
          <Input required type="date" value={draft.end} onChange={(e) => set("end", e.target.value)} />
        </Field>
        <Field label="国家/地区">
          <Input required value={draft.country} onChange={(e) => set("country", e.target.value)} placeholder="德国" />
        </Field>
        <Field label="场馆（选填）">
          <Input value={draft.venue} onChange={(e) => set("venue", e.target.value)} placeholder="Messe Frankfurt" />
        </Field>
        <Field label="官网">
          <Input required type="url" value={draft.website} onChange={(e) => set("website", e.target.value)} placeholder="https://" />
        </Field>
        <Field label="核对来源">
          <Input required type="url" value={draft.source} onChange={(e) => set("source", e.target.value)} placeholder="https://" />
        </Field>
        <Field label="核对日期（选填）">
          <Input type="date" value={draft.checkedAt} onChange={(e) => set("checkedAt", e.target.value)} />
        </Field>
        <Field label="备注（选填）">
          <Input value={draft.note} onChange={(e) => set("note", e.target.value)} placeholder="同期论坛、报名截止等" />
        </Field>
      </div>
      <Field label="行业分类" hint="出现在展会页的行业筛选里，可多选">
        <div className="flex flex-wrap gap-1.5">
          {CATEGORIES.map((category) => {
            const on = draft.categories.includes(category.key);
            return (
              <button
                key={category.key}
                type="button"
                onClick={() => toggle(category.key)}
                className={`rounded-full px-2.5 py-1 text-[12px] ${on ? "bg-ink text-bg" : "bg-bg-sunk text-ink-2"}`}
              >
                {category.label}
              </button>
            );
          })}
        </div>
      </Field>
      <div className="flex items-center gap-2">
        <Button type="submit" tone="primary" size="sm" disabled={Boolean(pending)}>{label}</Button>
        {onDone && <Button type="button" tone="ghost" size="sm" onClick={onDone}>取消</Button>}
      </div>
    </form>
  );
}

function EventCard({ event }: { event: EventRow }) {
  const { run, pending } = useAdminAction();
  const [editing, setEditing] = useState(false);
  return (
    <Card
      title={
        <span className="flex flex-wrap items-center gap-2">
          {event.name}
          <span className="num text-[12px] text-ink-4">{event.start === event.end ? event.start : `${event.start} – ${event.end}`}</span>
        </span>
      }
      right={
        <span className="flex items-center gap-2">
          <Button size="sm" tone="ghost" onClick={() => setEditing((v) => !v)}>{editing ? "收起" : "编辑"}</Button>
          <Button
            size="sm"
            tone="ghost"
            disabled={pending !== null}
            onClick={async () => {
              if (!window.confirm(`删除展会「${event.name}」？`)) return;
              await run("DELETE", `/api/admin/events/${encodeURIComponent(event.id)}`, undefined, { label: `delete-${event.id}`, success: "已删除" });
            }}
          >
            删除
          </Button>
        </span>
      }
    >
      <div className="space-y-1 text-[12.5px] text-ink-3">
        <div>{event.city} · {event.country}{event.venue ? ` · ${event.venue}` : ""}</div>
        {event.note && <div className="text-ink-4">{event.note}</div>}
        <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
          {event.categories.map((key) => (
            <Badge key={key} tone="muted">{CATEGORIES.find((c) => c.key === key)?.label ?? key}</Badge>
          ))}
          <a className="text-accent" href={event.website} target="_blank" rel="noreferrer">{event.website}</a>
        </div>
      </div>
      {editing && (
        <div className="mt-3 border-t border-line pt-3">
          <EventForm
            initial={draftOf(event)}
            pending={pending}
            label="保存"
            submit={(draft) => run("PATCH", `/api/admin/events/${encodeURIComponent(event.id)}`, payloadOf(draft), { label: `save-${event.id}`, success: "已保存" })}
            onDone={() => setEditing(false)}
          />
        </div>
      )}
    </Card>
  );
}

export default function AdminEvents({ loaderData }: Route.ComponentProps) {
  const { events } = loaderData;
  const { run, pending } = useAdminAction();
  const [adding, setAdding] = useState(false);
  return (
    <AdminPage
      title="展会"
      subtitle="展会日历（/events）的数据源。日期、场馆和官网以主办方页面为准，新增或修改后请核对官网。"
      actions={<Button tone="primary" size="sm" onClick={() => setAdding((v) => !v)}>{adding ? "收起" : "新增展会"}</Button>}
    >
      <div className="space-y-3">
        {adding && (
          <Card title="新增展会">
            <EventForm
              initial={EMPTY}
              pending={pending}
              label="创建"
              submit={(draft) => run("POST", "/api/admin/events", payloadOf(draft), { label: "create-event", success: "已创建" })}
              onDone={() => setAdding(false)}
            />
          </Card>
        )}
        {events.length === 0 ? (
          <Card><p className="text-[13px] text-ink-4">还没有展会。首次部署会从 industry/events.json 导入示范数据，也可以在这里新增。</p></Card>
        ) : (
          events.map((event) => <EventCard key={event.id} event={event} />)
        )}
      </div>
    </AdminPage>
  );
}
