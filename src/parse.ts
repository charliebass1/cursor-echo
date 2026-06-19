import { readFileSync } from "node:fs";
import { basename, dirname } from "node:path";

export interface Turn {
  role: "user" | "assistant";
  text: string;
}

export interface ParsedSession {
  id: string;
  sourcePath: string;
  turns: Turn[];
}

interface ContentBlock {
  type: string;
  text?: string;
  [key: string]: unknown;
}

interface TranscriptLine {
  role: string;
  message?: { content?: ContentBlock[] };
}

const USER_QUERY_RE = /<user_query>\s*([\s\S]*?)\s*<\/user_query>/;
const TIMESTAMP_RE = /<timestamp>[\s\S]*?<\/timestamp>\s*/g;

function extractUserText(raw: string): string {
  const stripped = raw.replace(TIMESTAMP_RE, "");
  const match = stripped.match(USER_QUERY_RE);
  if (match) return match[1].trim();
  return stripped.trim();
}

function extractAssistantText(blocks: ContentBlock[]): string {
  return blocks
    .filter((b) => b.type === "text" && typeof b.text === "string")
    .map((b) => b.text!)
    .join("\n")
    .trim();
}

export function parseTranscriptFile(filePath: string): ParsedSession {
  const raw = readFileSync(filePath, "utf-8");
  const lines = raw.split("\n").filter((l: string) => l.trim().length > 0);
  const turns: Turn[] = [];

  for (const line of lines) {
    let parsed: TranscriptLine;
    try {
      parsed = JSON.parse(line);
    } catch {
      continue;
    }

    const blocks = parsed.message?.content;
    if (!Array.isArray(blocks)) continue;

    if (parsed.role === "user") {
      const rawText = blocks
        .filter((b) => b.type === "text" && typeof b.text === "string")
        .map((b) => b.text!)
        .join("\n");
      const text = extractUserText(rawText);
      if (text.length > 0) turns.push({ role: "user", text });
    } else if (parsed.role === "assistant") {
      const text = extractAssistantText(blocks);
      if (text.length > 0) turns.push({ role: "assistant", text });
    }
  }

  const dirName = basename(dirname(filePath));
  const fileName = basename(filePath, ".jsonl");
  const id = dirName !== fileName ? fileName : dirName;

  return { id, sourcePath: filePath, turns };
}
