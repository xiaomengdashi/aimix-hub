import { redirect } from "next/navigation";
import {
  DEFAULT_CHAT_AI_PROVIDER,
  isChatAiProvider,
} from "@/lib/chat/provider";

export const dynamic = "force-dynamic";

type ThreadPageProps = {
  params: Promise<{ provider: string; threadId: string }>;
};

/** Route shell only — UI lives in `[provider]/layout.tsx`. */
export default async function ThreadPage({ params }: ThreadPageProps) {
  const { provider: providerParam, threadId } = await params;

  if (providerParam === "image") {
    redirect(`/image/${threadId}`);
  }

  if (!isChatAiProvider(providerParam)) {
    redirect(`/${DEFAULT_CHAT_AI_PROVIDER}/${threadId}`);
  }

  return null;
}
