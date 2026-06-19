import type { LongHorizonSignal, Session, SessionAnalysis } from "./types.js";

/**
 * This module exists specifically to serve the "help Cursor's researchers
 * study long-horizon tasks" goal, as distinct from the "help this one user
 * write better prompts" goal. A flat friction count per category doesn't
 * tell you whether friction compounds as a session gets longer; this does.
 *
 * Two views are computed:
 * 1. First-half vs second-half friction rate, pooled across all sessions --
 *    a coarse signal for "does friction concentrate later in a session?"
 * 2. Friction-per-turn bucketed by session length -- a coarse signal for
 *    "do longer sessions have proportionally more friction than short ones?"
 *
 * Caveat that matters for anyone using this seriously: with a handful of
 * sessions, these numbers are illustrative, not statistically meaningful.
 * The value here is the *shape* of the analysis, not these specific
 * numbers from 5-6 synthetic examples.
 */

function lengthBucketLabel(length: number): string {
  if (length <= 5) return "1-5 turns";
  if (length <= 10) return "6-10 turns";
  if (length <= 20) return "11-20 turns";
  return "21+ turns";
}

export function computeLongHorizonSignal(sessions: Session[], analyses: SessionAnalysis[]): LongHorizonSignal {
  const analysisBySession = new Map(analyses.map((a) => [a.sessionId, a]));

  let firstHalfTagged = 0;
  let firstHalfTotal = 0;
  let secondHalfTagged = 0;
  let secondHalfTotal = 0;

  const bucketStats = new Map<string, { sessionCount: number; totalTurns: number; totalTags: number }>();

  for (const session of sessions) {
    const analysis = analysisBySession.get(session.id);
    if (!analysis) continue;

    const length = session.turns.length;
    const midpoint = length / 2;
    const taggedIndices = new Set(analysis.tags.map((t) => t.turnIndex));

    for (const turn of session.turns) {
      const isTagged = taggedIndices.has(turn.index);
      if (turn.index < midpoint) {
        firstHalfTotal++;
        if (isTagged) firstHalfTagged++;
      } else {
        secondHalfTotal++;
        if (isTagged) secondHalfTagged++;
      }
    }

    const bucket = lengthBucketLabel(length);
    const existing = bucketStats.get(bucket) ?? { sessionCount: 0, totalTurns: 0, totalTags: 0 };
    existing.sessionCount += 1;
    existing.totalTurns += length;
    existing.totalTags += analysis.tags.filter((t) => t.category !== "clean_oneshot").length;
    bucketStats.set(bucket, existing);
  }

  const byLengthBucket = Array.from(bucketStats.entries())
    .map(([bucket, stats]) => ({
      bucket,
      sessionCount: stats.sessionCount,
      frictionPerTurn: stats.totalTurns > 0 ? stats.totalTags / stats.totalTurns : 0,
    }))
    .sort((a, b) => a.bucket.localeCompare(b.bucket));

  return {
    firstHalfFrictionRate: firstHalfTotal > 0 ? firstHalfTagged / firstHalfTotal : 0,
    secondHalfFrictionRate: secondHalfTotal > 0 ? secondHalfTagged / secondHalfTotal : 0,
    byLengthBucket,
  };
}
