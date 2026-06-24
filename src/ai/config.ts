import * as vscode from "vscode";
import {
  resolveModel,
  type AIProviderConfig,
  type AIProviderId,
} from "./provider";

export const API_KEY_SECRET = "cursorEcho.apiKey";
const CONSENT_KEY = "cursorEcho.aiConsentGranted";

export interface EchoAISettings {
  aiMode: boolean;
  provider: AIProviderId;
  model: string;
  maxSessions: number;
  redact: boolean;
}

export function readAISettings(): EchoAISettings {
  const config = vscode.workspace.getConfiguration("cursorEcho");
  const provider = config.get<string>("aiProvider", "anthropic");
  return {
    aiMode: config.get<boolean>("aiMode", false),
    provider: normalizeProvider(provider),
    model: config.get<string>("aiModel", ""),
    maxSessions: config.get<number>("maxSessionsForAI", 20),
    redact: config.get<boolean>("redactBeforeSend", true),
  };
}

function normalizeProvider(value: string): AIProviderId {
  return value === "openai" || value === "cursor" ? value : "anthropic";
}

export async function buildProviderConfig(
  context: vscode.ExtensionContext,
  settings: EchoAISettings,
  cwd?: string
): Promise<AIProviderConfig | undefined> {
  const apiKey = await context.secrets.get(API_KEY_SECRET);
  if (!apiKey) return undefined;

  return {
    provider: settings.provider,
    apiKey,
    model: resolveModel(settings.provider, settings.model),
    cwd,
  };
}

/**
 * One-time modal consent before any transcript text leaves the machine. The
 * grant is remembered in global state so we only interrupt the user once.
 */
export async function confirmAIConsent(
  context: vscode.ExtensionContext,
  settings: EchoAISettings
): Promise<boolean> {
  if (context.globalState.get<boolean>(CONSENT_KEY)) return true;

  const providerName =
    settings.provider === "cursor" ? "the Cursor SDK" : `the ${settings.provider} API`;
  const choice = await vscode.window.showWarningMessage(
    `Echo Pro will send transcript text to ${providerName} using your API key. ` +
      `${settings.redact ? "Likely secrets are redacted first. " : "Redaction is disabled. "}` +
      "This happens only when AI mode is on.",
    { modal: true },
    "Enable AI Analysis"
  );

  if (choice === "Enable AI Analysis") {
    await context.globalState.update(CONSENT_KEY, true);
    return true;
  }
  return false;
}
