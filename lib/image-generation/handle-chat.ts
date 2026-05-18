import {
  createUIMessageStream,
  createUIMessageStreamResponse,
  type UIMessage,
} from "ai";
import { extractImagePromptFromMessages } from "@/lib/image-generation/extract-prompt";
import { generateGatewayImage } from "@/lib/image-generation/gateway";
import { resolveImageGenerationModelId } from "@/lib/image-generation/models";
import { persistGeneratedImage } from "@/lib/image-generation/persist-image";
import { createClient } from "@/lib/supabase/server";

const STATUS_TEXT_ID = "image-gen-status";

export function createImageErrorStreamResponse(
  messages: UIMessage[],
  errorMessage: string,
): Response {
  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "text-start", id: STATUS_TEXT_ID });
      writer.write({
        type: "text-delta",
        id: STATUS_TEXT_ID,
        delta: `图像生成失败：${errorMessage}`,
      });
      writer.write({ type: "text-end", id: STATUS_TEXT_ID });
      writer.write({ type: "finish", finishReason: "error" });
    },
  });
  return createUIMessageStreamResponse({ stream });
}

export async function handleImageGenerationChat(
  req: Request,
  messages: UIMessage[],
  modelId: string,
  userId: string,
): Promise<Response> {
  const apiModel = resolveImageGenerationModelId(modelId);

  let prompt: string;
  try {
    prompt = extractImagePromptFromMessages(messages);
  } catch (error) {
    const message = error instanceof Error ? error.message : "无法读取提示词";
    return createImageErrorStreamResponse(messages, message);
  }

  const stream = createUIMessageStream({
    originalMessages: messages,
    execute: async ({ writer }) => {
      writer.write({ type: "start" });
      writer.write({ type: "start-step" });
      writer.write({ type: "text-start", id: STATUS_TEXT_ID });
      writer.write({
        type: "text-delta",
        id: STATUS_TEXT_ID,
        delta: "正在生成图片，请稍候（约 1 分钟）…",
      });

      const image = await generateGatewayImage({
        model: apiModel,
        prompt,
        size: "1024x1024",
        quality: "low",
        format: "jpeg",
        abortSignal: req.signal,
      });

      const supabase = await createClient();
      const persisted = await persistGeneratedImage(
        supabase,
        userId,
        image.bytes,
        image.mediaType,
      );
      const publicUrl = persisted.imageUrl;

      writer.write({
        type: "text-delta",
        id: STATUS_TEXT_ID,
        delta: "\n\n图片已生成。",
      });
      writer.write({ type: "text-end", id: STATUS_TEXT_ID });

      writer.write({
        type: "file",
        mediaType: image.mediaType,
        url: publicUrl,
      });
      writer.write({ type: "finish-step" });
      writer.write({ type: "finish", finishReason: "stop" });
    },
    onError: (error) =>
      error instanceof Error ? error.message : "图像生成失败",
  });

  return createUIMessageStreamResponse({ stream });
}
