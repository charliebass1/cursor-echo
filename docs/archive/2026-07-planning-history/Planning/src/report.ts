import type { AggregatedPatterns, LongHorizonSignal, Suggestion } from "./types.js";

const CATEGORY_LABELS: Record<string, string> = {
  clarification_loop: "Clarification loops",
  repeated_correction: "Repeated corrections",
  context_loss: "Context loss",
  scope_mismatch: "Scope mismatches",
  clean_oneshot: "Clean one-shots",
};

const PRIMITIVE_LABELS: Record<string, string> = {
  rules: ".cursor/rules",
  hooks: ".cursor/hooks.json",
  skills: ".cursor/skills",
  mode: "Plan / Ask mode",
  subagents_plans: "subagents + .cursor/plans",
  none: "no config needed",
};

export function renderReport(
  agg: AggregatedPatterns,
  suggestions: Suggestion[],
  longHorizon: LongHorizonSignal,
  mode: "sdk" | "mock"
): string {
  const lines: string[] = [];

  lines.push(`# Cursor Session Coach Report`);
  lines.push("");
  lines.push(`Generated ${new Date().toISOString()} · classifier mode: **${mode}** · ${agg.totalSessions} session(s) analyzed`);
  lines.push("");
  lines.push(`---`);
  lines.push("");
  lines.push(`## Long-horizon signal`);
  lines.push("");
  lines.push(
    `_This section exists for the research-facing goal of this tool: not "what should this user do differently" but "does friction compound over the course of a session, which matters for studying long-running agent tasks." With only a handful of sessions these numbers are illustrative, not statistically meaningful -- the value is the shape of the analysis, scaled up to a real batch of sessions._`
  );
  lines.push("");
  lines.push(
    `- Friction rate, first half of sessions: **${Math.round(longHorizon.firstHalfFrictionRate * 100)}%** of turns tagged`
  );
  lines.push(
    `- Friction rate, second half of sessions: **${Math.round(longHorizon.secondHalfFrictionRate * 100)}%** of turns tagged`
  );
  lines.push("");
  if (longHorizon.byLengthBucket.length > 0) {
    lines.push(`| Session length | Sessions | Friction tags per turn |`);
    lines.push(`|---|---|---|`);
    for (const b of longHorizon.byLengthBucket) {
      lines.push(`| ${b.bucket} | ${b.sessionCount} | ${b.frictionPerTurn.toFixed(2)} |`);
    }
    lines.push("");
  }

  lines.push(`---`);
  lines.push("");
  lines.push(`## Friction patterns`);
  lines.push("");

  if (agg.patterns.length === 0) {
    lines.push("No patterns detected.");
  }

  for (const p of agg.patterns) {
    const label = CATEGORY_LABELS[p.category] ?? p.category;
    lines.push(`### ${label}`);
    lines.push("");
    lines.push(`- **${p.count}** tagged turn(s), present in **${Math.round(p.sessionCoverage * 100)}%** of sessions`);
    if (p.examples.length > 0) {
      lines.push(`- Examples:`);
      for (const ex of p.examples) {
        lines.push(`  - ${ex}`);
      }
    }
    lines.push("");
  }

  lines.push(`---`);
  lines.push("");
  lines.push(`## Suggestions`);
  lines.push("");

  const promptRewrites = suggestions.filter((s) => s.type === "prompt_rewrite");
  const automations = suggestions.filter((s) => s.type === "automation");

  if (promptRewrites.length > 0) {
    lines.push(`### Prompt rewrites`);
    lines.push("");
    for (const s of promptRewrites) {
      lines.push(`**${s.title}** _(from: ${CATEGORY_LABELS[s.triggeredBy]})_`);
      lines.push("");
      lines.push(s.description);
      if (s.example) {
        lines.push("");
        lines.push("```");
        lines.push(s.example);
        lines.push("```");
      }
      lines.push("");
    }
  }

  if (automations.length > 0) {
    lines.push(`### Automation suggestions`);
    lines.push("");
    for (const s of automations) {
      lines.push(`**${s.title}** _(${PRIMITIVE_LABELS[s.cursorPrimitive]}, from: ${CATEGORY_LABELS[s.triggeredBy]})_`);
      lines.push("");
      lines.push(s.description);
      if (s.example) {
        lines.push("");
        lines.push("```");
        lines.push(s.example);
        lines.push("```");
      }
      lines.push("");
    }
  }

  if (promptRewrites.length === 0 && automations.length === 0) {
    lines.push("No suggestions generated -- not enough friction signal in this batch.");
  }

  lines.push(`---`);
  lines.push("");
  lines.push(`## Researcher dataset`);
  lines.push("");
  lines.push(
    `A turn-level labeled dataset (one row per friction tag, with session length and position-within-session metadata) was written to \`output/dataset.jsonl\`. This is the structured counterpart to this narrative report -- the format a researcher would actually want to load and analyze, rather than read.`
  );

  return lines.join("\n");
}
