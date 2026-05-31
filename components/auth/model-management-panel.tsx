"use client";

import {
  ArrowDownIcon,
  ArrowLeftIcon,
  ArrowUpIcon,
  Loader2Icon,
  PlusIcon,
  RefreshCwIcon,
  Settings2Icon,
  Trash2Icon,
} from "lucide-react";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
} from "react";
import type {
  AdminIntegrationSettings,
  GatewayModelOption,
  ModelCatalogInput,
} from "@/lib/admin/types";
import {
  uiProviderForGatewayId,
} from "@/lib/ai-gateway/gateway-discovery";
import { inferBackendFromEndpointTypes } from "@/lib/ai-gateway/model-backend";
import { resolveModelDisplay } from "@/lib/ai-gateway/model-display";
import type { ModelUiScope } from "@/lib/chat/models";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROVIDER_TABS: { id: ModelUiScope; label: string }[] = [
  { id: "chatgpt", label: "ChatGPT" },
  { id: "claude", label: "Claude" },
  { id: "gemini", label: "Gemini" },
  { id: "other", label: "其他" },
  { id: "image", label: "绘图" },
];

type EditableModel = ModelCatalogInput & {
  modelType?: string;
  supportedEndpointTypes?: string[];
};

function resolveModelType(
  model: EditableModel,
  gatewayTypeById: Map<string, string>,
): string | undefined {
  return model.modelType ?? gatewayTypeById.get(model.modelId);
}

function resolveSupportedEndpointTypes(
  model: EditableModel,
  gatewayEndpointTypesById: Map<string, string[]>,
): string[] | undefined {
  return model.supportedEndpointTypes ?? gatewayEndpointTypesById.get(model.modelId);
}

function createModelFromGateway(
  option: GatewayModelOption,
  uiProvider: ModelUiScope,
  sortOrder: number,
): EditableModel {
  const display = resolveModelDisplay(option.id, uiProvider);
  return {
    modelId: option.id,
    uiProvider,
    enabled: true,
    sortOrder,
    name: display.name,
    description: display.description,
    contextWindow: uiProvider === "image" ? 0 : uiProvider === "gemini" ? 1_000_000 : 200_000,
    backend: inferBackendFromEndpointTypes(option.supportedEndpointTypes, uiProvider),
    apiModel: option.id,
    modelType: option.modelType,
    supportedEndpointTypes: option.supportedEndpointTypes,
  };
}

export const ModelManagementPanel: FC = () => {
  const [activeProvider, setActiveProvider] = useState<ModelUiScope>("chatgpt");
  const [models, setModels] = useState<EditableModel[]>([]);
  const [settings, setSettings] = useState<AdminIntegrationSettings | null>(
    null,
  );
  const [gatewayModels, setGatewayModels] = useState<GatewayModelOption[]>([]);
  const [gatewayFilter, setGatewayFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [savingModels, setSavingModels] = useState(false);
  const [savingSettings, setSavingSettings] = useState(false);
  const [loadingGateway, setLoadingGateway] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [aiBaseUrl, setAiBaseUrl] = useState("https://yunwu.ai/v1");
  const [aiApiKey, setAiApiKey] = useState("");
  const [tavilyBaseUrl, setTavilyBaseUrl] = useState("https://api.tavily.com");
  const [tavilyApiKey, setTavilyApiKey] = useState("");

  const providerModels = useMemo(
    () =>
      models
        .filter((model) => model.uiProvider === activeProvider)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.modelId.localeCompare(b.modelId)),
    [models, activeProvider],
  );

  const existingIds = useMemo(
    () => new Set(models.map((model) => model.modelId)),
    [models],
  );

  const gatewayTypeById = useMemo(
    () =>
      new Map(
        gatewayModels
          .filter((model) => model.modelType)
          .map((model) => [model.id, model.modelType!] as const),
      ),
    [gatewayModels],
  );

  const gatewayEndpointTypesById = useMemo(
    () =>
      new Map(
        gatewayModels
          .filter((model) => model.supportedEndpointTypes?.length)
          .map(
            (model) => [model.id, model.supportedEndpointTypes!] as const,
          ),
      ),
    [gatewayModels],
  );

  const filteredGatewayModels = useMemo(() => {
    const query = gatewayFilter.trim().toLowerCase();
    return gatewayModels.filter((model) => {
      if (model.uiProvider && model.uiProvider !== activeProvider) return false;
      if (!query) return true;
      return model.id.toLowerCase().includes(query);
    });
  }, [gatewayFilter, gatewayModels, activeProvider]);

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [settingsRes, modelsRes, gatewayRes] = await Promise.all([
        fetch("/api/admin/integration"),
        fetch("/api/admin/models"),
        fetch("/api/admin/models/gateway"),
      ]);

      const settingsPayload = (await settingsRes.json()) as {
        settings?: AdminIntegrationSettings;
        error?: string;
      };
      const modelsPayload = (await modelsRes.json()) as {
        models?: EditableModel[];
        error?: string;
      };
      const gatewayPayload = (await gatewayRes.json()) as {
        models?: GatewayModelOption[];
        error?: string;
      };

      if (!settingsRes.ok) {
        throw new Error(settingsPayload.error ?? "加载网关配置失败");
      }
      if (!modelsRes.ok) {
        throw new Error(modelsPayload.error ?? "加载模型配置失败");
      }

      if (gatewayRes.ok) {
        setGatewayModels(gatewayPayload.models ?? []);
      }

      setSettings(settingsPayload.settings ?? null);
      setAiBaseUrl(settingsPayload.settings?.aiBaseUrl ?? "https://yunwu.ai/v1");
      setTavilyBaseUrl(
        settingsPayload.settings?.tavilyBaseUrl ?? "https://api.tavily.com",
      );

      setModels(
        (modelsPayload.models ?? []).map((model) => ({
          modelId: model.modelId,
          uiProvider: model.uiProvider,
          enabled: model.enabled,
          sortOrder: model.sortOrder,
          name: model.name,
          description: model.description,
          contextWindow: model.contextWindow,
          backend: model.backend,
          apiModel: model.apiModel,
          modelType: gatewayPayload.models?.find((row) => row.id === model.modelId)
            ?.modelType,
          supportedEndpointTypes: gatewayPayload.models?.find(
            (row) => row.id === model.modelId,
          )?.supportedEndpointTypes,
        })),
      );
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "加载管理数据失败",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const handleSaveSettings = async () => {
    setSavingSettings(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/integration", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aiBaseUrl,
          aiApiKey: aiApiKey.trim() ? aiApiKey.trim() : null,
          tavilyBaseUrl,
          tavilyApiKey: tavilyApiKey.trim() ? tavilyApiKey.trim() : null,
        }),
      });
      const payload = (await response.json()) as {
        settings?: AdminIntegrationSettings;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "保存网关配置失败");
      }

      setSettings(payload.settings ?? null);
      setAiApiKey("");
      setTavilyApiKey("");
      setSuccess("网关配置已保存");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "保存网关配置失败",
      );
    } finally {
      setSavingSettings(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/integration/test", {
        method: "POST",
      });
      const payload = (await response.json()) as {
        ok?: boolean;
        count?: number;
        error?: string;
      };

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error ?? "连接测试失败");
      }

      setSuccess(`AI 网关连接成功，共 ${payload.count ?? 0} 个模型`);
    } catch (testError) {
      setError(
        testError instanceof Error ? testError.message : "连接测试失败",
      );
    } finally {
      setTestingConnection(false);
    }
  };

  const handleLoadGatewayModels = async () => {
    setLoadingGateway(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/models/gateway");
      const payload = (await response.json()) as {
        models?: GatewayModelOption[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "拉取网关模型失败");
      }

      setGatewayModels(payload.models ?? []);
      setSuccess(`已加载 ${payload.models?.length ?? 0} 个网关模型`);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : "拉取网关模型失败",
      );
    } finally {
      setLoadingGateway(false);
    }
  };

  const handleSaveModels = async () => {
    setSavingModels(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/admin/models", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          models: models.map((model) => ({
            ...model,
            backend: inferBackendFromEndpointTypes(
              resolveSupportedEndpointTypes(model, gatewayEndpointTypesById),
              model.uiProvider,
            ),
          })),
        }),
      });
      const payload = (await response.json()) as {
        models?: EditableModel[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "保存模型配置失败");
      }

      setModels(
        (payload.models ?? []).map((model) => ({
          modelId: model.modelId,
          uiProvider: model.uiProvider,
          enabled: model.enabled,
          sortOrder: model.sortOrder,
          name: model.name,
          description: model.description,
          contextWindow: model.contextWindow,
          backend: model.backend,
          apiModel: model.apiModel,
          modelType: gatewayTypeById.get(model.modelId),
          supportedEndpointTypes: gatewayEndpointTypesById.get(model.modelId),
        })),
      );
      setSuccess("模型配置已保存");
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : "保存模型配置失败",
      );
    } finally {
      setSavingModels(false);
    }
  };

  const updateModel = (modelId: string, patch: Partial<EditableModel>) => {
    setModels((current) =>
      current.map((model) =>
        model.modelId === modelId ? { ...model, ...patch } : model,
      ),
    );
  };

  const removeModel = (modelId: string) => {
    setModels((current) => current.filter((model) => model.modelId !== modelId));
  };

  const moveModel = (modelId: string, direction: -1 | 1) => {
    setModels((current) => {
      const scoped = current
        .filter((model) => model.uiProvider === activeProvider)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      const index = scoped.findIndex((model) => model.modelId === modelId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= scoped.length) {
        return current;
      }

      const reordered = [...scoped];
      const [item] = reordered.splice(index, 1);
      reordered.splice(targetIndex, 0, item!);

      const orderMap = new Map(
        reordered.map((model, order) => [model.modelId, order] as const),
      );

      return current.map((model) =>
        model.uiProvider === activeProvider
          ? { ...model, sortOrder: orderMap.get(model.modelId) ?? model.sortOrder }
          : model,
      );
    });
  };

  const addGatewayModel = (option: GatewayModelOption) => {
    if (existingIds.has(option.id)) return;

    const uiProvider = option.uiProvider ?? uiProviderForGatewayId(option.id);
    const nextOrder = models.filter((model) => model.uiProvider === uiProvider).length;

    setModels((current) => [
      ...current,
      createModelFromGateway(option, uiProvider, nextOrder),
    ]);
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ms-2 gap-1.5" asChild>
          <Link href="/account">
            <ArrowLeftIcon className="size-4" />
            返回个人中心
          </Link>
        </Button>
      </header>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Settings2Icon className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-xl">模型与网关管理</h1>
            <p className="text-muted-foreground text-sm">
              配置 AI / Tavily 密钥，并为各 Provider 选择可用模型及参数。
            </p>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive text-sm"
          >
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mt-6 rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-emerald-700 text-sm dark:text-emerald-300">
            {success}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <label className="space-y-2 text-sm">
            <span className="font-medium">AI Base URL</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              value={aiBaseUrl}
              onChange={(event) => setAiBaseUrl(event.target.value)}
              placeholder="https://yunwu.ai/v1"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">AI API Key</span>
            <input
              type="password"
              className="h-10 w-full rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              value={aiApiKey}
              onChange={(event) => setAiApiKey(event.target.value)}
              placeholder={
                settings?.aiApiKeyConfigured
                  ? `已配置 ${settings.aiApiKeyHint ?? ""}，留空则不修改`
                  : "请输入 AI 网关 API Key"
              }
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Tavily Base URL</span>
            <input
              className="h-10 w-full rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              value={tavilyBaseUrl}
              onChange={(event) => setTavilyBaseUrl(event.target.value)}
              placeholder="https://api.tavily.com"
            />
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">Tavily API Key</span>
            <input
              type="password"
              className="h-10 w-full rounded-md border bg-background px-3 outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              value={tavilyApiKey}
              onChange={(event) => setTavilyApiKey(event.target.value)}
              placeholder={
                settings?.tavilyApiKeyConfigured
                  ? `已配置 ${settings.tavilyApiKeyHint ?? ""}，留空则不修改`
                  : "请输入 Tavily API Key"
              }
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            onClick={() => void handleSaveSettings()}
            disabled={savingSettings || loading}
          >
            {savingSettings ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                保存中…
              </>
            ) : (
              "保存网关配置"
            )}
          </Button>
          <Button
            variant="outline"
            onClick={() => void handleTestConnection()}
            disabled={testingConnection || loading}
          >
            {testingConnection ? (
              <>
                <Loader2Icon className="size-4 animate-spin" />
                测试中…
              </>
            ) : (
              "测试 AI 连接"
            )}
          </Button>
        </div>
      </section>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-medium text-lg">Provider 模型配置</h2>
            <p className="text-muted-foreground text-sm">
              运行时仅展示此处启用的模型；配置保存在数据库中。
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => void handleLoadGatewayModels()}
              disabled={loadingGateway || loading}
            >
              {loadingGateway ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  加载中…
                </>
              ) : (
                <>
                  <RefreshCwIcon className="size-4" />
                  从网关加载
                </>
              )}
            </Button>
            <Button onClick={() => void handleSaveModels()} disabled={savingModels || loading}>
              {savingModels ? (
                <>
                  <Loader2Icon className="size-4 animate-spin" />
                  保存中…
                </>
              ) : (
                "保存模型配置"
              )}
            </Button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {PROVIDER_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={cn(
                "rounded-full px-3 py-1.5 text-sm transition-colors",
                activeProvider === tab.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground",
              )}
              onClick={() => setActiveProvider(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-3 py-3 font-medium">启用</th>
                <th className="px-3 py-3 font-medium">Model ID</th>
                <th className="px-3 py-3 font-medium">名称</th>
                <th className="px-3 py-3 font-medium">描述</th>
                <th className="px-3 py-3 font-medium">Context</th>
                <th className="px-3 py-3 font-medium">Backend</th>
                <th className="px-3 py-3 font-medium">类型</th>
                <th className="px-3 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2Icon className="size-4 animate-spin" />
                      加载中…
                    </span>
                  </td>
                </tr>
              ) : providerModels.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                    当前 Provider 暂无模型，请从下方网关列表添加
                  </td>
                </tr>
              ) : (
                providerModels.map((model) => (
                  <tr key={model.modelId} className="border-t align-top">
                    <td className="px-3 py-3">
                      <input
                        type="checkbox"
                        checked={model.enabled}
                        onChange={(event) =>
                          updateModel(model.modelId, { enabled: event.target.checked })
                        }
                        aria-label={`启用 ${model.modelId}`}
                      />
                    </td>
                    <td className="px-3 py-3 font-mono text-xs">{model.modelId}</td>
                    <td className="px-3 py-3">
                      <input
                        className="h-9 min-w-32 rounded-md border bg-background px-2"
                        value={model.name}
                        onChange={(event) =>
                          updateModel(model.modelId, { name: event.target.value })
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        className="h-9 min-w-40 rounded-md border bg-background px-2"
                        value={model.description}
                        onChange={(event) =>
                          updateModel(model.modelId, {
                            description: event.target.value,
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      <input
                        type="number"
                        className="h-9 w-28 rounded-md border bg-background px-2"
                        value={model.contextWindow}
                        onChange={(event) =>
                          updateModel(model.modelId, {
                            contextWindow: Number(event.target.value) || 0,
                          })
                        }
                      />
                    </td>
                    <td className="px-3 py-3">
                      {(() => {
                        const endpointTypes = resolveSupportedEndpointTypes(
                          model,
                          gatewayEndpointTypesById,
                        );
                        if (!endpointTypes?.length) {
                          return (
                            <span className="text-muted-foreground text-xs">—</span>
                          );
                        }
                        return (
                          <div className="flex max-w-40 flex-wrap gap-1">
                            {endpointTypes.map((type) => (
                              <span
                                key={type}
                                className="inline-flex rounded-full bg-muted px-2 py-0.5 font-mono text-xs"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3">
                      {(() => {
                        const modelType = resolveModelType(model, gatewayTypeById);
                        return modelType ? (
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs">
                            {modelType}
                          </span>
                        ) : (
                          <span className="text-muted-foreground text-xs">—</span>
                        );
                      })()}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => moveModel(model.modelId, -1)}
                          aria-label="上移"
                        >
                          <ArrowUpIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => moveModel(model.modelId, 1)}
                          aria-label="下移"
                        >
                          <ArrowDownIcon className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeModel(model.modelId)}
                          aria-label="删除"
                        >
                          <Trash2Icon className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 space-y-3">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="font-medium">从网关添加模型</h3>
            <input
              className="h-9 min-w-48 flex-1 rounded-md border bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/50"
              value={gatewayFilter}
              onChange={(event) => setGatewayFilter(event.target.value)}
              placeholder="搜索 model id…"
            />
          </div>

          <div className="max-h-72 overflow-y-auto rounded-lg border">
            {filteredGatewayModels.length === 0 ? (
              <p className="px-4 py-8 text-center text-muted-foreground text-sm">
                {gatewayModels.length === 0
                  ? "点击「从网关加载」获取可选模型"
                  : "没有匹配的模型"}
              </p>
            ) : (
              <ul className="divide-y">
                {filteredGatewayModels.map((option) => {
                  const added = existingIds.has(option.id);
                  return (
                    <li
                      key={option.id}
                      className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                    >
                      <div className="min-w-0">
                        <p className="font-mono text-xs">{option.id}</p>
                        {option.modelType ? (
                          <span className="mt-1 inline-flex rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                            {option.modelType}
                          </span>
                        ) : null}
                        {option.supportedEndpointTypes?.length ? (
                          <div className="mt-1 flex flex-wrap gap-1">
                            {option.supportedEndpointTypes.map((type) => (
                              <span
                                key={type}
                                className="inline-flex rounded-full bg-muted px-2 py-0.5 font-mono text-muted-foreground text-xs"
                              >
                                {type}
                              </span>
                            ))}
                          </div>
                        ) : null}
                        {option.description ? (
                          <p className="mt-1 text-muted-foreground text-xs">
                            {option.description}
                          </p>
                        ) : null}
                      </div>
                      <Button
                        size="sm"
                        variant={added ? "secondary" : "outline"}
                        disabled={added}
                        onClick={() => addGatewayModel(option)}
                      >
                        <PlusIcon className="size-4" />
                        {added ? "已添加" : "添加"}
                      </Button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
