"use client";

import { Loader2, Sparkles } from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FC,
  type FormEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { Button } from "@/components/ui/button";
import type { ChatModel } from "@/lib/chat/models";
import {
  DEFAULT_IMAGE_PARAMS,
  getImageSizesForModel,
  IMAGE_FORMATS,
  IMAGE_QUALITIES,
  IMAGE_SIZE_CONSTRAINTS,
  IMAGE_SIZE_GROUPS,
  IMAGE_STUDIO_STORAGE_KEY,
  isValidImageSizeForModel,
  type ImageFormat,
  type ImageGenerationParams,
  type ImageQuality,
  type ImageSize,
} from "@/lib/image-generation/settings";
import { cn } from "@/lib/utils";

type ImageStudioControlPanelProps = {
  models: ChatModel[];
  modelsLoading: boolean;
  isGenerating: boolean;
  prompt: string;
  onPromptChange: (value: string) => void;
  promptInputRef?: RefObject<HTMLTextAreaElement | null>;
  onGenerate: (params: ImageGenerationParams) => void;
};

type StoredSettings = Omit<ImageGenerationParams, "prompt">;

function loadStoredSettings(): StoredSettings {
  if (typeof window === "undefined") return DEFAULT_IMAGE_PARAMS;
  try {
    const raw = localStorage.getItem(IMAGE_STUDIO_STORAGE_KEY);
    if (!raw) return DEFAULT_IMAGE_PARAMS;
    return { ...DEFAULT_IMAGE_PARAMS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_IMAGE_PARAMS;
  }
}

function saveStoredSettings(settings: StoredSettings) {
  localStorage.setItem(IMAGE_STUDIO_STORAGE_KEY, JSON.stringify(settings));
}

const selectClass =
  "h-10 w-full rounded-xl border border-[#d4e4ff] bg-[#f7faff] px-3 text-sm text-[#0d3b8c] outline-none focus:border-[#a78bfa] focus:ring-2 focus:ring-[#7c3aed]/30 dark:border-[#3d4f6f] dark:bg-[#1a2332] dark:text-[#b8d4ff]";

function optionClass(active: boolean) {
  return cn(
    "flex flex-col items-start rounded-xl border px-3 py-2 text-left text-sm transition-colors",
    active
      ? "border-[#7c3aed] bg-[#ede9fe] text-[#5b21b6] dark:border-[#8b5cf6] dark:bg-[#2e1065]/40 dark:text-[#ddd6fe]"
      : "border-[#d4e4ff] bg-white text-[#3d5a8c] hover:bg-[#e6efff] dark:border-[#3d4f6f] dark:bg-[#1a2332] dark:text-[#8ab4f8] dark:hover:bg-[#243044]",
  );
}

const Field: FC<{ label: string; children: ReactNode }> = ({ label, children }) => (
  <section>
    <label className="mb-1.5 block font-medium text-[#3d5a8c] text-xs dark:text-[#8ab4f8]">
      {label}
    </label>
    {children}
  </section>
);

export const ImageStudioControlPanel: FC<ImageStudioControlPanelProps> = ({
  models,
  modelsLoading,
  isGenerating,
  prompt,
  onPromptChange,
  promptInputRef,
  onGenerate,
}) => {
  const [settings, setSettings] = useState<StoredSettings>(DEFAULT_IMAGE_PARAMS);

  useEffect(() => {
    setSettings(loadStoredSettings());
  }, []);

  useEffect(() => {
    if (models.length && !models.some((m) => m.id === settings.model)) {
      const nextModel = models[0]!.id;
      const sizes = getImageSizesForModel(nextModel);
      setSettings((s) => ({
        ...s,
        model: nextModel,
        size: sizes[0]?.value ?? s.size,
      }));
    }
  }, [models, settings.model]);

  useEffect(() => {
    if (isValidImageSizeForModel(settings.model, settings.size)) return;
    const sizes = getImageSizesForModel(settings.model);
    if (sizes[0]) {
      setSettings((s) => ({ ...s, size: sizes[0]!.value }));
    }
  }, [settings.model, settings.size]);

  const sizeOptions = getImageSizesForModel(settings.model);

  const sizeOptionGroups = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, (typeof sizeOptions)[number][]>();
    for (const s of sizeOptions) {
      const g = s.group ?? "other";
      if (!map.has(g)) {
        map.set(g, []);
        order.push(g);
      }
      map.get(g)!.push(s);
    }
    return order.map((group) => ({ group, items: map.get(group)! }));
  }, [sizeOptions]);

  const updateSettings = useCallback((patch: Partial<StoredSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      saveStoredSettings(next);
      return next;
    });
  }, []);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isGenerating) return;
    onGenerate({ ...settings, prompt: trimmed });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex h-full min-h-0 flex-col bg-white/90 lg:border-l lg:border-[#d4e4ff]/80 dark:bg-[#121820]/95 dark:lg:border-[#2a3a52]"
    >
      <header className="border-b border-[#d4e4ff]/60 px-4 py-3 dark:border-[#2a3a52]">
        <h2 className="font-semibold text-[#0d3b8c] text-sm dark:text-[#b8d4ff]">
          创作参数
        </h2>
        <p className="mt-0.5 text-[#6b8fc7] text-xs">每次生成将创建新会话</p>
      </header>

      <section className="flex-1 space-y-4 overflow-y-auto px-4 py-4">
        <Field label="模型">
          <select
            value={settings.model}
            disabled={modelsLoading || isGenerating}
            onChange={(e) => updateSettings({ model: e.target.value })}
            className={selectClass}
          >
            {models.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </Field>

        <Field label="输出尺寸">
          <section className="flex flex-col gap-3">
            {sizeOptionGroups.map(({ group, items }) => (
              <div key={group} className="flex flex-col gap-2">
                {IMAGE_SIZE_GROUPS[group] ? (
                  <p className="text-[#6b8fc7] text-[10px] font-medium uppercase tracking-wide">
                    {IMAGE_SIZE_GROUPS[group]}
                  </p>
                ) : null}
                {items.map((s) => (
                  <button
                    key={s.value}
                    type="button"
                    disabled={isGenerating}
                    onClick={() => updateSettings({ size: s.value as ImageSize })}
                    className={optionClass(settings.size === s.value)}
                  >
                    <span className="flex w-full items-baseline justify-between gap-2">
                      <span>
                        <span className="font-medium">{s.label}</span>
                        <span className="ms-1.5 text-xs opacity-70">{s.subtitle}</span>
                      </span>
                      <span className="shrink-0 text-xs opacity-70">{s.pixels}</span>
                    </span>
                  </button>
                ))}
              </div>
            ))}
          </section>
          <p className="mt-1.5 text-[#6b8fc7] text-xs leading-relaxed">
            MP 为宽×高总像素。自定义尺寸须满足：单边 ≤{" "}
            {IMAGE_SIZE_CONSTRAINTS.maxEdgePx}px、{IMAGE_SIZE_CONSTRAINTS.alignPx}px
            对齐、长宽比 ≤ {IMAGE_SIZE_CONSTRAINTS.maxAspectRatio}:1、总像素在约{" "}
            {(IMAGE_SIZE_CONSTRAINTS.minTotalPixels / 1_000_000).toFixed(2)}–
            {(IMAGE_SIZE_CONSTRAINTS.maxTotalPixels / 1_000_000).toFixed(1)} MP。
          </p>
        </Field>

        <Field label="质量">
          <section className="grid grid-cols-2 gap-2">
            {IMAGE_QUALITIES.map((q) => (
              <button
                key={q.value}
                type="button"
                disabled={isGenerating}
                onClick={() =>
                  updateSettings({ quality: q.value as ImageQuality })
                }
                className={optionClass(settings.quality === q.value)}
              >
                <span className="font-medium">{q.label}</span>
              </button>
            ))}
          </section>
        </Field>

        <Field label="输出格式">
          <section className="grid grid-cols-3 gap-2">
            {IMAGE_FORMATS.map((f) => (
              <button
                key={f.value}
                type="button"
                disabled={isGenerating}
                onClick={() =>
                  updateSettings({ format: f.value as ImageFormat })
                }
                className={optionClass(settings.format === f.value)}
              >
                {f.label}
              </button>
            ))}
          </section>
        </Field>

        <Field label="提示词">
          <textarea
            ref={promptInputRef}
            value={prompt}
            onChange={(e) => onPromptChange(e.target.value)}
            disabled={isGenerating}
            rows={6}
            placeholder="描述画面主体、风格、光线、构图…"
            className="w-full resize-none rounded-xl border border-[#d4e4ff] bg-[#f7faff] px-3 py-2.5 text-[#0d3b8c] text-sm outline-none placeholder:text-[#6b8fc7] focus:border-[#a78bfa] focus:ring-2 focus:ring-[#7c3aed]/30 dark:border-[#3d4f6f] dark:bg-[#1a2332] dark:text-[#b8d4ff]"
          />
        </Field>
      </section>

      <footer className="shrink-0 border-t border-[#d4e4ff]/60 p-4 dark:border-[#2a3a52]">
        <Button
          type="submit"
          disabled={isGenerating || !prompt.trim() || modelsLoading}
          className="h-11 w-full bg-gradient-to-r from-[#7c3aed] via-[#db2777] to-[#0891b2] text-white hover:opacity-95"
        >
          {isGenerating ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              生成中…
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              生成图像（新会话）
            </>
          )}
        </Button>
      </footer>
    </form>
  );
};
