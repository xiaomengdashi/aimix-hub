import { redirect } from "next/navigation";
import { Assistant } from "../assistant";
import {
  DEFAULT_CHAT_AI_PROVIDER,
  isChatAiProvider,
  type ChatAiProvider,
} from "@/lib/chat/provider";
import { providerPath } from "@/lib/chat/routes";

export const dynamic = "force-dynamic";

type ProviderLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ provider: string }>;
};

/** Keeps Assistant mounted while navigating `/provider` ↔ `/provider/{threadId}`. */
export default async function ProviderChatLayout({
  children,
  params,
}: ProviderLayoutProps) {
  const { provider: providerParam } = await params;

  if (providerParam === "image") {
    redirect("/image");
  }

  if (!isChatAiProvider(providerParam)) {
    redirect(providerPath(DEFAULT_CHAT_AI_PROVIDER));
  }

  const provider = providerParam as ChatAiProvider;

  return (
    <main className="h-dvh">
      <Assistant initialAppId={provider} />
      {children}
    </main>
  );
}
