import type { Turn } from "./parse";

export type PatternType =
  | "re_explaining_context"
  | "agent_out_of_scope"
  | "back_and_forth"
  | "strong_prompt";

export interface DetectedPattern {
  type: PatternType;
  turnIndex: number;
  matchedPhrase: string;
  sessionId: string;
}

const RE_EXPLAINING_RE =
  /i already (said|told you|mentioned)|as i mentioned|remember,?\s|like i said|we agreed|i already said|we discussed|as i (stated|noted)/i;

const SCOPE_MISMATCH_RE =
  /too much|only wanted|don't touch|didn't ask you to|out of scope|more than i asked|way more than|that's not what i|that's way more|i only wanted|no,? i only/i;

const CLARIFICATION_RE =
  /what do you mean|which (file|approach|one|database|format)|can you clarify|do you want me to|could you specify|are you asking|a few questions|one more thing|should (it|this|the|i)|need to know/i;

const STRONG_PROMPT_INDICATORS =
  /\/[\w/.-]+\.\w+|["'`].{4,}["'`]|\b(only|refactor|add|fix|update|remove|replace|delete|create|implement)\b/i;

export function classifySession(
  sessionId: string,
  turns: Turn[]
): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];

    if (turn.role === "user") {
      let match = turn.text.match(RE_EXPLAINING_RE);
      if (match) {
        patterns.push({
          type: "re_explaining_context",
          turnIndex: i,
          matchedPhrase: extractSurrounding(turn.text, match),
          sessionId,
        });
        continue;
      }

      match = turn.text.match(SCOPE_MISMATCH_RE);
      if (match) {
        patterns.push({
          type: "agent_out_of_scope",
          turnIndex: i,
          matchedPhrase: extractSurrounding(turn.text, match),
          sessionId,
        });
        continue;
      }
    }

    if (turn.role === "assistant") {
      const match = turn.text.match(CLARIFICATION_RE);
      if (match) {
        patterns.push({
          type: "back_and_forth",
          turnIndex: i,
          matchedPhrase: extractSurrounding(turn.text, match),
          sessionId,
        });
      }
    }
  }

  for (let i = 0; i < turns.length; i++) {
    const turn = turns[i];
    if (turn.role !== "user") continue;
    if (!STRONG_PROMPT_INDICATORS.test(turn.text)) continue;

    const next = turns[i + 1];
    if (!next || next.role !== "assistant") continue;

    const followUp = turns[i + 2];
    if (followUp && followUp.role === "user") {
      const isCorrecting =
        RE_EXPLAINING_RE.test(followUp.text) ||
        SCOPE_MISMATCH_RE.test(followUp.text);
      if (isCorrecting) continue;
    }

    const alreadyTagged = patterns.some(
      (p) => p.turnIndex === i && p.sessionId === sessionId
    );
    if (alreadyTagged) continue;

    patterns.push({
      type: "strong_prompt",
      turnIndex: i,
      matchedPhrase: turn.text.length > 120 ? turn.text.slice(0, 120) + "..." : turn.text,
      sessionId,
    });
  }

  return patterns;
}

function extractSurrounding(text: string, _match: RegExpMatchArray): string {
  const clean = text.replace(/\n+/g, " ").trim();
  if (clean.length <= 140) return clean;
  const truncated = clean.slice(0, 137);
  const lastSpace = truncated.lastIndexOf(" ");
  return (lastSpace > 100 ? truncated.slice(0, lastSpace) : truncated) + "...";
}
