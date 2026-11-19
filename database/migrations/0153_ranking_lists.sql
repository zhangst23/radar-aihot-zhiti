-- 亚马逊榜单（专题 · 亚马逊榜单）：每个榜单一行，由 rankings.collect 每日采集一次快照。
CREATE TABLE IF NOT EXISTS ranking_lists (
  id                text PRIMARY KEY,
  name              text NOT NULL,
  url               text NOT NULL,
  position          integer NOT NULL DEFAULT 0,
  enabled           boolean NOT NULL DEFAULT true,
  interval_minutes  integer NOT NULL DEFAULT 1440,
  next_fetch_at     timestamptz NOT NULL DEFAULT now(),
  last_fetched_at   timestamptz,
  last_error        text,
  updated_at        timestamptz NOT NULL DEFAULT now()
);
