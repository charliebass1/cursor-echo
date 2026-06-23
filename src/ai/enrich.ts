import type {
  SuggestedArtifact,
  Suggestion,
  SuggestionResult,
} from "../suggest";
import type { EchoProvider } from "./provider";

const SYSTEM_PROMPT =
  "You write concise, ready-to-use Cursor configuration artifacts. " +
  "You return only the file or prompt body requested, with no surrounding commentary or markdown fences.";

export interface EnrichOptions {
  onWarn?: (message: string) => void;
}

/**
 * Replaces template artifact bodies with context-specific ones grounded in the
 * actual quoted session text. Any artifact whose model output is invalid keeps
 * its original heuristic template, so this can only improve or no-op.
 */
export async function enrichSuggestions(
  result: SuggestionResult,
  provider: EchoProvider,
  opts: EnrichOptions = {}
): Promise<SuggestionResult> {
  const patterns: Suggestion[] = [];
  for (const s of result.patterns) {
    const artifact = await enrichArtifact(provider, s.artifact, s.quotedExample, opts);
    patterns.push({ ...s, artifact });
  }

  const strongPrompts = [];
  for (const sp of result.strongPrompts) {
    const artifact = await enrichArtifact(provider, sp.artifact, sp.text, opts);
    strongPrompts.push({ ...sp, artifact });
  }

  return { patterns, strongPrompts };
}

async function enrichArtifact(
  provider: EchoProvider,
  artifact: SuggestedArtifact,
  context: string,
  opts: EnrichOptions
): Promise<SuggestedArtifact> {
  try {
    const prompt = buildPrompt(artifact, context);
    const raw = await provider.complete(prompt, { system: SYSTEM_PROMPT });
    const content = sanitize(raw);

    if (!isValid(artifact, content)) {
      throw new Error("model output failed validation");
    }
    return { ...artifact, content };
  } catch (err) {
    opts.onWarn?.(
      `AI artifact enrichment skipped for ${artifact.label} (${
        err instanceof Error ? err.message : String(err)
      }); kept template.`
    );
    return artifact;
  }
}

function buildPrompt(artifact: SuggestedArtifact, context: string): string {
  const shared = `A developer's Cursor session showed this signal:\n"${context}"\n\n`;

  if (artifact.type === "rule") {
    return (
      shared +
      "Write a Cursor Rule file that would prevent this from recurring. " +
      "Start with YAML frontmatter delimited by --- containing 'description' and 'alwaysApply: true', " +
      "then one or more concise, imperative bullet rules grounded in the signal above. " +
      "Keep it under 12 lines.\n\nCurrent template for reference:\n" +
      artifact.content
    );
  }

  if (artifact.type === "skill") {
    return (
      shared +
      "Write a Cursor Skill file (SKILL.md). " +
      "Start with YAML frontmatter delimited by --- containing 'name' (kebab-case) and 'description', " +
      "then a short markdown body describing when to use the skill and the proven prompt shape. " +
      "Keep it under 20 lines.\n\nCurrent template for reference:\n" +
      artifact.content
    );
  }

  return (
    shared +
    "Write an improved, copy-ready prompt the developer could paste next time to avoid this friction. " +
    "Be specific and structured (goal, context, constraints). Plain text only.\n\nCurrent template for reference:\n" +
    artifact.content
  );
}

function sanitize(raw: string): string {
  return raw
    .replace(/^```[a-z]*\n?/i, "")
    .replace(/```$/i, "")
    .trim();
}

function isValid(artifact: SuggestedArtifact, content: string): boolean {
  if (content.length < 10) return false;
  if (artifact.type === "rule" || artifact.type === "skill") {
    return content.startsWith("---");
  }
  return true;
}
