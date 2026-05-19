import type { LucideIcon } from "lucide-react";
import { Globe, Lightbulb, Sparkles, Telescope } from "lucide-react";
import type { ComposerToolId } from "@/lib/chat/composer-tools";
import type { ComposerToolsMenuItem } from "@/components/assistant-ui/providers/shared/composer-tools-menu";

const TOOL_ICONS: Record<ComposerToolId, LucideIcon> = {
  search: Globe,
  research: Telescope,
  think: Lightbulb,
  study: Sparkles,
};

const EN_LABELS: Record<ComposerToolId, string> = {
  search: "Search the web",
  research: "Run deep research",
  think: "Think longer",
  study: "Study and learn",
};

const ZH_LABELS: Record<ComposerToolId, string> = {
  search: "联网搜索",
  research: "深度研究",
  think: "深入思考",
  study: "学习辅导",
};

export function buildComposerToolsMenu(
  ids: ComposerToolId[],
  labels: Record<ComposerToolId, string> = EN_LABELS,
): ComposerToolsMenuItem[] {
  return ids.map((id) => ({
    id,
    label: labels[id],
    Icon: TOOL_ICONS[id],
  }));
}

export const CHATGPT_TOOLS_MENU = buildComposerToolsMenu(
  ["search", "research", "think", "study"],
  EN_LABELS,
);

export const GEMINI_TOOLS_MENU = buildComposerToolsMenu(
  ["research", "search", "study"],
  EN_LABELS,
);

export const CLAUDE_TOOLS_MENU = buildComposerToolsMenu(
  ["search", "research", "think", "study"],
  ZH_LABELS,
);

export const OTHER_TOOLS_MENU = buildComposerToolsMenu(
  ["search", "research", "think", "study"],
  ZH_LABELS,
);
