# Long-Horizon Agent Tasks Research

Status: Complete (public-data scan; recommendations are hypotheses to validate against internal data)

## Start here

**Read [`DELIVERABLE.md`](DELIVERABLE.md).** It leads with the answer to the research question — the roadblocks that recur most, which ones Cursor can act on now, and what Cursor should investigate — and links to the full audit trail.

One-line answer: across independent public sources, the most consistent *and* Cursor-actionable roadblocks are **cloud-agent startup/environment reliability, parallel-agent state & ownership visibility, and completed-agent handoff** — the recurring gap is making autonomous work inspectable, recoverable, and reviewable, not making agents more autonomous.

## Goal

Map how developers actually run long-horizon or autonomous agent tasks today, especially in Cursor, identify the recurring roadblocks they hit, and translate the strongest and most frequent patterns into concrete product recommendations for Cursor.

## Research Questions

- How are developers setting up, supervising, and resuming long-running agent tasks today?
- Which workflows are specific to Cursor, and which are broader agent-development habits?
- Where do tasks break down: context, trust, review, handoff, permissions, tooling, evaluation, or recovery?
- Which roadblocks are frequent enough and painful enough to justify product recommendations?
- What product changes would reduce friction without adding unnecessary workflow complexity?

## Files

- `DELIVERABLE.md` — **the deliverable**: leads with the answer and the ranked recommendations.
- `founder-brief.md` — one-page, founder-grade read: Compile 2026 announcements → this study → ideas to explore.
- `output-c-synthesis-memo.md` — full synthesis memo (executive summary → limits).
- `recommendations.md` — product-hypothesis backlog with MVPs, risks, and confidence.
- `output-b-themes-reliability.md` — theme codebook, 2×2 placement, reliability check.
- `output-a-coverage-source-log.md` — coverage statement, exact queries, tagged source log, and the 2026-06-23 verification pass.
- `findings.md` — one-page index of the theme clusters.
- `research-plan.md` — the research brief / protocol this scan followed.
- `sources.md` — Stage 0 coverage check and evidence-log scaffold.
- `data/README.md` — what can be stored in `data/` and what stays local.

## Privacy And Tracking

Do not commit raw private transcripts, proprietary code snippets, customer names, API keys, credentials, or screenshots with sensitive data. Commit only sanitized excerpts, summaries, or synthetic examples that are safe to publish.
