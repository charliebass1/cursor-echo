# Cursor Echo

Cursor Echo is a local Cursor extension that analyzes your recent agent chats and turns repeated friction into practical Cursor workflow fixes.

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

```bash
git clone https://github.com/charliebass1/cursor-echo.git
cd cursor-echo
npm install
npm run build
npx @vscode/vsce package --no-dependencies --allow-missing-repository
```

Then in Cursor:

1. Open the Command Palette with `Cmd+Shift+P`.
2. Run `Extensions: Install from VSIX...`.
3. Select `cursor-echo-0.1.0.vsix`.
4. Reload Cursor when prompted.

## Use It

Open the Command Palette and run:

- `Cursor Echo: Analyze My Sessions`: analyzes real transcripts for the open workspace.
- `Cursor Echo: Analyze with Fixtures`: runs the bundled demo transcripts.

The report opens as a Markdown Preview tab and is saved to `.cursor/echo-report.md`.

## Example Output

The report starts with the most useful next move:

```text
## Start here

Do this first: Create the suggested rule below, then rerun Echo after a few sessions to see if this pattern drops.
```

Then it shows the evidence and a copy-ready recommendation:

```text
Copy-ready Cursor Rule -> .cursor/rules/project-conventions.mdc

---
description: Project conventions inferred from repeated Cursor corrections
alwaysApply: true
---

- Do not introduce third-party dependencies unless explicitly approved.
```

See [EXAMPLE_REPORT.md](EXAMPLE_REPORT.md) for the full fixture output.

## Settings

- `cursorEcho.transcriptsPath`: custom directory of `.jsonl` transcripts. Defaults to auto-discovery under `~/.cursor/projects/`.
- `cursorEcho.minTurns`: skips very short sessions. Default: `3`.
- `cursorEcho.saveReport`: saves `.cursor/echo-report.md`. Default: `true`.

## Development

```bash
npm install
npm run build
npm run watch
```

To test the extension without packaging, open this folder in Cursor and press `F5` to launch the Extension Development Host.

## License

MIT
