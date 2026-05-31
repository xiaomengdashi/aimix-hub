import type { GatewayModelOption } from "@/lib/admin/types";
import { fetchGatewayModelRows } from "@/lib/ai-gateway/gateway-models";
import { uiProviderForGatewayId } from "@/lib/ai-gateway/gateway-discovery";

const EXCLUDE_ID =
  /tts|audio|realtime|transcribe|vision|embedding|gizmo|whisper|suno|video|ocr|moderation|search-api|\*/i;

const REMOVED_MODEL_IDS = new Set(["gpt-4o"]);

function isDiscoverableModel(row: {
  id: string;
  model_type?: string;
}): boolean {
  if (!row.id || REMOVED_MODEL_IDS.has(row.id)) return false;
  if (EXCLUDE_ID.test(row.id)) return false;
  if (/^gpt-image/i.test(row.id)) return true;
  if (/dall-e|flux|midjourney|stable-diffusion|sdxl|ideogram/i.test(row.id)) {
    return true;
  }
  if (row.model_type) {
    const type = row.model_type.toLowerCase();
    return (
      type === "文本" ||
      type === "text" ||
      type.includes("图") ||
      type.includes("image")
    );
  }
  return true;
}

export async function listGatewayModelOptions(): Promise<
  Array<
    GatewayModelOption & {
      uiProvider: ReturnType<typeof uiProviderForGatewayId>;
    }
  >
> {
  const rows = await fetchGatewayModelRows();
  return rows
    .filter(isDiscoverableModel)
    .map((row) => ({
      id: row.id,
      description: row.description,
      modelType: row.model_type,
      uiProvider: uiProviderForGatewayId(row.id),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
