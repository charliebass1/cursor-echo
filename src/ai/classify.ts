import type { ParsedSession } from "../parse";
import {
  classifySession,
  type DetectedPattern,
  type PatternType,
} from "../classify";
import type { EchoProvider } from "./provider";
import { redactText } from "./redact";

const VALID_TYPES: PatternType[] = [
  "re_explaining_context",
  "agent_out_of_scope",
  "back_and_forth",
  "strong_prompt",
];

const SYSTEM_PROMPT =
  "You are an expert at analyzing transcripts between a developer and an AI coding agent (Cursor). " +
  "You identify recurring interaction friction so the developer can adopt the right Cursor feature. " +
  "You respond with strict JSON only, no prose, no markdown fences.";

export interface AIClassifyOptions {
  redact: boolean;
  onWarn?: (message: string) => void;
}

export async function classifySessionsWithAI(
  sessions: ParsedSession[],
  provider: EchoProvider,
  opts: AIClassifyOptions
): Promise<DetectedPattern[]> {
  const all: DetectedPattern[] = [];

  for (const session of sessions) {
    try {
      all.push(...(await classifyOneWithAI(session, provider, opts.redact)));
    } catch (err) {
      opts.onWarn?.(
        `AI classification failed for ${session.id} (${
          err instanceof Error ? err.message : String(err)
        }); using local heuristics for that session.`
      );
      all.push(...classifySession(session.id, session.turns));
    }
  }

  return all;
}

async function classifyOneWithAI(
  session: ParsedSession,
  provider: EchoProvider,
  redact: boolean
): Promise<DetectedPattern[]> {
  const transcript = session.turns
    .map((t, i) => {
      const text = redact ? redactText(t.text) : t.text;
      return `[${i}] ${t.role.toUpperCase()}: ${text}`;
    })
    .join("\n\n");

  const prompt = buildPrompt(transcript);
  const raw = await provider.complete(prompt, { system: SYSTEM_PROMPT });
  return parseTags(raw, session);
}

function buildPrompt(transcript: string): string {
  return `Tag turns in this transcript with friction patterns. Use only these types:

- re_explaining_context: a USER turn that restates a constraint or instruction the agent already had.
- agent_out_of_scope: a USER turn correcting the agent for doing more, less, or different work than intended.
- back_and_forth: an ASSISTANT turn that asks a clarifying question instead of proceeding.
- strong_prompt: a USER turn that was clear, specific, and led to a good result with no follow-up correction.

Only tag turns where a type clearly applies. Most turns get no tag. A turn gets at most one type.

Respond with JSON exactly in this shape:
{"tags":[{"turnIndex":<number>,"type":"<one of the types>","quote":"<short verbatim quote from that turn, max 140 chars>"}]}

Transcript:
${transcript}`;
}

interface RawTag {
  turnIndex?: unknown;
  type?: unknown;
  quote?: unknown;
}

function parseTags(raw: string, session: ParsedSession): DetectedPattern[] {
  const cleaned = raw
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/i, "")
    .trim();

  let parsed: { tags?: RawTag[] };
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    throw new Error("model did not return valid JSON");
  }

  if (!Array.isArray(parsed.tags)) {
    throw new Error("model JSON missing 'tags' array");
  }

  const patterns: DetectedPattern[] = [];
  for (const tag of parsed.tags) {
    const type = tag.type;
    const turnIndex = Number(tag.turnIndex);

    if (typeof type !== "string" || !VALID_TYPES.includes(type as PatternType)) {
      continue;
    }
    if (!Number.isInteger(turnIndex) || turnIndex < 0 || turnIndex >= session.turns.length) {
      continue;
    }

    const quote = typeof tag.quote === "string" ? tag.quote.trim() : "";
    const fallbackText = session.turns[turnIndex]?.text ?? "";
    const matchedPhrase = truncate(quote.length > 0 ? quote : fallbackText);

    patterns.push({
      type: type as PatternType,
      turnIndex,
      matchedPhrase,
      sessionId: session.id,
    });
  }

  return patterns;
}

function truncate(text: string): string {
  const clean = text.replace(/\n+/g, " ").trim();
  if (clean.length <= 140) return clean;
  return clean.slice(0, 137) + "...";
}
