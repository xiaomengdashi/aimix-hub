"use client";

import type { ComponentType, SVGProps } from "react";
import type { ChatAiProvider } from "@/lib/chat-ai-provider";
import { resolveModelVendor, type ModelVendor } from "@/lib/model-vendor";
import { ClaudeIcon } from "@/components/assistant-ui/providers/claude/icon";
import { OpenAIIcon } from "@/components/assistant-ui/providers/chatgpt/icon";
import { GeminiIcon } from "@/components/assistant-ui/providers/gemini/icon";
import {
  DeepSeekIcon,
  GenericModelIcon,
  KimiIcon,
  MinimaxIcon,
  QwenIcon,
  XiaomiMimoIcon,
  ZhipuIcon,
} from "@/components/assistant-ui/providers/shared/vendor-icons";

const VENDOR_ICONS: Record<
  ModelVendor,
  ComponentType<SVGProps<SVGSVGElement>>
> = {
  openai: OpenAIIcon,
  anthropic: ClaudeIcon,
  google: GeminiIcon,
  deepseek: DeepSeekIcon,
  zhipu: ZhipuIcon,
  moonshot: KimiIcon,
  qwen: QwenIcon,
  minimax: MinimaxIcon,
  xiaomi: XiaomiMimoIcon,
  generic: GenericModelIcon,
};

export function ModelBrandIcon({
  modelId,
  uiProvider,
  className,
}: {
  modelId: string;
  uiProvider?: ChatAiProvider;
  className?: string;
}) {
  const vendor = resolveModelVendor(modelId, uiProvider);
  const Icon = VENDOR_ICONS[vendor];
  return <Icon className={className} />;
}
