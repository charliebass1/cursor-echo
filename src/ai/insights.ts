import type { ParsedSession } from "../parse";
import type { DetectedPattern } from "../classify";
import type { EchoProvider } from "./provider";

const SYSTEM_PROMPT =
  "You are a concise Cursor workflow coach. You write short, practical markdown. " +
  "No preamble, no headings larger than level 3, no fabricated numbers.";

export interface InsightsOptions {
  onWarn?: (message: string) => void;
}

/**
 * Produces an optional narrative coaching section (per-session digest, trend
 * note, and 2-3 sentences of advice). Returns undefined on any failure so the
 * report simply omits the section rather than rendering an empty one.
 */
export async function generateInsights(
  sessions: ParsedSession[],
  patterns: DetectedPattern[],
  provider: EchoProvider,
  opts: InsightsOptions = {}
): Promise<string | undefined> {
  if (sessions.length === 0) return undefined;

  try {
    const digest = buildDigest(sessions, patterns);
    const prompt = buildPrompt(digest);
    const raw = await provider.complete(prompt, { system: SYSTEM_PROMPT, maxTokens: 600 });
    const body = raw.replace(/^```[a-z]*\n?/i, "").replace(/```$/i, "").trim();
    return body.length > 0 ? body : undefined;
  } catch (err) {
    opts.onWarn?.(
      `AI insights skipped (${err instanceof Error ? err.message : String(err)}).`
    );
    return undefined;
  }
}

function buildDigest(sessions: ParsedSession[], patterns: DetectedPattern[]): string {
  const bySession = new Map<string, Map<string, number>>();
  for (const p of patterns) {
    const counts = bySession.get(p.sessionId) ?? new Map<string, number>();
    counts.set(p.type, (counts.get(p.type) ?? 0) + 1);
    bySession.set(p.sessionId, counts);
  }

  const lines = sessions.map((s) => {
    const counts = bySession.get(s.id);
    const tags = counts
      ? [...counts.entries()].map(([type, n]) => `${type} x${n}`).join(", ")
      : "no friction tags";
    return `- ${s.turns.length} turns: ${tags}`;
  });

  return lines.join("\n");
}

function buildPrompt(digest: string): string {
  return `Here is a digest of a developer's recent Cursor sessions (one line per session):

${digest}

Write a short coaching note with exactly these three parts, as markdown:
1. A one-line trend across the sessions.
2. A bullet list (max 3) of the highest-leverage Cursor habit changes.
3. One encouraging sentence.

Do not invent statistics beyond what the digest supports.`;
}
