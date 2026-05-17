"use client";

import type { SyntaxHighlighterProps } from "@assistant-ui/react-markdown";
import mermaid from "mermaid";
import {
  useEffect,
  useId,
  useRef,
  useState,
  type FC,
} from "react";

import { cn } from "@/lib/utils";

const RENDER_DEBOUNCE_MS = 400;

function usePrefersDark() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const root = document.documentElement;
    const media = window.matchMedia("(prefers-color-scheme: dark)");

    const update = () => {
      setIsDark(root.classList.contains("dark") || media.matches);
    };

    update();
    media.addEventListener("change", update);
    const observer = new MutationObserver(update);
    observer.observe(root, { attributes: true, attributeFilter: ["class"] });

    return () => {
      media.removeEventListener("change", update);
      observer.disconnect();
    };
  }, []);

  return isDark;
}

function configureMermaid(isDark: boolean) {
  mermaid.initialize({
    startOnLoad: false,
    theme: isDark ? "dark" : "default",
    securityLevel: "strict",
    fontFamily: "inherit",
  });
}

export const MermaidDiagram: FC<
  Omit<SyntaxHighlighterProps, "node" | "components">
> = ({ code }) => {
  const baseId = useId().replace(/:/g, "");
  const containerRef = useRef<HTMLDivElement>(null);
  const renderCounterRef = useRef(0);
  const isDark = usePrefersDark();
  const [hasRendered, setHasRendered] = useState(false);
  const [showSource, setShowSource] = useState(false);

  useEffect(() => {
    const trimmed = code.trim();
    const container = containerRef.current;
    if (!trimmed || !container) return;

    setShowSource(false);
    let cancelled = false;

    const timer = window.setTimeout(async () => {
      configureMermaid(isDark);
      const renderId = `aui-mermaid-${baseId}-${++renderCounterRef.current}`;

      try {
        const { svg, bindFunctions } = await mermaid.render(renderId, trimmed);
        if (cancelled) return;

        container.innerHTML = svg;
        bindFunctions?.(container);
        setHasRendered(true);
        setShowSource(false);
      } catch {
        if (cancelled) return;
        setShowSource(true);
      }
    }, RENDER_DEBOUNCE_MS);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [baseId, code, isDark]);

  if (showSource) {
    return (
      <pre
        className="aui-mermaid-fallback overflow-x-auto rounded-b-lg border border-border/50 border-t-0 bg-muted/30 p-3 font-mono text-xs leading-relaxed whitespace-pre-wrap"
      >
        {code.trim()}
      </pre>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "aui-mermaid overflow-x-auto rounded-b-lg border border-border/50 border-t-0 bg-muted/30 p-3",
        !hasRendered && "min-h-24 animate-pulse",
        "[&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-full",
      )}
      aria-busy={!hasRendered}
    ></div>
  );
};

MermaidDiagram.displayName = "MermaidDiagram";
