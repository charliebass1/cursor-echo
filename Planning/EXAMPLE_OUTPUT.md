# Cursor Session Coach Report

Generated 2026-06-19T00:19:20.671Z · classifier mode: **mock** · 5 session(s) analyzed

---

## Long-horizon signal

_This section exists for the research-facing goal of this tool: not "what should this user do differently" but "does friction compound over the course of a session, which matters for studying long-running agent tasks." With only a handful of sessions these numbers are illustrative, not statistically meaningful -- the value is the shape of the analysis, scaled up to a real batch of sessions._

- Friction rate, first half of sessions: **18%** of turns tagged
- Friction rate, second half of sessions: **28%** of turns tagged

| Session length | Sessions | Friction tags per turn |
|---|---|---|
| 1-5 turns | 1 | 0.33 |
| 11-20 turns | 1 | 0.27 |
| 6-10 turns | 3 | 0.23 |

---

## Friction patterns

### Repeated corrections

- **4** tagged turn(s), present in **40%** of sessions
- Examples:
  - User language suggests restating or correcting a prior instruction.
  - User language suggests restating or correcting a prior instruction.
  - User language suggests restating or correcting a prior instruction.
  - User language suggests restating or correcting a prior instruction.

### Scope mismatches

- **3** tagged turn(s), present in **40%** of sessions
- Examples:
  - User language suggests the agent's output didn't match intended scope.
  - User language suggests the agent's output didn't match intended scope.
  - User language suggests the agent's output didn't match intended scope.

### Clarification loops

- **2** tagged turn(s), present in **20%** of sessions
- Examples:
  - Agent asked a clarifying question instead of proceeding.
  - Agent asked a clarifying question instead of proceeding.

### Context loss

- **1** tagged turn(s), present in **20%** of sessions
- Examples:
  - User references something already said, implying the agent lost it.

---

## Suggestions

### Prompt rewrites

**State the constraint before the agent acts, not after** _(from: Repeated corrections)_

You're correcting the same kind of mistake more than once. State the constraint explicitly in the first message instead of letting the agent guess and then fixing it after the fact.

```
Instead of fixing after: "actually, use snake_case not camelCase"
Try stating upfront: "use snake_case for all new variable names, matching this file's existing convention"
```

**Bound scope explicitly with file or directory limits** _(from: Scope mismatches)_

The agent did meaningfully more or less than intended. Naming the exact files or directories in scope (and explicitly out of scope) removes the ambiguity that causes over- or under-reach.

```
Instead of: "refactor the auth logic"
Try: "refactor only /src/auth/session.ts -- don't touch /src/auth/oauth.ts or any test files"
```

**Front-load the missing context** _(from: Clarification loops)_

Sessions show the agent repeatedly asking what you meant before it could proceed. The fix is usually adding the one piece of context you're leaving implicit -- which file, which approach, which environment.

```
Instead of: "make the tests pass"
Try: "run `npm test`, fix failures in `/src/api` only, and don't touch test fixtures in `/tests/fixtures`"
```

**Re-state key constraints at the start of long sessions** _(from: Context loss)_

Long sessions show the agent losing track of earlier instructions. For multi-hour or multi-day work, briefly restate the 2-3 constraints that matter most when you pick the session back up.

### Automation suggestions

**Codify the convention as a Rule** _(.cursor/rules, from: Repeated corrections)_

Repeated corrections about the same convention are a signal that it belongs in a persistent rule rather than in your memory.

```
Add the convention to .cursor/rules/ so it's applied automatically rather than re-stated and re-corrected each session.
```

**Review the approach in Plan mode before execution** _(Plan / Ask mode, from: Scope mismatches)_

Scope mismatches are caught after the fact, once files have already changed. Plan mode produces a reviewable, editable plan before any code is touched -- catching an over-broad or under-scoped approach while it's still just a markdown file you can edit, not a diff you have to revert.

**Package the recurring task as a Skill** _(.cursor/skills, from: Scope mismatches)_

If a particular multi-step task (with a consistent, well-understood scope) comes up repeatedly, packaging it as a skill with explicit boundaries baked in removes scope ambiguity entirely.

```
Add a .cursor/skills/<task-name>/SKILL.md describing the exact scope and steps.
```

**Start ambiguous tasks in Plan or Ask mode, not Agent mode** _(Plan / Ask mode, from: Clarification loops)_

Clarifying questions mid-task interrupt a run that's already underway. Cursor's Plan mode has the agent research the codebase and ask clarifying questions up front, producing a reviewable plan before any files change -- so the back-and-forth happens before execution, not during it. Ask mode is the right call when you just want information with no changes at all.

```
Cycle modes with Shift+Tab (or Cmd/Ctrl+.) -- switch to Plan for anything with real ambiguity about approach or scope.
```

**Save plans to .cursor/plans/ and delegate exploration to subagents** _(subagents + .cursor/plans, from: Context loss)_

Context loss tends to show up specifically in long-running, multi-step work -- exactly the case Cursor's own agent harness work is focused on. Two concrete levers: save Plan Mode output to .cursor/plans/ so the constraints survive as a re-readable artifact instead of living only in the conversation, and delegate research/exploration to subagents (each with their own context window) so the main conversation's context stays focused on what's actually being decided.

```
In Plan mode, click "Save to workspace" to persist the plan to .cursor/plans/ before execution begins.
```

---

## Researcher dataset

A turn-level labeled dataset (one row per friction tag, with session length and position-within-session metadata) was written to `output/dataset.jsonl`. This is the structured counterpart to this narrative report -- the format a researcher would actually want to load and analyze, rather than read.