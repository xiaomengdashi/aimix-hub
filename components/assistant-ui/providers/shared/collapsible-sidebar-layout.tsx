"use client";

import { PanelLeft } from "lucide-react";
import { useEffect, useState, type FC, type ReactNode } from "react";
import { ProviderSwitch } from "@/components/assistant-ui/providers/shared/provider-switch";
import type { ProviderSwitchVariant } from "@/components/assistant-ui/providers/shared/provider-switch-styles";
import { UserMenu } from "@/components/auth/user-menu";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type CollapsibleSidebarLayoutProps = {
  displayUsername: string;
  chatError: string | null;
  children: ReactNode;
  brand: ReactNode;
  threadList: ReactNode;
  switchVariant: ProviderSwitchVariant;
  shellClassName: string;
  sidebarPanelClassName?: string;
  sidebarBorderClassName: string;
  sheetClassName: string;
  headerButtonClassName: string;
  alertClassName: string;
  footerBorderClassName: string;
};

export const CollapsibleSidebarLayout: FC<CollapsibleSidebarLayoutProps> = ({
  displayUsername,
  chatError,
  children,
  brand,
  threadList,
  switchVariant,
  shellClassName,
  sidebarPanelClassName,
  sidebarBorderClassName,
  sheetClassName,
  headerButtonClassName,
  alertClassName,
  footerBorderClassName,
}) => {
  const isMobile = useIsMobile();
  const [desktopOpen, setDesktopOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const sidebarOpen = isMobile ? mobileOpen : desktopOpen;

  useEffect(() => {
    if (isMobile) setMobileOpen(false);
  }, [isMobile]);

  const toggleSidebar = () => {
    if (isMobile) setMobileOpen((open) => !open);
    else setDesktopOpen((open) => !open);
  };

  const sidebarPanel = (
    <div className={cn("flex h-full min-h-0 flex-col", sidebarPanelClassName)}>
      <div className="flex items-center gap-2 px-3 py-3">
        {brand}
      </div>
      <div className="flex min-h-0 flex-1 flex-col px-2 pb-2">
        {threadList}
      </div>
      <div
        className={cn(
          "mt-auto shrink-0 border-t px-2 py-3",
          footerBorderClassName,
        )}
      >
        <ProviderSwitch variant={switchVariant} fullWidth />
      </div>
    </div>
  );

  return (
    <div className={cn("flex h-dvh w-full", shellClassName)}>
      <aside
        className={cn(
          "hidden h-full shrink-0 flex-col border-r transition-[width] duration-200 md:flex",
          sidebarBorderClassName,
          desktopOpen ? "w-[260px]" : "w-0 overflow-hidden border-r-0",
        )}
      >
        {sidebarPanel}
      </aside>

      <Sheet
        open={isMobile && mobileOpen}
        onOpenChange={(open) => {
          if (isMobile) setMobileOpen(open);
        }}
      >
        <SheetContent
          side="left"
          className={cn(
            "flex h-full w-[min(100vw,260px)] flex-col p-0 [&>button]:hidden",
            sheetClassName,
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>会话列表</SheetTitle>
            <SheetDescription>浏览与切换对话</SheetDescription>
          </SheetHeader>
          {sidebarPanel}
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-14 shrink-0 items-center gap-2 px-3">
          <button
            type="button"
            onClick={toggleSidebar}
            className={cn(
              "flex size-9 items-center justify-center rounded-md transition-colors",
              headerButtonClassName,
            )}
            aria-label={sidebarOpen ? "收起侧边栏" : "展开侧边栏"}
          >
            <PanelLeft className="size-4" />
          </button>
          <UserMenu displayName={displayUsername} />
        </header>
        {chatError ? (
          <div
            role="alert"
            className={cn("mx-3 mb-2 rounded-lg px-4 py-2 text-sm", alertClassName)}
          >
            {chatError}
          </div>
        ) : null}
        <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </div>
  );
};
