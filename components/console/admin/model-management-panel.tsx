"use client";

import {
	ArrowDownIcon,
	ArrowUpIcon,
	Loader2Icon,
	PlusIcon,
	RefreshCwIcon,
	Trash2Icon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import { filterGatewayModelsByQuery } from "@/lib/admin/filter-gateway-models";
import {
	applyModelsDevPricesToModel,
	type ModelsDevPrice,
} from "@/lib/admin/models-dev-pricing";
import type { GatewayModelOption, ModelCatalogInput } from "@/lib/admin/types";
import { inferBackendFromEndpointTypes } from "@/lib/ai-gateway/model-backend";
import { resolveModelDisplay } from "@/lib/ai-gateway/model-display";
import { parsePriceInput } from "@/lib/chat/format-model-price";
import type { ModelUiScope } from "@/lib/chat/models";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PROVIDER_TABS: { id: ModelUiScope; label: string }[] = [
	{ id: "chatgpt", label: "ChatGPT" },
	{ id: "claude", label: "Claude" },
	{ id: "gemini", label: "Gemini" },
	{ id: "grok", label: "Grok" },
	{ id: "other", label: "国产" },
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
	return (
		model.supportedEndpointTypes ?? gatewayEndpointTypesById.get(model.modelId)
	);
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
		contextWindow:
			uiProvider === "image"
				? 0
				: uiProvider === "gemini"
					? 1_000_000
					: 200_000,
		backend: inferBackendFromEndpointTypes(
			option.supportedEndpointTypes,
			uiProvider,
		),
		apiModel: option.id,
		modelType: option.modelType,
		supportedEndpointTypes: option.supportedEndpointTypes,
		inputPricePerMillion: null,
		outputPricePerMillion: null,
	};
}

export const ModelManagementPanel: FC = () => {
	const [activeProvider, setActiveProvider] = useState<ModelUiScope>("chatgpt");
	const [models, setModels] = useState<EditableModel[]>([]);
	const [gatewayModels, setGatewayModels] = useState<GatewayModelOption[]>([]);
	const [gatewayFilter, setGatewayFilter] = useState("");
	const [loading, setLoading] = useState(true);
	const [savingModels, setSavingModels] = useState(false);
	const [syncingPrices, setSyncingPrices] = useState(false);
	const [loadingGateway, setLoadingGateway] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const providerModels = useMemo(
		() =>
			models
				.filter((model) => model.uiProvider === activeProvider)
				.sort(
					(a, b) =>
						a.sortOrder - b.sortOrder || a.modelId.localeCompare(b.modelId),
				),
		[models, activeProvider],
	);

	const existingIdsInCurrentCatalog = useMemo(
		() =>
			new Set(
				models
					.filter((model) => model.uiProvider === activeProvider)
					.map((model) => model.modelId),
			),
		[models, activeProvider],
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
					.map((model) => [model.id, model.supportedEndpointTypes!] as const),
			),
		[gatewayModels],
	);

	const filteredGatewayModels = useMemo(
		() => filterGatewayModelsByQuery(gatewayModels, gatewayFilter),
		[gatewayFilter, gatewayModels],
	);

	const fillPricesFromModelsDev = useCallback(
		async (source: EditableModel[], overwrite: boolean) => {
			if (source.length === 0) return 0;

			const response = await fetch("/api/admin/models/pricing", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					ids: source.map((model) => ({
						id: model.modelId,
						uiProvider: model.uiProvider,
						apiModel: model.apiModel,
					})),
				}),
			});
			const payload = (await response.json()) as {
				prices?: Record<string, ModelsDevPrice>;
				error?: string;
			};
			if (!response.ok) {
				throw new Error(payload.error ?? "同步 models.dev 价格失败");
			}

			const prices = payload.prices ?? {};
			const matched = source.filter((model) => prices[model.modelId]).length;
			setModels((current) =>
				current.map((model) => {
					if (!prices[model.modelId]) return model;
					return applyModelsDevPricesToModel(model, prices, { overwrite });
				}),
			);
			return matched;
		},
		[],
	);

	const loadAll = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const modelsRes = await fetch("/api/admin/models");
			const modelsPayload = (await modelsRes.json()) as {
				models?: EditableModel[];
				error?: string;
			};

			if (!modelsRes.ok) {
				throw new Error(modelsPayload.error ?? "加载模型配置失败");
			}

			const loaded = (modelsPayload.models ?? []).map((model) => ({
				modelId: model.modelId,
				uiProvider: model.uiProvider,
				enabled: model.enabled,
				sortOrder: model.sortOrder,
				name: model.name,
				description: model.description,
				contextWindow: model.contextWindow,
				backend: model.backend,
				apiModel: model.apiModel,
				inputPricePerMillion: model.inputPricePerMillion ?? null,
				outputPricePerMillion: model.outputPricePerMillion ?? null,
			}));
			setModels(loaded);
			try {
				await fillPricesFromModelsDev(loaded, false);
			} catch {
				// 价格源不可用时仍展示目录
			}
		} catch (loadError) {
			setError(
				loadError instanceof Error ? loadError.message : "加载管理数据失败",
			);
		} finally {
			setLoading(false);
		}
	}, [fillPricesFromModelsDev]);

	useEffect(() => {
		void loadAll();
	}, [loadAll]);

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

			const nextGateway = payload.models ?? [];
			setGatewayModels(nextGateway);
			setModels((current) =>
				current.map((model) => {
					const row = nextGateway.find((item) => item.id === model.modelId);
					return {
						...model,
						modelType: row?.modelType ?? model.modelType,
						supportedEndpointTypes:
							row?.supportedEndpointTypes ?? model.supportedEndpointTypes,
					};
				}),
			);
			const query = gatewayFilter.trim();
			const matched = filterGatewayModelsByQuery(nextGateway, query).length;
			setSuccess(
				query
					? `已获取 ${nextGateway.length} 个模型，按「${query}」匹配到 ${matched} 个`
					: `已获取全部 ${nextGateway.length} 个网关模型`,
			);
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
					inputPricePerMillion: model.inputPricePerMillion ?? null,
					outputPricePerMillion: model.outputPricePerMillion ?? null,
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

	const handleSyncPrices = async (overwrite: boolean) => {
		setSyncingPrices(true);
		setError(null);
		setSuccess(null);
		try {
			const matched = await fillPricesFromModelsDev(models, overwrite);
			setSuccess(
				overwrite
					? `已从 models.dev 覆盖 ${matched} 个模型的价格（请保存后生效到数据库）`
					: `已从 models.dev 补全 ${matched} 个空价格（请保存后写入数据库）`,
			);
		} catch (syncError) {
			setError(
				syncError instanceof Error ? syncError.message : "同步 models.dev 价格失败",
			);
		} finally {
			setSyncingPrices(false);
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
		setModels((current) =>
			current.filter((model) => model.modelId !== modelId),
		);
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
					? {
							...model,
							sortOrder: orderMap.get(model.modelId) ?? model.sortOrder,
						}
					: model,
			);
		});
	};

	const addGatewayModel = (option: GatewayModelOption) => {
		if (existingIdsInCurrentCatalog.has(option.id)) return;

		const nextOrder = models.filter(
			(model) => model.uiProvider === activeProvider,
		).length;
		const nextModel = createModelFromGateway(
			option,
			activeProvider,
			nextOrder,
		);

		setModels((current) => {
			const existingIndex = current.findIndex(
				(model) => model.modelId === option.id,
			);
			if (existingIndex >= 0) {
				return current.map((model, index) =>
					index === existingIndex ? nextModel : model,
				);
			}
			return [...current, nextModel];
		});
		void fillPricesFromModelsDev([nextModel], true).catch(() => undefined);
	};

	return (
		<div className="space-y-6">
			{error ? (
				<div
					role="alert"
					className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive text-sm"
				>
					{error}
				</div>
			) : null}

			{success ? (
				<div className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-emerald-700 text-sm dark:text-emerald-300">
					{success}
				</div>
			) : null}

			<section>
				<div className="mb-4 flex flex-wrap items-center justify-between gap-3">
					<div>
						<h2 className="text-base font-semibold tracking-tight text-slate-900">
							模型目录
						</h2>
						<p className="mt-0.5 text-sm text-slate-500">
							已配置 {models.length} 个模型，其中{" "}
							{models.filter((model) => model.enabled).length} 个启用。空价格会自动对照
							models.dev 补全；点「同步」可覆盖已填价格，保存后写入数据库。
						</p>
					</div>
					<div className="flex flex-wrap items-center gap-2">
						<Button
							type="button"
							variant="outline"
							onClick={() => void handleSyncPrices(true)}
							disabled={syncingPrices || loading || models.length === 0}
						>
							{syncingPrices ? (
								<>
									<Loader2Icon className="size-4 animate-spin" />
									同步中…
								</>
							) : (
								"同步 models.dev 价格"
							)}
						</Button>
						<Button
							onClick={() => void handleSaveModels()}
							disabled={savingModels || loading}
						>
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

				<div className="flex flex-wrap gap-1 border-b border-slate-200">
					{PROVIDER_TABS.map((tab) => (
						<button
							key={tab.id}
							type="button"
							className={cn(
								"-mb-px border-b-2 px-3.5 py-2 text-sm transition-colors duration-150",
								activeProvider === tab.id
									? "border-blue-600 font-medium text-blue-700"
									: "border-transparent text-slate-500 hover:text-slate-800",
							)}
							onClick={() => setActiveProvider(tab.id)}
						>
							{tab.label}
						</button>
					))}
				</div>

				<div className="mt-4 overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
					<table className="min-w-full text-sm">
						<thead className="bg-slate-50/80 text-left text-slate-500">
							<tr>
								<th className="px-3 py-3 font-medium">启用</th>
								<th className="px-3 py-3 font-medium">Model ID</th>
								<th className="px-3 py-3 font-medium">名称</th>
								<th className="px-3 py-3 font-medium">描述</th>
								<th className="px-3 py-3 font-medium">Context</th>
								<th className="px-3 py-3 font-medium">Input $ / 1M</th>
								<th className="px-3 py-3 font-medium">Output $ / 1M</th>
								<th className="px-3 py-3 font-medium">Backend</th>
								<th className="px-3 py-3 font-medium">类型</th>
								<th className="px-3 py-3 font-medium">操作</th>
							</tr>
						</thead>
						<tbody>
							{loading ? (
								<tr>
									<td colSpan={10} className="px-4 py-10 text-center">
										<span className="inline-flex items-center gap-2 text-muted-foreground">
											<Loader2Icon className="size-4 animate-spin" />
											加载中…
										</span>
									</td>
								</tr>
							) : providerModels.length === 0 ? (
								<tr>
									<td
										colSpan={10}
										className="px-4 py-10 text-center text-muted-foreground"
									>
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
													updateModel(model.modelId, {
														enabled: event.target.checked,
													})
												}
												aria-label={`启用 ${model.modelId}`}
											/>
										</td>
										<td className="px-3 py-3 font-mono text-xs">
											{model.modelId}
										</td>
										<td className="px-3 py-3">
											<input
												className="h-9 min-w-32 rounded-md border bg-background px-2"
												value={model.name}
												onChange={(event) =>
													updateModel(model.modelId, {
														name: event.target.value,
													})
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
											<input
												type="number"
												min="0"
												step="0.01"
												className="h-9 w-24 rounded-md border bg-background px-2 font-mono text-xs"
												placeholder="—"
												value={model.inputPricePerMillion ?? ""}
												onChange={(event) =>
													updateModel(model.modelId, {
														inputPricePerMillion: parsePriceInput(
															event.target.value,
														),
													})
												}
												aria-label={`${model.modelId} input 价格`}
											/>
										</td>
										<td className="px-3 py-3">
											<input
												type="number"
												min="0"
												step="0.01"
												className="h-9 w-24 rounded-md border bg-background px-2 font-mono text-xs"
												placeholder="—"
												value={model.outputPricePerMillion ?? ""}
												onChange={(event) =>
													updateModel(model.modelId, {
														outputPricePerMillion: parsePriceInput(
															event.target.value,
														),
													})
												}
												aria-label={`${model.modelId} output 价格`}
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
														<span className="text-muted-foreground text-xs">
															—
														</span>
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
												const modelType = resolveModelType(
													model,
													gatewayTypeById,
												);
												return modelType ? (
													<span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs">
														{modelType}
													</span>
												) : (
													<span className="text-muted-foreground text-xs">
														—
													</span>
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

				<div className="mt-6 space-y-3 rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]">
					<div className="flex flex-wrap items-center gap-3">
						<h3 className="text-base font-semibold text-slate-900 tracking-tight">
							从网关添加模型
						</h3>
						<input
							className="h-9 min-w-48 flex-1 rounded-md border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
							value={gatewayFilter}
							onChange={(event) => setGatewayFilter(event.target.value)}
							onKeyDown={(event) => {
								if (event.key === "Enter" && gatewayModels.length === 0) {
									event.preventDefault();
									void handleLoadGatewayModels();
								}
							}}
							placeholder="按输入的 model id 过滤，不限当前厂商"
						/>
						<Button
							variant="outline"
							onClick={() => void handleLoadGatewayModels()}
							disabled={loadingGateway || loading}
						>
							{loadingGateway ? (
								<>
									<Loader2Icon className="size-4 animate-spin" />
									获取中…
								</>
							) : (
								<>
									<RefreshCwIcon className="size-4" />
									获取全部模型
								</>
							)}
						</Button>
					</div>

					<div className="max-h-72 overflow-y-auto rounded-xl border border-slate-200">
						{filteredGatewayModels.length === 0 ? (
							<p className="px-4 py-8 text-center text-muted-foreground text-sm">
								{gatewayModels.length === 0
									? "默认不拉取网关列表。可先输入关键词再获取，或直接获取全部模型。"
									: "没有匹配的模型"}
							</p>
						) : (
							<ul className="divide-y">
								{filteredGatewayModels.map((option) => {
									const added = existingIdsInCurrentCatalog.has(option.id);
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
