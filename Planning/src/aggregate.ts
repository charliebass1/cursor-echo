import type { AggregatedPattern, AggregatedPatterns, FrictionCategory, SessionAnalysis } from "./types.js";

const ALL_CATEGORIES: FrictionCategory[] = [
  "clarification_loop",
  "repeated_correction",
  "context_loss",
  "scope_mismatch",
  "clean_oneshot",
];

const MAX_EXAMPLES_PER_CATEGORY = 4;

export function aggregate(analyses: SessionAnalysis[]): AggregatedPatterns {
  const totalSessions = analyses.length;

  const patterns: AggregatedPattern[] = ALL_CATEGORIES.map((category) => {
    const tagsInCategory = analyses.flatMap((a) => a.tags.filter((t) => t.category === category));
    const sessionsWithCategory = new Set(
      analyses.filter((a) => a.tags.some((t) => t.category === category)).map((a) => a.sessionId)
    );

    return {
      category,
      count: tagsInCategory.length,
      sessionCoverage: totalSessions > 0 ? sessionsWithCategory.size / totalSessions : 0,
      examples: tagsInCategory.slice(0, MAX_EXAMPLES_PER_CATEGORY).map((t) => t.rationale),
    };
  })
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count);

  return { totalSessions, patterns };
}
