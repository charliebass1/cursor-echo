# Cursor Echo  ·  4 sessions  ·  26 turns

---

## You often re-explain context the agent forgot
Seen in 1 of 4 sessions

The fix: save repeated context as a Cursor Rule so you never have to say it again.

From your sessions:
> "I already told you — no third-party HTTP libraries. got is a third-party library. Please remove it and implement the retry logic with a..."

Suggested rule → .cursor/rules/project-conventions.mdc
  Do not introduce third-party dependencies unless explicitly approved.

---

## The agent sometimes does more than you asked
Seen in 1 of 4 sessions

The fix: use Plan mode to review the approach before the agent runs. You approve, then it acts.

From your sessions:
> "The mobile nav menu isn't closing when a user taps a link. Can you fix the click handler in /src/components/MobileNav.tsx? Just the..."

---

## You and the agent go back and forth clarifying intent
Seen in 1 of 4 sessions

The fix: front-load specifics in your prompt — name the file, the approach, and what's out of scope. For exploratory questions, use Ask mode instead of Agent mode.

From your sessions:
> "I can help with that. A few questions first: 1. Which database are you using — Postgres, MySQL, or SQLite? 2. Do you want me to use a..."

---

## 2 prompts that worked especially well

These are clean, specific, and got good results. Worth saving as reusable Skills.

· "Add a loading spinner to the ParticipantList component in /src/components/ParticipantList.tsx while the Supabase query i..."
· "I need to refactor the data pipeline in /src/pipeline. Important constraint: we cannot use any third-party HTTP librarie..."

---