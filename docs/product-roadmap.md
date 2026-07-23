# Cursor Echo Product Roadmap

**Status:** Active

**Planning unit:** One bounded two-hour coding session

**Product direction:** Personalized Cursor efficiency coach

## Product outcome

Echo should answer one question better than a generic prompt guide:

> Based on my actual Cursor history, what is the single best workflow method I
> should adopt next, why does it fit me, and can Echo help me apply it safely?

The roadmap builds toward a local loop:

```text
observe history -> match curated playbook -> explain personal fit
                -> apply focused improvement -> measure the next sessions
```

The default path remains offline. Echo Pro can improve interpretation and
artifact quality, but the product must remain useful without an API key.

## How to use this roadmap

Each numbered item is intended to fit one focused two-hour implementation
session. A session is complete only when its acceptance checks pass. If the time
box ends first, stop at the card's hard boundary, record the remaining work, and
do not pull work from the next card into the current change.

Statuses:

- **Next:** ready to build in order.
- **Queued:** scoped, but depends on the Next foundation.
- **Gated:** do not start until the listed dependency is complete and the prior
  product behavior has been dogfooded.

The likely files are guidance, not permission to broaden the change.

## Phase 1: Make the current product trustworthy

### Session 01 — Pure-pipeline regression harness

**Status:** Next

**User outcome:** Existing analysis behavior can change without silently
breaking local reports.

**Scope**

- Add a lightweight TypeScript test runner and `npm test`.
- Extract or expose the smallest pure analysis seam needed to test parsing,
  heuristic classification, suggestion generation, and report rendering
  without a VS Code extension host.
- Add one smoke test that crosses that seam.
- Add a CI check that runs the build and test command.

**Likely files**

- `package.json`, `package-lock.json`
- `src/extension.ts` or a new `src/analyze.ts`
- `src/**/*.test.ts`
- `.github/workflows/ci.yml`

**Depends on:** Nothing.

**Acceptance checks**

- `npm test` runs without Cursor or network access.
- `npm run build` still bundles the extension.
- CI uses the same commands contributors run locally.
- The fixture command's runtime behavior is unchanged.

**Verification:** Run `npm test` and `npm run build`.

**Hard stop:** Do not increase classifier coverage or change report copy.

### Session 02 — Golden fixture-report check

**Status:** Next

**User outcome:** The bundled demo and documented example cannot drift apart
unnoticed.

**Scope**

- Run the four fixture transcripts through the local pure pipeline.
- Normalize only genuinely variable report content.
- Compare the result with `EXAMPLE_REPORT.md`.
- Add a single command that intentionally updates the golden file.

**Likely files**

- `src/analyze.ts`
- `src/**/*.test.ts`
- `scripts/update-example-report.ts`
- `package.json`
- `EXAMPLE_REPORT.md`

**Depends on:** Session 01.

**Acceptance checks**

- A changed heading, ranking, artifact, count, or quote fails the test.
- The update command reproduces `EXAMPLE_REPORT.md` deterministically.
- No API key or provider is used.

**Verification:** Run `npm test`, run the update command, and confirm a clean
Git diff.

**Hard stop:** Test the current output; do not redesign it.

### Session 03 — Skipped-input diagnostics

**Status:** Next

**User outcome:** A report explains why available transcript data was not
analyzed.

**Scope**

- Count malformed JSONL lines, unsupported/empty lines, parsed sessions with no
  turns, and sessions excluded by `minTurns`.
- Carry aggregate diagnostics through the pure pipeline.
- Add a compact report note only when at least one item was skipped.
- Protect the behavior with focused tests.

**Likely files**

- `src/parse.ts`
- `src/analyze.ts`
- `src/report.ts`
- parser and report tests

**Depends on:** Sessions 01–02.

**Acceptance checks**

- Valid transcripts produce the same main report.
- Invalid or filtered input produces actionable counts without exposing raw
  transcript text or file-system paths.
- The no-sessions notification remains clear.

**Verification:** Run the parser tests, golden test, and `npm run build`.

**Hard stop:** Report diagnostics; do not repair malformed source files.

## Phase 2: Build the personalized playbook engine

### Session 04 — Curated playbook schema

**Status:** Queued

**User outcome:** Echo recommendations become explicit, reviewable product
knowledge instead of scattered hard-coded copy.

**Scope**

- Define a versioned `Playbook` type.
- Represent method name, user outcome, evidence triggers, contraindications,
  expected benefit, artifact type, and safe next action.
- Add schema validation tests.
- Keep current recommendation output unchanged.

**Likely files**

- `src/playbooks/types.ts`
- `src/playbooks/validate.ts`
- `src/playbooks/**/*.test.ts`

**Depends on:** Sessions 01–03.

**Acceptance checks**

- Invalid or incomplete playbooks fail a deterministic test.
- A playbook can express “do not recommend a swarm for one dependent task.”
- The schema stores no transcript text.

**Verification:** Run playbook tests and `npm run build`.

**Hard stop:** Define the model; do not migrate matching or report behavior.

### Session 05 — Seed the curated playbook library

**Status:** Queued

**User outcome:** Echo has a coherent, inspectable set of proven Cursor methods
to choose from.

**Scope**

- Add initial playbooks for persistent Rules, front-loaded prompts, Plan-mode
  scoping, reusable Skills, task decomposition, completion handoff, and
  appropriate subagent/swarm use.
- Give every method at least one trigger and one contraindication.
- Document the evidence or product rationale behind each entry.

**Likely files**

- `src/playbooks/catalog.ts`
- `src/playbooks/catalog.test.ts`
- `docs/playbook-authoring.md`

**Depends on:** Session 04.

**Acceptance checks**

- The catalog validates and has unique stable IDs.
- Rules, Skills, prompts, plans, checklists, and advice-only methods can be
  represented.
- Swarm guidance explicitly rejects tightly coupled or single-step work.

**Verification:** Run catalog tests and review the rendered catalog data.

**Hard stop:** Curate the initial seven methods; do not ingest external feeds.

### Session 06 — Evidence-to-playbook matching

**Status:** Queued

**User outcome:** The top recommendation is stable and based on transparent
evidence, not array order.

**Scope**

- Convert detected patterns into playbook evidence.
- Rank eligible playbooks using documented deterministic rules.
- Apply contraindications before ranking.
- Deduplicate methods that address the same evidence.
- Return a plain-language reason for the chosen fit.

**Likely files**

- `src/playbooks/match.ts`
- `src/suggest.ts`
- matcher and suggestion tests

**Depends on:** Sessions 04–05.

**Acceptance checks**

- The same evidence always produces the same order.
- Ties have an explicit deterministic rule.
- A contraindicated playbook is never selected.
- Existing fixture scenarios still receive an appropriate recommendation.

**Verification:** Run matcher tests, the golden test, and `npm run build`.

**Hard stop:** Use current signals; do not add new classifiers.

### Session 07 — Personalized “Start here”

**Status:** Queued

**User outcome:** The first report action clearly answers “why this method for
me?”

**Scope**

- Render the selected playbook's name, expected benefit, personal fit reason,
  and one supporting quote in `Start here`.
- Keep deeper findings below it.
- Add a safe fallback when no playbook has sufficient evidence.
- Update the golden report intentionally.

**Likely files**

- `src/report.ts`
- `src/suggest.ts`
- report tests
- `EXAMPLE_REPORT.md`

**Depends on:** Session 06.

**Acceptance checks**

- The first action identifies the method and personal evidence.
- Report copy distinguishes observation from expected benefit.
- No fabricated score or unsupported performance claim appears.
- The report remains readable in under a minute.

**Verification:** Run all tests and inspect the fixture Markdown preview.

**Hard stop:** Improve the Markdown hierarchy; do not add a webview.

## Phase 3: Turn recommendations into safe actions

### Session 08 — Rule diff preview and collision safety

**Status:** Gated

**User outcome:** A user can inspect exactly what Echo will write before an
existing Rule is created or changed.

**Scope**

- Show the proposed Rule before the write.
- For collisions, show existing and proposed content as a diff.
- Require an explicit create or replace action.
- Preserve cancel and open-existing paths.
- Share no transcript content beyond the generated artifact.

**Likely files**

- `src/extension.ts`
- a new `src/artifacts/write.ts`
- artifact-writer tests where logic can remain pure

**Depends on:** Session 07 and dogfooding of playbook output.

**Acceptance checks**

- Cancel never changes the workspace.
- Existing content is never silently overwritten.
- A successful write opens the resulting file.
- New and collision paths are manually verified.

**Verification:** Run tests/build and exercise both paths in the Extension
Development Host.

**Hard stop:** Support Rule artifacts only; generalization belongs to Session
09.

### Session 09 — One-click Skill installation

**Status:** Gated

**User outcome:** A proven prompt can become a workspace Skill without manual
copying.

**Scope**

- Reuse the safe artifact writer for Skill drafts.
- Add an `Apply Top Skill Recommendation` command.
- Handle missing recommendations and path collisions.
- Open the created `SKILL.md`.

**Likely files**

- `src/extension.ts`
- `src/artifacts/write.ts`
- `package.json`
- command and artifact tests

**Depends on:** Session 08.

**Acceptance checks**

- Only a ranked Skill artifact can be installed.
- The target stays under `.cursor/skills/`.
- Preview, cancel, collision, and success paths behave consistently with Rules.

**Verification:** Run tests/build and apply a fixture-derived Skill in the
Extension Development Host.

**Hard stop:** Do not add a general artifact browser.

### Session 10 — One-click prompt and Plan action

**Status:** Gated

**User outcome:** A tailored scope or prompt method is immediately usable in the
next Cursor interaction.

**Scope**

- Add an action that copies the top prompt artifact to the clipboard.
- For a Plan playbook, optionally save a previewed Markdown draft under
  `.cursor/plans/`.
- Confirm the destination/action in clear language.
- Reuse common selection and collision logic.

**Likely files**

- `src/extension.ts`
- `src/artifacts/write.ts`
- `src/playbooks/catalog.ts`
- `package.json`

**Depends on:** Sessions 08–09.

**Acceptance checks**

- Advice-only playbooks do not write files.
- Clipboard and Plan paths are distinguishable before the action.
- Cancel has no side effects.
- The generated artifact is grounded in report evidence.

**Verification:** Run tests/build and manually exercise copy, save, and cancel.

**Hard stop:** Do not launch an agent or execute the generated plan.

### Session 11 — Delegation-readiness coaching

**Status:** Gated

**User outcome:** Echo recommends subagents or swarms only when the user's
history contains work that is plausibly separable or parallelizable.

**Scope**

- Detect a narrow set of observable delegation signals, such as multiple
  independent deliverables or repeated parallel work.
- Require evidence from more than one session before selecting swarm guidance.
- Apply playbook contraindications for ordered, tightly coupled, or trivial
  work.
- Generate a decomposition checklist, not an orchestrated run.

**Likely files**

- `src/delegation.ts`
- `src/playbooks/catalog.ts`
- `src/playbooks/match.ts`
- delegation fixtures and tests

**Depends on:** Sessions 05–07.

**Acceptance checks**

- Positive and contraindicated fixtures are both covered.
- The report quotes the evidence and calls the result a recommendation, not a
  guarantee.
- Echo never starts subagents, creates branches, or estimates savings.

**Verification:** Run matcher/golden tests and inspect positive and negative
reports.

**Hard stop:** Coaching only; no swarm orchestration or external issue import.

## Phase 4: Make Echo Pro safer and clearer

### Session 12 — Echo Pro preflight and fallback reason

**Status:** Gated

**User outcome:** Before transcript submission, a user knows which provider and
model will run and why Echo used local mode if it cannot.

**Scope**

- Validate provider, key presence, model resolution, and Cursor SDK runtime
  requirements before classification.
- Represent analysis mode and fallback reason as structured run metadata.
- Add a concise report note when local fallback occurs.
- Avoid placing key material or provider errors containing secrets in output.

**Likely files**

- `src/ai/config.ts`
- `src/ai/provider.ts`
- `src/extension.ts`
- `src/report.ts`
- AI configuration tests

**Depends on:** Sessions 01–03.

**Acceptance checks**

- Invalid setup fails before transcript submission.
- Every fallback path has a safe, actionable reason.
- Local-only reports do not imply AI was used.

**Verification:** Run tests/build and manually test missing-key and invalid
provider/model configurations.

**Hard stop:** Validate known local conditions; do not call provider model-list
APIs.

### Session 13 — Redaction preview

**Status:** Gated

**User outcome:** A user can review what categories and examples Echo will
redact before approving AI analysis.

**Scope**

- Produce a local preview from the exact bounded sessions selected for AI.
- Show redaction counts by category and a short redacted sample.
- Offer continue, cancel, and disable-AI paths.
- Never render the API key or persist the unredacted preview.

**Likely files**

- `src/ai/redact.ts`
- `src/ai/config.ts`
- `src/extension.ts`
- redaction tests

**Depends on:** Session 12.

**Acceptance checks**

- Preview and submitted text use the same redaction function.
- Cancel causes no network request.
- Common token, key, and email forms are covered by tests.
- The modal states that heuristic redaction cannot guarantee removal of every
  secret.

**Verification:** Run redaction tests/build and manually cancel before provider
submission.

**Hard stop:** Improve transparency; do not claim comprehensive data-loss
prevention.

## Phase 5: Measure whether the advice worked

### Session 14 — Local recommendation and adoption history

**Status:** Gated

**User outcome:** Echo can remember which method it recommended and whether the
user applied it without storing chat content.

**Scope**

- Define a versioned local history schema.
- Store run timestamp, workspace identity, playbook ID/version, aggregate
  evidence counts, artifact action, and adoption state.
- Exclude transcript text, quotes, API configuration, and secrets.
- Add retention and corruption-safe loading behavior.

**Likely files**

- `src/history/types.ts`
- `src/history/store.ts`
- `src/extension.ts`
- history tests
- privacy documentation

**Depends on:** Sessions 06–10.

**Acceptance checks**

- Schema migration/version failure does not block a report.
- History contains no raw transcript text or generated artifact content.
- Applying an artifact records an action; analysis alone does not imply
  adoption.
- The storage location and deletion method are documented.

**Verification:** Run tests/build and inspect a generated history record.

**Hard stop:** Local history only; no telemetry or account sync.

### Session 15 — Post-adoption trend delta

**Status:** Gated

**User outcome:** Echo shows whether the friction tied to an adopted method
appears to be improving.

**Scope**

- Compare a current run with the latest comparable pre-adoption baseline.
- Display direction and raw session counts, not a fabricated productivity
  score.
- Require enough comparable sessions and explain when evidence is insufficient.
- Keep the trend section optional.

**Likely files**

- `src/history/compare.ts`
- `src/report.ts`
- trend tests and fixtures

**Depends on:** Session 14 plus dogfooding that creates history.

**Acceptance checks**

- Improved, unchanged, regressed, and insufficient-data cases are tested.
- Different workspaces or playbook versions are not compared accidentally.
- The report uses cautious causal language: “appeared less often,” not “Echo
  fixed.”

**Verification:** Run trend/golden tests and inspect all four report states.

**Hard stop:** Compare observed signals only; do not create a global efficiency
score.

### Session 16 — Outcome-aware next recommendation

**Status:** Gated

**User outcome:** After evaluating one method, Echo chooses the next useful
playbook instead of repeatedly recommending the same action.

**Scope**

- Feed evaluated adoption state into playbook eligibility and ranking.
- Continue a method when evidence remains high, retire it when improvement is
  sustained, and select the next eligible method.
- Explain why Echo is continuing or changing the recommendation.
- Add deterministic journey tests across multiple synthetic runs.

**Likely files**

- `src/playbooks/match.ts`
- `src/history/compare.ts`
- `src/report.ts`
- multi-run journey tests

**Depends on:** Sessions 14–15.

**Acceptance checks**

- Applied-but-unevaluated methods are not treated as successful.
- Sustained improvement can advance to a different playbook.
- Regression can restore the prior method without losing history.
- The user always sees the evidence behind the decision.

**Verification:** Run all tests/build and review the synthetic multi-run
journey.

**Hard stop:** Complete the local loop; do not add cloud synchronization.

## Parking lot

These ideas are intentionally outside the active sequence:

- ingesting, ranking, or moderating methods from X or other community sources;
- a marketplace or social feed inside Echo;
- a mandatory webview dashboard;
- full agent-swarm orchestration, branch management, or project management;
- Cloud Agent infrastructure diagnosis;
- researcher dataset export;
- cross-device history sync or an Echo account;
- productivity scores or unsupported time-saved estimates.

Reconsider an item only when user evidence shows that the local personalized
coaching loop cannot deliver the north-star promise without it.

## Roadmap review rule

After each session:

1. Keep the card complete only if its acceptance checks pass.
2. Record new evidence or scope discoveries in the next relevant card.
3. Do not reorder the Gated phases based on novelty alone.
4. Revisit the sequence when dogfooding disproves a product assumption.
5. Update the PRD only after behavior is implemented and stable.
