# Product Requirements Document: Cursor Echo
**Version:** 0.4 — transcript path and schema confirmed

---

## 1. What it is

**Cursor Echo** is a Cursor extension that reads your session history, spots recurring patterns in how you and the agent interact, and tells you — in plain language — what to change.

**How you run it:**
Open the Command Palette (`Cmd+Shift+P`) and type `Cursor Echo: Analyze My Sessions`.

No account. No API key. No config file. No Node.js required. It installs like any other Cursor extension and finds your sessions automatically.

---

## 2. The problem it solves

Most Cursor users feel friction before they can name it. They re-explain things to the agent, watch it overshoot a task, or notice sessions get worse the longer they run — but they can't point to *why*, and they can't fix what they can't see.

Cursor Echo makes that friction visible and tells you which Cursor feature eliminates it.

---

## 3. How it works (user's perspective)

User opens the Command Palette, runs `Cursor Echo: Analyze My Sessions`. A progress notification appears briefly. A new editor tab opens:

```
# Cursor Echo  ·  14 sessions  ·  87 turns

---

## You often re-explain context the agent forgot
Seen in 8 of 14 sessions

The fix: save repeated context as a Cursor Rule so you never have
to say it again.

From your sessions:
> "remember, we're not touching the auth module"

Suggested rule → .cursor/rules/project-scope.mdc
  Never modify files in /src/auth unless explicitly asked.

---

## The agent sometimes does more than you asked
Seen in 5 of 14 sessions

The fix: use Plan mode to review the approach before the agent
runs. You approve, then it acts.

From your sessions:
> "no I only wanted you to update the test, not refactor the whole file"

---

## 2 prompts that worked especially well

These are clean, specific, and got good results. Worth saving as
reusable Skills.

· "Refactor only the auth module, leave routing untouched"
· "Add error handling here — no new dependencies"

---

*Report saved to .cursor/echo-report.md*
```

That's the entire interaction. The report opens inline, reads in under a minute, and links directly to the relevant Cursor features.

---

## 4. Patterns it looks for

Three patterns, in plain language. Each maps to a Cursor feature that fixes it.

| What you'll see | What it means | The fix |
|---|---|---|
| **Re-explaining context** | You restated something the agent forgot — a constraint, a file boundary, a decision already made | Save it as a [Rule](https://docs.cursor.com/context/rules) |
| **Agent went out of scope** | The agent did noticeably more or less than you intended | Use [Plan mode](https://docs.cursor.com/agent/plan-mode) to review before it runs |
| **Back-and-forth on intent** | The agent asked what you meant instead of attempting the task | Front-load specifics; consider an [Ask mode](https://docs.cursor.com/agent/ask-mode) prompt pattern |

A fourth signal — **strong prompts** — surfaces exchanges where things went smoothly. These are flagged as candidates to save as reusable [Skills](https://docs.cursor.com/agent/skills).

No scores. No percentages. No jargon beyond the Cursor feature names. Every finding includes a quoted line from the user's actual sessions.

---

## 5. Inputs

### Confirmed transcript location

Verified on macOS. The actual path structure is:

```
~/.cursor/projects/{project-name}/agent-transcripts/{session-uuid}/{session-uuid}.jsonl
                                                                    subagents/{uuid}.jsonl
```

Key details for `discover.ts`:
- The main session file has the **same name as its parent UUID folder** — glob pattern is `~/.cursor/projects/*/agent-transcripts/*/*.jsonl`
- Any file inside a `subagents/` directory must be **skipped** — those are not primary sessions
- Project folders use path-encoded names (e.g., `Users-charlie-Building-Echo`) as well as numeric IDs — discover all of them

### Confirmed JSONL schema

Each line in a session file is one of:

```json
// User turn — actual message is inside <user_query> tags
{"role":"user","message":{"content":[{"type":"text","text":"<timestamp>Thu, Jun 18, 2026</timestamp>\n<user_query>\nThe real message text here\n</user_query>"}]}}

// Assistant turn — may contain both text and tool_use blocks
{"role":"assistant","message":{"content":[{"type":"text","text":"Visible response text"},{"type":"tool_use","name":"Read","input":{...}}]}}
```

Parsing rules for `parse.ts`:
1. **User turns**: extract text from `message.content[].type === "text"`, then strip `<timestamp>` tags and extract the content inside `<user_query>...</user_query>`. If no `<user_query>` wrapper is present, use the raw text.
2. **Assistant turns**: extract only `type === "text"` blocks. Skip all `type === "tool_use"` blocks — those are execution, not conversation.
3. **Skip the line entirely** if it produces no text content after extraction (tool-only turns).
4. Consecutive assistant-role lines are valid — the agent sometimes sends multiple messages in a row.

### Auto-discovery (default)
Cursor Echo scans `~/.cursor/projects/*/agent-transcripts/*/*.jsonl` automatically when the command runs, excluding any files under `subagents/`. Nothing to configure.

If no sessions are found, a notification explains why:

> **Cursor Echo:** No sessions found at `~/.cursor/projects/`. Try pointing to a folder with `.jsonl` transcripts via Settings.

### Custom path (optional setting)
In Cursor settings (`cursorEcho.transcriptsPath`), users can point to any directory. Cursor Echo will recursively find all `.jsonl` files within it, excluding any inside `subagents/` folders. Useful for analyzing a specific project or testing with the bundled fixtures.

---

## 6. Output

### Report tab (primary)
Opens as a rendered **Markdown Preview** tab (`vscode.commands.executeCommand('markdown.showPreview', uri)`) so the report displays as formatted text, not raw markdown. Designed to be readable in under a minute. Shows at most 3 patterns and 2 strong-prompt examples. If fewer patterns are detected, only those are shown — no padding.

### `.cursor/echo-report.md` (also written)
The same content, saved to the current workspace's `.cursor/` directory alongside Rules and plans. Persists after the tab is closed. Can be disabled via `cursorEcho.saveReport: false` in settings.

---

## 7. Classifier

v0.1 uses a heuristic classifier — no API key, no cost, no network requests.

**How it detects patterns:**

- **Re-explaining context**: user turn contains phrases referencing something said earlier ("I already said", "as I mentioned", "remember", "like I said", "we agreed")
- **Agent went out of scope**: user turn contains correction phrases ("too much", "only wanted", "just the", "don't touch", "didn't ask you to")
- **Back-and-forth on intent**: agent turn contains clarifying questions ("what do you mean", "which file", "can you clarify", "do you want me to")
- **Strong prompt**: a user turn immediately followed by an agent response with no follow-up correction

Every detected pattern quotes the specific phrase that triggered it, so users can judge for themselves whether the match is accurate.

**Known limitation:** heuristics miss subtle patterns and will produce some false positives. The goal of v0.1 is to surface obvious, recurring friction — not to be exhaustive. A `cursorEcho.useAI: true` setting (v0.2, uses Anthropic API) will improve accuracy significantly.

---

## 8. Extension commands and settings

**Commands** (registered in Command Palette):

| Command | What it does |
|---|---|
| `Cursor Echo: Analyze My Sessions` | Runs analysis, opens report tab |
| `Cursor Echo: Analyze with Fixtures` | Runs against bundled example data — no real sessions needed |

**Settings** (in Cursor `settings.json`):

| Setting | Default | Description |
|---|---|---|
| `cursorEcho.transcriptsPath` | `""` | Custom path to `.jsonl` transcript directory. Auto-discovers if empty. |
| `cursorEcho.minTurns` | `3` | Skip sessions shorter than this. Filters out one-turn experiments. |
| `cursorEcho.saveReport` | `true` | Write `.cursor/echo-report.md` after each run. |

---

## 9. Project structure

```
cursor-echo/
  src/
    extension.ts          Extension entry point, command registration
    discover.ts           Auto-finds ~/.cursor/projects/ transcripts
    parse.ts              Parses Cursor JSONL transcripts
    classify.ts           Heuristic pattern detection
    suggest.ts            Pattern → plain-language suggestion + example
    report.ts             Builds markdown report, opens editor tab
  data/
    fixtures/             4 example transcripts (one per pattern + one clean)
  package.json            Extension manifest (contributes, activationEvents, engines.vscode: "^1.85.0")
  tsconfig.json
  .vscodeignore
  README.md
  EXAMPLE_REPORT.md
```

---

## 10. Install

**For open-source / early users:**
1. Download `cursor-echo-x.x.x.vsix` from the GitHub releases page
2. In Cursor: Extensions sidebar → `···` menu → **Install from VSIX...**
3. Select the downloaded file

**If published to the Cursor/VS Code marketplace:**
1. Open Extensions in Cursor (`Cmd+Shift+X`)
2. Search `Cursor Echo`
3. Click Install

No terminal. No Node.js. No npm. Works the same way every other Cursor extension installs.

---

## 11. What's explicitly out of scope

- **AI classification** — v0.2, opt-in via `cursorEcho.useAI: true`, uses Anthropic API
- **Trend tracking over time** — requires more session history than most users will have at launch
- **Webview UI or dashboard** — a markdown report tab is enough for v0.1
- **Researcher dataset export** — out entirely; this is a user-facing tool

---

## 12. Done when

v0.1 ships when:

1. `Cursor Echo: Analyze My Sessions` auto-discovers and parses at least one real Cursor transcript without any user configuration
2. The report tab opens in under 3 seconds for ≤20 sessions
3. Every pattern finding quotes a real line from the user's sessions
4. `Cursor Echo: Analyze with Fixtures` runs clean and produces output matching `EXAMPLE_REPORT.md`
5. Installing from `.vsix` and running the command works on a fresh Cursor install with no additional setup
6. A Cursor user who has never heard of this tool can understand the report without reading the README
