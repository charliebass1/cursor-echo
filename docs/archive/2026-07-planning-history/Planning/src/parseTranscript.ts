import { readFileSync } from "node:fs";
import { basename } from "node:path";
import type { Session, Turn } from "./types.js";

/**
 * Expected transcript format (markdown):
 *
 * ---
 * project: palate-insights-pipeline
 * date: 2026-06-10
 * ---
 *
 * User: <message text, can span multiple lines>
 *
 * Agent: <message text, can span multiple lines>
 *
 * User: <message text>
 *
 * Agent: <message text>
 *
 * Turn markers must be at the start of a line and may optionally be bold
 * markdown ("**User:**"). Everything between one marker and the next
 * belongs to that turn.
 *
 * This is intentionally permissive because real exported transcripts won't
 * always be pristine. If you're copy-pasting from the Cursor chat panel,
 * just prefix each message with "User:" / "Agent:" on its own line.
 */

const TURN_MARKER = /^(\*\*)?(user|agent)(\*\*)?:\s?/i;
const FRONTMATTER_DELIM = "---";

function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const lines = raw.split("\n");
  if (lines[0]?.trim() !== FRONTMATTER_DELIM) {
    return { meta: {}, body: raw };
  }
  const meta: Record<string, string> = {};
  let i = 1;
  for (; i < lines.length; i++) {
    const line = lines[i];
    if (line.trim() === FRONTMATTER_DELIM) {
      i++;
      break;
    }
    const match = line.match(/^([\w-]+):\s*(.*)$/);
    if (match) {
      meta[match[1]] = match[2].trim();
    }
  }
  return { meta, body: lines.slice(i).join("\n") };
}

export function parseTranscript(filePath: string): Session {
  const raw = readFileSync(filePath, "utf-8");
  const { meta, body } = parseFrontmatter(raw);

  const lines = body.split("\n");
  const turns: Turn[] = [];
  let currentRole: "user" | "agent" | null = null;
  let buffer: string[] = [];

  const flush = () => {
    if (currentRole && buffer.length > 0) {
      const content = buffer.join("\n").trim();
      if (content.length > 0) {
        turns.push({ index: turns.length, role: currentRole, content });
      }
    }
    buffer = [];
  };

  for (const line of lines) {
    const match = line.match(TURN_MARKER);
    if (match) {
      flush();
      currentRole = match[2].toLowerCase() as "user" | "agent";
      buffer.push(line.slice(match[0].length));
    } else {
      buffer.push(line);
    }
  }
  flush();

  if (turns.length === 0) {
    throw new Error(
      `No turns found in ${filePath}. Make sure each message starts with "User:" or "Agent:" on its own line.`
    );
  }

  return {
    id: basename(filePath).replace(/\.md$/, ""),
    meta,
    turns,
    sourcePath: filePath,
  };
}
