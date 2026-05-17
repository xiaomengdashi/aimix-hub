export type ChatModeId = "write" | "learn" | "code" | "drive" | "calendar";

export type ChatModeSuggestion = {
  title: string;
  prompt: string;
};

export type ChatMode = {
  id: ChatModeId;
  label: string;
  composerPlaceholder: string;
  systemPrompt: string;
  suggestions: ChatModeSuggestion[];
  integrationNote?: string;
};

export const CHAT_MODES: ChatMode[] = [
  {
    id: "write",
    label: "Write",
    composerPlaceholder: "想写什么？邮件、文章、提纲都可以…",
    systemPrompt: `You are a skilled writing assistant. Help the user draft, edit, and refine text in their chosen language and tone. Offer structure (outlines, headings), clarity improvements, and concise alternatives. Ask brief clarifying questions when goals are unclear.`,
    suggestions: [
      {
        title: "润色文案",
        prompt: "请帮我润色下面这段文字，让语气更自然、专业：",
      },
      {
        title: "写邮件",
        prompt: "帮我写一封礼貌、简洁的工作邮件，主题是：",
      },
      {
        title: "扩写大纲",
        prompt: "根据这个大纲写成完整文章，保持条理清晰：",
      },
    ],
  },
  {
    id: "learn",
    label: "Learn",
    composerPlaceholder: "想学点什么？可以提问或让我解释概念…",
    systemPrompt: `You are a patient tutor. Explain concepts step by step with simple language, analogies, and short examples. Check understanding, suggest practice questions, and adapt depth to the user's level. Encourage curiosity without overwhelming detail unless asked.`,
    suggestions: [
      {
        title: "通俗解释",
        prompt: "用通俗的例子解释这个概念：",
      },
      {
        title: "练习题",
        prompt: "给我 3 道由易到难的练习题，并附简要答案要点：",
      },
      {
        title: "知识总结",
        prompt: "把下面内容总结成要点和记忆口诀：",
      },
    ],
  },
  {
    id: "code",
    label: "Code",
    composerPlaceholder: "描述编程问题，或粘贴代码让我帮你看…",
    systemPrompt: `You are an expert software engineer. Write correct, readable code; explain tradeoffs briefly; prefer modern best practices. When debugging, state hypotheses, propose fixes, and mention edge cases. Match the user's language/framework when specified.`,
    suggestions: [
      {
        title: "代码审查",
        prompt: "请审查这段代码，指出 bug、风险和可改进之处：\n```\n\n```",
      },
      {
        title: "Debug",
        prompt: "这段代码报错，帮我定位原因并给出修复：\n```\n\n```",
      },
      {
        title: "实现功能",
        prompt: "用 TypeScript 实现以下功能，并简要说明设计：",
      },
    ],
  },
  {
    id: "drive",
    label: "From Drive",
    composerPlaceholder: "上传文件或粘贴文档内容，我来帮你处理…",
    systemPrompt: `You help users work with documents and file content. When they attach or paste text, summarize, extract structure, compare versions, or answer questions grounded in that content. If no file is provided, ask them to upload or paste the relevant excerpt. Do not invent file contents.`,
    integrationNote:
      "尚未连接 Google Drive。请先点击输入框左侧「+」上传文件，或直接粘贴文档内容。",
    suggestions: [
      {
        title: "总结文档",
        prompt: "请总结附件/下文的核心内容与结论：",
      },
      {
        title: "提取要点",
        prompt: "从以下内容提取行动项、日期和负责人：",
      },
      {
        title: "对比差异",
        prompt: "对比下面两版内容的差异，用条目列出：",
      },
    ],
  },
  {
    id: "calendar",
    label: "From Calendar",
    composerPlaceholder: "描述你的日程、会议或待办，我来帮你规划…",
    systemPrompt: `You help with calendars, scheduling, and time management. Propose realistic timelines, meeting agendas, reminders, and prioritization. Use clear dates/times when the user provides them; otherwise ask for timezone and constraints. Do not claim access to their real calendar unless they paste events.`,
    integrationNote:
      "尚未连接 Google Calendar。请用文字描述你的日程或粘贴会议信息。",
    suggestions: [
      {
        title: "规划一周",
        prompt: "根据以下约束，帮我规划下周的时间安排：",
      },
      {
        title: "会议议程",
        prompt: "为这次会议起草议程（含时长与目标）：",
      },
      {
        title: "待办优先级",
        prompt: "帮我把这些待办按优先级排序，并建议时间块：",
      },
    ],
  },
];

const ALLOWED_CHAT_MODE_IDS = new Set(CHAT_MODES.map((mode) => mode.id));

export function isAllowedChatModeId(id: string): boolean {
  return ALLOWED_CHAT_MODE_IDS.has(id as ChatModeId);
}

export function parseChatModeId(mode: unknown): ChatModeId | null {
  if (typeof mode !== "string" || !mode.trim()) {
    return null;
  }
  return isAllowedChatModeId(mode) ? (mode as ChatModeId) : null;
}

export function getChatMode(id: ChatModeId): ChatMode | undefined {
  return CHAT_MODES.find((m) => m.id === id);
}
