# Output B: Themes, Reliability, And Prioritization

Date: 2026-06-22

This is the Stage 4 Output B deliverable. It clusters the retained Output A evidence rows, reports an internal recode check, places themes on the requested 2x2, and summarizes the positive/negative balance from Pass C. It does not make product recommendations or write the final memo.

## Scope And Caveats

Observed in data: This coding pass originally used 30 retained non-grounding evidence rows from Output A: 12 Cursor Forum rows, 10 GitHub rows, and 8 YouTube transcript/search rows. After the wrap-up verification pass (see Output A, "Verification Pass"), 4 unverifiable `cursor/cursor` issue rows were dropped, leaving 26 rows: 12 Forum, 6 GitHub, 8 YouTube. Reddit and X produced no retained rows under access limits. Cursor docs/blog/changelog rows were used only as product grounding, not as user pain evidence.

Note on the revision: only theme T2 below loses evidence from the dropped rows. Its severity is downgraded from S1–S2 to S1 and its independent source families from 3 to 2. T1, T3, T4, T5, and T6 did not rely on the dropped rows; T3 and T4 gained corroborating forum threads at verification.

Researcher inference: The themes below are qualitative clusters, not frequencies or population rates. The visible sample overrepresents public support posters, tool builders, tutorial creators, and early adopters. Engagement metrics and view counts are not treated as prevalence.

## Theme Codebook

### T1 - Cloud Startup And Environment Reliability

Definition: The agent cannot start, cannot attach to its remote environment, cannot execute commands, or requires setup knowledge the user expected the product to manage.

Observed in data:

- Cursor Forum reports Cloud Agent startup and exec-daemon failures that block use: [Cannot Start Cloud Agent](https://forum.cursor.com/t/cannot-start-cloud-agent/163194), [Background Agent Fails Repeatedly](https://forum.cursor.com/t/background-agent-fails-repeatedly-with-we-encountered-an-unexpected-error-repeatedly-no-request-id-visible/159566).
- The startup failures surface as environment-readiness errors (stuck `CREATING`, `EXEC_DAEMON_NOT_READY`, "Cannot resolve authority"), confirmed via search on the same thread: [Cannot Start Cloud Agent](https://forum.cursor.com/t/cannot-start-cloud-agent/163194). A related general agent-mode execution failure (shell tool cannot spawn a process, `pid: -1`) is independently reported on the forum, corroborating the broader execution-reliability surface: [Agent shell fails to spawn on WSL](https://forum.cursor.com/t/agent-shell-tool-fails-to-spawn-shell-process-on-wsl-pid-1/145286).
- GitHub workflow files encode setup workarounds for ephemeral cloud environments: [cursor-setup-guide AGENTS.md](https://github.com/Wade-O-Lution-Inc/cursor-setup-guide/blob/main/agents.md).

Researcher inference: This is highly Cursor-actionable when the failure is in Cloud Agent infrastructure, environment setup affordances, or terminal/mode execution. It is less clear when the failure comes from an arbitrary user repo environment.

### T2 - Context And Instruction Retention

Definition: Over long sessions, the agent loses visible conversation state, stops following rules, fails to receive rules, or needs repeated reminders of conventions.

Observed in data:

- Forum rows show long-session context loss and rules not reliably applied: [Agent Chat Loses Context](https://forum.cursor.com/t/agent-chat-loses-context-when-conversationstate-snapshot-is-skipped-for-unloaded-user-message-bubble/161477), [Cursor Agent Not Following Rules](https://forum.cursor.com/t/cursor-agent-not-following-rules/149542).
- Verification note: two `cursor/cursor` issue rows that previously evidenced "rules acknowledged then violated" and "User Rules not passed into context" were dropped at wrap-up (404, unverifiable). T2 therefore now rests on the forum and YouTube evidence above. That evidence is S1 (rework, re-explaining, babysitting) rather than S2 (blocking); the stronger "blocking" claim is no longer supported by a verifiable source.
- YouTube workflow evidence recommends layered `AGENTS.md` files to prevent long-session convention drift: [Cursor, Droid, Claude: Why Your Agent Forgets Rules](https://www.youtube.com/watch?v=PTjP9S9DrPo).

Researcher inference: The recurring public workaround is not just "write better prompts"; users are building persistent, hierarchical context systems. Cursor can plausibly mitigate this through clearer rule loading, refresh, visibility, and failure diagnostics, even though model recency/context behavior is partly ecosystem-level.

### T3 - Parallel Agent And Worktree Orchestration

Definition: Users want multiple agents working at once, but run into stuck subagents, unclear worktree state, wrong-directory edits, merge conflicts, or missing orchestration controls.

Observed in data:

- Forum rows show stuck/looping subagents and worktree regressions: [Long-Running Multi-Agent Orchestration](https://forum.cursor.com/t/workflow-long-running-multi-agent-orchestration-root-agent-parallel-sub-agents-separate-prs/160563), [Cursor 3 Worktrees & Best-of-N](https://forum.cursor.com/t/cursor-3-worktrees-best-of-n/156507). A second independent thread corroborates the parallel-worktree regression: [/best-of-n falls back to single agent](https://forum.cursor.com/t/best-of-n-does-not-run-parallel-model-worktrees-falls-back-to-single-agent/156550).
- YouTube workflow evidence shows both the value of parallel agents and roadblocks around wrong worktree context: [Cursor 2.0: Shipping Real Feature](https://www.youtube.com/watch?v=79FG_IocSPo), [Cursor 3 is Not What You Think](https://www.youtube.com/watch?v=AAGmJAvec9o).
- GitHub rows show external orchestration layers being built around Cursor agents: [cursor-background-agents-mcp](https://github.com/bryantbrock/cursor-background-agents-mcp), [safe-agentic-workflow rules](https://github.com/bybren-llc/safe-agentic-workflow/blob/edf298b9/.cursor/rules/30-background-agents.mdc).

Researcher inference: This is the most Cursor-specific cluster because Cursor 3, Cloud Agents, worktrees, and Agents Window are first-party surfaces. The strongest opportunity is not merely "run more agents"; it is making state, ownership, conflicts, and completion visible enough for users to coordinate many agents safely.

### T4 - Review, Verification, And Handoff Friction

Definition: Agents complete work but the user still needs to verify outputs, recover branch/PR state, avoid focus interruptions, or preserve an audit trail.

Observed in data:

- Forum success rows emphasize verification artifacts and PR handoff: [Cloud Agents with Computer Use](https://forum.cursor.com/t/cloud-agents-with-computer-use/152829), [Background Agents Cloud or Local](https://forum.cursor.com/t/background-agents-cloud-or-local-machine/102543).
- Forum and YouTube rows also show handoff friction: [Agent Finish Steals Focus](https://forum.cursor.com/t/agent-finish-steals-focus/157090), [First look at Cursor background agents](https://www.youtube.com/watch?v=Mu3J-odJyb4). A second independent thread corroborates the completion focus-steal during multi-plan review: [Parallel agents/plans steal focus when completing](https://forum.cursor.com/t/parallel-agents-plans-steal-focus-when-completing-disrupts-workflow-when-reviewing-multiple-plans/150407).
- GitHub evidence shows audit trail fragility when session history is duplicated or truncated: [specstoryai/getspecstory issue #196](https://github.com/specstoryai/getspecstory/issues/196).
- YouTube success rows show agent-created PRs and verification loops: [CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc), [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk).

Researcher inference: Public data suggests the "last mile" is not binary success/failure. Users need confidence that a finished agent maps cleanly to a branch, PR, tests, artifacts, and the current local workspace.

### T5 - Task Sizing, Specification, And Delegation Discipline

Definition: Long-horizon tasks work better when users split work into focused issues/specs; large vague tasks create babysitting, rework, or external orchestration needs.

Observed in data:

- YouTube workflow rows recommend small, predictable tasks and issue/spec-first delegation: [CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc), [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk).
- Forum rows show users building orchestration wrappers for large dependent tasks: [Background Agent Orchestrator](https://forum.cursor.com/t/built-an-background-agent-orchestrator-to-handle-large-tasks/142478), [Trigger Background Agent Programmatically](https://forum.cursor.com/t/trigger-background-agent-programmatically/101479).
- GitHub workflow rows encode repeatable rules and PR-producing background-agent instructions: [safe-agentic-workflow rules](https://github.com/bybren-llc/safe-agentic-workflow/blob/edf298b9/.cursor/rules/30-background-agents.mdc), [cursor-best-practices](https://github.com/HKTITAN/cursor-best-practices/blob/HEAD/cursor-best-practices/references/rules-and-commands.md).

Researcher inference: The successful public workflows look less like "give the agent a huge task" and more like "turn work into small reviewable tickets, then run agents in parallel."

### T6 - Cost, Permissions, And Security Governance

Definition: Running autonomous agents introduces spend, repo access, auto-run terminal behavior, internet access, and permission-management concerns.

Observed in data:

- YouTube workflow evidence explicitly flags spend limits, max-mode pricing, personal access token scope, internet access, and terminal auto-run risks: [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk), [CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc).
- Cursor grounding confirms `permissions.json` and Auto-review are current surfaces for permission governance: [permissions.json docs](https://cursor.com/docs/reference/permissions), [Auto-review blog](https://cursor.com/blog/agent-autonomy-auto-review).

Researcher inference: This theme is thinner than T1-T4 in the retained user-pain rows, but it appears in concrete workflow tutorials as a gating condition for unattended or cloud runs.

## Positive And Negative Balance From Pass C

Observed in data: The retained Pass C/disconfirming sample includes 12 rows with success-seeking intent: 4 Forum, 2 GitHub, and 6 YouTube rows. Within this bounded sample, 9 are primarily positive/success-condition rows, while 3 are mixed or negative because they describe review, handoff, or interruption friction despite a successful or success-seeking query.

Researcher inference: Long-horizon agent work does succeed in the public sample when tasks are scoped as small independent issues, the agent has an isolated branch/worktree or cloud environment, outputs are reviewed through PRs/diffs/tests, and verification artifacts such as logs/screenshots/videos are available. The most common caveat inside the success rows is that users still need handoff clarity, branch/PR cleanup, cost awareness, and manual review discipline.

Success-condition examples:

- Issue/spec to background agent to reviewed PR: [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk).
- Small backlog tasks delegated in parallel with local checkout and PR review: [CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc).
- Cloud agents producing merge-ready PR artifacts: [Cloud Agents with Computer Use](https://forum.cursor.com/t/cloud-agents-with-computer-use/152829).
- Multi-agent UI changes merged through Cursor 3 review flow: [Cursor 3 is Not What You Think](https://www.youtube.com/watch?v=AAGmJAvec9o).

## 2x2 Placement

Criteria:

- Cursor-actionability: high when the evidence ties to Cursor Cloud Agents, Agents Window, worktrees, rules, environment setup, PR/review surfaces, or permission UX; low when the root cause is mostly model behavior or generic agent practice.
- Evidence strength: high when the theme recurs across independent source families, appears in recent/current evidence, and includes severity-evidenced roadblocks; medium when recurrent but thinner, older, or partly search-only; low when mostly grounding or tutorial caveat.

```text
High evidence strength / High Cursor-actionability:
- T1 Cloud Startup And Environment Reliability
- T3 Parallel Agent And Worktree Orchestration
- T4 Review, Verification, And Handoff Friction

Medium-high evidence strength / Lower or mixed Cursor-actionability:
- T2 Context And Instruction Retention (downgraded from high after the verification pass dropped its S2/GitHub-issue evidence; now S1, two source families)

Medium evidence strength / High Cursor-actionability:
- T5 Task Sizing, Specification, And Delegation Discipline

Lower evidence strength / Medium Cursor-actionability:
- T6 Cost, Permissions, And Security Governance
```

Tiering:

- Now: T1, T3, T4.
- Investigate: T2, T5.
- Watch: T6.
- Park: No retained cluster is fully parked, but generic model recency bias inside T2 should be treated as ecosystem-level unless tied to Cursor rule/context surfaces.

## Reliability Check

Method: Re-coded 6 of the 30 originally retained non-grounding items, a 20% internal consistency sample. None of the 6 sampled rows were among the 4 dropped at the wrap-up verification pass, so this result is unaffected by the revision (effective retained denominator 26). This is not inter-rater reliability because the same agent performed both passes; it is only a check that the theme definitions are stable enough to proceed.

Sampled rows:

- [Cannot Start Cloud Agent](https://forum.cursor.com/t/cannot-start-cloud-agent/163194)
- [Agent Chat Loses Context](https://forum.cursor.com/t/agent-chat-loses-context-when-conversationstate-snapshot-is-skipped-for-unloaded-user-message-bubble/161477)
- [Cursor 3 Worktrees & Best-of-N](https://forum.cursor.com/t/cursor-3-worktrees-best-of-n/156507)
- [specstoryai/getspecstory issue #196](https://github.com/specstoryai/getspecstory/issues/196)
- [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk)
- [Cursor, Droid, Claude: Why Your Agent Forgets Rules](https://www.youtube.com/watch?v=PTjP9S9DrPo)

Agreement result: 5 of 6 sampled rows matched exactly on primary theme, severity band, and Cursor-actionability. The one mismatch was [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk), initially coded as T5 task sizing/specification and recoded as T4 review/handoff because the transcript contains both issue decomposition and PR review. Final code keeps it as T5 primary with T4 secondary because the workflow is organized around spec-to-issue delegation.

Agreement rate: 83% exact primary-code agreement in this internal check. Because this is above the pre-registered ~80% threshold, no full recode was triggered. Tightening applied: rows may carry a secondary theme in notes, but the primary theme should be the workflow failure or success condition most central to the evidence snippet.

## Notes For Output C

- Treat T1/T3/T4 as strongest candidates for Cursor product hypotheses.
- Treat T2 as important but mixed: Cursor can improve rule/context surfaces, but cannot alone solve model recency bias.
- Treat T5 as a workflow/design opportunity: users are inventing specs, issues, rules, and orchestration wrappers.
- Treat T6 as a governance watch item needing more direct evidence from current Cloud Agent users.
