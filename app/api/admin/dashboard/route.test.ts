import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAdmin = vi.fn();
const fetchAdminDashboardStats = vi.fn();
vi.mock("@/lib/auth/require-admin", () => ({ requireAdmin }));
vi.mock("@/lib/admin/fetch-dashboard-stats", () => ({ fetchAdminDashboardStats }));

const { GET } = await import("./route");

beforeEach(() => {
  requireAdmin.mockReset();
  fetchAdminDashboardStats.mockReset();
});

it("returns 403 without an administrator session", async () => {
  requireAdmin.mockResolvedValue(null);
  const response = await GET();
  expect(response.status).toBe(403);
  await expect(response.json()).resolves.toEqual({ error: "无权访问" });
});

it("returns safe dashboard data for an administrator", async () => {
  requireAdmin.mockResolvedValue({ user: { id: "admin-1" }, role: "admin" });
  fetchAdminDashboardStats.mockResolvedValue({ overview: { totalUsers: 3 } });
  const response = await GET();
  expect(response.status).toBe(200);
  await expect(response.json()).resolves.toEqual({ dashboard: { overview: { totalUsers: 3 } } });
});

it("maps an aggregation failure to a 500 JSON error", async () => {
  requireAdmin.mockResolvedValue({ user: { id: "admin-1" }, role: "admin" });
  fetchAdminDashboardStats.mockRejectedValue(new Error("数据库不可用"));
  const response = await GET();
  expect(response.status).toBe(500);
  await expect(response.json()).resolves.toEqual({ error: "数据库不可用" });
});
