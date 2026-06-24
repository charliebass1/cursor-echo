import * as vscode from "vscode";
import { existsSync, mkdirSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { parseTranscriptFile } from "./parse";
import { classifySession } from "./classify";
import { generateSuggestions } from "./suggest";
import { renderReport, showReport } from "./report";
import { discoverTranscripts } from "./discover";
import type { ParsedSession } from "./parse";
import type { DetectedPattern } from "./classify";
import type { Suggestion, SuggestionResult } from "./suggest";
import {
  API_KEY_SECRET,
  buildProviderConfig,
  confirmAIConsent,
  readAISettings,
} from "./ai/config";
import { getProvider } from "./ai/provider";
import { classifySessionsWithAI } from "./ai/classify";
import { enrichSuggestions } from "./ai/enrich";
import { generateInsights } from "./ai/insights";

type ProgressReporter = vscode.Progress<{ message?: string }>;

interface AnalysisOutput {
  markdown: string;
  result: SuggestionResult;
  sessionCount: number;
  turnCount: number;
}

function countTurns(sessions: ParsedSession[]): number {
  return sessions.reduce((total, s) => total + s.turns.length, 0);
}

function runHeuristic(
  sessions: ParsedSession[],
  sourceLabel: string
): AnalysisOutput {
  const allPatterns: DetectedPattern[] = [];
  for (const session of sessions) {
    allPatterns.push(...classifySession(session.id, session.turns));
  }
  const result = generateSuggestions(allPatterns, sessions.length);
  const turnCount = countTurns(sessions);
  const markdown = renderReport(result, sessions.length, turnCount, sourceLabel);
  return { markdown, result, sessionCount: sessions.length, turnCount };
}

async function runAnalysis(
  context: vscode.ExtensionContext,
  sessions: ParsedSession[],
  sourceLabel: string,
  allowAI: boolean,
  progress?: ProgressReporter,
  cwd?: string
): Promise<AnalysisOutput> {
  const config = vscode.workspace.getConfiguration("cursorEcho");
  const minTurns = config.get<number>("minTurns", 3);
  const filtered = sessions.filter((s) => s.turns.length >= minTurns);

  const aiSettings = readAISettings();
  if (!allowAI || !aiSettings.aiMode) {
    return runHeuristic(filtered, sourceLabel);
  }

  const providerConfig = await buildProviderConfig(context, aiSettings, cwd);
  if (!providerConfig) {
    vscode.window.showWarningMessage(
      "Echo Pro: AI mode is on but no API key is set. Run 'Cursor Echo: Set API Key (Echo Pro)'. Falling back to local heuristics."
    );
    return runHeuristic(filtered, sourceLabel);
  }

  const consented = await confirmAIConsent(context, aiSettings);
  if (!consented) {
    vscode.window.showInformationMessage(
      "Echo Pro: AI analysis declined. Using local heuristics."
    );
    return runHeuristic(filtered, sourceLabel);
  }

  const aiSessions = filtered.slice(0, aiSettings.maxSessions);
  const onWarn = (message: string) => console.warn(`[Cursor Echo] ${message}`);

  try {
    const provider = await getProvider(providerConfig);

    progress?.report({ message: "Classifying sessions with AI..." });
    const patterns = await classifySessionsWithAI(aiSessions, provider, {
      redact: aiSettings.redact,
      onWarn,
    });

    let result = generateSuggestions(patterns, aiSessions.length);

    progress?.report({ message: "Personalizing recommendations..." });
    result = await enrichSuggestions(result, provider, { onWarn });

    progress?.report({ message: "Generating insights..." });
    const aiInsights = await generateInsights(aiSessions, patterns, provider, {
      onWarn,
    });

    const turnCount = countTurns(aiSessions);
    const markdown = renderReport(result, aiSessions.length, turnCount, sourceLabel, {
      aiInsights,
      aiProviderLabel: `${providerConfig.provider} (${providerConfig.model})`,
    });

    return { markdown, result, sessionCount: aiSessions.length, turnCount };
  } catch (err) {
    vscode.window.showWarningMessage(
      `Echo Pro: AI analysis failed (${
        err instanceof Error ? err.message : String(err)
      }). Falling back to local heuristics.`
    );
    return runHeuristic(filtered, sourceLabel);
  }
}

function loadFixtures(extensionPath: string): ParsedSession[] {
  const fixturesDir = join(extensionPath, "data", "fixtures");
  const files = readdirSync(fixturesDir).filter((f: string) => f.endsWith(".jsonl"));
  return files.map((f: string) => parseTranscriptFile(join(fixturesDir, f)));
}

function loadWorkspaceSessions(): {
  sessions: ParsedSession[];
  sourceLabel: string;
  workspaceFolder?: string;
  emptyMessage: string;
} {
  const config = vscode.workspace.getConfiguration("cursorEcho");
  const customPath = config.get<string>("transcriptsPath", "");
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const paths = discoverTranscripts(customPath, workspaceFolder);

  const emptyMessage = workspaceFolder
    ? `Cursor Echo: No sessions found for this workspace. Looked in ~/.cursor/projects/${workspaceFolder.replace(/^\//, "").replace(/\//g, "-")}/agent-transcripts/`
    : "Cursor Echo: No sessions found at ~/.cursor/projects/. Open a workspace folder or set cursorEcho.transcriptsPath.";

  const sourceLabel = workspaceFolder
    ? `Sessions from this workspace (${workspaceFolder.replace(/^\//, "").replace(/\//g, "-")}).`
    : "Sessions from ~/.cursor/projects/ (all projects).";

  return {
    sessions: paths.map((p) => parseTranscriptFile(p)),
    sourceLabel,
    workspaceFolder,
    emptyMessage,
  };
}

function topRuleSuggestion(result: SuggestionResult): Suggestion | undefined {
  return result.patterns.find(
    (p) => p.artifact.type === "rule" && typeof p.artifact.path === "string"
  );
}

async function openFile(path: string): Promise<void> {
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(path));
  await vscode.window.showTextDocument(document);
}

async function writeRuleSuggestion(
  workspaceFolder: string,
  suggestion: Suggestion
): Promise<void> {
  const artifact = suggestion.artifact;
  if (artifact.type !== "rule" || !artifact.path) return;

  const rulePath = join(workspaceFolder, artifact.path);
  if (existsSync(rulePath)) {
    const choice = await vscode.window.showWarningMessage(
      `Cursor Echo: ${artifact.path} already exists.`,
      "Open Existing",
      "Overwrite"
    );
    if (choice === "Open Existing") {
      await openFile(rulePath);
      return;
    }
    if (choice !== "Overwrite") return;
  }

  mkdirSync(dirname(rulePath), { recursive: true });
  writeFileSync(rulePath, artifact.content, "utf-8");
  await openFile(rulePath);
  vscode.window.showInformationMessage(
    `Cursor Echo: Applied top Rule recommendation to ${artifact.path}.`
  );
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
            const { markdown } = await runAnalysis(
              context,
              sessions,
              "Bundled demo sessions (not your real chats). Use **Cursor Echo: Analyze My Sessions** for this project.",
              false
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
        async (progress) => {
          try {
            const input = loadWorkspaceSessions();

            if (input.sessions.length === 0) {
              vscode.window.showWarningMessage(input.emptyMessage);
              return;
            }

            const { markdown } = await runAnalysis(
              context,
              input.sessions,
              input.sourceLabel,
              true,
              progress,
              input.workspaceFolder
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

  const applyTopRecommendation = vscode.commands.registerCommand(
    "cursorEcho.applyTopRecommendation",
    async () => {
      await vscode.window.withProgress(
        {
          location: vscode.ProgressLocation.Notification,
          title: "Cursor Echo: Applying top Rule recommendation...",
          cancellable: false,
        },
        async (progress) => {
          try {
            const input = loadWorkspaceSessions();
            if (!input.workspaceFolder) {
              vscode.window.showWarningMessage(
                "Cursor Echo: Open a workspace folder before applying a Rule recommendation."
              );
              return;
            }
            if (input.sessions.length === 0) {
              vscode.window.showWarningMessage(input.emptyMessage);
              return;
            }

            const { result } = await runAnalysis(
              context,
              input.sessions,
              input.sourceLabel,
              true,
              progress,
              input.workspaceFolder
            );
            const suggestion = topRuleSuggestion(result);
            if (!suggestion) {
              vscode.window.showInformationMessage(
                "Cursor Echo: No Rule recommendation found in this run. Use Analyze My Sessions to review prompt and Plan mode suggestions."
              );
              return;
            }

            await writeRuleSuggestion(input.workspaceFolder, suggestion);
          } catch (err) {
            vscode.window.showErrorMessage(
              `Cursor Echo: ${err instanceof Error ? err.message : String(err)}`
            );
          }
        }
      );
    }
  );

  const setApiKey = vscode.commands.registerCommand(
    "cursorEcho.setApiKey",
    async () => {
      const settings = readAISettings();
      const key = await vscode.window.showInputBox({
        title: "Cursor Echo: Set API Key (Echo Pro)",
        prompt: `Paste your ${settings.provider} API key. It is stored in VS Code SecretStorage, never in settings.json.`,
        password: true,
        ignoreFocusOut: true,
      });

      if (key === undefined) return;
      const trimmed = key.trim();
      if (trimmed.length === 0) {
        vscode.window.showWarningMessage("Cursor Echo: No API key entered.");
        return;
      }

      await context.secrets.store(API_KEY_SECRET, trimmed);
      const hint = settings.aiMode
        ? ""
        : " Enable the cursorEcho.aiMode setting to start using it.";
      vscode.window.showInformationMessage(`Cursor Echo: API key saved.${hint}`);
    }
  );

  const clearApiKey = vscode.commands.registerCommand(
    "cursorEcho.clearApiKey",
    async () => {
      await context.secrets.delete(API_KEY_SECRET);
      vscode.window.showInformationMessage("Cursor Echo: API key cleared.");
    }
  );

  context.subscriptions.push(
    analyzeFixtures,
    analyzeSessions,
    applyTopRecommendation,
    setApiKey,
    clearApiKey
  );
}

export function deactivate() {}
