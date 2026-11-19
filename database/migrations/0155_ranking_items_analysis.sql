-- 榜单项的 AI 选品分析（功效与主打成分），由 rankings.collect 在采集后补齐；同一 ASIN 复用上一次的结论。
ALTER TABLE ranking_items ADD COLUMN IF NOT EXISTS analysis text;
