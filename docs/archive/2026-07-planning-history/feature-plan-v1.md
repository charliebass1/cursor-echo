# Cursor Echo Feature Plan (v1)

**Status:** Superseded in July 2026 by `docs/product-roadmap.md`.

This was the first forward-looking feature roadmap for Echo.

Baseline references:

- `README.md` for install and usage behavior
- `cursor-echo-prd-v2.md` for current product requirements
- `EXAMPLE_REPORT.md` for fixture-output expectations

## Planning goals

1. Keep setup friction near zero (local-first, predictable VSIX install flow).
2. Improve signal quality in reports while preserving trust and transparency.
3. Add depth for repeat users without turning Echo into a heavyweight dashboard.

## Roadmap

### Milestone A: Reliability and confidence (next)

- Add automated fixture regression checks so report generation changes are caught early.
- Expand parser and classifier edge-case handling for mixed/partial transcript lines.
- Add lightweight telemetry-free diagnostics in report output (e.g., why sessions were skipped).

**Done when**

- Fixture run remains stable against `EXAMPLE_REPORT.md` expectations after refactors.
- Local heuristic mode continues to work without any API key or network dependency.

### Milestone B: Better recommendations (near-term)

- Improve recommendation ranking so the report "Start here" action is consistently high-value.
- Add stronger deduplication across similar findings to reduce noisy repetition.
- Improve copy-ready artifact quality for Rule and Plan templates.

**Done when**

- Reports consistently present one clear top action with less duplication.
- Recommended artifacts require minimal user edits before adoption.

### Milestone C: Echo Pro quality upgrades (near-term)

- Improve AI fallback behavior messaging so users understand when local heuristics were used.
- Tighten redaction controls and previews before AI submission.
- Add provider/model guardrails to reduce invalid configuration failures.

**Done when**

- AI mode failures degrade gracefully and explain next steps clearly.
- Redaction and provider settings remain explicit and user-controlled.

### Milestone D: Longitudinal guidance (later)

- Add optional trend snapshots across runs (pattern up/down, recommendation impact).
- Add "after applying recommendation" follow-up guidance tied to prior findings.
- Keep outputs markdown-first and repo-local.

**Done when**

- Users can see whether recurring friction is improving over time.
- Trend features remain optional and do not affect first-run simplicity.

## Non-goals for this plan window

- No required cloud account or hosted backend.
- No migration from markdown reports to a mandatory webview UI.
- No breaking changes to command names or install flow.

## Working cadence

- Revisit this roadmap at each release tag.
- Promote completed items into `cursor-echo-prd-v2.md` when behavior becomes stable.
