"use client";

import type * as React from "react";
import { useChatModel } from "@/components/assistant-ui/contexts/chat-model-context";
import { ModelBrandIcon } from "@/components/assistant-ui/providers/shared/model-brand-icon";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { ProviderSwitch } from "@/components/assistant-ui/providers/shared/provider-switch";
import { OtherThreadList } from "@/components/assistant-ui/providers/other/thread-list";
import { useChatAiProvider } from "@/components/assistant-ui/contexts/chat-ui-theme-context";
import { getProviderDisplayName } from "@/lib/chat/provider";

export function OtherThreadListSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { provider } = useChatAiProvider();
  const { model } = useChatModel();
  const providerLabel = getProviderDisplayName(provider);

  return (
    <Sidebar {...props}>
      <SidebarHeader className="aui-sidebar-header mb-2 border-b">
        <div className="aui-sidebar-header-content flex items-center justify-between">
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton size="lg" className="pointer-events-none">
                <div className="aui-sidebar-header-icon-wrapper flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                  <ModelBrandIcon
                    modelId={model}
                    uiProvider="other"
                    className="size-4"
                  />
                </div>
                <div className="aui-sidebar-header-heading flex flex-col gap-0.5 leading-none">
                  <span className="aui-sidebar-header-title font-semibold">
                    {providerLabel}
                  </span>
                  <span className="text-muted-foreground text-xs">
                    会话仅属于当前 AI
                  </span>
                </div>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarHeader>
      <SidebarContent className="aui-sidebar-content px-2">
        <OtherThreadList />
      </SidebarContent>
      <SidebarFooter className="aui-sidebar-footer border-t">
        <ProviderSwitch fullWidth />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
