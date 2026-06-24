export type AIProviderId = "anthropic" | "openai" | "cursor";

export interface AIProviderConfig {
  provider: AIProviderId;
  apiKey: string;
  model: string;
  cwd?: string;
}

export interface CompleteOptions {
  system?: string;
  maxTokens?: number;
}

export interface EchoProvider {
  readonly id: AIProviderId;
  complete(prompt: string, opts?: CompleteOptions): Promise<string>;
}

const DEFAULT_MODELS: Record<AIProviderId, string> = {
  anthropic: "claude-3-5-haiku-latest",
  openai: "gpt-4o-mini",
  cursor: "composer-2.5",
};

export function resolveModel(provider: AIProviderId, configured: string): string {
  const trimmed = configured.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_MODELS[provider];
}

export async function getProvider(config: AIProviderConfig): Promise<EchoProvider> {
  if (config.provider === "cursor") {
    const { CursorSdkProvider } = await import("./providerCursor");
    return new CursorSdkProvider(config);
  }

  const { DirectProvider } = await import("./providerDirect");
  return new DirectProvider(config);
}
