export type ModelsDevPrice = {
  input: number;
  output: number;
  sourceId: string;
};

export type ModelsDevPriceEntry = ModelsDevPrice & {
  providerId: string;
};

type ModelsDevCost = {
  input?: number;
  output?: number;
};

type ModelsDevProvider = {
  id?: string;
  models?: Record<
    string,
    {
      id?: string;
      cost?: ModelsDevCost | null;
    }
  >;
};

const MODELS_DEV_API = "https://models.dev/api.json";
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

let cache: { at: number; entries: ModelsDevPriceEntry[] } | null = null;

export function canonicalModelKey(id: string): string {
  const trimmed = id.trim().toLowerCase().replace(/_/g, "-");
  const short = trimmed.includes("/")
    ? trimmed.slice(trimmed.lastIndexOf("/") + 1)
    : trimmed;
  return short.replace(/-\d{8}$/, "").replace(/(\d)\.(\d)/g, "$1-$2");
}

export function preferredProviderPrefixes(
  uiProvider?: string,
): readonly string[] {
  switch (uiProvider) {
    case "chatgpt":
    case "image":
      return ["openai/", "openai"];
    case "claude":
      return ["anthropic/"];
    case "gemini":
      return ["google/"];
    case "grok":
      return ["x-ai/", "xai/", "grok/"];
    case "other":
      return [
        "deepseek/",
        "moonshotai/",
        "zai-org/",
        "z-ai/",
        "alibaba/",
        "qwen/",
        "minimax/",
        "xiaomi/",
      ];
    default:
      return [];
  }
}

export function scoreModelsDevMatch(
  catalogId: string,
  entry: ModelsDevPriceEntry,
  uiProvider?: string,
): number {
  const catalogKey = canonicalModelKey(catalogId);
  const sourceKey = canonicalModelKey(entry.sourceId);
  if (catalogKey !== sourceKey) return -1;

  let score = 10;
  const source = entry.sourceId.toLowerCase();
  for (const prefix of preferredProviderPrefixes(uiProvider)) {
    if (source.startsWith(prefix)) {
      score += 8;
      break;
    }
  }
  if (typeof entry.input === "number" && typeof entry.output === "number") {
    score += 3;
  }
  if (entry.input > 0 || entry.output > 0) score += 2;
  if (source.startsWith("umans-") || source.includes("/umans-")) score -= 6;
  return score;
}

export function lookupModelsDevPrice(
  catalogId: string,
  entries: readonly ModelsDevPriceEntry[],
  uiProvider?: string,
): ModelsDevPrice | null {
  let best: { score: number; entry: ModelsDevPriceEntry } | null = null;
  for (const entry of entries) {
    const score = scoreModelsDevMatch(catalogId, entry, uiProvider);
    if (score < 0) continue;
    if (!best || score > best.score) best = { score, entry };
  }
  return best
    ? {
        input: best.entry.input,
        output: best.entry.output,
        sourceId: best.entry.sourceId,
      }
    : null;
}

export function parseModelsDevIndex(
  payload: Record<string, ModelsDevProvider>,
): ModelsDevPriceEntry[] {
  const entries: ModelsDevPriceEntry[] = [];
  for (const [providerId, provider] of Object.entries(payload)) {
    const models = provider.models ?? {};
    for (const [modelId, model] of Object.entries(models)) {
      const cost = model.cost;
      if (!cost) continue;
      if (typeof cost.input !== "number" && typeof cost.output !== "number") {
        continue;
      }
      entries.push({
        providerId: provider.id ?? providerId,
        sourceId: model.id ?? modelId,
        input: typeof cost.input === "number" ? cost.input : 0,
        output: typeof cost.output === "number" ? cost.output : 0,
      });
    }
  }
  return entries;
}

export async function fetchModelsDevEntries(): Promise<ModelsDevPriceEntry[]> {
  if (cache && Date.now() - cache.at < CACHE_TTL_MS) {
    return cache.entries;
  }

  const response = await fetch(MODELS_DEV_API, {
    headers: { "User-Agent": "aimix-hub/models-dev-pricing" },
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`models.dev 请求失败 (${response.status})`);
  }

  const json = (await response.json()) as Record<string, ModelsDevProvider>;
  const entries = parseModelsDevIndex(json);
  cache = { at: Date.now(), entries };
  return entries;
}

export async function lookupPricesForModelIds(
  ids: Array<{ id: string; uiProvider?: string; apiModel?: string }>,
): Promise<Record<string, ModelsDevPrice>> {
  const entries = await fetchModelsDevEntries();
  const prices: Record<string, ModelsDevPrice> = {};
  for (const item of ids) {
    const found =
      lookupModelsDevPrice(item.id, entries, item.uiProvider) ??
      (item.apiModel && item.apiModel !== item.id
        ? lookupModelsDevPrice(item.apiModel, entries, item.uiProvider)
        : null);
    if (found) prices[item.id] = found;
  }
  return prices;
}

export function applyModelsDevPricesToModel<
  T extends {
    id?: string;
    modelId?: string;
    uiProvider?: string;
    apiModel?: string;
    inputPricePerMillion?: number | null;
    outputPricePerMillion?: number | null;
  },
>(
  model: T,
  prices: Record<string, ModelsDevPrice>,
  options?: { overwrite?: boolean },
): T {
  const id = model.id ?? model.modelId;
  if (!id) return model;
  const price = prices[id];
  if (!price) return model;

  const overwrite = options?.overwrite === true;
  return {
    ...model,
    inputPricePerMillion:
      overwrite || model.inputPricePerMillion == null
        ? price.input
        : model.inputPricePerMillion,
    outputPricePerMillion:
      overwrite || model.outputPricePerMillion == null
        ? price.output
        : model.outputPricePerMillion,
  };
}
