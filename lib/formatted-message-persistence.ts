import type {
  MessageFormatAdapter,
  MessageFormatItem,
  MessageStorageEntry,
} from "@assistant-ui/core";

/** Parents must be imported before children (MessageRepository.import). */
function orderMessagesForImport<TMessage>(
  items: MessageFormatItem<TMessage>[],
  getId: (message: TMessage) => string,
): MessageFormatItem<TMessage>[] {
  const byId = new Map(items.map((item) => [getId(item.message), item]));
  const ordered: MessageFormatItem<TMessage>[] = [];
  const visited = new Set<string>();

  const visit = (item: MessageFormatItem<TMessage>) => {
    const id = getId(item.message);
    if (visited.has(id)) return;
    if (item.parentId) {
      const parent = byId.get(item.parentId);
      if (parent) visit(parent);
    }
    visited.add(id);
    ordered.push(item);
  };

  for (const item of items) visit(item);
  return ordered;
}

function resolveHeadId<TMessage>(
  items: MessageFormatItem<TMessage>[],
  getId: (message: TMessage) => string,
): string | null {
  if (items.length === 0) return null;

  const referencedAsParent = new Set(
    items
      .map((item) => item.parentId)
      .filter((id): id is string => id != null),
  );
  const leaves = items.filter(
    (item) => !referencedAsParent.has(getId(item.message)),
  );
  const head =
    leaves.length > 0 ? leaves[leaves.length - 1]! : items[items.length - 1]!;
  return getId(head.message);
}

export type MessagePersistence = {
  append(
    threadId: string,
    messageId: string,
    parentId: string | null,
    format: string,
    content: Record<string, unknown>,
  ): Promise<void>;
  update?(
    threadId: string,
    messageId: string,
    format: string,
    content: Record<string, unknown>,
  ): Promise<void>;
  load(
    threadId: string,
    format: string,
  ): Promise<MessageStorageEntry<Record<string, unknown>>[]>;
};

export const createFormattedPersistence = <
  TMessage,
  TStorageFormat extends Record<string, unknown>,
>(
  persistence: MessagePersistence,
  adapter: MessageFormatAdapter<TMessage, TStorageFormat>,
) => ({
  append: async (threadId: string, item: MessageFormatItem<TMessage>) => {
    const messageId = adapter.getId(item.message);
    const encoded = adapter.encode(item);
    await persistence.append(
      threadId,
      messageId,
      item.parentId,
      adapter.format,
      encoded,
    );
  },
  update: persistence.update
    ? async (
        threadId: string,
        item: MessageFormatItem<TMessage>,
        messageId: string,
      ) => {
        const encoded = adapter.encode(item);
        await persistence.update!(
          threadId,
          messageId,
          adapter.format,
          encoded,
        );
      }
    : undefined,
  load: async (threadId: string) => {
    const messages = await persistence.load(threadId, adapter.format);
    const decoded = messages
      .filter((m) => m.format === adapter.format)
      .map((m) =>
        adapter.decode({
          id: m.id,
          parent_id: m.parent_id,
          format: m.format,
          content: m.content as TStorageFormat,
        }),
      );
    const ordered = orderMessagesForImport(decoded, adapter.getId);
    return {
      messages: ordered,
      headId: resolveHeadId(ordered, adapter.getId),
    };
  },
});
