import type { FrictionCategory, Session, SessionAnalysis, FrictionTag } from "./types.js";
import { runCursorPrompt } from "./cursorAgent.js";

const CATEGORIES: FrictionCategory[] = [
  "clarification_loop",
  "repeated_correction",
  "context_loss",
  "scope_mismatch",
  "clean_oneshot",
];

function buildClassificationPrompt(session: Session): string {
  const transcript = session.turns
    .map((t) => `[${t.index}] ${t.role.toUpperCase()}: ${t.content}`)
    .join("\n\n");

  return `You are analyzing a transcript of a developer working with an AI coding agent (like Cursor).

Tag specific turns with at most one friction category from this fixed list.
Tag the turn where the friction becomes visible, following these rules per category:

- clarification_loop: tag the AGENT turn that asks the clarifying question
- repeated_correction: tag the USER turn that restates or corrects a prior instruction
- context_loss: tag the USER turn that reveals the agent forgot something stated earlier
- scope_mismatch: tag the USER turn that flags the agent did more or less than intended
- clean_oneshot: tag the LAST turn of a smooth exchange with no friction (use sparingly -- one per clean sequence, not every turn)

Only tag turns where one of these clearly applies. Most turns should have no tag.

Respond with ONLY valid JSON, no markdown fences, no commentary, matching this shape:
{
  "tags": [
    { "turnIndex": <number>, "category": "<one of the categories above>", "rationale": "<one sentence, grounded in the transcript>" }
  ],
  "summary": "<1-2 sentence summary of how this session went overall>"
}

Transcript:
${transcript}`;
}

function safeParseJson(text: string): { tags: FrictionTag[]; summary: string } {
  // Strip markdown fences if the model added them despite instructions.
  const cleaned = text.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  const parsed = JSON.parse(cleaned);

  const tags: FrictionTag[] = Array.isArray(parsed.tags)
    ? parsed.tags
        .filter((t: any) => CATEGORIES.includes(t.category))
        .map((t: any) => ({
          turnIndex: Number(t.turnIndex),
          category: t.category as FrictionCategory,
          rationale: String(t.rationale ?? ""),
        }))
    : [];

  return { tags, summary: String(parsed.summary ?? "") };
}

export async function classifySessionWithSdk(session: Session, cwd: string): Promise<SessionAnalysis> {
  const prompt = buildClassificationPrompt(session);
  const raw = await runCursorPrompt(prompt, { cwd });
  const { tags, summary } = safeParseJson(raw);
  return { sessionId: session.id, tags, summary };
}

/**
 * Offline heuristic classifier. No API key required. This exists so the
 * pipeline (parsing -> aggregation -> suggestions -> report) can be
 * developed and demoed without spending API credits, and so the synthetic
 * fixtures have a fast feedback loop. It's intentionally simple --
 * regex/keyword based -- and is NOT a substitute for the SDK classifier's
 * judgment on real, messy transcripts.
 */
export function classifySessionMock(session: Session): SessionAnalysis {
  const tags: FrictionTag[] = [];

  const userTurns = session.turns.filter((t) => t.role === "user");
  const correctionWords = /\b(actually|i meant|no,? i|that'?s not|sorry,? i meant|to clarify|wait,? )/i;
  const clarifyWords = /\b(what do you mean|can you clarify|which (file|approach|one)|do you want me to|need to know|one more thing|should (it|this|the|i))\b/i;
  const scopeWords = /\b(too much|that'?s more than|only|just the|don'?t touch|scope|out of scope)/i;
  const contextWords = /\b(i already (said|told you)|as i mentioned|we discussed|like i said)/i;

  for (let i = 0; i < session.turns.length; i++) {
    const turn = session.turns[i];

    if (turn.role === "agent" && clarifyWords.test(turn.content)) {
      tags.push({
        turnIndex: turn.index,
        category: "clarification_loop",
        rationale: "Agent asked a clarifying question instead of proceeding.",
      });
    }

    if (turn.role === "user") {
      if (correctionWords.test(turn.content)) {
        tags.push({
          turnIndex: turn.index,
          category: "repeated_correction",
          rationale: "User language suggests restating or correcting a prior instruction.",
        });
      }
      if (contextWords.test(turn.content)) {
        tags.push({
          turnIndex: turn.index,
          category: "context_loss",
          rationale: "User references something already said, implying the agent lost it.",
        });
      }
      if (scopeWords.test(turn.content)) {
        tags.push({
          turnIndex: turn.index,
          category: "scope_mismatch",
          rationale: "User language suggests the agent's output didn't match intended scope.",
        });
      }
    }
  }

  if (tags.length === 0 && userTurns.length > 0) {
    tags.push({
      turnIndex: session.turns[session.turns.length - 1].index,
      category: "clean_oneshot",
      rationale: "No friction keywords detected across the session.",
    });
  }

  return {
    sessionId: session.id,
    tags,
    summary:
      tags.length === 1 && tags[0].category === "clean_oneshot"
        ? "Smooth session, no detected friction."
        : `Detected ${tags.length} friction signal(s) via heuristic keyword matching.`,
  };
}
