import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { UserManagementPanel } from "./user-management-panel";

beforeEach(() =>
	vi.stubGlobal(
		"fetch",
		vi.fn().mockResolvedValue(
			new Response(
				JSON.stringify({
					users: [
						{ id: "u-1", username: "alice", role: "admin", createdAt: "2026-08-01T00:00:00Z", lastSignInAt: null },
						{ id: "u-2", username: "bob", role: "user", createdAt: "2026-08-02T00:00:00Z", lastSignInAt: null },
					],
				}),
				{ status: 200 },
			),
		),
	),
);

it("filters already loaded users locally by username and role", async () => {
	render(<UserManagementPanel currentUserId="u-1" />);
	await screen.findByText("alice");
	fireEvent.change(screen.getByRole("searchbox", { name: "搜索用户" }), {
		target: { value: "bob" },
	});
	expect(screen.queryByText("alice")).not.toBeInTheDocument();
	expect(screen.getByText("bob")).toBeInTheDocument();
	fireEvent.change(screen.getByRole("combobox", { name: "按角色筛选" }), {
		target: { value: "admin" },
	});
	await waitFor(() =>
		expect(screen.getByText("没有匹配的用户")).toBeInTheDocument(),
	);
	expect(fetch).toHaveBeenCalledTimes(1);
});
