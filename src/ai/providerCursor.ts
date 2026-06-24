import type {
  AIProviderConfig,
  AIProviderId,
  CompleteOptions,
  EchoProvider,
} from "./provider";

interface CursorRunResult {
  id: string;
  status: "finished" | "error" | "cancelled" | string;
  result?: string;
}

interface CursorSdkModule {
  Agent: {
    prompt(
      message: string,
      options: {
        apiKey: string;
        model?: { id: string };
        local?: { cwd?: string };
      }
    ): Promise<CursorRunResult>;
  };
}

/**
 * Loads @cursor/sdk lazily through a computed specifier so neither TypeScript
 * nor esbuild tries to resolve the optional dependency at build time. The SDK
 * is only required when a user explicitly selects the "cursor" provider.
 */
async function loadCursorSdk(): Promise<CursorSdkModule> {
  const specifier = "@cursor/sdk";
  try {
    return (await import(specifier)) as unknown as CursorSdkModule;
  } catch {
    throw new Error(
      "Echo Pro: the Cursor SDK backend needs the optional '@cursor/sdk' dependency installed and Node >= 22.13 in the extension host. " +
        "Install it, or switch cursorEcho.aiProvider to 'anthropic' or 'openai'."
    );
  }
}

export class CursorSdkProvider implements EchoProvider {
  readonly id: AIProviderId = "cursor";

  constructor(private readonly config: AIProviderConfig) {}

  async complete(prompt: string, opts?: CompleteOptions): Promise<string> {
    const sdk = await loadCursorSdk();

    const message = opts?.system ? `${opts.system}\n\n${prompt}` : prompt;
    const run = await sdk.Agent.prompt(message, {
      apiKey: this.config.apiKey,
      model: { id: this.config.model },
      local: this.config.cwd ? { cwd: this.config.cwd } : undefined,
    });

    if (run.status === "error") {
      throw new Error(`Cursor SDK run ${run.id} ended in error.`);
    }
    if (run.status === "cancelled") {
      throw new Error(`Cursor SDK run ${run.id} was cancelled.`);
    }
    if (typeof run.result !== "string" || run.result.trim().length === 0) {
      throw new Error(`Cursor SDK run ${run.id} returned no result text.`);
    }

    return run.result.trim();
  }
}
