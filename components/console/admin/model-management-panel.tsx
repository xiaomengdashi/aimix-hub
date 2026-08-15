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
import type { GatewayModelOption, ModelCatalogInput } from "@/lib/admin/types";
import { uiProviderForGatewayId } from "@/lib/ai-gateway/gateway-discovery";
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
	};
}

export const ModelManagementPanel: FC = () => {
	const [activeProvider, setActiveProvider] = useState<ModelUiScope>("chatgpt");
	const [models, setModels] = useState<EditableModel[]>([]);
	const [gatewayModels, setGatewayModels] = useState<GatewayModelOption[]>([]);
	const [gatewayFilter, setGatewayFilter] = useState("");
	const [loading, setLoading] = useState(true);
	const [savingModels, setSavingModels] = useState(false);
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
					.map((model) => [model.id, model.supportedEndpointTypes!] as const),
			),
		[gatewayModels],
	);

	const filteredGatewayModels = useMemo(() => {
		const query = gatewayFilter.trim().toLowerCase();
		const scoped = gatewayModels.filter((model) => {
			if (model.uiProvider && model.uiProvider !== activeProvider) return false;
			if (!query) return true;
			return model.id.toLowerCase().includes(query);
		});
		if (!query) return scoped;
		return [...scoped].sort((a, b) => {
			const aId = a.id.toLowerCase();
			const bId = b.id.toLowerCase();
			const rank = (id: string) => {
				if (id === query) return 0;
				if (id.startsWith(query)) return 1;
				return 2;
			};
			return rank(aId) - rank(bId) || aId.localeCompare(bId);
		});
	}, [gatewayFilter, gatewayModels, activeProvider]);

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
			const query = gatewayFilter.trim().toLowerCase();
			const matched = query
				? nextGateway.filter((model) => model.id.toLowerCase().includes(query))
						.length
				: nextGateway.length;
			setSuccess(
				query
					? `已获取 ${nextGateway.length} 个模型，按「${gatewayFilter.trim()}」匹配到 ${matched} 个`
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
		if (existingIds.has(option.id)) return;

		const uiProvider = option.uiProvider ?? uiProviderForGatewayId(option.id);
		const nextOrder = models.filter(
			(model) => model.uiProvider === uiProvider,
		).length;

		setModels((current) => [
			...current,
			createModelFromGateway(option, uiProvider, nextOrder),
		]);
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
							{models.filter((model) => model.enabled).length} 个启用
						</p>
					</div>
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
									<td
										colSpan={8}
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
							placeholder="输入 model id，优先按此匹配"
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
