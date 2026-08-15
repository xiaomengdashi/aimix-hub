"use client";

import {
	Loader2Icon,
	SearchIcon,
	ShieldCheckIcon,
	Trash2Icon,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState, type FC } from "react";
import type { ManagedUser } from "@/lib/admin/types";
import { APP_USER_ROLE_LABELS, type AppUserRole } from "@/lib/auth/roles";
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

type RoleFilter = "all" | AppUserRole;

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
	const [pendingDeleteUser, setPendingDeleteUser] =
		useState<ManagedUser | null>(null);
	const [query, setQuery] = useState("");
	const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

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
				loadError instanceof Error ? loadError.message : "加载用户列表失败",
			);
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		void loadUsers();
	}, [loadUsers]);

	const filteredUsers = useMemo(() => {
		const keyword = query.trim().toLowerCase();
		return users.filter((user) => {
			if (roleFilter !== "all" && user.role !== roleFilter) return false;
			if (!keyword) return true;
			return user.username.toLowerCase().includes(keyword);
		});
	}, [users, query, roleFilter]);

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
				current.map((user) => (user.id === userId ? { ...user, role } : user)),
			);
		} catch (updateError) {
			setError(
				updateError instanceof Error ? updateError.message : "更新角色失败",
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
				deleteError instanceof Error ? deleteError.message : "删除用户失败",
			);
		} finally {
			setDeletingUserId(null);
		}
	};

	return (
		<div className="space-y-4">
			{error ? (
				<div
					role="alert"
					className="rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-red-700 text-sm"
				>
					{error}
				</div>
			) : null}

			<div className="flex flex-wrap items-center gap-3">
				<label className="relative min-w-56 flex-1">
					<SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-slate-400" />
					<span className="sr-only">搜索用户</span>
					<input
						type="search"
						aria-label="搜索用户"
						className="h-10 w-full rounded-lg border border-slate-200 bg-white pr-3 pl-9 text-sm outline-none transition-colors placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="按用户名搜索"
					/>
				</label>
				<label className="flex items-center gap-2 text-sm">
					<span className="sr-only">按角色筛选</span>
					<select
						aria-label="按角色筛选"
						className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
						value={roleFilter}
						onChange={(event) =>
							setRoleFilter(event.target.value as RoleFilter)
						}
					>
						<option value="all">全部角色</option>
						<option value="admin">{APP_USER_ROLE_LABELS.admin}</option>
						<option value="user">{APP_USER_ROLE_LABELS.user}</option>
					</select>
				</label>
				<span className="ml-auto text-xs text-slate-400 tabular-nums">
					已加载 {users.length} 位用户
				</span>
			</div>

			<div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
				<table className="min-w-full text-sm">
					<thead className="bg-slate-50/80 text-left text-slate-500">
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
								<td colSpan={5} className="px-4 py-12 text-center">
									<span className="inline-flex items-center gap-2 text-slate-400">
										<Loader2Icon className="size-4 animate-spin" />
										加载中…
									</span>
								</td>
							</tr>
						) : filteredUsers.length === 0 ? (
							<tr>
								<td
									colSpan={5}
									className="px-4 py-12 text-center text-slate-400"
								>
									{users.length === 0 ? "暂无用户" : "没有匹配的用户"}
								</td>
							</tr>
						) : (
							filteredUsers.map((user) => {
								const isCurrentUser = user.id === currentUserId;
								const isUpdating = updatingUserId === user.id;
								const isDeleting = deletingUserId === user.id;
								const isBusy = isUpdating || isDeleting;
								const initial = user.username.slice(0, 1).toUpperCase();

								return (
									<tr
										key={user.id}
										className="border-t border-slate-100 transition-colors hover:bg-slate-50/70"
									>
										<td className="px-4 py-3">
											<div className="flex items-center gap-3">
												<span
													aria-hidden
													className="grid size-9 shrink-0 place-items-center rounded-full bg-slate-900 text-xs font-semibold text-white"
												>
													{initial}
												</span>
												<div className="min-w-0">
													<div className="flex items-center gap-2">
														<span className="font-medium text-slate-800">
															{user.username}
														</span>
														{isCurrentUser ? (
															<span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-500 text-xs">
																当前账号
															</span>
														) : null}
													</div>
													<p className="mt-0.5 truncate font-mono text-slate-400 text-xs">
														{user.id}
													</p>
												</div>
											</div>
										</td>
										<td className="px-4 py-3">
											<div className="flex items-center gap-2">
												<span
													className={cn(
														"inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs",
														user.role === "admin"
															? "bg-blue-50 text-blue-700"
															: "bg-slate-100 text-slate-600",
													)}
												>
													{user.role === "admin" ? (
														<ShieldCheckIcon className="size-3" />
													) : null}
													{APP_USER_ROLE_LABELS[user.role]}
												</span>
												<select
													className={cn(
														"h-9 min-w-32 rounded-md border border-slate-200 bg-white px-2 text-sm outline-none",
														"focus:border-blue-400 focus:ring-2 focus:ring-blue-100",
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
												{isUpdating ? (
													<Loader2Icon className="size-4 animate-spin text-slate-400" />
												) : null}
											</div>
										</td>
										<td className="px-4 py-3 text-slate-500">
											{formatDate(user.createdAt)}
										</td>
										<td className="px-4 py-3 text-slate-500">
											{formatDate(user.lastSignInAt)}
										</td>
										<td className="px-4 py-3">
											<Button
												type="button"
												variant="outline"
												size="sm"
												className="gap-1.5 text-red-600 hover:text-red-700"
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

			<Dialog
				open={pendingDeleteUser !== null}
				onOpenChange={(open) => {
					if (!open && !deletingUserId) {
						setPendingDeleteUser(null);
					}
				}}
			>
				<DialogContent
					className="sm:max-w-md"
					showCloseButton={!deletingUserId}
				>
					<DialogHeader>
						<DialogTitle>删除用户</DialogTitle>
						<DialogDescription>
							确定要删除用户「{pendingDeleteUser?.username}
							」吗？此操作不可撤销， 该账号的所有会话与消息也会被永久删除。
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
