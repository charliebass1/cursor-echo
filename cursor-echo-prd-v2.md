# Product Requirements Document: Cursor Echo

**Version:** 0.5 — implementation and product direction reconciled

---

## Documentation status

This PRD, `README.md`, `EXAMPLE_REPORT.md`, `docs/product-audit-2026-07.md`,
and `docs/product-roadmap.md` are the active references for extension
development.

Historical planning and research material is archived at `docs/archive/2026-07-planning-history/`.

---

## 1. What it is

**Cursor Echo** is a personalized Cursor efficiency coach. It reads your session
history, spots recurring patterns in how you and the agent interact, and
recommends the Cursor method most likely to improve your workflow next.

**How you run it:**
Open the Command Palette (`Cmd+Shift+P`) and type `Cursor Echo: Analyze My Sessions`.

The default experience needs no account, API key, config file, or Node.js
installation. It installs like any other Cursor extension and finds sessions
automatically. Echo Pro is an optional, bring-your-own-key path.

---

## 2. The problem it solves

Most Cursor users feel friction before they can name it. They re-explain things to the agent, watch it overshoot a task, or notice sessions get worse the longer they run — but they can't point to *why*, and they can't fix what they can't see.

Cursor Echo makes that friction visible, matches it to a curated workflow
playbook, and grounds the recommendation in evidence from the user's own chats.
Generic Skills and prompting methods are easy to find; deciding which one fits
this user is the product's differentiator.

### Product promise

> Tell me the single best way to improve my Cursor workflow next, show me why it
> applies to me, and help me adopt it safely.

The target product loop is:

1. Observe behavior in local session history.
2. Match evidence to a curated playbook.
3. Explain why the method fits and what benefit to expect.
4. Generate or safely apply a tailored artifact.
5. Compare future sessions to see whether the friction declined.

---

## 3. How it works (user's perspective)

The user opens the Command Palette and runs `Cursor Echo: Analyze My Sessions`.
A progress notification appears briefly. Echo opens a Markdown report with one
ranked `Start here` action, evidence, an explanation, and a copy-ready artifact.
For example:

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

The report opens inline and is designed to read in under a minute. A separate
command can apply the top Rule recommendation after handling an existing-file
collision. See `EXAMPLE_REPORT.md` for the current fixture output.

---

## 4. Patterns it looks for

Three patterns, in plain language. Each maps to a Cursor feature that fixes it.


| What you'll see              | What it means                                                                                    | The fix                                                                                             |
| ---------------------------- | ------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **Re-explaining context**    | You restated something the agent forgot — a constraint, a file boundary, a decision already made | Save it as a [Rule](https://docs.cursor.com/context/rules)                                          |
| **Agent went out of scope**  | The agent did noticeably more or less than you intended                                          | Use [Plan mode](https://docs.cursor.com/agent/plan-mode) to review before it runs                   |
| **Back-and-forth on intent** | The agent asked what you meant instead of attempting the task                                    | Front-load specifics; consider an [Ask mode](https://docs.cursor.com/agent/ask-mode) prompt pattern |


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

## 7. Analysis modes

### Local mode (default)

Local mode uses a heuristic classifier — no API key, cost, or network request.

**How it detects patterns:**

- **Re-explaining context**: user turn contains phrases referencing something said earlier ("I already said", "as I mentioned", "remember", "like I said", "we agreed")
- **Agent went out of scope**: user turn contains correction phrases ("too much", "only wanted", "just the", "don't touch", "didn't ask you to")
- **Back-and-forth on intent**: agent turn contains clarifying questions ("what do you mean", "which file", "can you clarify", "do you want me to")
- **Strong prompt**: a user turn immediately followed by an agent response with no follow-up correction

Every detected pattern quotes the specific phrase that triggered it, so users can judge for themselves whether the match is accurate.

**Known limitation:** heuristics miss subtle patterns and can produce false
positives. The goal of local mode is to surface obvious recurring friction, not
to be exhaustive.

### Echo Pro (optional)

When `cursorEcho.aiMode` is enabled, Echo Pro can use Anthropic, OpenAI, or the
optional Cursor SDK provider. The API key is stored in VS Code `SecretStorage`.
Before any transcript text leaves the machine, Echo asks for one-time explicit
consent and states whether redaction is enabled.

Echo Pro:

1. analyzes at most `cursorEcho.maxSessionsForAI` recent sessions;
2. optionally redacts likely secrets;
3. classifies each session with the configured provider;
4. personalizes generated artifacts from the matched session evidence;
5. adds a short coaching section to the report.

If a session classification fails, that session falls back to local heuristics.
If provider setup or the overall AI run fails, the entire run falls back to
local heuristics and still produces a report. Fixtures never use AI.

---

## 8. Extension commands and settings

**Commands** (registered in Command Palette):


| Command                                      | What it does                                                        |
| -------------------------------------------- | ------------------------------------------------------------------- |
| `Cursor Echo: Analyze My Sessions`           | Analyzes sessions for the open workspace and opens the report       |
| `Cursor Echo: Analyze with Fixtures`         | Runs bundled examples locally; no real sessions are needed          |
| `Cursor Echo: Apply Top Rule Recommendation` | Analyzes real sessions and writes the highest-ranked Rule artifact  |
| `Cursor Echo: Set API Key (Echo Pro)`        | Stores the selected provider key in VS Code `SecretStorage`         |
| `Cursor Echo: Clear API Key (Echo Pro)`      | Removes the stored Echo Pro key                                     |


**Settings** (in Cursor `settings.json`):


| Setting                          | Default       | Description                                                                  |
| -------------------------------- | ------------- | ---------------------------------------------------------------------------- |
| `cursorEcho.transcriptsPath`     | `""`          | Custom `.jsonl` directory; auto-discovers if empty                            |
| `cursorEcho.minTurns`            | `3`           | Skips sessions shorter than this                                              |
| `cursorEcho.saveReport`          | `true`        | Writes `.cursor/echo-report.md` after each run                                |
| `cursorEcho.aiMode`              | `false`       | Opts in to Echo Pro AI analysis                                               |
| `cursorEcho.aiProvider`          | `anthropic`   | Selects `anthropic`, `openai`, or `cursor`                                    |
| `cursorEcho.aiModel`             | `""`          | Optional model override; empty uses the provider default                      |
| `cursorEcho.maxSessionsForAI`    | `20`          | Caps recent sessions submitted to the provider                               |
| `cursorEcho.redactBeforeSend`    | `true`        | Redacts likely keys, tokens, and email addresses before provider submission  |


---

## 9. Project structure

```
cursor-echo/
  src/
    extension.ts          Extension entry point, command registration
    discover.ts           Auto-finds ~/.cursor/projects/ transcripts
    parse.ts              Parses Cursor JSONL transcripts
    classify.ts           Heuristic pattern detection
    suggest.ts            Pattern → recommendation and copy-ready artifact
    report.ts             Builds Markdown report and opens its preview
    ai/
      config.ts           Settings, SecretStorage lookup, and consent
      provider.ts         Provider interface and model defaults
      providerDirect.ts   Anthropic and OpenAI HTTPS adapters
      providerCursor.ts   Optional Cursor SDK adapter
      classify.ts         AI classification with per-session fallback
      enrich.ts           Context-specific artifact generation
      insights.ts         Optional coaching section
      redact.ts           Likely-secret redaction
  data/
    fixtures/             4 example transcripts (one per pattern + one clean)
  docs/
    product-audit-2026-07.md
    product-roadmap.md
  research/               Canonical long-horizon research deliverable
  package.json            Extension manifest and settings
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

## 11. Current limitations and non-goals

Current limitations:

- There are no automated regression tests or CI checks.
- Malformed lines and sessions below `minTurns` are skipped without report
  diagnostics.
- Recommendation ranking uses affected-session count and a small hard-coded
  method mapping.
- Rule application does not show a diff preview before writing.
- Echo does not remember adoption or compare outcomes across runs.
- Only the first open workspace folder is used for scoping and saving.

Non-goals for the current roadmap:

- required accounts, hosted storage, or a mandatory backend;
- direct ingestion or ranking of posts from X or other community feeds;
- a mandatory webview or dashboard;
- researcher dataset export;
- full project management or multi-agent orchestration;
- diagnosis of Cursor's internal Cloud Agent infrastructure.

---

## 12. Release status and next quality bar

The source currently implements the v0.1 experience:

1. `Cursor Echo: Analyze My Sessions` auto-discovers and parses at least one real Cursor transcript without any user configuration
2. The report tab opens in under 3 seconds for ≤20 sessions
3. Every pattern finding quotes a real line from the user's sessions
4. `Cursor Echo: Analyze with Fixtures` runs clean and produces output matching `EXAMPLE_REPORT.md`
5. Installing from `.vsix` and running the command works on a fresh Cursor install with no additional setup
6. A Cursor user who has never heard of this tool can understand the report without reading the README

These criteria have manual evidence but are not protected by automation. Before
expanding the recommendation library, Echo needs:

1. parser, classifier, suggestion, and report regression tests;
2. a deterministic fixture-to-report check;
3. visible diagnostics for skipped input;
4. a versioned curated playbook model with triggers, contraindications,
   expected benefit, and artifact type;
5. stable evidence-to-playbook ranking;
6. safe previews for workspace writes;
7. local recommendation history so improvement can be evaluated.

The ordered implementation backlog and two-hour session boundaries live in
`docs/product-roadmap.md`.

