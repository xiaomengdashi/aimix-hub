export type ComposerToolId =
  | "search"
  | "research"
  | "think"
  | "study";

export type ComposerTool = {
  id: ComposerToolId;
  composerPlaceholder: string;
  systemPrompt: string;
  /** 激活时切换到此模型（如文生图） */
  modelId?: string;
  integrationNote?: string;
};

export const COMPOSER_TOOLS: Record<ComposerToolId, ComposerTool> = {
  search: {
    id: "search",
    composerPlaceholder: "你想搜索什么？",
    systemPrompt: `You help the user research topics using the web search results already provided in your instructions. Organize findings with clear headings, cite source URLs, and distinguish facts from speculation. Do not claim you are still searching—the search has already been done.`,
    integrationNote: "已启用 Tavily 实时网页搜索。",
  },
  research: {
    id: "research",
    composerPlaceholder: "你想深入研究什么主题？",
    systemPrompt: `You conduct in-depth research for the user. Produce a structured report: executive summary, key findings, analysis, open questions, and suggested next steps. Use headings and bullet points. Be thorough but readable; note limitations when information may be incomplete.`,
  },
  think: {
    id: "think",
    composerPlaceholder: "提出一个需要仔细思考的问题…",
    systemPrompt: `Take extra time to reason carefully before answering. Show your reasoning steps when helpful, consider alternatives and edge cases, and give a clear final answer. Prefer accuracy and depth over brevity unless the user asks for a short reply.`,
  },
  study: {
    id: "study",
    composerPlaceholder: "你想学什么？可以提问或让我解释概念…",
    systemPrompt: `You are a patient tutor. Explain concepts step by step with simple language, analogies, and short examples. Check understanding, suggest practice questions, and adapt depth to the user's level.`,
  },
};

export const CHATGPT_COMPOSER_TOOL_IDS: ComposerToolId[] = [
  "search",
  "research",
  "think",
  "study",
];

export const GEMINI_COMPOSER_TOOL_IDS: ComposerToolId[] = [
  "research",
  "search",
  "study",
];

const ALLOWED = new Set(Object.keys(COMPOSER_TOOLS) as ComposerToolId[]);

export function isComposerToolId(id: string): id is ComposerToolId {
  return ALLOWED.has(id as ComposerToolId);
}

export function parseComposerToolId(tool: unknown): ComposerToolId | null {
  if (typeof tool !== "string" || !tool.trim()) return null;
  return isComposerToolId(tool) ? tool : null;
}

export function getComposerTool(id: ComposerToolId): ComposerTool {
  return COMPOSER_TOOLS[id];
}

export function mergeSystemPrompts(
  ...parts: (string | undefined)[]
): string | undefined {
  const merged = parts
    .map((p) => p?.trim())
    .filter((p): p is string => Boolean(p));
  if (merged.length === 0) return undefined;
  return merged.join("\n\n");
}
