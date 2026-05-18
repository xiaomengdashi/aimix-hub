import { randomUUID } from "crypto";
import type { SupabaseClient } from "@supabase/supabase-js";
import { GENERATED_IMAGES_BUCKET } from "@/lib/image-generation/constants";

export type PersistedImage = {
  imageUrl: string;
  storagePath: string;
};

function extensionFromMediaType(mediaType: string): string {
  if (mediaType === "image/png") return "png";
  if (mediaType === "image/webp") return "webp";
  return "jpg";
}

/** 上传至 Supabase Storage `generated-images`（需公共读或签名 URL 策略）。 */
export async function persistGeneratedImage(
  supabase: SupabaseClient,
  userId: string,
  bytes: Uint8Array,
  mediaType: string,
): Promise<PersistedImage> {
  const id = randomUUID();
  const storagePath = `${userId}/${id}.${extensionFromMediaType(mediaType)}`;

  const { error } = await supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .upload(storagePath, Buffer.from(bytes), {
      contentType: mediaType,
      upsert: false,
    });

  if (error) {
    throw new Error(`图片上传失败：${error.message}`);
  }

  const { data } = supabase.storage
    .from(GENERATED_IMAGES_BUCKET)
    .getPublicUrl(storagePath);

  return {
    imageUrl: data.publicUrl,
    storagePath,
  };
}
