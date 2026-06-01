"use client";

import { useAuiState } from "@assistant-ui/store";
import { ListTree, XIcon } from "lucide-react";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FC,
} from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  collectThreadQuestionOutline,
  OUTLINE_PANEL_WIDTH,
  type ThreadQuestionOutlineItem,
} from "@/lib/chat/thread-question-outline";
import { useArtifactStore } from "@/lib/artifacts/artifact-store";
import { cn } from "@/lib/utils";

/** 右侧边缘悬停热区宽度（px） */
const OUTLINE_EDGE_HIT_WIDTH = 14;

function scrollToQuestionAnchor(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

const QuestionOutlineList: FC<{
  items: ThreadQuestionOutlineItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
}> = ({ items, activeId, onSelect }) => {
  if (items.length === 0) {
    return (
      <p className="px-3 py-6 text-center text-muted-foreground text-xs leading-relaxed">
        发送第一条消息后，这里会按每次提问列出目录。
      </p>
    );
  }

  return (
    <ol className="flex flex-col gap-0.5 px-2 pb-4">
      {items.map((item) => (
        <li key={item.id}>
          <button
            type="button"
            onClick={() => onSelect(item.id)}
            className={cn(
              "flex w-full gap-2 rounded-md px-2 py-1.5 text-start text-xs leading-snug transition-colors",
              activeId === item.id
                ? "bg-[#c96442]/12 font-medium text-[#c96442] dark:bg-[#c96442]/20 dark:text-[#f0c4b5]"
                : "text-[#5b5950] hover:bg-[#1a1a18]/5 hover:text-[#1a1a18] dark:text-[#a3a098] dark:hover:bg-white/5 dark:hover:text-[#eee]",
            )}
            title={item.label}
          >
            <span
              className={cn(
                "mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full font-medium text-[10px] tabular-nums",
                activeId === item.id
                  ? "bg-[#c96442]/20 text-[#c96442] dark:bg-[#c96442]/30 dark:text-[#f0c4b5]"
                  : "bg-[#1a1a18]/6 text-[#8a8780] dark:bg-white/10 dark:text-[#a3a098]",
              )}
              aria-hidden
            >
              {item.index}
            </span>
            <span className="line-clamp-3 min-w-0 flex-1">{item.label}</span>
          </button>
        </li>
      ))}
    </ol>
  );
};

const OutlinePanelChrome: FC<{
  items: ThreadQuestionOutlineItem[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onClose?: () => void;
  className?: string;
}> = ({ items, activeId, onSelect, onClose, className }) => (
  <div className={cn("flex h-full min-h-0 flex-col", className)}>
    <div className="flex shrink-0 items-center justify-between border-[#E5E0D6] border-b px-3 py-2.5 dark:border-[#3d3a35]">
      <div className="flex min-w-0 flex-col gap-0.5">
        <div className="flex items-center gap-2">
          <ListTree className="size-4 shrink-0 text-[#c96442]" aria-hidden />
          <span className="font-medium text-sm">提问目录</span>
        </div>
        <p className="text-[#8a8780] text-[11px] dark:text-[#a3a098]">
          共 {items.length} 次提问
        </p>
      </div>
      {onClose ? (
        <button
          type="button"
          onClick={onClose}
          className="flex size-8 shrink-0 items-center justify-center rounded-md text-[#5b5950] transition-colors hover:bg-[#1a1a18]/5 dark:text-[#a3a098] dark:hover:bg-white/5"
          aria-label="关闭提问目录"
        >
          <XIcon className="size-4" />
        </button>
      ) : null}
    </div>
    <nav
      aria-label="提问目录"
      className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain"
    >
      <QuestionOutlineList
        items={items}
        activeId={activeId}
        onSelect={onSelect}
      />
    </nav>
  </div>
);

function useThreadQuestionOutline(): ThreadQuestionOutlineItem[] {
  const messages = useAuiState((s) => s.thread.messages);
  const isEmpty = useAuiState((s) => s.thread.isEmpty);
  if (isEmpty) return [];
  return collectThreadQuestionOutline(messages);
}

function useActiveQuestionOutlineId(
  items: ThreadQuestionOutlineItem[],
): string | null {
  const [activeId, setActiveId] = useState<string | null>(null);
  const itemsKey = items.map((item) => item.id).join("|");

  useEffect(() => {
    if (items.length === 0) {
      setActiveId(null);
      return;
    }

    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((el): el is HTMLElement => el != null);

    if (elements.length === 0) {
      setActiveId(items[0]?.id ?? null);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) {
          setActiveId(visible[0].target.id);
        }
      },
      {
        root: null,
        rootMargin: "-15% 0px -55% 0px",
        threshold: [0, 0.1, 0.5, 1],
      },
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [items, itemsKey]);

  return activeId;
}

const DesktopThreadOutlinePanel: FC = () => {
  const items = useThreadQuestionOutline();
  const isEmpty = useAuiState((s) => s.thread.isEmpty);
  const artifactOpen = useArtifactStore((s) => s.panelOpen);
  const activeId = useActiveQuestionOutlineId(items);
  const [hovered, setHovered] = useState(false);
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSelect = useCallback((id: string) => {
    scrollToQuestionAnchor(id);
  }, []);

  const showPanel = useCallback(() => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    setHovered(true);
  }, []);

  const scheduleHidePanel = useCallback(() => {
    hideTimerRef.current = setTimeout(() => {
      setHovered(false);
      hideTimerRef.current = null;
    }, 160);
  }, []);

  useEffect(() => {
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current);
    };
  }, []);

  if (isEmpty || artifactOpen || items.length === 0) return null;

  return (
    <div
      className="absolute inset-y-0 right-0 z-10 hidden lg:block"
      style={{
        width: hovered ? OUTLINE_PANEL_WIDTH : OUTLINE_EDGE_HIT_WIDTH,
      }}
      onMouseEnter={showPanel}
      onMouseLeave={scheduleHidePanel}
    >
      {!hovered ? (
        <div
          className="pointer-events-none absolute inset-y-0 right-0 w-[14px] bg-linear-to-l from-[#1a1a18]/6 to-transparent dark:from-white/8"
          aria-hidden
        />
      ) : null}
      <aside
        className={cn(
          "absolute inset-y-0 right-0 flex h-full flex-col overflow-hidden border-[#E5E0D6] border-s bg-[#F0ECE0]/95 shadow-lg backdrop-blur-sm transition-[transform,opacity] duration-200 ease-out dark:border-[#3d3a35] dark:bg-[#2b2a27]/95",
          hovered
            ? "w-[var(--outline-panel-width)] translate-x-0 opacity-100"
            : "pointer-events-none w-[var(--outline-panel-width)] translate-x-full opacity-0",
        )}
        style={
          {
            "--outline-panel-width": `${OUTLINE_PANEL_WIDTH}px`,
          } as CSSProperties
        }
        aria-hidden={!hovered}
      >
        {hovered ? (
          <OutlinePanelChrome
            items={items}
            activeId={activeId}
            onSelect={handleSelect}
          />
        ) : null}
      </aside>
    </div>
  );
};

const MobileThreadOutlineTrigger: FC = () => {
  const items = useThreadQuestionOutline();
  const isEmpty = useAuiState((s) => s.thread.isEmpty);
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const activeId = useActiveQuestionOutlineId(items);

  const handleSelect = useCallback((id: string) => {
    scrollToQuestionAnchor(id);
    setOpen(false);
  }, []);

  if (!isMobile || isEmpty || items.length === 0) return null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-24 z-30 flex items-center gap-1.5 rounded-full border border-[#E5E0D6] bg-white/95 px-3 py-2 text-[#1a1a18] text-xs shadow-md backdrop-blur-sm lg:hidden dark:border-[#3d3a35] dark:bg-[#1f1e1b]/95 dark:text-[#eee]"
        aria-label="打开提问目录"
      >
        <ListTree className="size-3.5" />
        提问
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="right"
          className="flex w-[min(100vw,280px)] flex-col p-0"
        >
          <SheetHeader className="sr-only">
            <SheetTitle>提问目录</SheetTitle>
            <SheetDescription>跳转到某次用户提问</SheetDescription>
          </SheetHeader>
          <OutlinePanelChrome
            items={items}
            activeId={activeId}
            onSelect={handleSelect}
            onClose={() => setOpen(false)}
            className="pt-2"
          />
        </SheetContent>
      </Sheet>
    </>
  );
};

export const ThreadOutlinePanel: FC = () => (
  <>
    <DesktopThreadOutlinePanel />
    <MobileThreadOutlineTrigger />
  </>
);

export { OUTLINE_PANEL_WIDTH };
