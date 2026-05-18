import { redirect } from "next/navigation";
import { Assistant } from "../assistant";
import {
  DEFAULT_CHAT_AI_PROVIDER,
  isChatAiProvider,
  type ChatAiProvider,
} from "@/lib/chat/provider";
import { providerPath } from "@/lib/chat/routes";

export const dynamic = "force-dynamic";

type ProviderPageProps = {
  params: Promise<{ provider: string }>;
};

export default async function ProviderPage({ params }: ProviderPageProps) {
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
    </main>
  );
}
