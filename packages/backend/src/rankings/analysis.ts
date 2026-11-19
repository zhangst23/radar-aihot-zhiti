// 榜单项的 AI 选品分析：从产品标题推断主打功效与核心成分，供运营人员选品参考。
// 模型调用只在 worker 的采集任务里发生（读者打开页面不会触发）；走 chatJson 的回执与预算，
// 同一 ASIN 复用上一次的结论，所以每天只有新上榜的产品会花一次调用。
import { z } from "zod";
import { sql } from "../db.ts";
import { modelFor } from "../editorial/models.ts";
import { promptText, promptVersion } from "../editorial/prompts.ts";
import { chatJson } from "../providers/llm.ts";

const Output = z.object({ efficacy: z.string().max(160), ingredients: z.array(z.string().max(60)).max(6) });
const SYSTEM = promptText("ranking-analysis");
const PROMPT_VERSION = promptVersion("ranking-analysis");

/** 每次采集最多分析这么多条，给花费封顶；剩下的等下一次采集。 */
export const ANALYZE_PER_RUN = 20;

const format = (value: z.infer<typeof Output>) =>
  `功效：${value.efficacy.trim()}${value.ingredients.length ? `｜主打成分：${value.ingredients.join("、")}` : ""}`;

interface PendingRow {
  list_id: string;
  rank: number;
  asin: string | null;
  title: string;
}

/**
 * Fills `analysis` for today's items that have none: a product seen in an earlier snapshot reuses that
 * answer, a new one asks the model. Stops at the first model failure (calls switched off, budget, outage)
 * so a broken run does not repeat the same failing call for every row.
 */
export async function analyzeRankingDay(listId: string, day: string, listName: string, limit = ANALYZE_PER_RUN): Promise<{ analyzed: number; reused: number; stopped: string | null }> {
  const pending = await sql<PendingRow[]>`
    SELECT list_id, rank, asin, title FROM ranking_items
    WHERE list_id = ${listId} AND collected_on = ${day} AND analysis IS NULL AND asin IS NOT NULL
    ORDER BY rank LIMIT ${limit}`;
  let analyzed = 0;
  let reused = 0;
  for (const row of pending) {
    const [known] = await sql<{ analysis: string }[]>`
      SELECT analysis FROM ranking_items
      WHERE asin = ${row.asin!} AND analysis IS NOT NULL
      ORDER BY collected_on DESC LIMIT 1`;
    if (known) {
      await sql`UPDATE ranking_items SET analysis = ${known.analysis} WHERE list_id = ${listId} AND collected_on = ${day} AND rank = ${row.rank}`;
      reused += 1;
      continue;
    }
    try {
      const model = await modelFor("summarize");
      const res = await chatJson({
        model,
        purpose: "ranking_analysis",
        subject: `ranking:${listId}:${row.asin}`,
        promptVersion: PROMPT_VERSION,
        system: SYSTEM,
        user: JSON.stringify({ list: listName, title: row.title }),
        schema: Output,
        temperature: 0.2,
        maxTokens: 300,
        timeoutMs: 60_000,
      });
      await sql`UPDATE ranking_items SET analysis = ${format(res.data)} WHERE list_id = ${listId} AND collected_on = ${day} AND rank = ${row.rank}`;
      analyzed += 1;
    } catch (error) {
      return { analyzed, reused, stopped: String((error as Error).message).slice(0, 200) };
    }
  }
  return { analyzed, reused, stopped: null };
}
