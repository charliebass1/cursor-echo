import type {
  AIProviderConfig,
  AIProviderId,
  CompleteOptions,
  EchoProvider,
} from "./provider";

const DEFAULT_MAX_TOKENS = 1024;

export class DirectProvider implements EchoProvider {
  readonly id: AIProviderId;

  constructor(private readonly config: AIProviderConfig) {
    this.id = config.provider;
  }

  async complete(prompt: string, opts?: CompleteOptions): Promise<string> {
    if (this.id === "anthropic") {
      return this.completeAnthropic(prompt, opts);
    }
    return this.completeOpenAI(prompt, opts);
  }

  private async completeAnthropic(
    prompt: string,
    opts?: CompleteOptions
  ): Promise<string> {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": this.config.apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: opts?.maxTokens ?? DEFAULT_MAX_TOKENS,
        system: opts?.system,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Anthropic API error ${response.status}: ${await safeBody(response)}`
      );
    }

    const data = (await response.json()) as {
      content?: Array<{ type: string; text?: string }>;
    };
    const text = (data.content ?? [])
      .filter((b) => b.type === "text" && typeof b.text === "string")
      .map((b) => b.text as string)
      .join("")
      .trim();

    if (!text) {
      throw new Error("Anthropic API returned no text content.");
    }
    return text;
  }

  private async completeOpenAI(
    prompt: string,
    opts?: CompleteOptions
  ): Promise<string> {
    const messages: Array<{ role: string; content: string }> = [];
    if (opts?.system) {
      messages.push({ role: "system", content: opts.system });
    }
    messages.push({ role: "user", content: prompt });

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${this.config.apiKey}`,
      },
      body: JSON.stringify({
        model: this.config.model,
        max_tokens: opts?.maxTokens ?? DEFAULT_MAX_TOKENS,
        messages,
      }),
    });

    if (!response.ok) {
      throw new Error(
        `OpenAI API error ${response.status}: ${await safeBody(response)}`
      );
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = (data.choices?.[0]?.message?.content ?? "").trim();

    if (!text) {
      throw new Error("OpenAI API returned no text content.");
    }
    return text;
  }
}

async function safeBody(response: Response): Promise<string> {
  try {
    const text = await response.text();
    return text.slice(0, 300);
  } catch {
    return response.statusText;
  }
}
