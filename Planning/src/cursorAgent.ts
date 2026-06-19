/**
 * Thin wrapper around @cursor/sdk so the rest of the codebase doesn't need
 * to know about SDK internals.
 *
 * Verified against the type declarations shipped in @cursor/sdk@1.0.10
 * (node_modules/@cursor/sdk/dist/esm/stubs.d.ts and run.d.ts):
 *
 *   Agent.prompt(message: string, options?: AgentOptions): Promise<RunResult>
 *   interface RunResult {
 *     id: string;
 *     status: "finished" | "error" | "cancelled";
 *     result?: string;   // <- final assistant text lands here
 *     model?: ModelSelection;
 *     durationMs?: number;
 *     git?: RunGitInfo;
 *   }
 *
 * This is still a public beta SDK, so re-check this against your installed
 * version's .d.ts files (same grep below) if something breaks after an
 * upgrade:
 *
 *   grep -n "RunResult" -A 8 node_modules/@cursor/sdk/dist/esm/run.d.ts
 */

import { Agent } from "@cursor/sdk";

export interface CursorPromptOptions {
  cwd: string;
  modelId?: string;
}

export async function runCursorPrompt(
  prompt: string,
  opts: CursorPromptOptions
): Promise<string> {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    throw new Error(
      "CURSOR_API_KEY is not set. Copy .env.example to .env and add your key, " +
        "or run with --mock to use the offline heuristic classifier instead."
    );
  }

  const modelId = opts.modelId ?? process.env.CURSOR_MODEL_ID ?? "composer-2.5";

  const run = await Agent.prompt(prompt, {
    apiKey,
    model: { id: modelId },
    local: { cwd: opts.cwd },
  });

  if (run.status === "error") {
    throw new Error(`Cursor agent run ${run.id} ended in error.`);
  }
  if (run.status === "cancelled") {
    throw new Error(`Cursor agent run ${run.id} was cancelled.`);
  }
  if (typeof run.result !== "string") {
    throw new Error(
      `Cursor agent run ${run.id} finished but returned no result text. Raw run:\n` +
        JSON.stringify(run, null, 2)
    );
  }

  return run.result;
}
