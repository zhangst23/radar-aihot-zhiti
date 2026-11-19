-- 展会日历进数据库：首次启动按 industry/events.json 导入（scripts/seed.ts），之后在后台“专题 · 展会”里增删改。
CREATE TABLE IF NOT EXISTS industry_events (
  id          text PRIMARY KEY,
  name        text NOT NULL,
  starts_on   date NOT NULL,
  ends_on     date NOT NULL,
  city        text NOT NULL,
  country     text NOT NULL,
  venue       text,
  note        text,
  categories  text[] NOT NULL DEFAULT '{}',
  website     text NOT NULL,
  source      text NOT NULL,
  checked_on  date,
  updated_at  timestamptz NOT NULL DEFAULT now()
);
