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
    systemPrompt: `The user turned on live web search. You MUST call the web_search tool before answering questions about current events, facts, prices, or anything that may have changed. Cite source URLs from the tool output. Do not pretend you searched if you did not call the tool.`,
    integrationNote: "已启用联网搜索（Tavily）。",
  },
  research: {
    id: "research",
    composerPlaceholder: "你想深入研究什么主题？",
    systemPrompt: `The user turned on deep research. Call web_search (and follow-up searches if needed) to gather sources, then write a structured report: executive summary, key findings, analysis, open questions, and next steps. Cite URLs. Note limitations when evidence is thin.`,
    integrationNote: "已启用深度研究（多次联网检索）。",
  },
  think: {
    id: "think",
    composerPlaceholder: "提出一个需要仔细思考的问题…",
    systemPrompt: `Take extra time to reason carefully before answering. Show your reasoning steps when helpful, consider alternatives and edge cases, and give a clear final answer. Prefer accuracy and depth over brevity unless the user asks for a short reply.`,
    integrationNote: "已启用更长推理。",
  },
  study: {
    id: "study",
    composerPlaceholder: "你想学什么？可以提问或让我解释概念…",
    systemPrompt: `You are a patient tutor. Explain concepts step by step with simple language, analogies, and short examples. Check understanding, suggest practice questions, and adapt depth to the user's level.`,
    integrationNote: "已启用学习辅导。",
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
  "think",
  "study",
];

export const GROK_COMPOSER_TOOL_IDS: ComposerToolId[] = [
  "search",
  "research",
  "think",
  "study",
];

const WEB_SEARCH_TOOLS = new Set<ComposerToolId>(["search", "research"]);
const ALLOWED = new Set(Object.keys(COMPOSER_TOOLS) as ComposerToolId[]);

export function composerToolNeedsWebSearch(
  toolId: ComposerToolId | null,
): boolean {
  return toolId != null && WEB_SEARCH_TOOLS.has(toolId);
}

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
