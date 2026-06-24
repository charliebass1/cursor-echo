# Research Brief v2: How Developers Run Long-Horizon Agent Tasks — Roadblocks & Cursor Product Opportunities

> Paste this entire brief into the agent as its task. It is self-contained and executable in stages. Do not skip Stage 0.

---

## Stage 0 — Capabilities check (do this first, before any research)

State plainly which of these you can actually do in this environment, and adapt the plan to fit:

- Live web search and page fetching?
- Access to `forum.cursor.com`, Reddit, and X/Twitter? (X is largely gated to programmatic access — if you cannot reach it directly, rely on screenshots/embeds surfaced through web search and say so.)
- GitHub code/repo search and the ability to read file contents?

Output a one-paragraph **coverage statement**: which sources are in reach, which are degraded or unavailable, and how that bounds the findings. If a source is unavailable, do not silently skip it — flag the resulting blind spot. Then proceed.

## Your role and epistemic stance

You are a product-focused user researcher running a **public-data landscape scan**. This is qualitative discovery, not measurement. Specifically:

- You report **themes that recur across independent sources**, not "frequencies." Public engagement (upvotes, replies, likes) measures amplification, not prevalence; you never treat it as a population rate, and you never add counts across platforms as if they share a denominator.
- You actively seek **disconfirming evidence**, not just support.
- You separate **what is in the data** from **your inference about it**, and you label which is which.
- You are skeptical of your own sample: people who post publicly are a frustrated, tooling-savvy minority, and you say so in every claim that needs it.

## Objective

Map how developers actually run **long-horizon / autonomous agent tasks** today — especially in Cursor — surface the recurring roadblocks, and translate the strongest, most **Cursor-actionable** ones into product *hypotheses* for Cursor. Deliver in three staged outputs (Stage 4).

## Primary research question

**What roadblocks recur most consistently across independent public sources when developers run long-horizon agent tasks, which of them is Cursor positioned to act on, and what should Cursor investigate as a result?**

Supporting sub-questions:

1. What does a long-horizon task look like in practice — single vs. parallel/background agents, local vs. cloud, supervised vs. unattended, rough scale?
2. Where in the workflow do roadblocks cluster (planning/setup, mid-run drift or context loss, scope mismatch, review/merge, multi-agent coordination, cost/usage limits)?
3. For each theme, is it plausibly **Cursor-actionable** (mitigable through a Cursor product surface) or **model/ecosystem-level** (Cursor can't fix it alone)?
4. What workarounds have users invented, and what missing feature does each imply?
5. **Where do long-horizon tasks succeed?** Under what conditions do users report them working well?

## Definitions and rubrics (apply consistently; this is the codebook)

**Long-horizon agent task.** Agent works largely autonomously across many steps. Operationalize per source because you can't measure the same way everywhere:
- *GitHub / SpecStory:* measurable — session parses to ≥20 turns, multi-file, or explicitly a background/cloud run.
- *Forum / Reddit / X:* textual markers — "background agent," "cloud agent," "ran overnight," "long-running," "after N prompts," "multiple/parallel agents," large multi-step task descriptions.
- *Exclude everywhere:* autocomplete/Tab, single-edit asks, and IDE-setup gripes unrelated to agent execution.

**Roadblock.** A point where the user must intervene, redo, re-explain, abandon, or build a workaround. Note the **workflow stage** where it occurs.

**Severity (anchor to evidence in the post; do not infer feeling).**
- *S0 — Annoyance:* complained but kept working.
- *S1 — Rework:* had to redo, re-explain, or babysit; recoverable, cost time.
- *S2 — Blocking/loss:* abandoned the task, lost work, or switched tools / threatened to.
- *S? — Unknown:* not evidenced. Mark it; never guess upward.

**Cursor-actionability test.** Tag each theme:
- *Cursor-actionable* — there is evidence the pain ties to a Cursor design choice, default, or feature behavior, **or** Cursor could plausibly mitigate it through a product surface even if the root cause is the model.
- *Model/ecosystem-level* — generic to coding agents; comparison posts show it on other tools too; Cursor can't fix it alone.
Use comparison posts ("better/worse than Claude Code / Copilot / Codex") as the main evidence for this split. If you can't evidence it, default to *model/ecosystem-level*.

**Cursor-usage signal.** Tag every item **Cursor / likely-Cursor / generic**: named in the post; repo with `.cursor/`, Cursor rules files, or SpecStory history whose originating tool is Cursor; PR opened by a Cursor background agent; visible Cursor UI.

## Stage 1 — Collect (pre-registered queries + sampling protocol)

Run **three separate query passes** so the problem search doesn't contaminate the landscape and the disconfirming evidence isn't crowded out. Record the exact queries you run.

**Pass A — Workflow (neutral, describes practice):** e.g. "how I use background agents," "my Cursor agent workflow," "running multiple agents," "long task setup," "parallel agents worktrees."

**Pass B — Roadblocks (problem-seeking):** e.g. "Cursor agent off track," "lost context long session," "ignored instructions," "background agent failed," "merge conflicts parallel agents," "compaction problem," "agent did too much." Keep these in their own bucket; they over-sample failure by construction.

**Pass C — Disconfirming (success-seeking):** e.g. "background agent shipped overnight," "long task just worked," "no drift," "agent finished the whole feature," "best long-horizon workflow."

**Per-source protocol.**
1. Run each pass with both the source's native sort (relevance/top) **and** a date-sorted pass, to counter ranking-recency bias.
2. **Stopping rule:** keep collecting within a source until two consecutive queries surface **no new themes** (thematic saturation), or you hit a cap of ~30–40 substantive items for that source. Report saturation status per source.
3. **Deduplicate by underlying claim/event,** not by URL — a viral thread cross-posted to three platforms is one origin, counted once.
4. **Authenticity screen:** discount marketing/promotional posts, competitor FUD, generic AI-generated-seeming content, and brand-new/zero-history accounts. Prefer first-person, specific, reproducible accounts.
5. **Version-stamp:** record the date, and the Cursor version/era if detectable. Bucket findings as *current* (last ~60–90 days) vs. *historical*.

**Sources and what each is good for.**
- **`forum.cursor.com`** — highest-signal; mine bug-report and feature-request categories (feature requests are pre-articulated asks). Native sort by views/replies to find pain that *resonates* (amplification, not prevalence).
- **Reddit** — r/cursor, r/ChatGPTCoding, r/AICodingTools, r/programming, r/ExperiencedDevs. Read comment threads; capture agreement/disagreement, not just OPs.
- **X** — Cursor handles, agent-workflow threads, replies to Cursor's posts (mine replies for friction). Note access limits from Stage 0.
- **GitHub** — evidence of *real practice*, not just opinion. SpecStory `path:.specstory/history path:*.md` (read originating-tool tag to isolate Cursor; long sessions show drift/re-explaining/scope corrections in situ); repos with `.cursor/`, rules files, or `AGENTS.md` (scan their issues/PRs); PRs by Cursor background agents (look at review comments and revert/rework rates).
- **Grounding (secondary)** — Cursor changelog, blog, docs; power-user write-ups/videos. Use to map complaints to *current* features and to confirm whether a complaint is already fixed.

**Per-item record (this is your auditable log):**
`source | url | date | Cursor-version-era | Cursor-signal | pass (A/B/C) | workflow stage | candidate theme | severity (S0–S2/?) | actionability (Cursor/model) | ≤15-word anonymized evidence snippet`

## Stage 2 — Code & cluster (with a reliability check)

1. Affinity-cluster the candidate themes into ~5–8 roadblock themes; let the data set the count. Maintain a one-line definition per theme (the codebook).
2. Every coded item must carry its evidence snippet + link. No snippet, no code.
3. **Reliability check:** re-code a random ~20% of items in a second, fresh pass. Report the agreement rate. If agreement is below ~80%, tighten the theme definitions and re-code.
4. Report the **positive:negative balance** from Pass C: how often long-horizon tasks are reported succeeding, and the conditions under which they do.

## Stage 3 — Prioritize (qualitative, no invented scores)

Place each theme on a 2×2:
- **Axis X — Cursor-actionability** (low → high).
- **Axis Y — Evidence strength** = recurrence across *independent* sources + recency + severity-evidenced (not engagement counts).

Then tier:
- **Now** — high actionability, strong evidence.
- **Investigate** — strong evidence, unclear actionability (needs internal data).
- **Watch** — actionable but thin/aging evidence.
- **Park** — model/ecosystem-level or weak evidence.

No multiplied composite score. State the criteria; let the placement speak.

## Stage 4 — Deliverables (staged; pause for inspection between stages)

**Output A — Coverage + source log.** The Stage 0 coverage statement, the exact queries run per pass, saturation status per source, and the full tagged item log. *Stop and surface this before writing the memo.*

**Output B — Themes + reliability.** The clustered themes with definitions, the 2×2 placement, the reliability agreement figure, and the positive:negative balance from Pass C.

**Output C — Synthesis memo (≤2,500 words + appendix):**
1. *Executive summary* — 5 takeaways, one line each.
2. *The landscape* — how developers actually run long-horizon tasks, including where they succeed.
3. *Ranked roadblocks* — table: theme | stage | evidence strength | severity | actionability | # independent sources | current vs. historical.
4. *Workarounds → implied gaps.*
5. *Recommendations for Cursor* — for each **Now/Investigate** theme: problem statement | evidence strength | a proposed change mapped to a **current** Cursor surface (verify names against the changelog/docs) | **what evidence would confirm or kill it**. These are hypotheses to validate, not features to ship. Do not solution beyond a hypothesis.
6. *What public data can't tell you* — limits of this scan, and the questions only Cursor's internal telemetry could answer next.

## Hard constraints (anti-hallucination)

- Every non-trivial claim carries a working link. No invented numbers, rates, or percentages.
- If a source can't be re-found or verified, drop it. Report coverage gaps; never fill them with plausible-sounding text.
- Label *observed in data* vs. *researcher inference* throughout.
- Ethics: data is public but anonymize — no usernames, individuals, or named repos; paraphrase; any quote ≤15 words; report aggregate patterns only.
- If a section is thin on evidence, say so plainly instead of padding it.
