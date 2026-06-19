import type { AggregatedPatterns, FrictionCategory, Suggestion } from "./types.js";

/**
 * This is the layer that turns "here's what's wrong" into "here's the fix."
 * Each friction category maps to a template suggestion. Templates are
 * deliberately generic placeholders -- in a fuller version, the SDK
 * classifier could be asked to fill in the specifics (the actual repeated
 * convention, the actual file path) per-pattern instead of using a fixed
 * template. That's a natural next step, called out in the README.
 */

const COVERAGE_THRESHOLD_FOR_AUTOMATION = 0.25; // surfaces automation suggestions once a pattern hits ~25%+ of sessions

function suggestionsFor(category: FrictionCategory, sessionCoverage: number): Suggestion[] {
  switch (category) {
    case "clarification_loop":
      return [
        {
          type: "prompt_rewrite",
          triggeredBy: category,
          title: "Front-load the missing context",
          description:
            "Sessions show the agent repeatedly asking what you meant before it could proceed. The fix is usually adding the one piece of context you're leaving implicit -- which file, which approach, which environment.",
          example:
            'Instead of: "make the tests pass"\nTry: "run `npm test`, fix failures in `/src/api` only, and don\'t touch test fixtures in `/tests/fixtures`"',
          cursorPrimitive: "none",
        },
        {
          type: "automation",
          triggeredBy: category,
          title: "Start ambiguous tasks in Plan or Ask mode, not Agent mode",
          description:
            "Clarifying questions mid-task interrupt a run that's already underway. Cursor's Plan mode has the agent research the codebase and ask clarifying questions up front, producing a reviewable plan before any files change -- so the back-and-forth happens before execution, not during it. Ask mode is the right call when you just want information with no changes at all.",
          example: "Cycle modes with Shift+Tab (or Cmd/Ctrl+.) -- switch to Plan for anything with real ambiguity about approach or scope.",
          cursorPrimitive: "mode",
        },
        ...(sessionCoverage >= COVERAGE_THRESHOLD_FOR_AUTOMATION
          ? [
              {
                type: "automation" as const,
                triggeredBy: category,
                title: "Persist recurring context as a Rule",
                description:
                  "If the same missing context (a convention, a directory boundary, a preferred library) keeps triggering clarifying questions across sessions, it's cheaper to state it once in a rule than to repeat it in every prompt.",
                example:
                  "Add a .cursor/rules/project-conventions.mdc file describing the recurring context (e.g. \"Tests live in /tests, source in /src, never modify /tests/fixtures\").",
                cursorPrimitive: "rules" as const,
              },
            ]
          : []),
      ];

    case "repeated_correction":
      return [
        {
          type: "prompt_rewrite",
          triggeredBy: category,
          title: "State the constraint before the agent acts, not after",
          description:
            "You're correcting the same kind of mistake more than once. State the constraint explicitly in the first message instead of letting the agent guess and then fixing it after the fact.",
          example:
            'Instead of fixing after: "actually, use snake_case not camelCase"\nTry stating upfront: "use snake_case for all new variable names, matching this file\'s existing convention"',
          cursorPrimitive: "none",
        },
        ...(sessionCoverage >= COVERAGE_THRESHOLD_FOR_AUTOMATION
          ? [
              {
                type: "automation" as const,
                triggeredBy: category,
                title: "Codify the convention as a Rule",
                description:
                  "Repeated corrections about the same convention are a signal that it belongs in a persistent rule rather than in your memory.",
                example:
                  "Add the convention to .cursor/rules/ so it's applied automatically rather than re-stated and re-corrected each session.",
                cursorPrimitive: "rules" as const,
              },
            ]
          : []),
      ];

    case "context_loss":
      return [
        {
          type: "prompt_rewrite",
          triggeredBy: category,
          title: "Re-state key constraints at the start of long sessions",
          description:
            "Long sessions show the agent losing track of earlier instructions. For multi-hour or multi-day work, briefly restate the 2-3 constraints that matter most when you pick the session back up.",
          cursorPrimitive: "none",
        },
        {
          type: "automation",
          triggeredBy: category,
          title: "Save plans to .cursor/plans/ and delegate exploration to subagents",
          description:
            "Context loss tends to show up specifically in long-running, multi-step work -- exactly the case Cursor's own agent harness work is focused on. Two concrete levers: save Plan Mode output to .cursor/plans/ so the constraints survive as a re-readable artifact instead of living only in the conversation, and delegate research/exploration to subagents (each with their own context window) so the main conversation's context stays focused on what's actually being decided.",
          example: "In Plan mode, click \"Save to workspace\" to persist the plan to .cursor/plans/ before execution begins.",
          cursorPrimitive: "subagents_plans",
        },
        ...(sessionCoverage >= COVERAGE_THRESHOLD_FOR_AUTOMATION
          ? [
              {
                type: "automation" as const,
                triggeredBy: category,
                title: "Use a session-start hook to re-inject key context",
                description:
                  "A hook can run at the start of a session and inject a fixed reminder of standing constraints, so they don't depend on the agent's working memory across a long conversation.",
                example:
                  '.cursor/hooks.json:\n{\n  "version": 1,\n  "hooks": {\n    "sessionStart": [\n      { "command": "cat .cursor/context-reminder.md" }\n    ]\n  }\n}',
                cursorPrimitive: "hooks" as const,
              },
            ]
          : []),
      ];

    case "scope_mismatch":
      return [
        {
          type: "prompt_rewrite",
          triggeredBy: category,
          title: "Bound scope explicitly with file or directory limits",
          description:
            "The agent did meaningfully more or less than intended. Naming the exact files or directories in scope (and explicitly out of scope) removes the ambiguity that causes over- or under-reach.",
          example:
            'Instead of: "refactor the auth logic"\nTry: "refactor only /src/auth/session.ts -- don\'t touch /src/auth/oauth.ts or any test files"',
          cursorPrimitive: "none",
        },
        {
          type: "automation",
          triggeredBy: category,
          title: "Review the approach in Plan mode before execution",
          description:
            "Scope mismatches are caught after the fact, once files have already changed. Plan mode produces a reviewable, editable plan before any code is touched -- catching an over-broad or under-scoped approach while it's still just a markdown file you can edit, not a diff you have to revert.",
          cursorPrimitive: "mode",
        },
        ...(sessionCoverage >= COVERAGE_THRESHOLD_FOR_AUTOMATION
          ? [
              {
                type: "automation" as const,
                triggeredBy: category,
                title: "Package the recurring task as a Skill",
                description:
                  "If a particular multi-step task (with a consistent, well-understood scope) comes up repeatedly, packaging it as a skill with explicit boundaries baked in removes scope ambiguity entirely.",
                example: "Add a .cursor/skills/<task-name>/SKILL.md describing the exact scope and steps.",
                cursorPrimitive: "skills" as const,
              },
            ]
          : []),
      ];

    case "clean_oneshot":
      return [
        {
          type: "automation",
          triggeredBy: category,
          title: "Turn what's already working into a reusable Skill",
          description:
            "These sessions show a request handled cleanly with no friction. That's a good candidate to formalize as a skill or rule so it stays reliable as the workflow gets reused.",
          cursorPrimitive: "skills",
        },
      ];

    default:
      return [];
  }
}

export function generateSuggestions(agg: AggregatedPatterns): Suggestion[] {
  return agg.patterns.flatMap((p) => suggestionsFor(p.category, p.sessionCoverage));
}
