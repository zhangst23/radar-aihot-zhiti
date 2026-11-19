import { useState } from "react";
import { SITE } from "@aihot/site";
import type { Route } from "./+types/rankings";
import { adminGet } from "../../lib/admin.server";
import { useAdminAction } from "../../features/admin/action";
import { AdminPage, Badge, Button, Card, Field, Input } from "../../features/admin/ui";

interface Row {
  id: string;
  name: string;
  url: string;
  position: number;
  enabled: boolean;
  interval_minutes: number;
  last_fetched_at: string | null;
  last_error: string | null;
  collected_on: string | null;
  items: number;
}

interface Draft {
  name: string;
  url: string;
  position: number;
  enabled: boolean;
  interval_minutes: number;
}

const EMPTY: Draft = { name: "", url: "", position: 0, enabled: true, interval_minutes: 1440 };

export async function loader({ request }: Route.LoaderArgs) {
  return adminGet<{ lists: Row[] }>(request, "/api/admin/rankings");
}

export const meta: Route.MetaFunction = () => [{ title: `亚马逊榜单 · ${SITE.name} 后台` }];

function ListForm({ initial, submit, pending, label, onDone }: {
  initial: Draft;
  submit: (draft: Draft) => Promise<unknown>;
  pending: string | null;
  label: string;
  onDone?: () => void;
}) {
  const [draft, setDraft] = useState(initial);
  return (
    <form
      className="space-y-3"
      onSubmit={async (e) => {
        e.preventDefault();
        const done = await submit({ ...draft, position: Number(draft.position), interval_minutes: Number(draft.interval_minutes) });
        if (done !== null) onDone?.();
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Field label="榜单名称">
          <Input required value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="美妆个护榜" />
        </Field>
        <Field label="亚马逊榜单地址" hint="Best Sellers 页面，https://www.amazon.com/Best-Sellers-…/zgbs/…">
          <Input required type="url" value={draft.url} onChange={(e) => setDraft({ ...draft, url: e.target.value })} placeholder="https://" />
        </Field>
        <Field label="排序（小的在前）">
          <Input type="number" min={0} value={draft.position} onChange={(e) => setDraft({ ...draft, position: Number(e.target.value) })} />
        </Field>
        <Field label="采集间隔（分钟）" hint="默认 1440，即每天一次">
          <Input type="number" min={60} max={10080} value={draft.interval_minutes} onChange={(e) => setDraft({ ...draft, interval_minutes: Number(e.target.value) })} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-[13px] text-ink-2">
        <input type="checkbox" checked={draft.enabled} onChange={(e) => setDraft({ ...draft, enabled: e.target.checked })} />
        启用（参与每日采集、出现在榜单页）
      </label>
      <div className="flex items-center gap-2">
        <Button type="submit" tone="primary" size="sm" disabled={pending !== null}>{label}</Button>
        {onDone && <Button type="button" tone="ghost" size="sm" onClick={onDone}>取消</Button>}
      </div>
    </form>
  );
}

function ListCard({ row }: { row: Row }) {
  const { run, pending } = useAdminAction();
  const [editing, setEditing] = useState(false);
  return (
    <Card
      title={<span className="flex flex-wrap items-center gap-2">{row.name} <Badge tone={row.enabled ? "ok" : "muted"}>{row.enabled ? "启用" : "暂停"}</Badge></span>}
      right={
        <span className="flex items-center gap-2">
          <Button
            size="sm"
            tone="ghost"
            disabled={pending !== null}
            onClick={() => run("POST", `/api/admin/rankings/${encodeURIComponent(row.id)}/collect`, undefined, { label: `collect-${row.id}`, success: "已采集" })}
          >
            立即采集
          </Button>
          <Button size="sm" tone="ghost" onClick={() => setEditing((v) => !v)}>{editing ? "收起" : "编辑"}</Button>
          <Button
            size="sm"
            tone="ghost"
            disabled={pending !== null}
            onClick={async () => {
              if (!window.confirm(`删除榜单「${row.name}」？已采集的快照会一起删除。`)) return;
              await run("DELETE", `/api/admin/rankings/${encodeURIComponent(row.id)}`, undefined, { label: `delete-${row.id}`, success: "已删除" });
            }}
          >
            删除
          </Button>
        </span>
      }
    >
      <div className="space-y-1 text-[12.5px] text-ink-3">
        <div className="break-all">{row.url}</div>
        <div className="text-ink-4">
          每 {row.interval_minutes} 分钟 · 最新快照 {row.collected_on ?? "—"}（{row.items} 条） · 上次采集 {row.last_fetched_at ?? "—"}
        </div>
        {row.last_error && <div className="text-hot">上次失败：{row.last_error}</div>}
      </div>
      {editing && (
        <div className="mt-3 border-t border-line pt-3">
          <ListForm
            initial={{ name: row.name, url: row.url, position: row.position, enabled: row.enabled, interval_minutes: row.interval_minutes }}
            pending={pending}
            label="保存"
            submit={(draft) => run("PATCH", `/api/admin/rankings/${encodeURIComponent(row.id)}`, draft, { label: `save-${row.id}`, success: "已保存" })}
            onDone={() => setEditing(false)}
          />
        </div>
      )}
    </Card>
  );
}

export default function AdminRankings({ loaderData }: Route.ComponentProps) {
  const { lists } = loaderData;
  const { run, pending } = useAdminAction();
  const [adding, setAdding] = useState(false);
  return (
    <AdminPage
      title="亚马逊榜单"
      subtitle="专题 · 亚马逊榜单的数据源：每日按间隔采集 Best Sellers 页面，公开页只读最新的快照。抓取可能被亚马逊反爬拦截，失败原因写在卡片上。"
      actions={<Button tone="primary" size="sm" onClick={() => setAdding((v) => !v)}>{adding ? "收起" : "新增榜单"}</Button>}
    >
      <div className="space-y-3">
        {adding && (
          <Card title="新增榜单">
            <ListForm
              initial={EMPTY}
              pending={pending}
              label="创建"
              submit={(draft) => run("POST", "/api/admin/rankings", draft, { label: "create-ranking", success: "已创建" })}
              onDone={() => setAdding(false)}
            />
          </Card>
        )}
        {lists.length === 0 ? (
          <Card><p className="text-[13px] text-ink-4">还没有榜单。首次部署会导入四个亚马逊默认榜单，也可以在这里新增。</p></Card>
        ) : (
          lists.map((row) => <ListCard key={row.id} row={row} />)
        )}
      </div>
    </AdminPage>
  );
}
