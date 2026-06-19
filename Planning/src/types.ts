/**
 * Shared types for the session coach pipeline.
 */

export type Role = "user" | "agent";

export interface Turn {
  index: number;
  role: Role;
  content: string;
}

export interface Session {
  id: string;
  /** Free-form metadata pulled from frontmatter, e.g. { project: "palate-insights", date: "2026-06-10" } */
  meta: Record<string, string>;
  turns: Turn[];
  sourcePath: string;
}

/**
 * The friction taxonomy. Keep this small and mutually exclusive enough
 * to tag reliably -- both the mock heuristic classifier and the SDK-based
 * classifier target this same set of categories so outputs are comparable.
 */
export type FrictionCategory =
  | "clarification_loop" // agent had to ask what the user meant
  | "repeated_correction" // user had to restate/correct the same instruction
  | "context_loss" // agent forgot something stated earlier in the session
  | "scope_mismatch" // agent did meaningfully more or less than intended
  | "clean_oneshot"; // no friction -- worth surfacing as a positive pattern too

export interface FrictionTag {
  turnIndex: number;
  category: FrictionCategory;
  /** Short rationale grounded in the transcript, e.g. quoting what triggered the tag */
  rationale: string;
}

export interface SessionAnalysis {
  sessionId: string;
  tags: FrictionTag[];
  /** 1-2 sentence summary of how the session went */
  summary: string;
}

export interface AggregatedPattern {
  category: FrictionCategory;
  count: number;
  /** Fraction of sessions that had at least one tag in this category */
  sessionCoverage: number;
  examples: string[]; // rationale strings, capped
}

export interface AggregatedPatterns {
  totalSessions: number;
  patterns: AggregatedPattern[];
}

/**
 * Long-horizon signal: does friction concentrate later in sessions /
 * longer sessions, as opposed to being evenly spread? This is the
 * specific question relevant to Cursor's long-running-agent research --
 * generic friction counts don't tell you whether degradation compounds
 * over a session, but position-within-session data does.
 */
export interface LongHorizonSignal {
  /** Friction tags per turn, in the first half of their session vs the second half */
  firstHalfFrictionRate: number;
  secondHalfFrictionRate: number;
  /** Sessions bucketed by length, with friction-tags-per-turn for each bucket */
  byLengthBucket: Array<{
    bucket: string; // e.g. "1-5 turns", "6-10 turns"
    sessionCount: number;
    frictionPerTurn: number;
  }>;
}

/**
 * One row of the researcher-facing dataset export (output/dataset.jsonl).
 * Shaped to be directly usable the way Cursor's own blog post described
 * building eval data for the Auto-review classifier: labeled rows with
 * enough context to be useful on their own, plus position/length metadata
 * specifically relevant to long-horizon-task research.
 */
export interface DatasetRow {
  session_id: string;
  turn_index: number;
  session_length: number;
  /** 0 (start of session) to 1 (end of session) */
  position_ratio: number;
  category: FrictionCategory;
  rationale: string;
  /** The actual content of the tagged turn, truncated to keep rows scannable */
  turn_content: string;
  classifier_mode: "sdk" | "mock";
}

export type SuggestionType = "prompt_rewrite" | "automation";
export type CursorPrimitive = "rules" | "hooks" | "skills" | "mode" | "subagents_plans" | "none";

export interface Suggestion {
  type: SuggestionType;
  triggeredBy: FrictionCategory;
  title: string;
  description: string;
  /** A concrete example a user could paste in, e.g. a rewritten prompt or a hooks.json snippet */
  example?: string;
  cursorPrimitive: CursorPrimitive;
}
