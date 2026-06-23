# Cursor Echo  ·  4 sessions  ·  26 turns

---

## Start here

Do this first: Create the suggested rule below, then rerun Echo after a few sessions to see if this pattern drops.

Why: this was the most common signal in this run, seen in 1 of 4 sessions.

---

## You often re-explain context the agent forgot
Seen in 1 of 4 sessions

The fix: save repeated context as a Cursor Rule so you never have to say it again.

Next action: Create the suggested rule below, then rerun Echo after a few sessions to see if this pattern drops.

Why Echo flagged this: Echo found language where you referenced an instruction or constraint you had already given.

From your sessions:
> "I already told you — no third-party HTTP libraries. got is a third-party library. Please remove it and implement the retry logic with a..."

Copy-ready Cursor Rule → .cursor/rules/project-conventions.mdc

```text
---
description: Project conventions inferred from repeated Cursor corrections
alwaysApply: true
---

- Do not introduce third-party dependencies unless explicitly approved.
```

---

## The agent sometimes does more than you asked
Seen in 1 of 4 sessions

The fix: use Plan mode to review the approach before the agent runs. You approve, then it acts.

Next action: Start broad or risky tasks in Plan mode and approve the scope before letting the agent edit files.

Why Echo flagged this: Echo found correction language that usually means the agent changed more, less, or different code than intended.

From your sessions:
> "The mobile nav menu isn't closing when a user taps a link. Can you fix the click handler in /src/components/MobileNav.tsx? Just the..."

Plan-mode scope prompt

```text
Before editing, make a short plan.

Task:
- <what I want changed>

In scope:
- <files, folders, or behavior the agent may change>

Out of scope:
- <files, folders, behavior, dependencies, or refactors to avoid>

Before making changes, tell me the files you expect to touch and wait for approval.
```

---

## You and the agent go back and forth clarifying intent
Seen in 1 of 4 sessions

The fix: front-load specifics in your prompt — name the file, the approach, and what's out of scope. For exploratory questions, use Ask mode instead of Agent mode.

Next action: Rewrite your next similar prompt with the file, desired outcome, and out-of-scope work in the first message.

Why Echo flagged this: Echo found an assistant clarification question where the missing context could likely have been included up front.

From your sessions:
> "I can help with that. A few questions first: 1. Which database are you using — Postgres, MySQL, or SQLite? 2. Do you want me to use a..."

Front-loaded prompt template

```text
Goal:
- <the outcome I want>

Context:
- File or area: <path or component>
- Current behavior: <what is happening now>
- Desired behavior: <what should happen instead>

Constraints:
- <what not to change>
- <dependency, style, or compatibility constraints>

If anything is still ambiguous, ask before editing.
```

---

## 2 prompts that worked especially well

These are clean, specific, and got good results. Worth saving as reusable Skills.

· "Add a loading spinner to the ParticipantList component in /src/components/ParticipantList.tsx while the Supabase query i..."

Reusable Skill draft → .cursor/skills/reusable-workflow/SKILL.md

````text
---
name: reusable-workflow
description: Use this skill when a task matches a prompt pattern that worked well before.
---

# Reusable Workflow

Start from this proven prompt shape:

```text
Add a loading spinner to the ParticipantList component in /src/components/ParticipantList.tsx while the Supabase query i...
```

Before editing, preserve the explicit scope, constraints, and file references from the prompt.
````

· "I need to refactor the data pipeline in /src/pipeline. Important constraint: we cannot use any third-party HTTP librarie..."

Reusable Skill draft → .cursor/skills/reusable-workflow/SKILL.md

````text
---
name: reusable-workflow
description: Use this skill when a task matches a prompt pattern that worked well before.
---

# Reusable Workflow

Start from this proven prompt shape:

```text
I need to refactor the data pipeline in /src/pipeline. Important constraint: we cannot use any third-party HTTP librarie...
```

Before editing, preserve the explicit scope, constraints, and file references from the prompt.
````

---