# Product Requirements Document: Cursor Session Coach

## 1. Product definition

**Name:** Cursor Echo

**One-liner:** A local CLI that reads your Cursor chat transcripts, tags friction patterns, and tells you exactly which Cursor features to use to fix them.

**Form factor:** TypeScript CLI, invoked via `npm run analyze`. No server, no UI, no accounts. Runs locally, reads local files, writes local files.

**Two audiences, two outputs:**

| Audience | Output | Format |
|---|---|---|
| The user (Cursor power-user) | Coaching report: per-session breakdown, aggregated friction patterns, prompt rewrites, and automation suggestions mapped to Cursor primitives | `output/report.md` |
| Cursor researchers / the Cursor team | Labeled dataset: one row per friction tag, with session length + position-within-session metadata for studying long-horizon degradation | `output/dataset.jsonl` |

---

## 2. Problem statement

Most Cursor users improve their workflow by vague intuition ("I feel like I keep re-explaining things"). There is no lightweight, repeatable way to:
- Identify *specific* recurring friction patterns in your own sessions
- Map those patterns to *concrete* Cursor features (Rules, Hooks, Skills, Plan mode, subagents) that would eliminate them
- Track whether friction compounds over the course of longer sessions

Cursor's own Auto-review research builds classifiers from internal engineer-session data. This tool is a complementary signal: user-side, self-serve, running against your own transcripts.

---

## 3. Friction taxonomy

The classifier targets exactly 5 categories. Each is mutually exclusive per turn, and each has a defined tagging rule (which role's turn gets tagged):

| Category | Meaning | Tagged turn |
|---|---|---|
| `clarification_loop` | Agent asks what the user meant instead of proceeding | Agent turn |
| `repeated_correction` | User restates or corrects the same instruction again | User turn |
| `context_loss` | Agent forgot a constraint stated earlier in the session | User turn |
| `scope_mismatch` | Agent did meaningfully more or less than intended | User turn |
| `clean_oneshot` | No friction -- a clean exchange worth formalizing | Last turn of sequence |

This taxonomy is a starting point. Five categories is enough to produce actionable suggestions and a useful dataset. Expanding it is a future concern, gated on running against a larger, more diverse set of real sessions.

---

## 4. Cursor primitive mapping

Each friction category maps to specific Cursor features the user should adopt. This is what makes the tool more than a linter -- it prescribes the fix, not just the problem.

| Friction category | Prompt rewrite (always shown) | Automation suggestion (shown at >=25% session coverage) |
|---|---|---|
| `clarification_loop` | Front-load missing context | Use Plan/Ask mode; persist context as a Rule |
| `repeated_correction` | State constraints before agent acts | Codify convention in `.cursor/rules/` |
| `context_loss` | Re-state key constraints in long sessions | Save plans to `.cursor/plans/`; delegate to subagents; use session-start Hook |
| `scope_mismatch` | Bound scope with explicit file/directory limits | Review approach in Plan mode; package as a Skill |
| `clean_oneshot` | (none -- already working) | Formalize as a reusable Skill |

---

## 5. Inputs

### 5a. Synthetic transcripts (bundled)

Five markdown files in `data/synthetic/`, one per friction category. These serve as:
- The demo dataset (run `npm run analyze:mock` with zero setup)
- Regression fixtures for the pipeline
- Format examples for users writing their own

Format: optional YAML frontmatter, then `User:` / `Agent:` turn markers on their own lines.

### 5b. User-provided markdown transcripts

Dropped into `data/real/`. Same format as synthetic. Analyzed alongside synthetic data automatically.

### 5c. Real Cursor agent transcripts (auto-ingested)

JSONL files from `~/.cursor/projects/*/agent-transcripts/`. Each line is a JSON object:

```json
{"role": "user", "message": {"content": [{"type": "text", "text": "..."}]}}
{"role": "assistant", "message": {"content": [{"type": "text", "text": "..."}, {"type": "tool_use", ...}]}}
```

Ingestion rules:
- Extract only text content blocks from `user` and `assistant` roles
- Strip system-injected metadata (timestamps, `<system_reminder>` tags, `<attached_files>` blocks) from user content
- Skip turns that are tool-use-only (no text content) -- these are execution, not conversation
- Ignore `subagents/` subdirectories (subagent transcripts are not standalone sessions)
- Session ID = the UUID directory name

Invoked via `--transcripts <path>` flag pointing at any directory containing `.jsonl` files, or via `npm run analyze:real` which auto-discovers `~/.cursor/projects/*/agent-transcripts/`.

---

## 6. Outputs

### 6a. Report (`output/report.md`)

Sections in order:

1. **Header** -- timestamp, classifier mode (sdk/mock), session count
2. **Session breakdown** -- per-session: ID, turn count, friction tags found, one-line summary
3. **Long-horizon signal** -- first-half vs second-half friction rate (pooled), friction-per-turn by session-length bucket (1-5, 6-10, 11-20, 21+ turns)
4. **Friction patterns** -- per-category: tag count, session coverage percentage, example rationales (up to 4, quoting specific transcript content)
5. **Suggestions: Prompt rewrites** -- one per detected friction category, with concrete before/after examples
6. **Suggestions: Automation** -- triggered when a category hits >=25% session coverage, naming the specific Cursor primitive and giving a pasteable config snippet
7. **Researcher dataset** -- pointer to `output/dataset.jsonl` with a note on its shape

### 6b. Dataset (`output/dataset.jsonl`)

One JSON object per line, one line per friction tag. Schema:

```
session_id       string    UUID or filename stem
turn_index       number    0-based position in session
session_length   number    total turns in session
position_ratio   number    0.0 (start) to 1.0 (end)
category         string    one of the 5 taxonomy categories
rationale        string    one sentence, grounded in transcript content
turn_content     string    the tagged turn's text, truncated to 400 chars
classifier_mode  string    "sdk" or "mock"
```

---

## 7. Classifier modes

### 7a. SDK mode (default)

Uses `@cursor/sdk` (`Agent.prompt()`) to classify each session. Sends the full transcript with a structured prompt specifying the taxonomy and tagging rules. Expects JSON output.

Requires: `CURSOR_API_KEY` in `.env`. Costs tokens.

Model: configurable via `CURSOR_MODEL_ID` env var, defaults to `composer-2.5`.

### 7b. Mock mode (`--mock` flag)

Offline regex/keyword heuristic classifier. No API key, no cost, no network.

Detection patterns:
- `clarification_loop`: agent turn matches clarifying-question keywords ("what do you mean", "can you clarify", "which file", etc.)
- `repeated_correction`: user turn matches correction keywords ("actually", "i meant", "no, i", "that's not", etc.)
- `context_loss`: user turn matches reference-back keywords ("i already said", "as i mentioned", "we discussed", etc.)
- `scope_mismatch`: user turn matches scope keywords ("too much", "only", "just the", "don't touch", etc.)
- `clean_oneshot`: assigned when no other tags are found

Rationale strings must include the specific matched phrase from the turn, not a generic category-level string.

---

## 8. CLI interface

```
npm run analyze              # SDK mode, data/synthetic + data/real
npm run analyze:mock         # Mock mode, data/synthetic + data/real
npm run analyze:real         # Mock mode, auto-discovers ~/.cursor agent transcripts

npx tsx src/index.ts [flags]
  --mock                     Use offline heuristic classifier
  --transcripts <path>       Path to directory of .jsonl transcript files
```

Exit codes:
- 0: success
- 1: no transcripts found, or all analyses failed

stdout: progress log (session count, classifier mode, per-session tag counts).
File output: `output/report.md`, `output/dataset.jsonl`.

---

## 9. Project structure (end state)

```
cursor-session-coach/
  src/
    index.ts                  CLI entrypoint
    types.ts                  Shared types, friction taxonomy
    parseTranscript.ts        Markdown transcript parser
    parseJsonlTranscript.ts   Cursor agent-transcript JSONL parser
    cursorAgent.ts            @cursor/sdk wrapper
    classifier.ts             SDK + mock classifiers
    aggregate.ts              Cross-session pattern aggregation
    longHorizon.ts            Position-within-session analysis
    suggest.ts                Friction -> suggestion mapping
    report.ts                 Markdown report renderer
    datasetExport.ts          JSONL dataset builder
  data/
    synthetic/                5 bundled example transcripts
    real/                     User-provided markdown transcripts (gitignored contents)
  output/                     Generated report + dataset (gitignored)
  package.json
  tsconfig.json
  .env.example
  .gitignore
  LICENSE                     MIT
  README.md
  EXAMPLE_OUTPUT.md           Pre-generated example report
  EXAMPLE_DATASET.jsonl       Pre-generated example dataset
```

---

## 10. Non-requirements (deliberately excluded)

- **No web UI.** The report is markdown. It renders on GitHub, in VS Code preview, and in any text editor. A dashboard adds complexity without adding information.
- **No database.** JSONL is the persistence format. It's appendable, greppable, and trivially loadable in Python/JS/jq.
- **No multi-user / server mode.** This reads chat transcripts. Keeping it local-only is a privacy feature.
- **No test framework.** The 5 synthetic fixtures are the test cases. `npm run analyze:mock` against them is the regression test. Formal test infra is warranted only after the taxonomy or pipeline changes substantially.
- **No real-time / watch mode.** Batch analysis after sessions is the interaction model. Hooking into live sessions is a different tool.

---

## 11. Success criteria for v0.1

The prototype is done when:

1. `npm run analyze:mock` runs clean against synthetic data and produces a report that matches the structure defined in Section 6a
2. `npm run analyze:real` (or `--transcripts <path>`) successfully parses at least one real Cursor agent-transcript JSONL file and includes it in the report
3. Mock classifier rationales quote specific transcript content, not generic category strings
4. The report includes a per-session breakdown section
5. Suggestion examples reference actual transcript content where available
6. `npm run build` (`tsc --noEmit`) passes with zero errors
7. A new user can clone the repo, run `npm install && npm run analyze:mock`, and read a useful report in under 2 minutes
