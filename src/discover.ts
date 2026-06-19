import { readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

export function discoverTranscripts(customPath?: string): string[] {
  if (customPath && customPath.length > 0) {
    return findJsonlFiles(customPath);
  }

  const cursorProjects = join(homedir(), ".cursor", "projects");
  if (!existsSync(cursorProjects)) return [];

  const results: string[] = [];

  for (const projectDir of safeReaddir(cursorProjects)) {
    const transcriptsDir = join(
      cursorProjects,
      projectDir,
      "agent-transcripts"
    );
    if (!existsSync(transcriptsDir)) continue;

    for (const sessionDir of safeReaddir(transcriptsDir)) {
      const sessionPath = join(transcriptsDir, sessionDir);
      if (!isDirectory(sessionPath)) continue;

      for (const file of safeReaddir(sessionPath)) {
        if (!file.endsWith(".jsonl")) continue;
        if (file === "subagents") continue;
        const fullPath = join(sessionPath, file);
        if (isDirectory(fullPath)) continue;
        results.push(fullPath);
      }
    }
  }

  return sortByMtime(results);
}

function findJsonlFiles(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const results: string[] = [];
  walk(dir, results);
  return sortByMtime(results);
}

function walk(dir: string, results: string[]): void {
  for (const entry of safeReaddir(dir)) {
    if (entry === "subagents") continue;
    const full = join(dir, entry);
    if (isDirectory(full)) {
      walk(full, results);
    } else if (entry.endsWith(".jsonl")) {
      results.push(full);
    }
  }
}

function safeReaddir(dir: string): string[] {
  try {
    return readdirSync(dir);
  } catch {
    return [];
  }
}

function isDirectory(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function sortByMtime(paths: string[]): string[] {
  return paths.sort((a, b) => {
    try {
      return statSync(b).mtimeMs - statSync(a).mtimeMs;
    } catch {
      return 0;
    }
  });
}
