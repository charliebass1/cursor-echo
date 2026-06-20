import * as vscode from "vscode";
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { parseTranscriptFile } from "./parse";
import { classifySession } from "./classify";
import { generateSuggestions } from "./suggest";
import { renderReport, showReport } from "./report";
import { discoverTranscripts } from "./discover";
import type { ParsedSession } from "./parse";
import type { DetectedPattern } from "./classify";

function runPipeline(
  sessions: ParsedSession[],
  sourceLabel: string
): {
  markdown: string;
  sessionCount: number;
  turnCount: number;
} {
  const config = vscode.workspace.getConfiguration("cursorEcho");
  const minTurns = config.get<number>("minTurns", 3);

  const filtered = sessions.filter((s) => s.turns.length >= minTurns);

  const allPatterns: DetectedPattern[] = [];
  let turnCount = 0;

  for (const session of filtered) {
    turnCount += session.turns.length;
    const patterns = classifySession(session.id, session.turns);
    allPatterns.push(...patterns);
  }

  const result = generateSuggestions(allPatterns, filtered.length);
  const markdown = renderReport(result, filtered.length, turnCount, sourceLabel);

  return { markdown, sessionCount: filtered.length, turnCount };
}

function loadFixtures(extensionPath: string): ParsedSession[] {
  const fixturesDir = join(extensionPath, "data", "fixtures");
  const files = readdirSync(fixturesDir).filter((f: string) => f.endsWith(".jsonl"));
  return files.map((f: string) => parseTranscriptFile(join(fixturesDir, f)));
}

export function activate(context: vscode.ExtensionContext) {
  const analyzeFixtures = vscode.commands.registerCommand(
    "cursorEcho.analyzeFixtures",
    async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Cursor Echo: Analyzing fixtures...",
          cancellable: false,
        },
        async () => {
          try {
            const sessions = loadFixtures(context.extensionPath);
            if (sessions.length === 0) {
              vscode.window.showWarningMessage(
                "Cursor Echo: No fixture files found in data/fixtures/."
              );
              return;
            }
            const { markdown } = runPipeline(
              sessions,
              "Bundled demo sessions (not your real chats). Use **Cursor Echo: Analyze My Sessions** for this project."
            );
            const config = vscode.workspace.getConfiguration("cursorEcho");
            await showReport(
              markdown,
              config.get<boolean>("saveReport", true)
            );
          } catch (err) {
            vscode.window.showErrorMessage(
              `Cursor Echo: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      );
    }
  );

  const analyzeSessions = vscode.commands.registerCommand(
    "cursorEcho.analyzeSessions",
    async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Cursor Echo: Discovering sessions...",
          cancellable: false,
        },
        async () => {
          try {
            const config = vscode.workspace.getConfiguration("cursorEcho");
            const customPath = config.get<string>("transcriptsPath", "");
            const workspaceFolder =
              vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
            const paths = discoverTranscripts(customPath, workspaceFolder);

            if (paths.length === 0) {
              vscode.window.showWarningMessage(
                workspaceFolder
                  ? `Cursor Echo: No sessions found for this workspace. Looked in ~/.cursor/projects/${workspaceFolder.replace(/^\//, "").replace(/\//g, "-")}/agent-transcripts/`
                  : "Cursor Echo: No sessions found at ~/.cursor/projects/. Open a workspace folder or set cursorEcho.transcriptsPath."
              );
              return;
            }

            const sessions = paths.map((p) => parseTranscriptFile(p));
            const projectLabel = workspaceFolder
              ? `Sessions from this workspace (${workspaceFolder.replace(/^\//, "").replace(/\//g, "-")}).`
              : "Sessions from ~/.cursor/projects/ (all projects).";
            const { markdown } = runPipeline(
              sessions,
              projectLabel
            );
            await showReport(
              markdown,
              config.get<boolean>("saveReport", true)
            );
          } catch (err) {
            vscode.window.showErrorMessage(
              `Cursor Echo: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      );
    }
  );

  context.subscriptions.push(analyzeFixtures, analyzeSessions);
}

export function deactivate() {}
