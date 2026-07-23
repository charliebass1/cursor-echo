# Cursor Echo

Cursor Echo is a local Cursor extension that analyzes your recent agent chats
and turns repeated friction into practical Cursor workflow fixes.

Its direction is a personalized Cursor efficiency coach: generic Skills,
prompting methods, and swarm advice are easy to find, but Echo uses evidence
from your own chat history to identify which method is most relevant to you.

It is built for developers who notice things like:

- "I keep re-explaining the same project constraint."
- "The agent keeps changing more files than I asked for."
- "My prompts work sometimes, but I do not know which ones are worth reusing."

Echo reads local Cursor transcripts, opens a short Markdown report, and saves it to `.cursor/echo-report.md`.

## What It Does

Echo looks for four useful signals:

- **Re-explained context**: suggests a copy-ready `.cursor/rules/` rule.
- **Scope mismatch**: suggests a Plan mode scope prompt.
- **Back-and-forth clarification**: suggests a stronger prompt template.
- **Strong prompts**: turns prompts that worked well into draft Skill material.

Each finding includes:

- One recommended next action.
- A quote from your own session.
- A plain-language explanation of why Echo flagged it.
- A copy-ready Cursor artifact or prompt template.

No account, API key, or server is required. Analysis runs locally with simple heuristics.

## Quick Start

The fastest way to understand Echo is to install it, run the fixture demo, and inspect the generated report.

```bash
git clone https://github.com/charliebass1/cursor-echo.git
cd cursor-echo
npm install
npm run package
```

Then in Cursor:

1. Open the Command Palette with `Cmd+Shift+P`.
2. Run `Extensions: Install from VSIX...`.
3. Select `cursor-echo-0.1.0.vsix`.
4. Reload Cursor when prompted.

## Try The Demo

Open the Command Palette and run:

```text
Cursor Echo: Analyze with Fixtures
```

This uses bundled demo transcripts, so you can see the product without exposing or configuring real sessions. Echo opens a Markdown report that starts with one recommended next action, then shows evidence and copy-ready Cursor artifacts.

## Use It

Open the Command Palette and run:

- `Cursor Echo: Analyze My Sessions`: analyzes real transcripts for the open workspace.
- `Cursor Echo: Analyze with Fixtures`: runs the bundled demo transcripts.
- `Cursor Echo: Apply Top Rule Recommendation`: analyzes real transcripts and writes the top Rule recommendation into `.cursor/rules/`.
- `Cursor Echo: Set API Key (Echo Pro)` / `Clear API Key (Echo Pro)`: manage the key used by the optional AI mode.

The report opens as a Markdown Preview tab and is saved to `.cursor/echo-report.md`.

## Example Output

The report starts with the most useful next move:

```text
## Start here

Do this first: Create the suggested rule below, then rerun Echo after a few sessions to see if this pattern drops.
```

Then it shows the evidence and a copy-ready recommendation:

```text
Copy-ready Cursor Rule -> .cursor/rules/dependency-approval.mdc

---
description: Require approval before adding dependencies
alwaysApply: true
---

- Do not introduce third-party dependencies unless explicitly approved.
```

See [EXAMPLE_REPORT.md](EXAMPLE_REPORT.md) for the full fixture output.

## Echo Pro (bring your own key)

By default Echo is fully local: it uses regex/heuristic analysis, sends nothing off your machine, and costs no tokens. Power users can optionally enable **Echo Pro**, which uses your own API key for higher-quality analysis:

- **Smarter classification**: an LLM tags friction patterns instead of regex, reducing misses and false positives.
- **Personalized artifacts**: Rules, Skills, and prompts are written from your actual session text, not fixed templates.
- **Echo Pro insights**: an added report section with a trend read and short coaching note.

Setup:

1. Run `Cursor Echo: Set API Key (Echo Pro)` and paste your key. It is stored in VS Code SecretStorage, never in `settings.json`.
2. Enable the `cursorEcho.aiMode` setting.
3. Pick `cursorEcho.aiProvider` (`anthropic`, `openai`, or `cursor`).
4. Run `Cursor Echo: Analyze My Sessions`. The first run asks for explicit consent before any text is sent.

Notes:

- AI mode sends transcript text to your chosen provider. Likely secrets are redacted first (`cursorEcho.redactBeforeSend`, on by default), and `cursorEcho.maxSessionsForAI` caps how many sessions are sent per run.
- Any AI failure (no key, network error, invalid output) falls back to local heuristics, so a run always produces a report.
- The `cursor` provider uses `@cursor/sdk`, an optional dependency that requires Node `>= 22.13` in the extension host. The `anthropic`/`openai` providers are plain HTTPS calls with no extra dependency and are the recommended starting point.

## Settings

- `cursorEcho.transcriptsPath`: custom directory of `.jsonl` transcripts. Defaults to auto-discovery under `~/.cursor/projects/`.
- `cursorEcho.minTurns`: skips very short sessions. Default: `3`.
- `cursorEcho.saveReport`: saves `.cursor/echo-report.md`. Default: `true`.
- `cursorEcho.aiMode`: opt in to Echo Pro AI analysis. Default: `false`.
- `cursorEcho.aiProvider`: `anthropic` | `openai` | `cursor`. Default: `anthropic`.
- `cursorEcho.aiModel`: model id for the provider. Default: per-provider sensible default.
- `cursorEcho.maxSessionsForAI`: cap sessions sent to the provider per run. Default: `20`.
- `cursorEcho.redactBeforeSend`: redact likely secrets before sending. Default: `true`.

## Project Docs

For active development and product behavior, read:

- `README.md` (setup, usage, and extension commands)
- `docs/product-audit-2026-07.md` (current product, maturity, research, and direction)
- `cursor-echo-prd-v2.md` (implemented requirements and current limitations)
- `docs/product-roadmap.md` (canonical roadmap of two-hour coding sessions)
- `EXAMPLE_REPORT.md` (expected fixture report output)

`docs/README.md` is the full documentation map. Canonical long-horizon
research lives under `research/`; historical planning material is preserved
under `docs/archive/2026-07-planning-history/`.

## Development

```bash
npm install
npm run build
npm run package
npm run watch
```

To test the extension without packaging, open this folder in Cursor and press `F5` to launch the Extension Development Host.

## License

MIT
