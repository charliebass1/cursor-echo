# Output C: Synthesis Memo

Date: 2026-06-22

## 1. Executive Summary

Observed in data: Long-horizon agent work succeeds most clearly when users split work into focused issues/specs, run agents in isolated branches/worktrees/cloud environments, and review outputs through PRs, diffs, tests, screenshots, logs, or videos ([My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk), [Cloud Agents with Computer Use](https://forum.cursor.com/t/cloud-agents-with-computer-use/152829)).

Observed in data: The most Cursor-actionable roadblocks are Cloud Agent startup/environment reliability, parallel-agent/worktree orchestration, and completed-agent handoff/review friction ([Cannot Start Cloud Agent](https://forum.cursor.com/t/cannot-start-cloud-agent/163194), [Cursor 3 Worktrees & Best-of-N](https://forum.cursor.com/t/cursor-3-worktrees-best-of-n/156507), [Agent Finish Steals Focus](https://forum.cursor.com/t/agent-finish-steals-focus/157090)).

Observed in data: Users are building their own orchestration and context systems around Cursor: GitHub issue pipelines, MCP launchers, rules files, `AGENTS.md`, and custom background-agent orchestrators ([cursor-background-agents-mcp](https://github.com/bryantbrock/cursor-background-agents-mcp), [Background Agent Orchestrator](https://forum.cursor.com/t/built-an-background-agent-orchestrator-to-handle-large-tasks/142478), [Cursor, Droid, Claude: Why Your Agent Forgets Rules](https://www.youtube.com/watch?v=PTjP9S9DrPo)).

Researcher inference: Cursor's opportunity is less "make agents autonomous" in the abstract and more "make autonomous work inspectable, recoverable, and reviewable."

Researcher inference: Public data is biased toward support posters, tool builders, tutorial creators, and early adopters; Reddit, X, and YouTube comments were degraded or unavailable, so this memo should be treated as hypothesis generation, not measurement.

## 2. The Landscape

Observed in data: Developers run long-horizon agent tasks in three visible patterns. First, they launch one or more Cloud/Background Agents from a prompt or issue and expect a branch/PR in return ([Background Agents Cloud or Local](https://forum.cursor.com/t/background-agents-cloud-or-local-machine/102543), [CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc)). Second, they run parallel agents in local/cloud/worktree contexts and compare or merge the results ([Cursor 3 is Not What You Think](https://www.youtube.com/watch?v=AAGmJAvec9o), [Cursor 3 Worktrees & Best-of-N](https://forum.cursor.com/t/cursor-3-worktrees-best-of-n/156507)). Third, they create issue/spec pipelines where GitHub, Linear, MCP, or custom scripts feed agents small independent tasks ([My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk), [Trigger Background Agent Programmatically](https://forum.cursor.com/t/trigger-background-agent-programmatically/101479)).

Observed in data: Success conditions recur across YouTube, Forum, and GitHub artifacts: small scoped tasks, clear acceptance criteria, isolated branches/worktrees, PR handoff, and verification artifacts ([safe-agentic-workflow rules](https://github.com/bybren-llc/safe-agentic-workflow/blob/edf298b9/.cursor/rules/30-background-agents.mdc), [Cursor's Agents Test Their Own Code Now](https://www.youtube.com/watch?v=R4I0BBMDp1Q)). Positive examples still include caveats: cost, branch selection, connector fragility, unclear post-merge state, and need for manual review ([First look at Cursor background agents](https://www.youtube.com/watch?v=Mu3J-odJyb4), [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk)).

Researcher inference: The working mental model is shifting from "chat with an assistant" to "supervise a queue of junior agents." Users want leverage, but they still want control over state, scope, risk, and review.

## 3. Ranked Roadblocks

| Theme | Stage | Evidence Strength | Severity | Actionability | Independent Source Families | Current vs. Historical |
|---|---|---|---|---|---:|---|
| Cloud startup and environment reliability | Startup/environment | Strong | S2 evidenced | High | 2 | Mostly current |
| Parallel agent and worktree orchestration | Planning/execution/merge | Strong | S1-S2 evidenced | High | 3 | Current |
| Review, verification, and handoff friction | Completion/review | Strong | S1 evidenced; success-linked | High | 3 | Current/mixed |
| Context and instruction retention | Mid-run context | Medium-strong | S1 evidenced | Mixed-high | 2 | Current/mixed |
| Task sizing and delegation discipline | Planning/setup | Medium | S1 risk; success-linked | High | 3 | Current/mixed |
| Cost, permissions, and security governance | Setup/governance | Thin-medium | S1 risk | Medium | 1 plus docs | Current/mixed |

Observed in data: Cloud startup/environment reliability includes blocked startup, exec-daemon readiness failures, and "cannot resolve authority" errors ([Cannot Start Cloud Agent](https://forum.cursor.com/t/cannot-start-cloud-agent/163194), [Background Agent Fails Repeatedly](https://forum.cursor.com/t/background-agent-fails-repeatedly-with-we-encountered-an-unexpected-error-repeatedly-no-request-id-visible/159566)). A related general agent-mode execution failure (shell tool cannot spawn, `pid: -1`) is independently reported ([Agent shell fails to spawn on WSL](https://forum.cursor.com/t/agent-shell-tool-fails-to-spawn-shell-process-on-wsl-pid-1/145286)).

Observed in data: Parallel-agent/worktree orchestration includes stuck subagents, worktree regressions, wrong-directory edits, and external orchestration workarounds ([Long-Running Multi-Agent Orchestration](https://forum.cursor.com/t/workflow-long-running-multi-agent-orchestration-root-agent-parallel-sub-agents-separate-prs/160563), [Cursor 2.0: Shipping Real Feature](https://www.youtube.com/watch?v=79FG_IocSPo)).

Observed in data: Review/handoff friction shows up even when agents succeed: users need artifacts, PR state, branch cleanup, focus behavior, and clearer "what now?" cues ([Agent Finish Steals Focus](https://forum.cursor.com/t/agent-finish-steals-focus/157090), [First look at Cursor background agents](https://www.youtube.com/watch?v=Mu3J-odJyb4)).

## 4. Workarounds To Implied Gaps

Observed in data: Users create GitHub issues/specs before launch, then ask agents to produce PRs ([My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk)). Implied gap: Cursor could help convert large asks into agent-sized tasks with acceptance criteria.

Observed in data: Users create external orchestrators or MCP launchers for dependent tasks and PR tracking ([Background Agent Orchestrator](https://forum.cursor.com/t/built-an-background-agent-orchestrator-to-handle-large-tasks/142478), [cursor-background-agents-mcp](https://github.com/bryantbrock/cursor-background-agents-mcp)). Implied gap: first-party agent status, dependency, and PR-state visibility may not yet be enough for power users.

Observed in data: Users build layered `AGENTS.md` and rules structures to prevent convention drift ([Cursor, Droid, Claude: Why Your Agent Forgets Rules](https://www.youtube.com/watch?v=PTjP9S9DrPo), [cursor-best-practices](https://github.com/HKTITAN/cursor-best-practices/blob/HEAD/cursor-best-practices/references/rules-and-commands.md)). Implied gap: users want rules to be inspectable, scoped, and refreshed during long sessions.

Observed in data: Users manually check out branches, test locally, open GitHub, merge PRs, and clean up state ([CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc), [First look at Cursor background agents](https://www.youtube.com/watch?v=Mu3J-odJyb4)). Implied gap: completed-agent handoff should be more explicit about branch, PR, local state, and verification.

## 5. Recommendations For Cursor

### Now: Cloud Agent readiness diagnosis and recovery

Problem statement: When Cloud Agents fail to start or attach to their environment, users cannot tell whether the problem is Cursor infrastructure, repo setup, terminal/tool execution, or something they can fix ([Cannot Start Cloud Agent](https://forum.cursor.com/t/cannot-start-cloud-agent/163194)).

Hypothesis: A clearer Cloud Agent readiness and recovery surface mapped to Cloud Agents, Cloud Agent environments, `.cursor/environment.json`, and the Agents Window would reduce blocked runs and repeat retries.

Confirm or kill: Confirm if internal logs show meaningful abandoned runs, repeated retries, support tickets, or refunds tied to startup/environment failures. Kill if recent builds already eliminated the issue or failures are rare and repo-specific.

### Now: Parallel-agent state and ownership visibility

Problem statement: Multi-agent users need to know which agent owns which branch/worktree, what changed, what is blocked, and whether conflicts or wrong-directory edits are likely ([Cursor 3 Worktrees & Best-of-N](https://forum.cursor.com/t/cursor-3-worktrees-best-of-n/156507)).

Hypothesis: A per-agent state view in Agents Window/Multi-Agents/worktrees could make repo, branch, worktree, environment, changed files, blockers, and next action explicit.

Confirm or kill: Confirm if multi-agent sessions show high rates of cancellation, wrong-branch edits, conflict repair, or manual `git status`/branch-check behavior. Kill if most users run one agent or current state surfaces already prevent these issues.

### Now: Completed-agent handoff contract

Problem statement: Users need more than "done"; they need to know what was changed, tested, pushed, merged, checked out locally, and left for review ([First look at Cursor background agents](https://www.youtube.com/watch?v=Mu3J-odJyb4)).

Hypothesis: A standard completion card mapped to Cloud Agents artifacts, PR handoff, diffs, and review UI would improve trust and reduce review confusion.

Confirm or kill: Confirm if completed-agent sessions often lead to "what happened/what now" follow-ups, GitHub switching, manual test reruns, or local state confusion. Kill if current summaries already correlate with successful review completion.

### Investigate: Rules/context visibility and refresh semantics

Problem statement: Users report context loss or rules not being followed in long sessions, and public workarounds structure rules hierarchically ([Agent Chat Loses Context](https://forum.cursor.com/t/agent-chat-loses-context-when-conversationstate-snapshot-is-skipped-for-unloaded-user-message-bubble/161477), [Cursor, Droid, Claude: Why Your Agent Forgets Rules](https://www.youtube.com/watch?v=PTjP9S9DrPo)).

Hypothesis: A context/rules inspector for Rules, `AGENTS.md`, Plan Mode, and Agents Window could show what guidance is active, stale, skipped, or refreshed.

Confirm or kill: Confirm if traces show relevant rules missing, stale, truncated, or skipped in failed sessions. Kill if most failures happen despite correct context loading, indicating mostly model-level adherence limits.

### Investigate: Pre-launch task decomposition

Problem statement: Successful workflows split work into small independent tasks, while large tasks lead users toward custom orchestration ([CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc), [Background Agent Orchestrator](https://forum.cursor.com/t/built-an-background-agent-orchestrator-to-handle-large-tasks/142478)).

Hypothesis: A Plan Mode or Cloud Agents option to split a large prompt into agent-sized tasks, dependencies, acceptance criteria, and review plans could improve long-horizon outcomes.

Confirm or kill: Confirm if large prompts fail or require follow-up more often than issue-sized prompts. Kill if decomposition adds friction without reducing rework.

## 6. What Public Data Cannot Tell Us

Public data cannot estimate prevalence. Forum posts, GitHub artifacts, and YouTube tutorials are biased toward frustrated users, power users, creators, and people willing to publish their workflows. Reddit, X, and YouTube comments were unavailable or degraded, so this scan lacks social disagreement and broader sentiment texture.

Public data cannot show Cursor's real funnel: Cloud Agent launch success rate, retry rate, abandonment, task length, internal error classes, review completion, merge/revert rates, or whether teams trust artifacts enough to merge. It also cannot distinguish cleanly between model-level instruction-following limits and Cursor-specific context/rule delivery without internal traces.

The next internal research step should compare public hypotheses against product telemetry, support tags, anonymized agent traces, and interviews with users who regularly run two or more agents in parallel.

## Appendix: Source Limits

- Lead deliverable (read first): `DELIVERABLE.md`.
- Full source log: `output-a-coverage-source-log.md`.
- Theme and reliability artifact: `output-b-themes-reliability.md`.
- Recommendation backlog: `recommendations.md`.
- Verification pass (2026-06-23): four unverifiable `cursor/cursor` issue rows were dropped (404); only theme T2 lost evidence (severity S1–S2 → S1, source families 3 → 2). Details in `output-a-coverage-source-log.md`.
- YouTube videos/transcripts were accessible; YouTube comments were not.
- Reddit and X produced no retained item rows under access constraints.
