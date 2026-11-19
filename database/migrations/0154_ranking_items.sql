-- 榜单条目：同一天同一名次一行；(list_id, collected_on, rank) 唯一，重采同一天时先清后写。
CREATE TABLE IF NOT EXISTS ranking_items (
  list_id      text NOT NULL REFERENCES ranking_lists (id) ON DELETE CASCADE,
  collected_on date NOT NULL,
  rank         integer NOT NULL,
  asin         text,
  title        text NOT NULL,
  url          text NOT NULL,
  price        text,
  rating       text,
  reviews      integer,
  PRIMARY KEY (list_id, collected_on, rank)
);
