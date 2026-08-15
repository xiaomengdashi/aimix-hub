"use client";

import { CheckCircle2Icon, Loader2Icon, PlugZapIcon } from "lucide-react";
import { useCallback, useEffect, useState, type FC } from "react";
import type { AdminIntegrationSettings } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";
import { ConsoleSection } from "@/components/console/console-section";

const inputClassName =
	"h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-100";

function formatDate(iso: string | null): string {
	if (!iso) return "—";
	return new Date(iso).toLocaleString("zh-CN", {
		dateStyle: "medium",
		timeStyle: "short",
	});
}

export const IntegrationSettingsPanel: FC = () => {
	const [settings, setSettings] = useState<AdminIntegrationSettings | null>(
		null,
	);
	const [loading, setLoading] = useState(true);
	const [savingSettings, setSavingSettings] = useState(false);
	const [testingConnection, setTestingConnection] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);
	const [aiBaseUrl, setAiBaseUrl] = useState("https://yunwu.ai/v1");
	const [aiApiKey, setAiApiKey] = useState("");
	const [tavilyBaseUrl, setTavilyBaseUrl] = useState("https://api.tavily.com");
	const [tavilyApiKey, setTavilyApiKey] = useState("");

	const loadSettings = useCallback(async () => {
		setLoading(true);
		setError(null);

		try {
			const response = await fetch("/api/admin/integration");
			const payload = (await response.json()) as {
				settings?: AdminIntegrationSettings;
				error?: string;
			};
			if (!response.ok) {
				throw new Error(payload.error ?? "加载网关配置失败");
			}
			setSettings(payload.settings ?? null);
			setAiBaseUrl(payload.settings?.aiBaseUrl ?? "https://yunwu.ai/v1");
			setTavilyBaseUrl(
				payload.settings?.tavilyBaseUrl ?? "https://api.tavily.com",
			);
		} catch (loadError) {
			setError(
				loadError instanceof Error ? loadError.message : "加载网关配置失败",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadSettings();
	}, [loadSettings]);

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
			setError(testError instanceof Error ? testError.message : "连接测试失败");
		} finally {
			setTestingConnection(false);
		}
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center rounded-2xl border border-slate-200/80 bg-white px-6 py-16 text-slate-500">
				<Loader2Icon className="mr-2 size-4 animate-spin" aria-hidden />
				正在加载配置…
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{error ? (
				<div
					role="alert"
					className="rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-700"
				>
					{error}
				</div>
			) : null}
			{success ? (
				<div className="rounded-xl border border-emerald-200 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-700">
					{success}
				</div>
			) : null}

			<div className="grid gap-3 sm:grid-cols-3">
				{[
					{
						id: "ai-key",
						label: "AI API Key",
						ok: settings?.aiApiKeyConfigured ?? false,
					},
					{
						id: "tavily-key",
						label: "Tavily API Key",
						ok: settings?.tavilyApiKeyConfigured ?? false,
					},
					{
						id: "updated-at",
						label: "最后更新",
						ok: true,
						detail: formatDate(settings?.updatedAt ?? null),
					},
				].map((item) => (
					<div
						key={item.id}
						aria-label={`${item.label}：${item.detail ?? (item.ok ? "已配置" : "未配置")}`}
						className="flex items-center gap-3 rounded-xl border border-slate-200/80 bg-white px-4 py-3"
					>
						{item.ok ? (
							<CheckCircle2Icon
								className="size-4 shrink-0 text-emerald-600"
								aria-hidden
							/>
						) : (
							<PlugZapIcon
								className="size-4 shrink-0 text-amber-500"
								aria-hidden
							/>
						)}
						<div className="min-w-0">
							<p className="text-xs text-slate-400">{item.label}</p>
							<p className="truncate text-sm font-medium text-slate-800">
								{item.detail ?? (item.ok ? "已配置" : "未配置")}
							</p>
						</div>
					</div>
				))}
			</div>

			<ConsoleSection
				title="AI 网关"
				description="对话与绘图请求统一经过此网关。"
				action={
					<Button
						variant="outline"
						onClick={() => void handleTestConnection()}
						disabled={testingConnection}
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
				}
			>
				<div className="grid gap-4 md:grid-cols-2">
					<label className="space-y-2 text-sm">
						<span className="font-medium text-slate-800">AI Base URL</span>
						<input
							className={inputClassName}
							value={aiBaseUrl}
							onChange={(event) => setAiBaseUrl(event.target.value)}
							placeholder="https://yunwu.ai/v1"
						/>
					</label>
					<label className="space-y-2 text-sm">
						<span className="font-medium text-slate-800">AI API Key</span>
						<input
							type="password"
							className={inputClassName}
							value={aiApiKey}
							onChange={(event) => setAiApiKey(event.target.value)}
							placeholder={
								settings?.aiApiKeyConfigured
									? "已配置，留空则不修改"
									: "请输入 AI 网关 API Key"
							}
						/>
					</label>
				</div>
			</ConsoleSection>

			<ConsoleSection
				title="联网搜索"
				description="对话中的 Tavily 联网搜索使用以下配置。"
			>
				<div className="grid gap-4 md:grid-cols-2">
					<label className="space-y-2 text-sm">
						<span className="font-medium text-slate-800">Tavily Base URL</span>
						<input
							className={inputClassName}
							value={tavilyBaseUrl}
							onChange={(event) => setTavilyBaseUrl(event.target.value)}
							placeholder="https://api.tavily.com"
						/>
					</label>
					<label className="space-y-2 text-sm">
						<span className="font-medium text-slate-800">Tavily API Key</span>
						<input
							type="password"
							className={inputClassName}
							value={tavilyApiKey}
							onChange={(event) => setTavilyApiKey(event.target.value)}
							placeholder={
								settings?.tavilyApiKeyConfigured
									? "已配置，留空则不修改"
									: "请输入 Tavily API Key"
							}
						/>
					</label>
				</div>
			</ConsoleSection>

			<div className="flex justify-end">
				<Button
					onClick={() => void handleSaveSettings()}
					disabled={savingSettings}
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
			</div>
		</div>
	);
};
