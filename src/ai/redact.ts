interface RedactionRule {
  re: RegExp;
  replacement: string;
}

const RULES: RedactionRule[] = [
  { re: /sk-[A-Za-z0-9-_]{16,}/g, replacement: "[REDACTED_KEY]" },
  { re: /\bAKIA[0-9A-Z]{16}\b/g, replacement: "[REDACTED_AWS_KEY]" },
  { re: /\bghp_[A-Za-z0-9]{20,}\b/g, replacement: "[REDACTED_GH_TOKEN]" },
  { re: /\bnpm_[A-Za-z0-9]{36}\b/g, replacement: "[REDACTED_NPM_TOKEN]" },
  { re: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g, replacement: "[REDACTED_SLACK_TOKEN]" },
  { re: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g, replacement: "[REDACTED_JWT]" },
  { re: /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g, replacement: "[REDACTED_EMAIL]" },
  {
    re: /\b(api[_-]?key|secret|token|password|passwd|authorization)\b(\s*[:=]\s*)("?)[^\s"']{6,}\3/gi,
    replacement: "$1$2[REDACTED]",
  },
];

/**
 * Best-effort redaction of likely secrets before transcript text is sent to a
 * third-party AI provider. This is a safety net, not a guarantee.
 */
export function redactText(text: string): string {
  let out = text;
  for (const rule of RULES) {
    out = out.replace(rule.re, rule.replacement);
  }
  return out;
}
