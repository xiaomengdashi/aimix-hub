"use client";

import {
  ArrowLeftIcon,
  Loader2Icon,
  ShieldCheckIcon,
  Trash2Icon,
  UsersIcon,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState, type FC } from "react";
import type { ManagedUser } from "@/lib/admin/types";
import {
  APP_USER_ROLE_LABELS,
  type AppUserRole,
} from "@/lib/auth/roles";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

type UserManagementPanelProps = {
  currentUserId: string;
};

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("zh-CN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export const UserManagementPanel: FC<UserManagementPanelProps> = ({
  currentUserId,
}) => {
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [pendingDeleteUser, setPendingDeleteUser] = useState<ManagedUser | null>(
    null,
  );

  const loadUsers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/users");
      const payload = (await response.json()) as {
        users?: ManagedUser[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "加载用户列表失败");
      }

      setUsers(payload.users ?? []);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "加载用户列表失败",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadUsers();
  }, [loadUsers]);

  const handleRoleChange = async (userId: string, role: AppUserRole) => {
    setUpdatingUserId(userId);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "更新角色失败");
      }

      setUsers((current) =>
        current.map((user) =>
          user.id === userId ? { ...user, role } : user,
        ),
      );
    } catch (updateError) {
      setError(
        updateError instanceof Error
          ? updateError.message
          : "更新角色失败",
      );
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeleteUser = async (user: ManagedUser) => {
    setDeletingUserId(user.id);
    setError(null);

    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      const payload = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(payload.error ?? "删除用户失败");
      }

      setUsers((current) => current.filter((item) => item.id !== user.id));
      setPendingDeleteUser(null);
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "删除用户失败",
      );
    } finally {
      setDeletingUserId(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" size="sm" className="-ms-2 gap-1.5" asChild>
          <Link href="/account">
            <ArrowLeftIcon className="size-4" />
            返回个人中心
          </Link>
        </Button>
      </header>

      <section className="rounded-xl border bg-card p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <UsersIcon className="size-6" />
          </div>
          <div className="min-w-0 flex-1">
            <h1 className="font-semibold text-xl">用户管理</h1>
            <p className="text-muted-foreground text-sm">
              查看所有用户、分配角色或删除账号。删除后该用户的会话与消息也会一并清除。
            </p>
          </div>
        </div>

        {error ? (
          <div
            role="alert"
            className="mt-6 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive text-sm"
          >
            {error}
          </div>
        ) : null}

        <div className="mt-6 overflow-x-auto rounded-lg border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/40 text-left text-muted-foreground">
              <tr>
                <th className="px-4 py-3 font-medium">用户名</th>
                <th className="px-4 py-3 font-medium">角色</th>
                <th className="px-4 py-3 font-medium">注册时间</th>
                <th className="px-4 py-3 font-medium">最近登录</th>
                <th className="px-4 py-3 font-medium">操作</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-10 text-center">
                    <span className="inline-flex items-center gap-2 text-muted-foreground">
                      <Loader2Icon className="size-4 animate-spin" />
                      加载中…
                    </span>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-10 text-center text-muted-foreground"
                  >
                    暂无用户
                  </td>
                </tr>
              ) : (
                users.map((user) => {
                  const isCurrentUser = user.id === currentUserId;
                  const isUpdating = updatingUserId === user.id;
                  const isDeleting = deletingUserId === user.id;
                  const isBusy = isUpdating || isDeleting;

                  return (
                    <tr key={user.id} className="border-t">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{user.username}</span>
                          {isCurrentUser ? (
                            <span className="rounded-full bg-muted px-2 py-0.5 text-muted-foreground text-xs">
                              当前账号
                            </span>
                          ) : null}
                        </div>
                        <p className="mt-1 break-all font-mono text-muted-foreground text-xs">
                          {user.id}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <select
                            className={cn(
                              "h-9 min-w-32 rounded-md border bg-background px-3 text-sm outline-none",
                              "focus-visible:ring-2 focus-visible:ring-ring/50",
                              isBusy && "opacity-60",
                            )}
                            value={user.role}
                            disabled={isBusy}
                            aria-label={`设置 ${user.username} 的角色`}
                            onChange={(event) => {
                              void handleRoleChange(
                                user.id,
                                event.target.value as AppUserRole,
                              );
                            }}
                          >
                            <option value="admin">
                              {APP_USER_ROLE_LABELS.admin}
                            </option>
                            <option value="user">
                              {APP_USER_ROLE_LABELS.user}
                            </option>
                          </select>
                          {user.role === "admin" ? (
                            <ShieldCheckIcon className="size-4 shrink-0 text-primary" />
                          ) : null}
                          {isUpdating ? (
                            <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
                          ) : null}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {formatDate(user.lastSignInAt)}
                      </td>
                      <td className="px-4 py-3">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="gap-1.5 text-destructive hover:text-destructive"
                          disabled={isCurrentUser || isBusy}
                          onClick={() => setPendingDeleteUser(user)}
                        >
                          {isDeleting ? (
                            <Loader2Icon className="size-4 animate-spin" />
                          ) : (
                            <Trash2Icon className="size-4" />
                          )}
                          删除
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      <Dialog
        open={pendingDeleteUser !== null}
        onOpenChange={(open) => {
          if (!open && !deletingUserId) {
            setPendingDeleteUser(null);
          }
        }}
      >
        <DialogContent className="sm:max-w-md" showCloseButton={!deletingUserId}>
          <DialogHeader>
            <DialogTitle>删除用户</DialogTitle>
            <DialogDescription>
              确定要删除用户「{pendingDeleteUser?.username}」吗？此操作不可撤销，
              该账号的所有会话与消息也会被永久删除。
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={Boolean(deletingUserId)}
              onClick={() => setPendingDeleteUser(null)}
            >
              取消
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={!pendingDeleteUser || Boolean(deletingUserId)}
              onClick={() => {
                if (pendingDeleteUser) {
                  void handleDeleteUser(pendingDeleteUser);
                }
              }}
            >
              {deletingUserId ? "删除中…" : "确认删除"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};
