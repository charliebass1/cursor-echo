# Cursor Echo

A Cursor extension that reads your session history, spots recurring friction patterns, and tells you which Cursor features to use to fix them.

## Install from source

1. Clone this repo:

   ```bash
   git clone https://github.com/charliebass1/cursor-echo.git
   cd cursor-echo
   ```

2. Install dependencies and build:

   ```bash
   npm install
   npm run build
   ```

3. Package and install the extension:

   ```bash
   npx @vscode/vsce package --no-dependencies --allow-missing-repository
   ```

   Then in Cursor: Command Palette (`Cmd+Shift+P`) → **Extensions: Install from VSIX...** → select `cursor-echo-0.1.0.vsix`.

   Reload Cursor when prompted.

## Usage

Open the Command Palette (`Cmd+Shift+P`) and run one of:

- **Cursor Echo: Analyze My Sessions** — analyzes transcripts for the open workspace
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
| `cursorEcho.transcriptsPath` | `""` | Custom path to `.jsonl` transcripts. Auto-discovers workspace sessions if empty. |
| `cursorEcho.minTurns` | `3` | Skip sessions shorter than this. |
| `cursorEcho.saveReport` | `true` | Save `.cursor/echo-report.md` after each run. |

## Example report

See [EXAMPLE_REPORT.md](EXAMPLE_REPORT.md) for sample output from the bundled fixtures.

## Development

```bash
npm install
npm run build
npm run watch   # rebuild on save
```

To test without packaging, open this folder in Cursor and press **F5** to launch the Extension Development Host.

## License

MIT
