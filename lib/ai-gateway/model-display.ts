import type { ChatAiProvider } from "@/lib/chat/provider";
import type { ChatModel } from "@/lib/chat/models";

type ModelDisplay = { name: string; description: string };

/** 已知模型的展示名与简短说明（与 UI 品牌风格一致） */
const KNOWN: Record<string, ModelDisplay> = {
  // ChatGPT
  "gpt-5.5": { name: "GPT-5.5", description: "旗舰对话，综合能力强" },
  "gpt-5.4-pro": { name: "GPT-5.4 Pro", description: "更强推理，适合复杂问题" },
  "gpt-5.4-mini": { name: "GPT-5.4 Mini", description: "更快更省，适合日常对话" },
  "gpt-5.3-chat": { name: "GPT-5.3 Chat", description: "对话优化，响应顺滑" },
  "gpt-5.2-chat": { name: "GPT-5.2 Chat", description: "稳定对话，性价比高" },
  "gpt-4o": { name: "GPT-4o", description: "成熟多模态，综合稳定" },
  "gpt-image-2": {
    name: "GPT Image 2",
    description: "文生图，输入描述即可绘图",
  },
  "gpt-images2": {
    name: "GPT Image 2",
    description: "文生图，输入描述即可绘图",
  },
  "gpt-4o-mini": { name: "GPT-4o mini", description: "轻量快速，日常够用" },
  "o4-mini": { name: "o4-mini", description: "推理优化，适合复杂问题" },
  // Claude（恢复原有命名与描述）
  "claude-sonnet-4-6": {
    name: "Sonnet 4.6",
    description: "均衡：聪明、快速，适合日常使用",
  },
  "claude-opus-4-7": {
    name: "Opus 4.7",
    description: "最强能力，适合复杂任务",
  },
  "claude-haiku-4-5-20251001": {
    name: "Haiku 4.5",
    description: "最快、最省，适合简单对话",
  },
  "claude-sonnet-4-5": {
    name: "Sonnet 4.5",
    description: "均衡实用，适合日常对话",
  },
  "claude-opus-4-6": {
    name: "Opus 4.6",
    description: "强推理能力，适合复杂任务",
  },
  "claude-haiku-4-5": {
    name: "Haiku 4.5",
    description: "最快、最省，适合简单对话",
  },
  // Gemini
  "gemini-3.1-pro-preview": {
    name: "Gemini 3.1 Pro Preview",
    description: "预览旗舰，复杂推理",
  },
  "gemini-3.1-flash-preview": {
    name: "Gemini 3.1 Flash Preview",
    description: "快速预览，日常首选",
  },
  "gemini-3-flash-preview": {
    name: "Gemini 3 Flash Preview",
    description: "轻量预览，低延迟",
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    description: "复杂推理与长文档",
  },
  "gemini-2.5-flash": {
    name: "Gemini 2.5 Flash",
    description: "默认推荐，快速且聪明",
  },
  "gemini-2.5-flash-lite": {
    name: "Gemini 2.5 Flash-Lite",
    description: "最轻量，简单任务首选",
  },
  "gemini-flash-latest": {
    name: "Gemini Flash Latest",
    description: "始终跟进最新 Flash",
  },
  // 其他
  "deepseek-v4-pro": {
    name: "DeepSeek V4 Pro",
    description: "旗舰推理，复杂任务",
  },
  "deepseek-v4-flash": {
    name: "DeepSeek V4 Flash",
    description: "快速响应，日常对话",
  },
  "glm-5.1": { name: "GLM-5.1", description: "智谱旗舰，中文出色" },
  "MiniMax-M2.7": { name: "MiniMax M2.7", description: "海螺新一代，综合均衡" },
  "kimi-k2.5": { name: "Kimi K2.5", description: "月之暗面，长文与推理" },
  "qwen3.6-plus": { name: "Qwen3.6", description: "通义旗舰，综合能力" },
  "mimo-v2.5-pro": { name: "MiMo V2.5 Pro", description: "小米旗舰，推理增强" },
};

function titleCase(segment: string): string {
  if (!segment) return segment;
  if (segment === "pro") return "Pro";
  if (segment === "flash") return "Flash";
  if (segment === "lite") return "Lite";
  if (segment === "mini") return "Mini";
  if (segment === "chat") return "Chat";
  if (segment === "preview") return "Preview";
  if (/^\d/.test(segment) || segment.includes(".")) return segment;
  return segment.charAt(0).toUpperCase() + segment.slice(1);
}

function formatGptName(id: string): string {
  if (/^o\d/i.test(id)) {
    const m = id.match(/^o(\d+(?:\.\d+)?)(?:-(.+))?$/i);
    if (!m) return id;
    const suffix = m[2] ? ` ${titleCase(m[2])}` : "";
    return `o${m[1]}${suffix}`;
  }
  if (!id.startsWith("gpt-")) return id;
  const body = id.slice(4);
  const [version, ...rest] = body.split("-");
  if (!rest.length) return `GPT-${version}`;
  return `GPT-${version} ${rest.map(titleCase).join(" ")}`;
}

function formatGeminiName(id: string): string {
  const body = id.replace(/^gemini-/i, "");
  return `Gemini ${body.split("-").map(titleCase).join(" ")}`;
}

function formatClaudeName(id: string): string {
  if (id.includes("opus")) {
    const v = id.match(/opus-(\d+-\d+)/)?.[1]?.replace("-", ".");
    return v ? `Opus ${v}` : "Opus";
  }
  if (id.includes("sonnet")) {
    const v = id.match(/sonnet-(\d+-\d+)/)?.[1]?.replace("-", ".");
    return v ? `Sonnet ${v}` : "Sonnet";
  }
  if (id.includes("haiku")) {
    const v = id.match(/haiku-(\d+-\d+)/)?.[1]?.replace("-", ".");
    return v ? `Haiku ${v}` : "Haiku";
  }
  return id.replace(/^claude-/i, "").replace(/-/g, " ");
}

function defaultDescription(uiProvider: ChatAiProvider): string {
  switch (uiProvider) {
    case "chatgpt":
      return "OpenAI 对话模型";
    case "claude":
      return "Anthropic 对话模型";
    case "gemini":
      return "Google 对话模型";
    default:
      return "通用对话模型";
  }
}

export function resolveModelDisplay(
  id: string,
  uiProvider: ChatAiProvider,
): ModelDisplay {
  const known = KNOWN[id];
  if (known) return known;

  switch (uiProvider) {
    case "chatgpt":
      return { name: formatGptName(id), description: defaultDescription(uiProvider) };
    case "gemini":
      return { name: formatGeminiName(id), description: defaultDescription(uiProvider) };
    case "claude":
      return { name: formatClaudeName(id), description: defaultDescription(uiProvider) };
    default:
      return {
        name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        description: defaultDescription(uiProvider),
      };
  }
}

export function applyModelDisplay(model: ChatModel): ChatModel {
  const { name, description } = resolveModelDisplay(model.id, model.uiProvider);
  return { ...model, name, description };
}

export function applyModelDisplayList(models: ChatModel[]): ChatModel[] {
  return models.map(applyModelDisplay);
}
