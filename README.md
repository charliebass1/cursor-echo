# Cursor Echo

A Cursor extension that reads your session history, spots recurring friction patterns, and tells you which Cursor features to use to fix them.

## Install

1. Download `cursor-echo-0.1.0.vsix` from the [Releases page](https://github.com/your-repo/cursor-echo/releases)
2. In Cursor: Extensions sidebar → `···` menu → **Install from VSIX...**
3. Select the downloaded file

## Usage

Open the Command Palette (`Cmd+Shift+P`) and run one of:

- **Cursor Echo: Analyze My Sessions** — auto-discovers your real Cursor transcripts and generates a report
- **Cursor Echo: Analyze with Fixtures** — runs against bundled example data (no real sessions needed)

The report opens as a Markdown Preview tab and is saved to `.cursor/echo-report.md` in your workspace.

## What it finds

| Pattern | What it means | Suggested fix |
|---|---|---|
| **Re-explaining context** | You restated something the agent forgot | Save it as a [Rule](https://docs.cursor.com/context/rules) |
| **Agent went out of scope** | The agent did more or less than intended | Use [Plan mode](https://docs.cursor.com/agent/plan-mode) |
| **Back-and-forth on intent** | The agent asked what you meant instead of acting | Front-load specifics; try [Ask mode](https://docs.cursor.com/agent/ask-mode) |
| **Strong prompts** | Clean, specific exchanges that worked well | Worth saving as [Skills](https://docs.cursor.com/agent/skills) |

Every finding quotes a specific line from your sessions so you can judge for yourself.

## Settings

| Setting | Default | Description |
|---|---|---|
| `cursorEcho.transcriptsPath` | `""` | Custom path to `.jsonl` transcripts. Auto-discovers if empty. |
| `cursorEcho.minTurns` | `3` | Skip sessions shorter than this. |
| `cursorEcho.saveReport` | `true` | Save `.cursor/echo-report.md` after each run. |

## Example report

See [EXAMPLE_REPORT.md](EXAMPLE_REPORT.md) for sample output from the bundled fixtures.

## Development

```bash
git clone https://github.com/your-repo/cursor-echo.git
cd cursor-echo
npm install
npm run build
```

To test locally, press `F5` in Cursor/VS Code to launch the Extension Development Host.

## License

MIT
