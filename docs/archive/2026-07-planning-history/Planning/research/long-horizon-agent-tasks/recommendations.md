# Product Recommendations

These are product hypotheses from the public-data scan, not feature specs to ship. Each should be validated against Cursor's internal telemetry, support data, session traces, and customer interviews before roadmap commitment.

## Now

### Hypothesis 1: Cloud Agent readiness needs clearer failure diagnosis and recovery

- Problem: Public forum rows show users blocked when Cloud Agents fail during startup, environment attach, exec-daemon readiness, terminal execution, or mode/tool handoff.
- Target user: Developers delegating unattended or production-adjacent work to Cloud Agents.
- Supporting evidence: [Cannot Start Cloud Agent](https://forum.cursor.com/t/cannot-start-cloud-agent/163194), [Background Agent Fails Repeatedly](https://forum.cursor.com/t/background-agent-fails-repeatedly-with-we-encountered-an-unexpected-error-repeatedly-no-request-id-visible/159566), [cursor-setup-guide AGENTS.md](https://github.com/Wade-O-Lution-Inc/cursor-setup-guide/blob/main/agents.md).
- Proposed product change: Investigate a Cloud Agent readiness and recovery surface that distinguishes infrastructure failure, environment misconfiguration, repo setup gaps, and user-actionable recovery steps.
- Current Cursor surface: Cloud Agents, Cloud Agent environments, `.cursor/environment.json`, Agents Window, Cloud Agents API.
- What would confirm it: Internal data shows startup/environment failures are a meaningful share of abandoned Cloud Agent runs, repeated retries, support tickets, or refunds.
- What would kill it: Failures are rare, short-lived, already resolved in current builds, or mostly isolated to unsupported repo environments.
- Risks / trade-offs: Too much diagnostic detail may overwhelm users or expose internal infra complexity.
- Confidence: High as a public-data hypothesis; needs internal incidence validation.
- Possible MVP: A clearer failed-start state with categorized reason, retry guidance, environment check, and support/debug bundle.

### Hypothesis 2: Parallel agents need stronger state and ownership visibility

- Problem: Users want many agents in flight, but public rows show stuck subagents, unclear worktree state, wrong-directory edits, merge-conflict uncertainty, and external orchestrators built around Cursor.
- Target user: Power users running multiple local/cloud agents, worktrees, best-of-N attempts, or issue-to-PR pipelines.
- Supporting evidence: [Long-Running Multi-Agent Orchestration](https://forum.cursor.com/t/workflow-long-running-multi-agent-orchestration-root-agent-parallel-sub-agents-separate-prs/160563), [Cursor 3 Worktrees & Best-of-N](https://forum.cursor.com/t/cursor-3-worktrees-best-of-n/156507), [Cursor 2.0: Shipping Real Feature](https://www.youtube.com/watch?v=79FG_IocSPo), [cursor-background-agents-mcp](https://github.com/bryantbrock/cursor-background-agents-mcp).
- Proposed product change: Investigate an orchestration view that makes each agent's workspace, branch/worktree, status, changed files, blockers, conflicts, and next action explicit.
- Current Cursor surface: Agents Window, Multi-Agents, worktrees, Cloud Agents, PR/review surfaces.
- What would confirm it: Users with multiple concurrent agents show higher interruption, cancellation, wrong-branch edits, conflict repair, or manual state-checking behavior.
- What would kill it: Most users run only one agent at a time, and multi-agent users already resolve these issues with current UI.
- Risks / trade-offs: Over-optimizing for power users could make the default agent experience feel heavier.
- Confidence: High for power-user segment; medium for broader user base.
- Possible MVP: Per-agent state cards that pin repo, branch/worktree, environment, last successful checkpoint, and recommended next action.

### Hypothesis 3: Finished agents need a clearer handoff contract

- Problem: "Finished" is not always enough. Users still need to know what changed, what was tested, where the PR/branch stands, whether local state is current, and what remains to review.
- Target user: Developers reviewing Cloud Agent or multi-agent output after returning from other work.
- Supporting evidence: [Agent Finish Steals Focus](https://forum.cursor.com/t/agent-finish-steals-focus/157090), [First look at Cursor background agents](https://www.youtube.com/watch?v=Mu3J-odJyb4), [Cloud Agents with Computer Use](https://forum.cursor.com/t/cloud-agents-with-computer-use/152829), [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk).
- Proposed product change: Investigate a standard handoff summary for completed agents: goal, files changed, tests/artifacts, PR/branch status, merge/conflict state, local checkout state, and suggested review steps.
- Current Cursor surface: Agents Window, Cloud Agents artifacts, PR handoff, diffs, review UI, remote desktop/videos/logs.
- What would confirm it: Users frequently open completed agents, inspect history manually, switch to GitHub, re-run tests, or ask follow-up questions like "what happened?" or "what now?"
- What would kill it: Current completion summaries already drive high review completion and low follow-up confusion in telemetry.
- Risks / trade-offs: A summary could create false confidence if it reads like a guarantee instead of a review aid.
- Confidence: High.
- Possible MVP: A completion card with status, linked artifacts, local/remote branch state, and "review checklist" actions.

## Investigate

### Hypothesis 4: Rules/context need visibility and refresh semantics for long sessions

- Problem: Users report agents losing visible context or failing to follow rules, while public workarounds use layered `AGENTS.md` or rules files to keep conventions available.
- Target user: Developers running long sessions in large repos with project conventions, generated plans, or folder-specific rules.
- Supporting evidence: [Agent Chat Loses Context](https://forum.cursor.com/t/agent-chat-loses-context-when-conversationstate-snapshot-is-skipped-for-unloaded-user-message-bubble/161477), [Cursor Agent Not Following Rules](https://forum.cursor.com/t/cursor-agent-not-following-rules/149542), [Cursor, Droid, Claude: Why Your Agent Forgets Rules](https://www.youtube.com/watch?v=PTjP9S9DrPo).
- Proposed product change: Investigate a rule/context inspector that shows which rules and summaries are active for an agent, when they were loaded/refreshed, and whether a relevant rule was skipped.
- Current Cursor surface: Rules, `AGENTS.md`, Plan Mode, Agents Window context, Skills.
- What would confirm it: Internal traces show preventable failures where relevant rules were missing, stale, truncated, or ignored in long sessions.
- What would kill it: Most rule failures are model-level adherence issues even when context is correctly loaded and visible.
- Risks / trade-offs: Exposing internals may make users overfit rules or blame the wrong layer.
- Confidence: Medium-high.
- Possible MVP: "Context used for this step" panel with active rules, attached summaries, and missing-rule warnings.

### Hypothesis 5: Cursor can help users decompose long-horizon tasks before launching agents

- Problem: Successful public workflows split work into small independent issues/specs, while large dependent tasks push users toward custom orchestrators and manual babysitting.
- Target user: Developers launching Cloud Agents or multiple agents from vague backlog items, Linear/GitHub issues, or large feature prompts.
- Supporting evidence: [CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc), [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk), [Background Agent Orchestrator](https://forum.cursor.com/t/built-an-background-agent-orchestrator-to-handle-large-tasks/142478), [Trigger Background Agent Programmatically](https://forum.cursor.com/t/trigger-background-agent-programmatically/101479).
- Proposed product change: Investigate a pre-launch decomposition step that turns a large request into independent agent-sized tasks with acceptance criteria, dependencies, target repo/branch, and review plan.
- Current Cursor surface: Plan Mode, Cloud Agents, Multi-Agents, GitHub/Linear integrations, Skills.
- What would confirm it: Large-agent tasks fail or require follow-up more often than smaller tasks; successful users already manually create issue/spec decomposition before launch.
- What would kill it: Users mostly launch well-scoped tasks already, or decomposition adds more friction than it saves.
- Risks / trade-offs: Too much planning could slow down simple asks and make Cursor feel bureaucratic.
- Confidence: Medium.
- Possible MVP: "Split into agent tasks" option from Plan Mode or issue import, with user approval before launch.

## Watch

### Hypothesis 6: Autonomous-agent governance may need clearer spend, permission, and security cues

- Problem: Public workflow videos explicitly warn about usage-based spending, max-mode costs, repo write access, internet access, and terminal auto-run behavior.
- Target user: Developers or teams enabling unattended Cloud Agents with repo write permissions and CI/deployment access.
- Supporting evidence: [My Ultimate AI Coding Workflow](https://www.youtube.com/watch?v=AggITrydtwk), [CRUSH Your Backlog With Background Agents](https://www.youtube.com/watch?v=0ctWRkOqKFc), [permissions.json docs](https://cursor.com/docs/reference/permissions), [Auto-review blog](https://cursor.com/blog/agent-autonomy-auto-review).
- Proposed product change: Watch whether Cloud Agent adoption creates confusion or risk around cost, permissions, prompt injection, and auto-run behavior; consider clearer preflight cues if internal signals support it.
- Current Cursor surface: `permissions.json`, Auto-review, Cloud Agent setup, billing/spend limits, MCP permissions.
- What would confirm it: Support tickets, abandoned setup, spend surprises, enterprise admin concerns, or unsafe permission configurations cluster around Cloud Agents.
- What would kill it: Current billing/permission surfaces are understood and produce low complaint or incident volume.
- Risks / trade-offs: Security warnings can become noise and reduce useful autonomy if too broad.
- Confidence: Low-medium from public data; needs internal validation.
- Possible MVP: Cloud Agent launch preflight showing estimated cost mode, repo permissions, internet/tool access, and safe defaults.

## Recommendation Backlog

| Tier | Product Hypothesis | Primary Theme | Evidence Strength | Cursor Actionability | Status |
|---|---|---|---|---|---|
| Now | Cloud Agent readiness diagnosis and recovery | T1 | Strong | High | Draft hypothesis |
| Now | Parallel-agent state and ownership visibility | T3 | Strong | High | Draft hypothesis |
| Now | Completed-agent handoff contract | T4 | Strong | High | Draft hypothesis |
| Investigate | Rule/context visibility and refresh semantics | T2 | Strong | Mixed-high | Needs internal traces |
| Investigate | Pre-launch task decomposition | T5 | Medium | High | Needs workflow validation |
| Watch | Spend, permission, and security cues | T6 | Thin-medium | Medium | Needs adoption/risk signals |
| Park | Generic model recency bias outside Cursor context surfaces | T2 subset | Strong but generic | Low | Not a Cursor-only problem |
| Park | Broad social sentiment from Reddit/X/YouTube comments | Coverage gap | Unavailable | Unknown | Do not infer |

## Not Recommended Yet

- Shipping a full project-management/orchestration product. Evidence supports clearer agent state and task decomposition, not a wholesale PM layer.
- Optimizing for YouTube/tutorial workflows as if they represent the median developer. Creator demos are useful but biased toward successful, visible workflows.
- Treating rule-following failures as fully solvable by Cursor. Some evidence points to model-level recency and instruction-following limits.
- Drawing conclusions from Reddit, X, or YouTube comments. Those sources were unavailable or degraded in this environment.
