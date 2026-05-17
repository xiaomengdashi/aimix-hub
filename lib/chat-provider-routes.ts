import {
  DEFAULT_CHAT_AI_PROVIDER,
  isChatAiProvider,
  type ChatAiProvider,
} from "@/lib/chat-ai-provider";

export function providerPath(provider: ChatAiProvider): string {
  return `/${provider}`;
}

export function providerFromPathname(pathname: string): ChatAiProvider | null {
  const segment = pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  if (!segment || !isChatAiProvider(segment)) return null;
  return segment;
}

export function resolveProviderFromPathname(pathname: string): ChatAiProvider {
  return providerFromPathname(pathname) ?? DEFAULT_CHAT_AI_PROVIDER;
}
