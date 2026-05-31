import type { GatewayModelOption } from "@/lib/admin/types";
import { fetchGatewayModelRows } from "@/lib/ai-gateway/gateway-models";
import { uiProviderForGatewayId } from "@/lib/ai-gateway/gateway-discovery";

export async function listGatewayModelOptions(): Promise<
  Array<
    GatewayModelOption & {
      uiProvider: ReturnType<typeof uiProviderForGatewayId>;
    }
  >
> {
  const rows = await fetchGatewayModelRows();
  return rows
    .filter((row) => Boolean(row.id))
    .map((row) => ({
      id: row.id,
      description: row.description,
      modelType: row.model_type,
      supportedEndpointTypes: row.supported_endpoint_types,
      uiProvider: uiProviderForGatewayId(row.id),
    }))
    .sort((a, b) => a.id.localeCompare(b.id));
}
