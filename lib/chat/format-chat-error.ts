import { APICallError } from "@ai-sdk/provider";

const DEFAULT_UNAVAILABLE = "大模型暂时不可用，请稍后重试或更换模型。";

function extractNestedErrorText(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed.startsWith("{") && !trimmed.startsWith("[")) {
    return trimmed;
  }

  try {
    const json: unknown = JSON.parse(trimmed);
    if (typeof json === "string") return json;
    if (json && typeof json === "object") {
      const record = json as Record<string, unknown>;
      for (const key of ["error", "message", "detail", "msg"] as const) {
        const value = record[key];
        if (typeof value === "string" && value.trim()) return value;
        if (value && typeof value === "object") {
          const nested = value as Record<string, unknown>;
          if (typeof nested.message === "string" && nested.message.trim()) {
            return nested.message;
          }
        }
      }
    }
  } catch {
    return trimmed;
  }

  return trimmed;
}

function looksLikeHtml(text: string): boolean {
  return /^\s*<(!DOCTYPE|html|pre)/i.test(text);
}

function mapByStatus(statusCode: number | undefined): string | null {
  if (statusCode === 401 || statusCode === 403) {
    return "模型鉴权失败，请在管理后台检查 AI 网关 API Key。";
  }
  if (statusCode === 404) {
    return "当前模型不可用或网关未开通该模型，请更换模型后再试。";
  }
  if (statusCode === 429) {
    return "请求过于频繁，请稍后再试。";
  }
  if (statusCode === 502 || statusCode === 503 || statusCode === 504) {
    return DEFAULT_UNAVAILABLE;
  }
  return null;
}

function mapByText(text: string): string | null {
  const lower = text.toLowerCase();
  if (
    /未配置|api key|invalid.?api.?key|incorrect api key|unauthorized|forbidden/.test(
      lower,
    )
  ) {
    return "模型鉴权失败，请在管理后台检查 AI 网关 API Key。";
  }
  if (
    /model[_ ]not[_ ]found|does not exist|unknown model|invalid model|not exist|not available|unavailable|overloaded|no such model/.test(
      lower,
    )
  ) {
    return "当前模型不可用或网关未开通该模型，请更换模型后再试。";
  }
  if (/rate.?limit|too many requests|quota/.test(lower)) {
    return "请求过于频繁或额度不足，请稍后再试。";
  }
  if (/an error occurred\.?$/.test(lower)) {
    return DEFAULT_UNAVAILABLE;
  }
  return null;
}

function collectRaw(error: unknown): { statusCode?: number; text: string } {
  if (APICallError.isInstance(error)) {
    const parts = [error.message, error.responseBody ?? ""]
      .map((part) => part.trim())
      .filter(Boolean);
    return {
      statusCode: error.statusCode,
      text: parts.join("\n"),
    };
  }

  if (error instanceof Error) {
    return { text: error.message };
  }

  if (typeof error === "string") {
    return { text: error };
  }

  return { text: "" };
}

export function formatChatErrorMessage(error: unknown): string {
  const { statusCode, text } = collectRaw(error);
  const nested = extractNestedErrorText(text);
  const byStatus = mapByStatus(statusCode);
  if (byStatus) return byStatus;

  if (!nested || looksLikeHtml(nested)) {
    return DEFAULT_UNAVAILABLE;
  }

  if (/[\u4e00-\u9fff]/.test(nested) && nested.length <= 280) {
    return nested;
  }

  const byText = mapByText(nested);
  if (byText) return byText;

  if (nested.length > 280) {
    return DEFAULT_UNAVAILABLE;
  }

  return nested;
}
