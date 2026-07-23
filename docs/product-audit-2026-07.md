# Cursor Echo Product Audit

**Audit date:** July 2026  
**Canonical baseline:** `main` at `dda7005`  
**Product version:** `0.1.0`

## Executive summary

Echo is a working, early-stage Cursor extension that analyzes a developer's local
agent transcripts and turns repeated interaction friction into practical
workflow advice. Its strongest current experience is simple: run one command,
read a short Markdown report, see evidence from your own chats, and get a
copy-ready Rule, prompt, or Skill draft.

The opportunity is larger than detecting friction. Generic Cursor Skills,
prompting methods, and agent-swarm advice are abundant, but they are rarely
matched to an individual developer's behavior. Echo can become the personalized
efficiency layer for Cursor: choose the method that fits this user, show the
evidence, tailor the artifact, help apply it safely, and measure whether it
worked.

The product is not yet ready to support that promise reliably. There are no
automated tests or CI checks, the recommendation system is a small hard-coded
mapping, and Echo does not remember whether a recommendation was adopted or
helpful. Reliability and recommendation architecture should therefore precede
more UI or more AI features.

## Product direction

### North-star promise

> Tell me the single best way to improve my Cursor workflow next, show me why it
> applies to me, and help me adopt it safely.

### Differentiation

Echo should not compete by publishing another generic prompt guide. Its
advantage is the private, local evidence already present in a user's Cursor
history:

1. Observe recurring behavior across real sessions.
2. Match that evidence to a curated workflow playbook.
3. Explain why the method fits this user and when it does not.
4. Generate or apply a tailored Rule, Skill, prompt, plan, or checklist.
5. Compare later sessions to see whether the matched friction declined.

The library should be curated and versioned with Echo. Ingesting social posts or
operating a community feed would add trust, moderation, freshness, and network
dependencies before the core matching loop is proven.

## What exists today

### Core workflow

- `Cursor Echo: Analyze My Sessions` discovers transcripts for the open
  workspace, filters short sessions, analyzes them, opens a Markdown preview,
  and normally saves `.cursor/echo-report.md`.
- `Cursor Echo: Analyze with Fixtures` runs the bundled sample transcripts
  without sending data or requiring real sessions.
- `Cursor Echo: Apply Top Rule Recommendation` reruns analysis and writes the
  highest-ranked Rule recommendation into `.cursor/rules/`.
- Echo Pro commands store or clear a bring-your-own API key using VS Code
  `SecretStorage`.

### Signals and actions

The local classifier recognizes three friction signals and one positive signal:

- Re-explained context becomes a Rule recommendation.
- Scope mismatch becomes a Plan-mode scope prompt.
- Clarification back-and-forth becomes a front-loaded prompt template.
- A strong prompt becomes a reusable Skill draft.

The report ranks friction by the number of sessions in which it appeared,
selects a `Start here` action, includes a quote, explains the detection, and
renders a copy-ready artifact.

### Local-first default

Without Echo Pro, transcript text stays on the machine and analysis uses regular
expressions. Echo discovers primary `.jsonl` transcripts under
`~/.cursor/projects/`, skips `subagents/`, supports a custom path, and sorts
sessions by modification time. When a workspace is open, discovery first scopes
analysis to that workspace.

### Optional Echo Pro path

Echo Pro supports Anthropic, OpenAI, and the optional Cursor SDK provider. It:

- requires an API key stored in `SecretStorage`;
- asks for one-time explicit consent before transcript text leaves the machine;
- can redact likely secrets;
- caps the number of sessions submitted;
- uses AI classification, artifact enrichment, and a short coaching section;
- falls back to local heuristics if configuration, network calls, or model
  output fail.

Fixtures deliberately run in local mode so the demo remains deterministic and
private.

## Architecture and maturity

The extension is a small TypeScript/esbuild application:

```text
discover.ts -> parse.ts -> classify.ts or ai/classify.ts
            -> suggest.ts -> optional ai/enrich.ts
            -> report.ts -> Markdown preview / workspace artifact
```

`src/extension.ts` owns command registration, orchestration, AI fallback, and
Rule application. `src/ai/` contains provider configuration, direct HTTP and
Cursor SDK adapters, redaction, classification, enrichment, and insights.

Evidence of a functional prototype:

- The real-session and fixture paths are implemented end to end.
- Four fixture transcripts and `EXAMPLE_REPORT.md` demonstrate intended output.
- Packaging produces a VSIX and the default path needs no account or service.
- Error handling normally preserves a usable local report.

Evidence that the product is still early:

- There is no automated test suite, golden-report check, or CI workflow.
- There is no release automation or documented published marketplace listing.
- Parser failures and filtered sessions are silently skipped.
- Recommendation ranking only counts affected sessions; ties have no explicit
  product logic.
- The playbook set is embedded in `suggest.ts` and is too small to express
  triggers, contraindications, expected outcomes, or versions.
- Rule application can overwrite an existing file after one confirmation and
  provides no diff preview.
- Only the first workspace folder is considered.
- Echo has no recommendation history, adoption state, or outcome comparison.
- Version `0.1.0` now covers more behavior than the active PRD described.

## Repository and branch audit

`origin/main` is the complete source of truth. The former
`research/long-horizon-agent-tasks` and `claude/friendly-cori-2yeo0b` branches
were merged and contain no commits missing from `main`. New work should not be
based on either branch.

Active product documents are:

- `README.md` for installation and usage;
- `cursor-echo-prd-v2.md` for current product requirements;
- `EXAMPLE_REPORT.md` for fixture output;
- `docs/product-roadmap.md` for forward work;
- this audit for the July 2026 baseline.

The former `Planning/` CLI is an archived, superseded product direction. It used
a separate taxonomy and included researcher dataset export; neither defines the
extension roadmap.

The long-horizon research has two locations for a deliberate reason:

- `research/long-horizon-agent-tasks/` is the canonical, polished research
  deliverable.
- `docs/archive/2026-07-planning-history/Planning/research/` is a historical
  snapshot inside the retired Planning tree.

The archive must remain labeled as historical so its PRD, code, and research do
not look like active Echo requirements.

## What the research means for Echo

The long-horizon study found that agent workflows work best when tasks are
small, scoped, isolated, verified, and handed off clearly. It also identified
context drift, poor task decomposition, and weak completion handoff as recurring
problems.

Echo can act on the user-coaching portion of those findings:

- detect repeated context and recommend an appropriate Rule;
- recognize vague or oversized requests and recommend a better prompt or Plan;
- identify history that suggests a task is separable enough for subagents;
- recommend a completion contract or review checklist when handoffs are weak;
- measure whether adopting the method changes later sessions.

Echo cannot directly fix Cloud Agent startup infrastructure, expose internal
agent state, resolve worktree ownership, or enforce model adherence. Those are
Cursor product surfaces, not extension features. Echo should coach users about
observable behavior without claiming access to internal telemetry.

## Product principles

1. **Personal evidence before generic advice.** Every recommendation must show
   why it applies to this user.
2. **One clear next move.** Depth can follow, but the first screen should not be
   a catalog.
3. **Curated methods, explicit fit.** Each playbook needs evidence triggers,
   contraindications, an expected benefit, and an artifact or next action.
4. **Local-first and transparent.** The default path remains offline; network
   use is opt-in and visible.
5. **Safe actions.** Preview workspace writes, handle collisions, and preserve
   user-authored files.
6. **Outcome over novelty.** Prefer a measurable reduction in repeated friction
   over adding another classifier or UI surface.
7. **Markdown-first.** Keep the product lightweight until a richer interface
   solves a demonstrated problem.

## Success signals

Echo can measure useful progress locally without collecting telemetry:

- a user applies or saves the top recommendation;
- the matched signal appears in fewer comparable sessions after adoption;
- a recommendation advances from suggested to applied to evaluated;
- later reports choose a new playbook because the prior issue improved;
- generated artifacts remain installed rather than immediately replaced;
- fixture and regression checks preserve trustworthy output as the library
  grows.

These are product hypotheses, not proven metrics. The roadmap should first make
them measurable, then use dogfooding and user interviews to validate them.

## Explicit non-goals

For the current roadmap, Echo will not:

- ingest or rank posts from X or other community feeds;
- require an Echo account, hosted backend, or mandatory cloud storage;
- become a full project-management or multi-agent orchestration product;
- diagnose Cursor's internal Cloud Agent infrastructure;
- export researcher datasets as a product feature;
- replace the Markdown report with a mandatory dashboard;
- recommend swarms merely because they are popular.

## Immediate conclusion

The next feature should not be another broad analyzer. First make the existing
pipeline testable and honest about skipped input. Then separate curated
playbooks from matching logic so Echo can answer the product's defining
question: **which proven Cursor method is most likely to improve this user's
workflow next?**
