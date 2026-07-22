import { writeFileSync } from "node:fs";
import type { DatasetRow, Session, SessionAnalysis } from "./types.js";

/**
 * Exports a JSONL dataset of labeled, turn-level examples -- one row per
 * friction tag, enriched with session-length and position-within-session
 * metadata. This is the artifact aimed at goal #2 (give Cursor's
 * researchers categorized data and examples for studying long-horizon
 * tasks), as opposed to the markdown report, which is aimed at goal #1
 * (help this user personally).
 *
 * Shape mirrors what Cursor's own blog described building for the
 * Auto-review classifier: labeled rows, deduplicated, with enough context
 * to be useful standalone -- just turn-level instead of action-level, and
 * with the position/length fields this project adds on top.
 */

const MAX_TURN_CONTENT_CHARS = 400;

export function buildDatasetRows(
  sessions: Session[],
  analyses: SessionAnalysis[],
  mode: "sdk" | "mock"
): DatasetRow[] {
  const sessionById = new Map(sessions.map((s) => [s.id, s]));
  const rows: DatasetRow[] = [];

  for (const analysis of analyses) {
    const session = sessionById.get(analysis.sessionId);
    if (!session) continue;

    const length = session.turns.length;

    for (const tag of analysis.tags) {
      const turn = session.turns.find((t) => t.index === tag.turnIndex);
      if (!turn) continue;

      rows.push({
        session_id: analysis.sessionId,
        turn_index: tag.turnIndex,
        session_length: length,
        position_ratio: length > 1 ? tag.turnIndex / (length - 1) : 0,
        category: tag.category,
        rationale: tag.rationale,
        turn_content: turn.content.slice(0, MAX_TURN_CONTENT_CHARS),
        classifier_mode: mode,
      });
    }
  }

  return rows;
}

export function writeDatasetJsonl(rows: DatasetRow[], outPath: string): void {
  const lines = rows.map((r) => JSON.stringify(r));
  writeFileSync(outPath, lines.join("\n") + (lines.length > 0 ? "\n" : ""), "utf-8");
}
