# Cursor Session Coach

A small tool that reads exported Cursor chat transcripts, tags moments of
friction using a fixed taxonomy, and serves two distinct goals:

1. **Help the user.** Generates **prompt rewrites** (how to ask better next
   time) and **automation suggestions** tied to Cursor's real features --
   Plan/Ask mode, subagents, `.cursor/plans/`, `.cursor/rules`,
   `.cursor/hooks.json`, `.cursor/skills/` -- mapped to the specific
   friction pattern that triggered them.
2. **Help Cursor's researchers.** Exports a turn-level **labeled dataset**
   (`output/dataset.jsonl`) with session-length and position-within-session
   metadata, plus a **long-horizon signal** section in the report showing
   whether friction concentrates later in sessions -- the specific question
   relevant to studying degradation in long-running agent tasks, as opposed
   to a flat friction count.

## Why this exists

This started as a portfolio project while exploring the User Researcher
role at Cursor. Cursor's own [Auto-review post](https://cursor.com/blog/agent-autonomy-auto-review)
describes a trust-calibration problem: ask permission too often and people
stop reading; don't ask enough and risky actions slip through. Their
classifier evals are built from internal developer sessions. This tool is
a small prototype of a complementary signal source -- not engineer-session
data, but a lightweight, repeatable way to mine **your own** sessions for
friction patterns and turn them into concrete fixes, using Cursor's actual
SDK rather than just writing about the idea.

It's also just genuinely useful on its own: most people's Cursor workflow
improvements happen by vague intuition ("I feel like I keep re-explaining
things"). This makes that concrete.

## How it works

1. **Parse** -- `data/synthetic/` and `data/real/` hold transcripts in a
   simple `User: / Agent:` markdown format (see `data/real/README.md`).
2. **Classify** -- each session is tagged against a 5-category friction
   taxonomy: `clarification_loop`, `repeated_correction`, `context_loss`,
   `scope_mismatch`, `clean_oneshot`. This runs either:
   - via **Cursor's own SDK** (`@cursor/sdk`, using `Agent.prompt()`) --
     the default, real path, or
   - via an **offline heuristic classifier** (`--mock` flag) -- keyword/regex
     based, no API key needed, useful for developing the pipeline without
     spending API credits.
3. **Aggregate** -- counts and session-coverage per category across the batch.
4. **Long-horizon signal** -- separately, computes friction rate in the
   first half vs second half of each session, and friction-per-turn
   bucketed by session length. This is the piece aimed specifically at
   goal #2 -- it answers "does friction compound as a session gets longer"
   rather than just "how much friction is there."
5. **Suggest** -- maps recurring patterns to prompt rewrites and, once a
   pattern crosses a coverage threshold, automation suggestions referencing
   real Cursor features (Plan/Ask mode, subagents, a rule, a hook, a skill).
6. **Report + dataset** -- writes a markdown report to `output/report.md`
   (goal #1, human-readable) and a labeled JSONL dataset to
   `output/dataset.jsonl` (goal #2, machine-readable -- one row per
   friction tag with session length and position-within-session metadata).

## Setup

```bash
npm install
cp .env.example .env
# add your Cursor API key to .env (Settings -> Integrations -> API Keys, Pro plan or above)
```

## Usage

Run with the real Cursor SDK classifier (uses your API key, costs tokens):

```bash
npm run analyze
```

Run with the offline mock classifier (free, good for testing the pipeline):

```bash
npm run analyze:mock
```

Either way, the report lands at `output/report.md` and the dataset at
`output/dataset.jsonl`. A sample run against the synthetic fixtures (mock
mode) is checked in at `EXAMPLE_OUTPUT.md` and `EXAMPLE_DATASET.jsonl` so
you can see what it produces without running anything first.

## Adding your own sessions

Drop exported transcripts into `data/real/` following the format in
`data/real/README.md`. They'll be analyzed alongside (or instead of) the
synthetic examples automatically.

## Known limitations / honest caveats

- **The Cursor SDK is in public beta.** `src/cursorAgent.ts` is written
  against the actual type declarations shipped in the installed
  `@cursor/sdk` version (`Agent.prompt()` returns a `RunResult` with a
  `.result` string field) rather than guessed from blog post snippets.
  If a future SDK version changes that shape, `npm run build` (a
  `tsc --noEmit` type check) will catch it immediately.
- **The mock classifier is intentionally simple.** It's regex/keyword
  based and exists for offline pipeline development, not as a serious
  substitute for the SDK classifier's judgment on real, messy transcripts.
- **The friction taxonomy is a starting point, not a finished framework.**
  Five categories is enough to demonstrate the idea; a production version
  would likely need refinement against a larger, more diverse set of real
  sessions, and probably input from people who actually study this for a
  living.
- **Suggestion templates are currently fixed per category.** A natural
  next step: have the classifier fill in the *specific* recurring
  convention or file path per pattern (e.g. "you stated the snake_case
  convention 4 times" instead of a generic template), rather than a fixed
  string per category.
- **The long-horizon signal needs real volume to mean anything.** With 5
  synthetic sessions, the first-half/second-half split and the
  length-bucketed table are demonstrations of the *method*, not a finding.
  The report says this explicitly. This becomes a real signal once it's
  run against dozens or hundreds of real sessions -- which is the point:
  the pipeline is built so that scaling up the input is the only thing
  that needs to change.

## Project structure

```
src/
  types.ts            -- shared types incl. the friction taxonomy
  parseTranscript.ts   -- markdown transcript parser
  cursorAgent.ts        -- thin wrapper around @cursor/sdk
  classifier.ts         -- SDK-based + offline mock classifiers
  aggregate.ts           -- pattern aggregation across sessions
  longHorizon.ts          -- first/second-half + length-bucketed friction analysis
  datasetExport.ts        -- builds + writes the labeled JSONL dataset
  suggest.ts               -- pattern -> prompt rewrite / automation mapping
  report.ts                 -- markdown report renderer
  index.ts                    -- CLI entrypoint
data/
  synthetic/  -- 5 example transcripts, one per friction category
  real/       -- drop your own exported transcripts here
output/
  report.md      -- generated after running `npm run analyze`
  dataset.jsonl  -- generated alongside it
```
