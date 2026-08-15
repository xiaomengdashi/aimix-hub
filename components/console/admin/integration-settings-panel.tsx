"use client";

import { Loader2Icon } from "lucide-react";
import { useCallback, useEffect, useState, type FC } from "react";
import type { AdminIntegrationSettings } from "@/lib/admin/types";
import { Button } from "@/components/ui/button";

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

	return (
		<div className="space-y-4">
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

			<div className="grid gap-4 md:grid-cols-2">
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

			<div className="flex flex-wrap gap-2">
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
		</div>
	);
};
