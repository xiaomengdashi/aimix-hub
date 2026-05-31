import { redirect } from "next/navigation";
import {
  DEFAULT_CHAT_AI_PROVIDER,
  isChatAiProvider,
} from "@/lib/chat/provider";

export const dynamic = "force-dynamic";

type ProviderPageProps = {
  params: Promise<{ provider: string }>;
};

/** Route shell only — UI lives in `[provider]/layout.tsx`. */
export default async function ProviderPage({ params }: ProviderPageProps) {
  const { provider: providerParam } = await params;

  if (providerParam === "image") {
    redirect("/image");
  }

  if (!isChatAiProvider(providerParam)) {
    redirect(`/${DEFAULT_CHAT_AI_PROVIDER}`);
  }

  return null;
}
