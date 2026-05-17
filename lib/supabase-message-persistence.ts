import type { SupabaseClient } from "@supabase/supabase-js";
import type { MessagePersistence } from "@/lib/formatted-message-persistence";
import type { MessageStorageEntry } from "@assistant-ui/core";

export class SupabaseMessagePersistence implements MessagePersistence {
  constructor(private readonly supabase: SupabaseClient) {}

  private async requireUserId(): Promise<string> {
    const {
      data: { user },
      error,
    } = await this.supabase.auth.getUser();
    if (error || !user) {
      throw new Error("Not authenticated");
    }
    return user.id;
  }

  async append(
    threadId: string,
    messageId: string,
    parentId: string | null,
    format: string,
    content: Record<string, unknown>,
  ): Promise<void> {
    const userId = await this.requireUserId();

    const { error } = await this.supabase.from("messages").upsert(
      {
        id: messageId,
        thread_id: threadId,
        user_id: userId,
        parent_id: parentId,
        format,
        content,
      },
      { onConflict: "id,thread_id" },
    );

    if (error) throw error;

    await this.supabase
      .from("threads")
      .update({ last_message_at: new Date().toISOString() })
      .eq("id", threadId)
      .eq("user_id", userId);
  }

  async update(
    threadId: string,
    messageId: string,
    format: string,
    content: Record<string, unknown>,
  ): Promise<void> {
    const userId = await this.requireUserId();

    const { error } = await this.supabase
      .from("messages")
      .update({ content })
      .eq("id", messageId)
      .eq("thread_id", threadId)
      .eq("format", format)
      .eq("user_id", userId);

    if (error) throw error;
  }

  async load(
    threadId: string,
    format: string,
  ): Promise<MessageStorageEntry<Record<string, unknown>>[]> {
    const userId = await this.requireUserId();

    const { data, error } = await this.supabase
      .from("messages")
      .select("id, parent_id, format, content")
      .eq("thread_id", threadId)
      .eq("format", format)
      .eq("user_id", userId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return (data ?? []).map((row) => ({
      id: row.id,
      parent_id: row.parent_id,
      format: row.format,
      content: row.content as Record<string, unknown>,
    }));
  }
}
