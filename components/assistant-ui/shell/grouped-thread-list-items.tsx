"use client";

import { Fragment, useMemo, type ComponentType, type FC } from "react";
import { ThreadListPrimitive, useAuiState } from "@assistant-ui/react";
import { cn } from "@/lib/utils";
import { groupThreadIndicesByTime } from "@/lib/chat/thread-time-groups";

type GroupedThreadListItemsProps = {
  ThreadListItem: ComponentType;
  labelClassName?: string;
};

export const GroupedThreadListItems: FC<GroupedThreadListItemsProps> = ({
  ThreadListItem,
  labelClassName,
}) => {
  const threadIds = useAuiState((s) => s.threads.threadIds);
  const threadItems = useAuiState((s) => s.threads.threadItems);

  const groups = useMemo(() => {
    const itemsById = new Map(threadItems.map((item) => [item.id, item]));
    return groupThreadIndicesByTime(
      threadIds.map((id) => itemsById.get(id)),
    );
  }, [threadIds, threadItems]);

  return groups.map((group) => (
    <Fragment key={group.label}>
      <div
        role="separator"
        data-slot="aui_thread-list-group-label"
        className={cn(
          "px-3 pt-3 pb-1 text-xs font-medium text-muted-foreground",
          labelClassName,
        )}
      >
        {group.label}
      </div>
      {group.indices.map((index) => (
        <ThreadListPrimitive.ItemByIndex
          key={threadIds[index]}
          index={index}
          components={{ ThreadListItem }}
        />
      ))}
    </Fragment>
  ));
};
