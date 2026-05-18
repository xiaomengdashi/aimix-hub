import { randomUUID } from "crypto";
import { normalizeModelId } from "@/lib/ai-gateway/normalize-model-id";
import { generateGatewayImage } from "@/lib/image-generation/gateway";
import {
  isImageGenerationModel,
  resolveImageGenerationModelId,
} from "@/lib/image-generation/models";
import {
  type ImageGenerationParams,
  parseImageFormat,
  parseImageQuality,
  parseImageSize,
} from "@/lib/image-generation/settings";
import {
  IMAGE_SESSION_FORMAT,
  type ImageSessionContent,
  type ImageSessionSummary,
  truncatePromptTitle,
} from "@/lib/image-generation/session";
import { persistGeneratedImage } from "@/lib/image-generation/persist-image";
import { createClient } from "@/lib/supabase/server";
import { formatThreadsProviderError } from "@/lib/supabase/thread-provider-errors";

export function parseImageGenerationBody(
  body: unknown,
): ImageGenerationParams | { error: string } {
  if (!body || typeof body !== "object") {
    return { error: "请求体无效" };
  }
  const b = body as Record<string, unknown>;
  const prompt = typeof b.prompt === "string" ? b.prompt.trim() : "";
  if (!prompt) return { error: "请输入提示词" };
  if (prompt.length > 4000) return { error: "提示词过长（最多 4000 字）" };

  const model =
    typeof b.model === "string" ? normalizeModelId(b.model) : "gpt-image-2";
  if (!isImageGenerationModel(model)) {
    return { error: "不支持的绘图模型" };
  }

  const resolvedModel = resolveImageGenerationModelId(model);

  return {
    prompt,
    model: resolvedModel,
    size: parseImageSize(b.size, resolvedModel),
    quality: parseImageQuality(b.quality),
    format: parseImageFormat(b.format),
  };
}

export async function generateImageSession(
  userId: string,
  params: ImageGenerationParams,
  modelName?: string,
): Promise<{ session: ImageSessionSummary } | { error: string }> {
  const supabase = await createClient();
  const now = new Date().toISOString();
  const messageId = randomUUID();

  const { data: thread, error: threadError } = await supabase
    .from("threads")
    .insert({
      user_id: userId,
      provider: "image",
      title: truncatePromptTitle(params.prompt),
      last_message_at: now,
    })
    .select("id, title, created_at, updated_at, last_message_at")
    .single();

  if (threadError || !thread) {
    return { error: formatThreadsProviderError(threadError?.message) };
  }

  const pendingContent: ImageSessionContent = {
    version: 1,
    prompt: params.prompt,
    model: params.model,
    modelName,
    size: params.size,
    quality: params.quality,
    format: params.format,
    status: "generating",
    createdAt: now,
  };

  const { error: insertError } = await supabase.from("messages").insert({
    id: messageId,
    thread_id: thread.id,
    user_id: userId,
    parent_id: null,
    format: IMAGE_SESSION_FORMAT,
    content: pendingContent,
  });

  if (insertError) {
    await supabase.from("threads").delete().eq("id", thread.id);
    return { error: insertError.message };
  }

  try {
    const image = await generateGatewayImage({
      model: params.model,
      prompt: params.prompt,
      size: params.size,
      quality: params.quality,
      format: params.format,
    });

    const persisted = await persistGeneratedImage(
      supabase,
      userId,
      image.bytes,
      image.mediaType,
    );

    const completedContent: ImageSessionContent = {
      ...pendingContent,
      status: "completed",
      imageUrl: persisted.imageUrl,
      storagePath: persisted.storagePath,
      mediaType: image.mediaType,
    };

    const { error: updateError } = await supabase
      .from("messages")
      .update({ content: completedContent })
      .eq("id", messageId)
      .eq("thread_id", thread.id);

    if (updateError) {
      return { error: updateError.message };
    }

    await supabase
      .from("threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", thread.id);

    return {
      session: {
        id: thread.id,
        title: thread.title,
        prompt: params.prompt,
        model: params.model,
        modelName,
        size: params.size,
        quality: params.quality,
        format: params.format,
        status: "completed",
        imageUrl: persisted.imageUrl,
        storagePath: persisted.storagePath,
        mediaType: image.mediaType,
        createdAt: now,
        updatedAt: new Date().toISOString(),
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "图像生成失败";
    const failedContent: ImageSessionContent = {
      ...pendingContent,
      status: "failed",
      error: message,
    };

    await supabase
      .from("messages")
      .update({ content: failedContent })
      .eq("id", messageId)
      .eq("thread_id", thread.id);

    return {
      session: {
        id: thread.id,
        title: thread.title,
        prompt: params.prompt,
        model: params.model,
        modelName,
        size: params.size,
        quality: params.quality,
        format: params.format,
        status: "failed",
        error: message,
        createdAt: now,
        updatedAt: new Date().toISOString(),
      },
    };
  }
}
