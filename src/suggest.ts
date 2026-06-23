import type { DetectedPattern, PatternType } from "./classify";

export interface Suggestion {
  heading: string;
  sessionCount: number;
  totalSessions: number;
  fix: string;
  nextAction: string;
  detectedBecause: string;
  quotedExample: string;
  artifact: SuggestedArtifact;
}

export interface StrongPromptExample {
  text: string;
  sessionId: string;
  artifact: SuggestedArtifact;
}

export interface SuggestionResult {
  patterns: Suggestion[];
  strongPrompts: StrongPromptExample[];
}

export interface SuggestedArtifact {
  label: string;
  path?: string;
  content: string;
}

const PATTERN_CONFIG: Record<
  Exclude<PatternType, "strong_prompt">,
  {
    heading: string;
    fix: string;
    nextAction: string;
    detectedBecause: string;
  }
> = {
  re_explaining_context: {
    heading: "You often re-explain context the agent forgot",
    fix: "The fix: save repeated context as a Cursor Rule so you never have to say it again.",
    nextAction: "Create the suggested rule below, then rerun Echo after a few sessions to see if this pattern drops.",
    detectedBecause:
      "Echo found language where you referenced an instruction or constraint you had already given.",
  },
  agent_out_of_scope: {
    heading: "The agent sometimes does more than you asked",
    fix: "The fix: use Plan mode to review the approach before the agent runs. You approve, then it acts.",
    nextAction: "Start broad or risky tasks in Plan mode and approve the scope before letting the agent edit files.",
    detectedBecause:
      "Echo found correction language that usually means the agent changed more, less, or different code than intended.",
  },
  back_and_forth: {
    heading: "You and the agent go back and forth clarifying intent",
    fix: "The fix: front-load specifics in your prompt — name the file, the approach, and what's out of scope. For exploratory questions, use Ask mode instead of Agent mode.",
    nextAction: "Rewrite your next similar prompt with the file, desired outcome, and out-of-scope work in the first message.",
    detectedBecause:
      "Echo found an assistant clarification question where the missing context could likely have been included up front.",
  },
};

function pickBestExample(patterns: DetectedPattern[]): string {
  return patterns
    .slice()
    .sort((a, b) => b.matchedPhrase.length - a.matchedPhrase.length)[0]
    .matchedPhrase;
}

export function generateSuggestions(
  allPatterns: DetectedPattern[],
  totalSessions: number
): SuggestionResult {
  const byType = new Map<PatternType, DetectedPattern[]>();
  for (const p of allPatterns) {
    const existing = byType.get(p.type) ?? [];
    existing.push(p);
    byType.set(p.type, existing);
  }

  const frictionTypes: Exclude<PatternType, "strong_prompt">[] = [
    "re_explaining_context",
    "agent_out_of_scope",
    "back_and_forth",
  ];

  const suggestions: Suggestion[] = [];

  for (const type of frictionTypes) {
    const hits = byType.get(type);
    if (!hits || hits.length === 0) continue;

    const sessionIds = new Set(hits.map((h) => h.sessionId));
    const config = PATTERN_CONFIG[type];
    const suggestion: Suggestion = {
      heading: config.heading,
      sessionCount: sessionIds.size,
      totalSessions,
      fix: config.fix,
      nextAction: config.nextAction,
      detectedBecause: config.detectedBecause,
      quotedExample: pickBestExample(hits),
      artifact: buildArtifact(type, hits),
    };

    suggestions.push(suggestion);
  }

  suggestions.sort((a, b) => b.sessionCount - a.sessionCount);
  const capped = suggestions.slice(0, 3);

  const strongHits = byType.get("strong_prompt") ?? [];
  const seenSessions = new Set<string>();
  const strongPrompts: StrongPromptExample[] = [];
  for (const hit of strongHits) {
    if (seenSessions.has(hit.sessionId)) continue;
    seenSessions.add(hit.sessionId);
    strongPrompts.push({
      text: hit.matchedPhrase,
      sessionId: hit.sessionId,
      artifact: buildSkillArtifact(hit.matchedPhrase),
    });
    if (strongPrompts.length >= 2) break;
  }

  return { patterns: capped, strongPrompts };
}

function buildArtifact(
  type: Exclude<PatternType, "strong_prompt">,
  patterns: DetectedPattern[]
): SuggestedArtifact {
  if (type === "re_explaining_context") {
    const ruleContent = inferRuleContent(patterns);
    return {
      label: "Copy-ready Cursor Rule",
      path: ".cursor/rules/project-conventions.mdc",
      content: [
        "---",
        "description: Project conventions inferred from repeated Cursor corrections",
        "alwaysApply: true",
        "---",
        "",
        ruleContent,
      ].join("\n"),
    };
  }

  if (type === "agent_out_of_scope") {
    return {
      label: "Plan-mode scope prompt",
      content: [
        "Before editing, make a short plan.",
        "",
        "Task:",
        "- <what I want changed>",
        "",
        "In scope:",
        "- <files, folders, or behavior the agent may change>",
        "",
        "Out of scope:",
        "- <files, folders, behavior, dependencies, or refactors to avoid>",
        "",
        "Before making changes, tell me the files you expect to touch and wait for approval.",
      ].join("\n"),
    };
  }

  return {
    label: "Front-loaded prompt template",
    content: [
      "Goal:",
      "- <the outcome I want>",
      "",
      "Context:",
      "- File or area: <path or component>",
      "- Current behavior: <what is happening now>",
      "- Desired behavior: <what should happen instead>",
      "",
      "Constraints:",
      "- <what not to change>",
      "- <dependency, style, or compatibility constraints>",
      "",
      "If anything is still ambiguous, ask before editing.",
    ].join("\n"),
  };
}

function buildSkillArtifact(prompt: string): SuggestedArtifact {
  return {
    label: "Reusable Skill draft",
    path: ".cursor/skills/reusable-workflow/SKILL.md",
    content: [
      "---",
      "name: reusable-workflow",
      "description: Use this skill when a task matches a prompt pattern that worked well before.",
      "---",
      "",
      "# Reusable Workflow",
      "",
      "Start from this proven prompt shape:",
      "",
      "```text",
      prompt,
      "```",
      "",
      "Before editing, preserve the explicit scope, constraints, and file references from the prompt.",
    ].join("\n"),
  };
}

function inferRuleContent(patterns: DetectedPattern[]): string {
  const example = patterns[0].matchedPhrase;
  if (/third.party|librar|depend|external/i.test(example)) {
    return "- Do not introduce third-party dependencies unless explicitly approved.";
  }
  if (/don't touch|leave.*alone|not.*modif/i.test(example)) {
    return "- Do not modify files outside the scope of the current task unless explicitly asked.";
  }
  return "- Follow the constraints stated at the start of the session; do not deviate without asking.";
}
