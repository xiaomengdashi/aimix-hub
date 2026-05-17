import { redirect } from "next/navigation";
import { Assistant } from "../assistant";
import {
  DEFAULT_CHAT_AI_PROVIDER,
  isChatAiProvider,
  type ChatAiProvider,
} from "@/lib/chat-ai-provider";
import { providerPath } from "@/lib/chat-provider-routes";

export const dynamic = "force-dynamic";

type ProviderPageProps = {
  params: Promise<{ provider: string }>;
};

export default async function ProviderPage({ params }: ProviderPageProps) {
  const { provider: providerParam } = await params;

  if (!isChatAiProvider(providerParam)) {
    redirect(providerPath(DEFAULT_CHAT_AI_PROVIDER));
  }

  const provider = providerParam as ChatAiProvider;

  return (
    <main className="h-dvh">
      <Assistant initialProvider={provider} />
    </main>
  );
}
