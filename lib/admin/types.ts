import type { AppUserRole } from "@/lib/auth/roles";
import type { ChatModel, ModelUiScope } from "@/lib/chat/models";

export type ManagedUser = {
  id: string;
  username: string;
  role: AppUserRole;
  createdAt: string;
  lastSignInAt: string | null;
};

export type AdminIntegrationSettings = {
  aiBaseUrl: string;
  aiApiKeyConfigured: boolean;
  aiApiKeyHint: string | null;
  tavilyApiKeyConfigured: boolean;
  tavilyApiKeyHint: string | null;
  tavilyBaseUrl: string;
  updatedAt: string | null;
};

export type ManagedModelConfig = {
  modelId: string;
  uiProvider: ModelUiScope;
  enabled: boolean;
  sortOrder: number;
  name: string;
  description: string;
  contextWindow: number;
  backend: ChatModel["backend"];
  apiModel: string;
  updatedAt: string;
};

export type ModelCatalogInput = Omit<ManagedModelConfig, "updatedAt">;

export type GatewayModelOption = {
  id: string;
  description?: string;
  modelType?: string;
  supportedEndpointTypes?: string[];
  uiProvider?: ModelUiScope;
};
