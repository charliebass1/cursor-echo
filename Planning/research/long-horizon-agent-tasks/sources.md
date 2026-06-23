# Sources And Evidence Log

Use this file to track the evidence behind findings.

## Stage 0 Coverage Check

Date: 2026-06-22

Coverage statement: Live web search and page fetching are available in this environment. `forum.cursor.com` is directly reachable and should be the strongest source for Cursor-specific bug reports, feature requests, and workflow discussions. Reddit is degraded: both `reddit.com` and `old.reddit.com` direct fetches are blocked by Reddit/network policy, so Reddit can only be used if individual results are visible through web search snippets or reachable cached/linked pages; this creates a meaningful blind spot for comment-thread disagreement and workaround detail. X/Twitter is degraded: a Cursor profile page was partially fetchable, but X search timed out and direct thread/comment mining should be treated as unreliable; use web search snippets, screenshots, embeds, or linked mirrors when available and flag the gap. GitHub repository pages and file pages are reachable through normal web fetch/search, but GitHub web code search requires sign-in and the `gh` CLI is not installed here, so GitHub code search is degraded; use web search discovery plus directly fetchable repository, issue, PR, and raw file URLs, and do not claim exhaustive GitHub coverage.

Capability probes run:

- Web search: `site:forum.cursor.com Cursor background agent long running`
- Web fetch: `https://forum.cursor.com/`
- Web fetch: `https://www.reddit.com/r/cursor/`
- Web fetch: `https://old.reddit.com/r/cursor/`
- Web fetch: `https://x.com/cursor_ai`
- Web fetch: `https://x.com/search?q=Cursor%20background%20agent&src=typed_query`
- Web fetch: `https://github.com/search?q=path%3A.specstory%2Fhistory+path%3A*.md&type=code`
- Web search: `site:github.com .specstory/history Cursor agent long session`
- Shell: `gh auth status && gh search code "path:.specstory/history path:*.md" --limit 3`

Adapted plan:

- Treat `forum.cursor.com` and directly fetchable Cursor docs/changelog/blog pages as primary sources.
- Use Reddit and X only as degraded supplementary sources unless individual posts/comments are reachable through search or linked pages.
- Use GitHub for directly discoverable repos, issues, PRs, and files, but state clearly that broad code search is not exhaustive.
- Keep every substantive claim linked to a reachable source; drop items that cannot be re-opened or verified.

## Source Types

- Developer interviews
- Public posts, issues, forums, and videos
- Cursor chat transcripts or session summaries
- Internal notes or firsthand observations
- Comparable product workflows

## Evidence Log

This file holds the Stage 0 coverage check (above). The full tagged source log — every retained item with URL, date, Cursor signal, workflow stage, candidate theme, severity, actionability, and evidence snippet — lives in [`output-a-coverage-source-log.md`](output-a-coverage-source-log.md), along with the 2026-06-23 verification pass that dropped four unverifiable rows.

## Source Quality Notes

Capture caveats here, such as sample bias, weak signals, anonymization limits, or claims that need corroboration.
