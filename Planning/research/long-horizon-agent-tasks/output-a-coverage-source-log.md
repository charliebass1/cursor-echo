# Output A: Coverage And Source Log

Date: 2026-06-22

This is the Stage 4 Output A deliverable for the public-data landscape scan. It includes the Stage 0 coverage statement, exact Stage 1 queries, saturation/access status, grounding notes, and the full retained tagged item log. It intentionally stops before Stage 2 clustering, reliability checking, or memo synthesis.

## Verification Pass (Wrap-Up, 2026-06-23)

Before finalizing the deliverable, the load-bearing rows were re-checked against live sources. The findings below were applied to this log and propagated to Outputs B and C.

Dropped as unverifiable (per the brief's hard constraint "if a source can't be re-found or verified, drop it"):

- `cursor/cursor` issue #3853, #3565, #3706, #3730 — all return HTTP 404 on both `github.com/cursor/cursor` and the real Cursor tracker `github.com/getcursor/cursor`, whose issue numbers do not reach this range. These were "search-only / fetch unavailable" rows in the original pass; the issue numbers appear spurious. All four are removed from the retained GitHub log.

Re-citation note (verifiable, but not promoted into the retained long-horizon set):

- The underlying problem behind dropped #3853 — the agent shell tool failing to spawn a process on WSL (`pid: -1`) — is independently reported on the Cursor forum at [Agent Shell tool fails to spawn shell process on WSL (pid: -1)](https://forum.cursor.com/t/agent-shell-tool-fails-to-spawn-shell-process-on-wsl-pid-1/145286). It is general agent-mode execution, not specifically long-horizon, so it is noted as corroboration for the execution-reliability theme rather than added as a coded row.

Re-verified (existence, title, date, and snippet confirmed via search after direct fetch returned 403 rate-limiting at wrap-up):

- [Cannot start cloud agent](https://forum.cursor.com/t/cannot-start-cloud-agent/163194) — confirmed; search surfaced richer detail (stuck in `CREATING`, `EXEC_DAEMON_NOT_READY`, "Cannot resolve authority").
- [Cursor 3: Worktrees & Best-of-N](https://forum.cursor.com/t/cursor-3-worktrees-best-of-n/156507) — confirmed; an additional independent thread corroborates the worktree/parallel regression: [/best-of-n does not run parallel model worktrees — falls back to single agent](https://forum.cursor.com/t/best-of-n-does-not-run-parallel-model-worktrees-falls-back-to-single-agent/156550).
- [Agent finish steals focus](https://forum.cursor.com/t/agent-finish-steals-focus/157090) — confirmed; an additional independent thread corroborates the focus-steal friction: [Parallel agents/plans steal focus when completing](https://forum.cursor.com/t/parallel-agents-plans-steal-focus-when-completing-disrupts-workflow-when-reviewing-multiple-plans/150407).
- [specstoryai/getspecstory issue #196](https://github.com/specstoryai/getspecstory/issues/196) — confirmed live; content matches the cited snippet (duplicate session files, truncated final messages).

Net effect on the retained set: 30 coded non-grounding rows become 26 (12 Forum, 6 GitHub, 8 YouTube). Only theme T2 (context/instruction retention) loses evidence — its severity drops from S1–S2 to S1 and its independent source families drop from 3 to 2. T1, T3, T4, T5, and T6 are unaffected, and T3/T4 gain corroboration. The corroborating threads above are recorded as supporting context, not re-coded into the formal log, to avoid overclaiming from search snippets.

## Coverage Statement

Live web search and page fetching are available in this environment. `forum.cursor.com` is directly reachable and is the strongest source for Cursor-specific bug reports, feature requests, and workflow discussions. Reddit is degraded: both `reddit.com` and `old.reddit.com` direct fetches were blocked by network policy/login requirements, so Reddit can only be used where an individual item is visible through search snippets or another reachable page; this leaves a meaningful blind spot for comment-thread agreement, disagreement, and workaround detail. X/Twitter is degraded: a Cursor profile page was partially fetchable, but X search/thread mining was unreliable and the bounded retry returned no direct X post URLs; use X only if individual posts can be re-opened or verified through reachable mirrors/screenshots. GitHub repository, issue, PR, and file pages are reachable when directly discoverable, but broad GitHub code search is degraded because web code search requires sign-in and `gh` is unavailable here; GitHub coverage is therefore opportunistic rather than exhaustive. YouTube video pages, metadata, descriptions, and transcripts are reachable for many videos and can be used as secondary workflow evidence, but YouTube comments are not reliably accessible through `WebFetch`; comment sentiment is therefore unavailable unless an individual comment is visible on a reachable page or user-provided export.

## Capability Probes

- Web search: `site:forum.cursor.com Cursor background agent long running`
- Web fetch: `https://forum.cursor.com/`
- Web fetch: `https://www.reddit.com/r/cursor/`
- Web fetch: `https://old.reddit.com/r/cursor/`
- Web fetch: `https://x.com/cursor_ai`
- Web fetch: `https://x.com/search?q=Cursor%20background%20agent&src=typed_query`
- Web fetch: `https://github.com/search?q=path%3A.specstory%2Fhistory+path%3A*.md&type=code`
- Web search: `site:github.com .specstory/history Cursor agent long session`
- Shell capability check: `gh auth status && gh search code "path:.specstory/history path:*.md" --limit 3`
- Web search: `site:youtube.com/watch Cursor 3 agents workflow parallel cloud agents`
- Web fetch: `https://www.youtube.com/watch?v=AggITrydtwk`

## Adapted Source Plan

- Treat `forum.cursor.com` and directly fetchable Cursor docs/changelog/blog pages as primary sources.
- Use Reddit and X only as degraded supplementary sources unless individual posts/comments are reachable and verifiable.
- Use GitHub for directly discoverable repos, issues, PRs, and files, while avoiding claims of exhaustive GitHub coverage.
- Use YouTube videos/transcripts as secondary workflow evidence, not comment-thread evidence.
- Keep every substantive claim tied to a reachable source; drop items that cannot be re-opened or verified.

## Exact Queries Run

### Cursor Forum

Pass A - workflow:

- `site:forum.cursor.com Cursor background agent workflow`
- `site:forum.cursor.com Cursor cloud agent workflow`
- `site:forum.cursor.com Cursor parallel agents`

Pass B - roadblocks:

- `site:forum.cursor.com Cursor background agent failed`
- `site:forum.cursor.com Cursor agent lost context`
- `site:forum.cursor.com Cursor agent ignored instructions`

Pass C - success/disconfirming:

- `site:forum.cursor.com Cursor background agent worked`
- `site:forum.cursor.com Cursor cloud agent success`
- `site:forum.cursor.com Cursor agent finished feature`

### GitHub

Pass A - workflow:

- `site:github.com Cursor background agent PR`
- `site:github.com .cursor/rules agent workflow`
- `site:github.com AGENTS.md Cursor agent workflow`

Pass B - roadblocks:

- `site:github.com Cursor background agent failed`
- `site:github.com .specstory/history Cursor lost context`
- `site:github.com Cursor agent ignored instructions`

Pass C - success/disconfirming:

- `site:github.com Cursor background agent shipped`
- `site:github.com agent finished feature PR Cursor`
- `site:github.com .specstory/history Cursor task worked`

### Reddit And X/Twitter

Pass A - workflow:

- `site:reddit.com/r/cursor Cursor background agent workflow`
- `site:x.com Cursor background agent workflow`
- `site:reddit.com/r/ChatGPTCoding running multiple agents`

Pass B - roadblocks:

- `site:reddit.com/r/cursor Cursor agent lost context`
- `site:x.com Cursor background agent failed`
- `site:reddit.com/r/cursor Cursor agent ignored instructions`

Pass C - success/disconfirming:

- `site:reddit.com/r/cursor Cursor background agent worked`
- `site:x.com Cursor agent finished feature`
- `site:reddit.com/r/ChatGPTCoding agent finished feature`

### YouTube

Pass A - workflow:

- `site:youtube.com/watch Cursor 3 agents workflow parallel cloud agents`
- `site:youtube.com/watch Cursor multi agents workflow long running`
- `site:youtube.com/watch Cursor background agents workflow`

Pass B - roadblocks:

- `site:youtube.com/watch Cursor 3 broken agents worktrees bug`
- `site:youtube.com/watch Cursor agent failed ignored instructions lost context`
- `site:youtube.com/watch Cursor cloud agent failed background agent`

Pass C - success/disconfirming:

- `site:youtube.com/watch Cursor agent finished feature PR cloud agent`
- `site:youtube.com/watch Cursor multi agents shipped feature`
- `site:youtube.com/watch Cursor 3 merge PR agents workflow`

### Cursor Grounding

- `Cursor docs background agents`
- `Cursor docs cloud agents`
- `Cursor docs rules`
- `Cursor docs plan mode`
- `Cursor docs hooks`
- `Cursor docs skills`
- `Cursor changelog background agents`
- `Cursor blog agent autonomy auto-review`

## Saturation And Access Status

Cursor Forum: Ran all 9 bounded queries and fetched 12 directly reachable forum threads. Stopped at the item cap rather than thematic saturation. Repeated infrastructure, context, worktree, orchestration, and review-friction themes appeared; Pass C still added success and review-friction signals, so the source is not fully saturated.

GitHub: Ran all 9 bounded queries and originally retained 10 substantive items, reduced to 6 after the wrap-up verification pass dropped 4 unverifiable `cursor/cursor` issue rows (see Verification Pass above). Stopped at the item cap, not full saturation. Broad code search was not used because GitHub code search is gated and `gh` is unavailable. The dropped rows were exactly the search-only ones whose direct fetch/API access had failed; the remaining 6 are directly verifiable repository files, repos, and one confirmed issue.

Reddit: Direct access was blocked by network policy/login requirements. No retained Reddit rows. This is a coverage gap, not evidence of absence.

X/Twitter: Bounded searches produced no direct X post URLs and direct thread mining is unreliable. No retained X rows. This is a coverage gap, not evidence of absence.

YouTube: Ran all 9 bounded queries and retained 8 video/transcript rows. Stopped at the item cap rather than full saturation. Video pages and transcripts were reachable for most selected videos, but some search-result video URLs returned 404 on direct fetch and were excluded or kept only when already fetched successfully. YouTube comments were not accessible, so comment-thread sentiment and disagreement are absent.

Cursor Grounding: Ran all 8 grounding queries and fetched reachable official/high-signal pages. Some official pages timed out, so feature details are limited to successfully fetched pages and reliable search snippets from official results.

## Tagged Item Log

Schema:

`source | url | date | Cursor-version-era | Cursor-signal | pass | workflow stage | candidate theme | severity | actionability | evidence snippet`

### Cursor Forum Rows

```text
My Background Agent Stack | https://forum.cursor.com/t/my-background-agent-stack-is-now-a-fully-operational-ci-cd-system/101126 | 2025-06-06 | Background Agent early era | Cursor | A | execution/deployment | async CI/CD via agents and APIs | S0 positive | Cursor-actionable docs/API | "No manual steps. Just fire the pipeline and ship."
Long-Running Multi-Agent Orchestration | https://forum.cursor.com/t/workflow-long-running-multi-agent-orchestration-root-agent-parallel-sub-agents-separate-prs/160563 | 2026-05-13 | Cloud Agents/API era | Cursor | A | orchestration | subagents not fit for many parallel PR workers | S2 | Cursor-actionable | "all subagents stuck or running in looping. none finished."
Background Agent Orchestrator | https://forum.cursor.com/t/built-an-background-agent-orchestrator-to-handle-large-tasks/142478 | 2025-11-13 | Background Agent API era | Cursor | A | planning/orchestration | external orchestrator for dependent large tasks | S0 positive | Cursor-actionable | "huge job of porting a 20 year old codebase"
Trigger Background Agent Programmatically | https://forum.cursor.com/t/trigger-background-agent-programmatically/101479 | 2025-06-07 | pre/API-request era | Cursor | A | launch/trigger | programmatic agent spawning for PR/CI workflows | S1 | Cursor-actionable | "spawn several background agents using REST api from github actions"
Cursor 3 Worktrees & Best-of-N | https://forum.cursor.com/t/cursor-3-worktrees-best-of-n/156507 | 2026-04-02 | Cursor 3.0.x | Cursor | A | parallel work setup | agentic worktree management regression | S2 | Cursor-actionable | "yet to get a single session to successfully use a worktree"
Cloud Agents with Computer Use | https://forum.cursor.com/t/cloud-agents-with-computer-use/152829 | 2026-02-24 | Cloud computer-use era | Cursor | C | verification/review | VM testing with PR artifacts works for some | S0 positive | Cursor-actionable | "Agents produce merge-ready PRs with videos, screenshots, and logs"
Background Agent Fails Repeatedly | https://forum.cursor.com/t/background-agent-fails-repeatedly-with-we-encountered-an-unexpected-error-repeatedly-no-request-id-visible/159566 | 2026-05-01 | Web Cloud Agents | Cursor | B | startup/handoff | server-side kickoff message loss | S2 | Cursor-actionable | "This is blocking production work."
Cannot Start Cloud Agent | https://forum.cursor.com/t/cannot-start-cloud-agent/163194 | 2026-06-13 | Cursor 3.7.27 | Cursor | B | startup/environment | exec-daemon infra readiness failure | S2 | Cursor-actionable | "Yes - Cursor is unusable"
Agent Chat Loses Context | https://forum.cursor.com/t/agent-chat-loses-context-when-conversationstate-snapshot-is-skipped-for-unloaded-user-message-bubble/161477 | 2026-05-24 | Cursor 3.5.17 | Cursor | B | context retention | long session summarization/context loss | S1 | Cursor-actionable | "agent behaves as if previous visible turns are missing"
Cursor Agent Not Following Rules | https://forum.cursor.com/t/cursor-agent-not-following-rules/149542 | 2026-01-22 | Cursor 2.3.41 | Cursor | B | instruction adherence | rules loaded but not reliably followed | S1 | mixed Cursor/model | "can see the rules... but doesn't apply them while working"
Background Agents Cloud or Local | https://forum.cursor.com/t/background-agents-cloud-or-local-machine/102543 | 2025-06-10 | Background Agent cloud era | Cursor | C | long-running delegation | cloud runs after local machine sleeps | S? | Cursor-actionable docs | "new Pull Request sitting for me in the morning"
Agent Finish Steals Focus | https://forum.cursor.com/t/agent-finish-steals-focus/157090 | 2026-04-08 | Cursor 3.0.13 | Cursor | C | completion/review | parallel agents interrupt review on completion | S1 | Cursor-actionable | "focus is forcibly switched away from what you're currently reading"
```

### GitHub Rows

```text
bybren-llc/safe-agentic-workflow | https://github.com/bybren-llc/safe-agentic-workflow/blob/edf298b9/.cursor/rules/30-background-agents.mdc | n.d. | Cloud Agents era | Cursor | A | background-agent workflow | PR-producing background agents with rules, validation, HITL review | S? not failure | Cursor-actionable | "clone GitHub, branch, commit, push, open pull requests"
Wade-O-Lution-Inc/cursor-setup-guide | https://github.com/Wade-O-Lution-Inc/cursor-setup-guide/blob/main/agents.md | n.d. | Cloud Agents era | Cursor | A | cloud setup | AGENTS.md bridges ephemeral VM/local-env gap | S1 rework risk | Cursor-actionable | "ephemeral VMs without local tools, secret managers, or network"
HKTITAN/cursor-best-practices | https://github.com/HKTITAN/cursor-best-practices/blob/HEAD/cursor-best-practices/references/rules-and-commands.md | n.d. | Rules/Commands era | Cursor | A | repo workflow design | Rules, commands, AGENTS.md used as persistent/triggered workflow system | S? not failure | Cursor-actionable | "Apply project rules from .cursor/rules or AGENTS.md"
specstoryai/getspecstory issue #196 | https://github.com/specstoryai/getspecstory/issues/196 | 2026-03-20 | Mar 2026 latest | likely-Cursor | B | history/audit capture | Duplicate/truncated Cursor session histories weaken audit trail | S1 rework/babysit | ecosystem-level | "last agent responses often cut off mid-sentence"
bryantbrock/cursor-background-agents-mcp | https://github.com/bryantbrock/cursor-background-agents-mcp | n.d. | Cloud Agents API era | Cursor | C | issue-to-PR orchestration | MCP workflow launches agents, links PRs, tracks completion/error | S? success pattern | Cursor/ecosystem-actionable | "Agent implements solution; creates PR with Closes #42"
KhalidAbdelaty/cursor-sdk-bug-fixer-demo | https://github.com/KhalidAbdelaty/cursor-sdk-bug-fixer-demo | n.d. | Cloud Agents SDK era | Cursor | C | successful cloud run | Demo cloud agent fixes bug and prints PR URL | S? success; S1 empty-diff risk | Cursor-actionable | "status FINISHED; Pull request: github.com/.../pull/1"
```

### Reddit And X Rows

```text
None retained | n/a | n/a | n/a | n/a | A/B/C | n/a | n/a | n/a | n/a | Direct Reddit/X evidence unavailable or unverifiable
```

### YouTube Rows

```text
My Ultimate AI Coding Workflow | https://www.youtube.com/watch?v=AggITrydtwk | 2025-09-12 | Background Agents era | Cursor | A/C | planning/delegation/review | issue-to-agent-to-PR workflow succeeds with focused specs | S0 positive; S1 connector/cost caveats | Cursor-actionable | "Split work into small independent issues and run agents in parallel."
CRUSH Your Backlog With Background Agents | https://www.youtube.com/watch?v=0ctWRkOqKFc | 2025-06-12 | Background Agents beta era | Cursor | A/B/C | task selection/cost/branch setup | smaller predictable tasks work better than complex ones | S1 rework/cost risk | Cursor-actionable | "pick the ones that are easier, smaller, more predictable"
Cursor 2.0: Shipping Real Feature | https://www.youtube.com/watch?v=79FG_IocSPo | search result; direct fetch failed | Cursor 2.0 era | Cursor | B | worktree/context management | agent stayed pinned to wrong worktree context | S1 rework | Cursor-actionable | "agent is writing to the wrong directory"
Cursor, Droid, Claude: Why Your Agent Forgets Rules | https://www.youtube.com/watch?v=PTjP9S9DrPo | 2025-12-07 | Rules/AGENTS.md era | Cursor/generic | B | context/instruction adherence | long sessions need hierarchical just-in-time context | S1 re-explain/rework | mixed Cursor/model | "why does my AI agent start ignoring my conversations halfway"
First look at Cursor background agents | https://www.youtube.com/watch?v=Mu3J-odJyb4 | n.d. | Background Agents preview era | Cursor | A/B/C | PR handoff/post-merge state | successful multi-agent PRs, but post-merge state unclear | S1 handoff friction | Cursor-actionable | "doesn't fully show me the context of what happens once merged"
Cursor 3 is Not What You Think | https://www.youtube.com/watch?v=AAGmJAvec9o | 2026-04-04 | Cursor 3.0 | Cursor | A/C | multi-agent execution/review | three agents complete UI changes and merge into PR | S0 positive; S1 branch cleanup gap | Cursor-actionable | "All three agents and their changes were pushed to one PR"
Cursor 3.0 is officially the new King | https://www.youtube.com/watch?v=la_tAgBKqO0 | search result; previously fetched | Cursor 3.0 | Cursor | A/C | local/cloud handoff/merge conflict review | local/cloud agents, move-to-local, conflict fix workflow | S0 positive | Cursor-actionable | "simple button where you can just click it resolves merge conflicts"
Cursor's Agents Test Their Own Code Now | https://www.youtube.com/watch?v=R4I0BBMDp1Q | search result; previously fetched | Cloud Agents computer-use era | Cursor | C | validation/testing | agents create videos/logs for verification before merge | S0 positive | Cursor-actionable | "send back video recordings of their work"
```

## Cursor Product Grounding

Schema:

`feature/surface | url | relevant capability/constraint | current/historical note`

```text
Cloud Agents | https://cursor.com/docs/cloud-agent | Remote agents in isolated cloud VMs; can build, test, interact with apps, use MCP, support multi-repo, artifacts, remote desktop, PR handoff. | Current name; formerly Background Agents.
Background Agents | https://cursor.com/help/ai-features/background-agents | Historical/alias surface for long-running cloud coding agents. | Renamed to Cloud Agents in Cursor 2.0.
Cloud Agent environments | https://cursor.com/docs/cloud-agent | Agent-led setup, saved snapshots, or Dockerfile via .cursor/environment.json; environment quality determines ability to test/verify. | Current setup model.
Cloud Agents API | https://cursor.com/docs/cloud-agent/api/endpoints | Programmatic launch/manage Cloud Agents; v1 public beta per search result. | Fetch timed out; search surfaced official docs snippet.
Plan Mode | https://cursor.com/docs/agent/plan-mode | Agent researches codebase, asks clarifying questions, creates editable implementation plan before Build. | Current; 2.0 added Plan Mode in background/parallel planning.
Rules | https://cursor.com/docs/rules | Persistent Agent instructions; Project/User/Team/AGENTS.md; .cursor/rules/*.mdc supports alwaysApply, globs, description. | Current; Rules do not apply to Tab or Inline Edit.
Skills | https://cursor.com/help/customization/skills | Reusable multi-step workflows in SKILL.md; invoked with /skill-name or @skill-name; auto-loaded from .cursor/skills, .agents/skills, etc. | Current; /migrate-to-skills available in Cursor 2.4+.
Hooks | https://cursor.com/docs/hooks | Scripts/prompt checks around agent lifecycle; can observe, block, or modify behavior; configured via .cursor/hooks.json or ~/.cursor/hooks.json. | Current; GitButler writeup observed Hooks beta in Cursor 1.7.
Auto-review | https://cursor.com/blog/agent-autonomy-auto-review | Classifier reviews actions in context before tool execution; reduces approval fatigue while slowing higher-risk actions. | Current; default for new users, existing users enable in Settings > Agents.
permissions.json | https://cursor.com/docs/reference/permissions | Configures MCP/terminal allowlists and autoRun classifier steering; not a security boundary. | Current; autoRun only affects Auto-review mode.
Multi-Agents | https://cursor.com/changelog/2-0 | Run up to eight agents in parallel on one prompt using worktrees or remote machines. | Cursor 2.0 surface.
Sandboxed Terminals | https://cursor.com/changelog/2-0 | Agent shell commands run in macOS sandbox by default unless allowlisted; workspace write, no internet. | GA in Cursor 2.0.
```

## Directly Observed Grounding Success Conditions

Schema:

`source | url | date | Cursor-version-era | Cursor-signal | pass | workflow stage | candidate theme | severity | actionability | evidence snippet`

```text
Cursor Docs: Cloud Agents | https://cursor.com/docs/cloud-agent | n.d. | current Cloud Agents | Cursor | grounding | validation/handoff | verifiable agent output | S? docs | Cursor-actionable | "produce screenshots, videos, and logs"
Cursor Docs: Plan Mode | https://cursor.com/docs/agent/plan-mode | n.d. | current Plan Mode | Cursor | grounding | planning | reviewable implementation plans | S? docs | Cursor-actionable | "reviewable plan you can edit before building"
Linear Changelog: Cursor background agents | https://linear.app/changelog/2025-08-21-cursor-agent | 2025-08-21 | Background Agents pre-2.0 naming | Cursor | grounding | delegation/handoff | issue-to-PR workflow | S? docs | Cursor-actionable | "create a branch, draft a PR"
Cursor Blog: Auto-review | https://cursor.com/blog/agent-autonomy-auto-review | 2026-era | Auto-review launch/current | Cursor | grounding | tool-permission governance | lower-interruption autonomy | S? docs | Cursor-actionable | "parent agent can use feedback"
```

## Source Quality Notes

- Forum evidence is auditable and Cursor-specific, but overrepresents failures, heavy users, and public support cases.
- GitHub evidence shows real workflows and public artifacts, but the sample overrepresents tool builders, demo repos, and documented enthusiasts; private enterprise use is absent.
- Search-only GitHub issue rows were validated at wrap-up: four `cursor/cursor` issue rows could not be re-found (404 on both `cursor/cursor` and `getcursor/cursor`) and were dropped. All remaining GitHub rows are directly verifiable repository files, repos, or a confirmed issue.
- Reddit and X produced no retained rows under the access constraints, so the scan lacks public social-commentary texture and disagreement from those platforms.
- YouTube evidence is useful for concrete workflow demonstrations and disconfirming/success cases, but it overrepresents creators, launch coverage, tutorials, sponsorship-adjacent content, and demo projects; comments were not available for triangulating audience disagreement.
- Public engagement should not be treated as prevalence. It can only indicate that a claim resonated within that platform's visible audience.
- Stage 2 should not infer population rates from this source log; it should cluster recurring, independently sourced themes and preserve the access caveats above.
