import { createClient } from "@/lib/supabase/server";
import {
  IMAGE_SESSION_FORMAT,
  parseImageSessionContent,
  type ImageSessionSummary,
} from "@/lib/image-generation/session";

export async function listImageSessions(
  userId: string,
): Promise<ImageSessionSummary[]> {
  const supabase = await createClient();

  const { data: threads, error } = await supabase
    .from("threads")
    .select("id, title, created_at, updated_at, last_message_at")
    .eq("user_id", userId)
    .eq("provider", "image")
    .eq("is_archived", false)
    .order("last_message_at", { ascending: false })
    .limit(80);

  if (error || !threads?.length) return [];

  const threadIds = threads.map((t) => t.id);
  const { data: messages } = await supabase
    .from("messages")
    .select("thread_id, content, created_at")
    .in("thread_id", threadIds)
    .eq("format", IMAGE_SESSION_FORMAT)
    .eq("user_id", userId);

  const contentByThread = new Map<string, ReturnType<typeof parseImageSessionContent>>();
  for (const row of messages ?? []) {
    contentByThread.set(
      row.thread_id,
      parseImageSessionContent(row.content),
    );
  }

  return threads
    .map((thread): ImageSessionSummary | null => {
      const content = contentByThread.get(thread.id);
      if (!content) return null;
      return {
        id: thread.id,
        title: thread.title,
        prompt: content.prompt,
        model: content.model,
        modelName: content.modelName,
        size: content.size,
        quality: content.quality,
        format: content.format,
        status: content.status,
        imageUrl: content.imageUrl,
        storagePath: content.storagePath,
        mediaType: content.mediaType,
        error: content.error,
        createdAt: content.createdAt,
        updatedAt: thread.last_message_at ?? thread.updated_at,
      };
    })
    .filter((s): s is ImageSessionSummary => s !== null);
}

export async function getImageSession(
  userId: string,
  sessionId: string,
): Promise<ImageSessionSummary | null> {
  const supabase = await createClient();

  const { data: thread, error } = await supabase
    .from("threads")
    .select("id, title, created_at, updated_at, last_message_at")
    .eq("id", sessionId)
    .eq("user_id", userId)
    .eq("provider", "image")
    .maybeSingle();

  if (error || !thread) return null;

  const { data: message } = await supabase
    .from("messages")
    .select("content")
    .eq("thread_id", sessionId)
    .eq("format", IMAGE_SESSION_FORMAT)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const content = parseImageSessionContent(message?.content);
  if (!content) return null;

  return {
    id: thread.id,
    title: thread.title,
    prompt: content.prompt,
    model: content.model,
    modelName: content.modelName,
    size: content.size,
    quality: content.quality,
    format: content.format,
    status: content.status,
    imageUrl: content.imageUrl,
    storagePath: content.storagePath,
    mediaType: content.mediaType,
    error: content.error,
    createdAt: content.createdAt,
    updatedAt: thread.last_message_at ?? thread.updated_at,
  };
}
