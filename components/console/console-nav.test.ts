import { expect, it } from "vitest";
import { CONSOLE_NAV_GROUPS, isConsoleNavActive } from "./console-nav";

it("places the administrator overview before resource management", () => {
  expect(CONSOLE_NAV_GROUPS.map((group) => group.id)).toEqual([
    "overview",
    "resources",
    "account",
  ]);
  expect(CONSOLE_NAV_GROUPS[0]?.items[0]).toMatchObject({ href: "/admin", label: "控制台首页", adminOnly: true });
});

it("matches the overview exactly without treating resource pages as overview", () => {
  expect(isConsoleNavActive("/admin", "/admin")).toBe(true);
  expect(isConsoleNavActive("/admin/models", "/admin")).toBe(false);
  expect(isConsoleNavActive("/admin/models", "/admin/models")).toBe(true);
});
