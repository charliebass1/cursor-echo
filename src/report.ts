import * as vscode from "vscode";
import { writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";
import type { SuggestionResult } from "./suggest";

export function renderReport(
  result: SuggestionResult,
  sessionCount: number,
  turnCount: number,
  sourceLabel: string
): string {
  const lines: string[] = [];

  lines.push(`# Cursor Echo  ·  ${sessionCount} sessions  ·  ${turnCount} turns`);
  lines.push("");
  lines.push(`_${sourceLabel}_`);
  lines.push("");
  lines.push("---");

  for (const s of result.patterns) {
    lines.push("");
    lines.push(`## ${s.heading}`);
    lines.push(`Seen in ${s.sessionCount} of ${s.totalSessions} sessions`);
    lines.push("");
    lines.push(s.fix);
    lines.push("");
    lines.push("From your sessions:");
    lines.push(`> "${s.quotedExample}"`);

    if (s.suggestedRule) {
      lines.push("");
      lines.push(`Suggested rule → ${s.suggestedRule.path}`);
      lines.push(`  ${s.suggestedRule.content}`);
    }

    lines.push("");
    lines.push("---");
  }

  if (result.strongPrompts.length > 0) {
    lines.push("");
    lines.push(`## ${result.strongPrompts.length} prompts that worked especially well`);
    lines.push("");
    lines.push(
      "These are clean, specific, and got good results. Worth saving as reusable Skills."
    );
    lines.push("");
    for (const sp of result.strongPrompts) {
      lines.push(`· "${sp.text}"`);
    }
    lines.push("");
    lines.push("---");
  }

  if (result.patterns.length === 0) {
    lines.push("");
    lines.push("## No recurring friction patterns detected in this batch");
    lines.push("");
    lines.push(
      result.strongPrompts.length > 0
        ? "This run found strong prompts but no repeated friction signals yet. Run again after more sessions (or broaden the transcript path) to surface trend-level issues."
        : "No friction patterns or strong prompts were detected in these sessions."
    );
    lines.push("");
    lines.push("---");
  }

  lines.push("");
  lines.push("*Report saved to .cursor/echo-report.md*");

  return lines.join("\n");
}

export async function showReport(
  markdown: string,
  saveReport: boolean
): Promise<void> {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  let reportUri: vscode.Uri;

  if (workspaceFolder && saveReport) {
    const cursorDir = join(workspaceFolder, ".cursor");
    if (!existsSync(cursorDir)) mkdirSync(cursorDir, { recursive: true });
    const reportPath = join(cursorDir, "echo-report.md");
    writeFileSync(reportPath, markdown, "utf-8");
    reportUri = vscode.Uri.file(reportPath);
  } else {
    const tmpPath = join(tmpdir(), `cursor-echo-report-${Date.now()}.md`);
    writeFileSync(tmpPath, markdown, "utf-8");
    reportUri = vscode.Uri.file(tmpPath);

    if (!workspaceFolder) {
      vscode.window.showInformationMessage(
        "No workspace folder open — report is shown but not saved. Open a folder to persist reports to .cursor/echo-report.md."
      );
    }
  }

  await vscode.commands.executeCommand("markdown.showPreview", reportUri);
}
