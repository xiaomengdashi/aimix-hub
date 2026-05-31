import {
  DEFAULT_CHAT_AI_PROVIDER,
  isChatAiProvider,
  type ChatAiProvider,
} from "@/lib/chat/provider";
import { type AppId, isAppId } from "@/lib/chat/app-id";

export function appPath(appId: AppId): string {
  return appId === "image" ? "/image" : `/${appId}`;
}

export function threadPath(appId: AppId, threadId?: string | null): string {
  const base = appPath(appId);
  if (!threadId) return base;
  return `${base}/${threadId}`;
}

export function threadIdFromPathname(pathname: string): string | null {
  const segments = pathname.replace(/^\/+|\/+$/g, "").split("/");
  if (segments.length < 2) return null;
  const [appSegment, threadSegment] = segments;
  if (appSegment === "image") return threadSegment ?? null;
  if (isChatAiProvider(appSegment)) return threadSegment ?? null;
  return null;
}

/** @deprecated 使用 appPath */
export function providerPath(provider: ChatAiProvider): string {
  return appPath(provider);
}

export function appFromPathname(pathname: string): AppId | null {
  const segment = pathname.replace(/^\/+|\/+$/g, "").split("/")[0];
  if (!segment) return null;
  if (segment === "image") return "image";
  if (isChatAiProvider(segment)) return segment;
  return null;
}

/** @deprecated 使用 appFromPathname */
export function providerFromPathname(pathname: string): ChatAiProvider | null {
  const app = appFromPathname(pathname);
  if (!app || app === "image") return null;
  return app;
}

export function resolveAppFromPathname(pathname: string): AppId {
  return appFromPathname(pathname) ?? DEFAULT_CHAT_AI_PROVIDER;
}

/** @deprecated 使用 resolveAppFromPathname */
export function resolveProviderFromPathname(pathname: string): ChatAiProvider {
  const app = resolveAppFromPathname(pathname);
  return app === "image" ? DEFAULT_CHAT_AI_PROVIDER : app;
}
