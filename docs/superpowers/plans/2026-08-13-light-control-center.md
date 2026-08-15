# 亮色中控后台实现计划

> **面向 AI 代理的工作者：** 必需子技能：使用 superpowers:subagent-driven-development（推荐）或 superpowers:executing-plans 逐任务实现此计划。步骤使用复选框（`- [ ]`）语法来跟踪进度。

**目标：** 将当前账号与管理员页面重构为亮色 AI 平台中控后台，并交付受管理员权限保护、由真实数据驱动的 `/admin` 概览与趋势图。

**架构：** 在服务端新增可测试的管理员数据聚合层，把 Supabase 查询、模型目录和脱敏集成设置收敛为 `AdminDashboardData`。新增的 `GET /api/admin/dashboard` 只输出该聚合 DTO；客户端 `AdminDashboard` 负责加载、重试及组合可访问的展示模块。控制台外壳、导航和既有面板保留原有授权及写入行为，仅更换信息架构、容器和亮色视觉层级。

**技术栈：** Next.js 16 App Router、React 19、TypeScript、Tailwind CSS 4、Supabase、Lucide、Vitest（新增，仅用于纯服务层、路由与组件测试）。

---

## 文件结构

### 新建

| 文件 | 职责 |
| --- | --- |
| `lib/admin/dashboard-types.ts` | 管理员总览的无敏感 DTO、原始聚合输入及注意事项类型。 |
| `lib/admin/dashboard-aggregation.ts` | 纯函数：生成连续 14 天序列、去重活跃用户、聚合 Token / provider、生成配置注意项；不访问数据库。 |
| `lib/admin/fetch-dashboard-stats.ts` | 服务端：读取全局消息、会话、用户、模型、脱敏集成设置，并调用纯聚合函数。 |
| `lib/admin/dashboard-aggregation.test.ts` | 用真实的原始行 fixture 覆盖统计、补零、配置告警和敏感数据边界。 |
| `app/api/admin/dashboard/route.ts` | 管理员只读聚合 API。 |
| `app/api/admin/dashboard/route.test.ts` | mock 授权 / 服务层，覆盖 403、成功和 500。 |
| `app/(console)/admin/page.tsx` | 受现有 `admin/layout.tsx` 保护的管理员首页。 |
| `components/console/admin/admin-dashboard.tsx` | 仪表盘数据获取、刷新、加载 / 错误状态与区块组合。 |
| `components/console/admin/dashboard-trend-chart.tsx` | 无第三方图表库的 SVG 双序列趋势图，含无障碍文本摘要。 |
| `components/console/admin/dashboard-distribution.tsx` | 按应用的真实使用分布、占比条与空态。 |
| `components/console/admin/dashboard-status.tsx` | 脱敏配置状态、已启用模型、待处理项和跳转操作。 |
| `components/console/admin/admin-dashboard.test.tsx` | mock `fetch`，覆盖加载、成功、空态、错误重试。 |
| `components/console/console-section.tsx` | 统一中控区块标题、说明与右侧操作，避免重复页面 header 结构。 |
| `vitest.config.ts` | Vitest 的 `@/` alias、jsdom 环境和测试文件规则。 |
| `tests/setup.ts` | 引入 `@testing-library/jest-dom/vitest` 及每例后的 mock 清理。 |

### 修改

| 文件 | 变更职责 |
| --- | --- |
| `package.json`、`package-lock.json` | 新增 `test` / `test:watch` 命令与 Vitest、Testing Library 开发依赖。 |
| `components/console/console-nav.ts` | 重组管理员“总览 / 资源管理 / 个人空间”菜单，新增 `/admin` 首页项与图标。 |
| `components/console/console-sidebar.tsx` | 亮色产品级品牌区、分组菜单、选中态、账户区及移动端一致性。 |
| `components/console/console-shell.tsx` | 蓝灰工作区背景、240px 侧栏、1440px 主画布、移动顶栏和抽屉样式。 |
| `components/console/console-page-header.tsx` | 与工作区统一的面包屑可选区、标题、说明和 action 插槽。 |
| `app/(console)/account/page.tsx` | 使用新的页面 header / 亮色 section，保持原资料数据和授权。 |
| `app/(console)/account/usage/page.tsx` | 保持既有统计来源，改为统一 section 布局。 |
| `app/(console)/account/archived/page.tsx` | 保持恢复会话逻辑，采用统一 page / list 外观。 |
| `components/console/account/overview-cards.tsx` | 改成平整 KPI 统计格，保留数值和 token 格式化。 |
| `components/console/account/activity-panel.tsx` | 改成中控趋势区块，增强 tooltip / aria 文本及 reduced-motion。 |
| `components/console/account/usage-section.tsx` | 统一白色面板、蓝色分布条和空态。 |
| `components/console/account/profile-section.tsx` | 资料数据改为更清晰的定义列表，移除过度嵌套的灰色小卡。 |
| `components/console/account/archived-list.tsx` | 调整表格式会话行和状态反馈，不修改 Supabase 客户端恢复行为。 |
| `components/console/admin/user-management-panel.tsx` | 增加本地用户名搜索、角色筛选、首字母头像和角色徽标；保留 PATCH / DELETE / 二次确认。 |
| `components/console/admin/model-management-panel.tsx` | 保留所有模型目录写操作，重排为目录工具栏、表格和网关发现区。 |
| `components/console/admin/integration-settings-panel.tsx` | 保留密钥留空语义及测试接口，拆成 AI 网关 / 联网搜索设置区并显示脱敏状态。 |
| `app/(console)/admin/users/page.tsx`、`app/(console)/admin/models/page.tsx`、`app/(console)/admin/integration/page.tsx` | 更新标题和说明，使其与新的资源管理菜单术语一致。 |

### 不修改

- `app/api/admin/users/**`、`app/api/admin/models/**`、`app/api/admin/integration/**`：请求 / 响应合同和授权逻辑保持，防止视觉重构引入行为回归。
- `lib/admin/delete-user.ts`、`lib/admin/update-user-role.ts`、`lib/admin/model-management.ts`：既有写入服务保持；新仪表盘只复用只读 `listManagedModels`、`getAdminIntegrationSettings`。
- 聊天、绘图、认证、Supabase migration 和模型调用链：不在本计划中改动。

## 任务 1：建立可运行的测试基础与管理员总览 DTO

**文件：**

- 修改：`package.json`
- 修改：`package-lock.json`
- 新建：`vitest.config.ts`
- 新建：`tests/setup.ts`
- 新建：`lib/admin/dashboard-types.ts`
- 新建：`lib/admin/dashboard-aggregation.ts`
- 测试：`lib/admin/dashboard-aggregation.test.ts`

- [ ] **步骤 1：安装测试依赖并声明测试命令**

运行：

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
npm pkg set scripts.test="vitest run"
npm pkg set scripts.test:watch="vitest"
```

然后创建 `vitest.config.ts`：

```ts
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: { alias: { "@": path.resolve(__dirname, ".") } },
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    include: ["**/*.test.{ts,tsx}"],
    restoreMocks: true,
  },
});
```

创建 `tests/setup.ts`：

```ts
import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";

afterEach(() => cleanup());
```

- [ ] **步骤 2：编写失败的聚合测试**

创建 `lib/admin/dashboard-aggregation.test.ts`，先只导入尚不存在的实现并写入以下可观察的行为：

```ts
import { describe, expect, it } from "vitest";
import { buildAdminDashboardData } from "@/lib/admin/dashboard-aggregation";

const now = new Date("2026-08-13T12:00:00.000Z");

it("builds fourteen contiguous days, aggregates tokens, and de-duplicates active users", () => {
  const dashboard = buildAdminDashboardData({
    now,
    users: [{ id: "u-1" }, { id: "u-2" }, { id: "u-3" }],
    threads: [
      { id: "t-1", provider: "claude" },
      { id: "t-2", provider: "image" },
    ],
    messages: [
      { userId: "u-1", threadId: "t-1", createdAt: "2026-08-12T08:00:00.000Z", usage: { inputTokens: 10, outputTokens: 5 } },
      { userId: "u-1", threadId: "t-1", createdAt: "2026-08-12T09:00:00.000Z", usage: { inputTokens: 4, outputTokens: 1 } },
      { userId: "u-2", threadId: "t-2", createdAt: "2026-08-02T11:00:00.000Z", usage: null },
    ],
    enabledModelCount: 2,
    integration: {
      aiBaseUrl: "https://gateway.example/v1",
      aiApiKeyConfigured: true,
      tavilyBaseUrl: "https://api.tavily.com",
      tavilyApiKeyConfigured: true,
    },
  });

  expect(dashboard.activity).toHaveLength(14);
  expect(dashboard.overview).toMatchObject({
    totalUsers: 3,
    activeUsers: 2,
    messageCount: 3,
    totalTokens: 20,
    enabledModelCount: 2,
  });
  expect(dashboard.activity.at(-1)).toMatchObject({ date: "2026-08-13", messageCount: 0, tokenCount: 0 });
  expect(dashboard.providerUsage.find((row) => row.provider === "claude")).toMatchObject({ messageCount: 2, tokenCount: 20 });
  expect(dashboard.attention).toEqual([]);
});

it("emits only configuration warnings and never returns secret values", () => {
  const dashboard = buildAdminDashboardData({
    now,
    users: [],
    threads: [],
    messages: [],
    enabledModelCount: 0,
    integration: {
      aiBaseUrl: "https://gateway.example/v1",
      aiApiKeyConfigured: false,
      tavilyBaseUrl: "https://api.tavily.com",
      tavilyApiKeyConfigured: false,
    },
  });

  expect(dashboard.attention.map((item) => item.id)).toEqual([
    "missing-ai-key",
    "missing-tavily-key",
    "no-enabled-models",
  ]);
  expect(JSON.stringify(dashboard)).not.toContain("api-key");
});
```

- [ ] **步骤 3：运行测试，确认是预期的红灯**

运行：

```bash
npm test -- lib/admin/dashboard-aggregation.test.ts
```

预期：测试失败，原因是无法解析 `@/lib/admin/dashboard-aggregation`，而非断言或 Vitest 配置错误。

- [ ] **步骤 4：定义最小、无敏感字段的 DTO**

创建 `lib/admin/dashboard-types.ts`：

```ts
import type { AppId } from "@/lib/chat/app-id";

export type DashboardIntegrationStatus = {
  aiBaseUrl: string | null;
  aiApiKeyConfigured: boolean;
  tavilyBaseUrl: string | null;
  tavilyApiKeyConfigured: boolean;
};

export type DashboardMessageRow = {
  userId: string;
  threadId: string;
  createdAt: string;
  usage: { inputTokens?: number; outputTokens?: number } | null;
};

export type AdminDashboardData = {
  range: { start: string; end: string; days: 14 };
  overview: {
    totalUsers: number;
    activeUsers: number;
    messageCount: number;
    totalTokens: number;
    enabledModelCount: number;
  };
  activity: Array<{ date: string; messageCount: number; tokenCount: number }>;
  providerUsage: Array<{ provider: AppId; messageCount: number; tokenCount: number }>;
  integration: DashboardIntegrationStatus;
  attention: Array<{
    id: "missing-ai-key" | "missing-tavily-key" | "no-enabled-models";
    level: "warning";
    title: string;
    description: string;
    href: "/admin/integration" | "/admin/models";
  }>;
};
```

- [ ] **步骤 5：实现最小纯聚合函数**

创建 `lib/admin/dashboard-aggregation.ts`。函数签名必须是：

```ts
export function buildAdminDashboardData(input: {
  now: Date;
  users: Array<{ id: string }>;
  threads: Array<{ id: string; provider: string }>;
  messages: DashboardMessageRow[];
  enabledModelCount: number;
  integration: DashboardIntegrationStatus;
}): AdminDashboardData
```

实现规则：

- 以 `now` 的本地日零点为结束日，倒推 13 日，预建 `YYYY-MM-DD` map；使用现有 `APP_NAV_OPTIONS` 建立 provider 行，以便零使用应用仍有稳定顺序。
- 仅统计闭区间 `[startOfFirstDay, startOfTomorrow)` 内的消息；`messageCount` 包含所有消息，`tokenCount` 仅累计 `usage.inputTokens ?? 0` 与 `usage.outputTokens ?? 0`。
- 在范围内有至少一条消息的不同 `userId` 计为 active user；消息的 `threadId` 通过 thread map 决定 provider，缺失 / 未知 provider 归入 `other`。
- 将 `aiApiKeyConfigured`、`tavilyApiKeyConfigured`、`enabledModelCount === 0` 分别生成固定的中文 title、description 和链接；不要把 API key 或 hint 作为输入或输出字段。

- [ ] **步骤 6：运行测试，确认绿灯并验证项目类型**

运行：

```bash
npm test -- lib/admin/dashboard-aggregation.test.ts
npx tsc --noEmit
```

预期：两个命令均退出码 0；第一个显示 2 个通过测试。

- [ ] **步骤 7：提交测试基础与纯领域层**

```bash
git add package.json package-lock.json vitest.config.ts tests/setup.ts lib/admin/dashboard-types.ts lib/admin/dashboard-aggregation.ts lib/admin/dashboard-aggregation.test.ts
git commit -m "test: add dashboard aggregation coverage"
```

## 任务 2：实现管理员总览服务和受保护 API

**文件：**

- 新建：`lib/admin/fetch-dashboard-stats.ts`
- 新建：`app/api/admin/dashboard/route.ts`
- 测试：`app/api/admin/dashboard/route.test.ts`

- [ ] **步骤 1：编写失败的管理员 API 路由测试**

创建 `app/api/admin/dashboard/route.test.ts`，通过 `vi.mock` 隔离认证和服务层：

```ts
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
```

- [ ] **步骤 2：运行 API 测试，确认红灯**

运行：

```bash
npm test -- app/api/admin/dashboard/route.test.ts
```

预期：失败，因为 `app/api/admin/dashboard/route.ts` 及服务层尚未存在。

- [ ] **步骤 3：实现数据库读取适配器，不向客户端传递内容**

创建 `lib/admin/fetch-dashboard-stats.ts`，导出：

```ts
export async function fetchAdminDashboardStats(
  now = new Date(),
): Promise<AdminDashboardData>
```

实现以下精确访问模式：

```ts
const supabase = await createClient();
const rangeStart = new Date(now);
rangeStart.setHours(0, 0, 0, 0);
rangeStart.setDate(rangeStart.getDate() - 13);
const rangeEnd = new Date(now);
rangeEnd.setHours(24, 0, 0, 0);

const [users, threads, messages, models, settings] = await Promise.all([
  listManagedUsers(supabase),
  supabase.from("threads").select("id, provider"),
  supabase
    .from("messages")
    .select("user_id, thread_id, created_at, content")
    .gte("created_at", rangeStart.toISOString())
    .lt("created_at", rangeEnd.toISOString()),
  listManagedModels(supabase),
  getAdminIntegrationSettings(supabase),
]);
```

对 `threads` 与 `messages` 查询的 `error` 显式 `throw`；将 message row 映射为 `DashboardMessageRow`，其 `usage` 为 `parseChatMessageUsage(row.content)` 的输入 / 输出 token 子集。调用 `buildAdminDashboardData`，只传入 `aiBaseUrl`、`tavilyBaseUrl` 和两个 `Configured` boolean；不传 hint 和 message content。

- [ ] **步骤 4：实现最小路由**

创建 `app/api/admin/dashboard/route.ts`：

```ts
import { NextResponse } from "next/server";
import { fetchAdminDashboardStats } from "@/lib/admin/fetch-dashboard-stats";
import { requireAdmin } from "@/lib/auth/require-admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "无权访问" }, { status: 403 });

  try {
    const dashboard = await fetchAdminDashboardStats();
    return NextResponse.json({ dashboard });
  } catch (error) {
    const message = error instanceof Error ? error.message : "加载控制台统计失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
```

- [ ] **步骤 5：运行路由及领域测试，确认绿灯**

运行：

```bash
npm test -- app/api/admin/dashboard/route.test.ts lib/admin/dashboard-aggregation.test.ts
npx tsc --noEmit
```

预期：5 个测试通过，TypeScript 退出码 0。

- [ ] **步骤 6：提交聚合服务和 API**

```bash
git add lib/admin/fetch-dashboard-stats.ts app/api/admin/dashboard/route.ts app/api/admin/dashboard/route.test.ts
git commit -m "feat: add admin dashboard API"
```

## 任务 3：交付管理员首页图表与数据状态组件

**文件：**

- 新建：`app/(console)/admin/page.tsx`
- 新建：`components/console/admin/admin-dashboard.tsx`
- 新建：`components/console/admin/dashboard-trend-chart.tsx`
- 新建：`components/console/admin/dashboard-distribution.tsx`
- 新建：`components/console/admin/dashboard-status.tsx`
- 新建：`components/console/admin/admin-dashboard.test.tsx`
- 新建：`components/console/console-section.tsx`

- [ ] **步骤 1：编写失败的首页客户端测试**

创建 `components/console/admin/admin-dashboard.test.tsx`：

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { AdminDashboard } from "./admin-dashboard";

beforeEach(() => vi.stubGlobal("fetch", vi.fn()));

it("shows a readable loading state then renders real dashboard totals", async () => {
  vi.mocked(fetch).mockResolvedValueOnce(new Response(JSON.stringify({
    dashboard: {
      range: { start: "2026-07-31", end: "2026-08-13", days: 14 },
      overview: { totalUsers: 3, activeUsers: 2, messageCount: 14, totalTokens: 1200, enabledModelCount: 2 },
      activity: [{ date: "2026-08-13", messageCount: 14, tokenCount: 1200 }],
      providerUsage: [{ provider: "claude", messageCount: 14, tokenCount: 1200 }],
      integration: { aiBaseUrl: "https://gateway.example/v1", aiApiKeyConfigured: true, tavilyBaseUrl: "https://api.tavily.com", tavilyApiKeyConfigured: true },
      attention: [],
    },
  }), { status: 200 }));

  render(<AdminDashboard />);
  expect(screen.getByText("正在加载系统统计…")).toBeInTheDocument();
  expect(await screen.findByText("3")).toBeInTheDocument();
  expect(screen.getByRole("img", { name: /14 天消息量与 token 用量趋势/ })).toBeInTheDocument();
  expect(screen.getByText("Claude")).toBeInTheDocument();
});

it("shows an error and retries the same endpoint", async () => {
  vi.mocked(fetch)
    .mockResolvedValueOnce(new Response(JSON.stringify({ error: "统计服务不可用" }), { status: 500 }))
    .mockResolvedValueOnce(new Response(JSON.stringify({ dashboard: { range: { start: "2026-07-31", end: "2026-08-13", days: 14 }, overview: { totalUsers: 0, activeUsers: 0, messageCount: 0, totalTokens: 0, enabledModelCount: 0 }, activity: [], providerUsage: [], integration: { aiBaseUrl: null, aiApiKeyConfigured: false, tavilyBaseUrl: null, tavilyApiKeyConfigured: false }, attention: [] } }), { status: 200 }));

  render(<AdminDashboard />);
  expect(await screen.findByText("统计服务不可用")).toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "重试" }));
  await waitFor(() => expect(fetch).toHaveBeenCalledTimes(2));
});
```

- [ ] **步骤 2：运行组件测试，确认红灯**

运行：

```bash
npm test -- components/console/admin/admin-dashboard.test.tsx
```

预期：失败，因为 `AdminDashboard` 尚未实现。

- [ ] **步骤 3：实现可复用亮色 section 和图表展示组件**

创建 `components/console/console-section.tsx`，使用以下 props 契约：

```tsx
type ConsoleSectionProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
};
```

根元素采用 `rounded-2xl border border-slate-200/80 bg-white p-5 shadow-[0_1px_2px_rgb(15_23_42/0.03)]`，标题区与内容使用细分隔线而不是额外嵌套卡片。

创建 `dashboard-trend-chart.tsx`，对 `activity`：

- 使用 `viewBox="0 0 680 220"` 的 SVG，消息为实蓝色 `#2F6FED`，Token 为青蓝 `#21A7B8`；路径点从输入的 min/max 缩放，空 / 零数组绘制基线。
- 外层 `role="img"`，`aria-label="14 天消息量与 Token 用量趋势：共 X 条消息，Y Token"`；图下另有视觉隐藏文本，列出最高消息日。
- `prefers-reduced-motion` 下不使用 stroke-dashoffset 动画；普通情况下只使用一次 180ms `opacity` 淡入。

创建 `dashboard-distribution.tsx`，从 `providerUsage` 输出真实应用名（调用 `getAppDisplayName`）、消息数、Token 数和按最大消息数计算的条形宽度。全零数组显示“所选周期暂无应用使用记录”。

创建 `dashboard-status.tsx`，用 `integration` 与 `overview.enabledModelCount` 展示“AI 网关 / 联网搜索 / 可用模型”的“已配置”或“需配置”状态；`attention` 每条必须通过 `Link` 指向其 `href`，并且不显示任何 key 或 hint。

- [ ] **步骤 4：实现加载容器及管理员页面**

创建 `components/console/admin/admin-dashboard.tsx`：

```tsx
const [state, setState] = useState<
  { kind: "loading" } | { kind: "error"; message: string } | { kind: "ready"; dashboard: AdminDashboardData }
>({ kind: "loading" });
```

请求函数必须调用 `fetch("/api/admin/dashboard", { cache: "no-store" })`；解析 `{ dashboard?, error? }`，非 `ok` 时使用 payload error 或“加载控制台统计失败”。loading 文本为“正在加载系统统计…”，error 区包含 `role="alert"` 和“重试”按钮。

ready 状态按以下顺序组合：四个 KPI（总用户数、14 天活跃用户、消息量、Token 用量）→ `DashboardTrendChart` → `DashboardDistribution` → `DashboardStatus`。KPI 使用真实 `formatTokenCount`，无数据用 `0` 而非占位符。每个统计块提供 `aria-label`，不只依赖颜色传达变化。

创建 `app/(console)/admin/page.tsx`，使用既有 `requireAdmin` 与 `notFound`，然后渲染：

```tsx
<ConsolePageHeader
  eyebrow="总览"
  title="系统概览"
  description="最近 14 天的平台使用、模型配置与服务状态。"
/>
<AdminDashboard />
```

- [ ] **步骤 5：运行组件测试，确认绿灯**

运行：

```bash
npm test -- components/console/admin/admin-dashboard.test.tsx
npx tsc --noEmit
```

预期：两个测试通过；TypeScript 无错误。

- [ ] **步骤 6：提交管理员首页**

```bash
git add app/(console)/admin/page.tsx components/console/console-section.tsx components/console/admin/admin-dashboard.tsx components/console/admin/dashboard-trend-chart.tsx components/console/admin/dashboard-distribution.tsx components/console/admin/dashboard-status.tsx components/console/admin/admin-dashboard.test.tsx
git commit -m "feat: add admin control center dashboard"
```

## 任务 4：重构控制台导航和亮色工作区外壳

**文件：**

- 修改：`components/console/console-nav.ts`
- 修改：`components/console/console-sidebar.tsx`
- 修改：`components/console/console-shell.tsx`
- 修改：`components/console/console-page-header.tsx`
- 测试：`components/console/console-nav.test.ts`

- [ ] **步骤 1：编写失败的导航纯函数测试**

创建 `components/console/console-nav.test.ts`：

```ts
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
```

- [ ] **步骤 2：运行导航测试，确认红灯**

运行：

```bash
npm test -- components/console/console-nav.test.ts
```

预期：首个断言失败，因为当前只有 `account` 与 `admin` 两组，且没有 `/admin` 项。

- [ ] **步骤 3：重组导航数据与精确激活规则**

修改 `console-nav.ts`：

- 图标新增 `LayoutDashboardIcon`、`UsersRoundIcon`、`RouteIcon`、`Settings2Icon`；移除未用图标。
- 输出固定顺序：`overview`（admin-only，仅 `控制台首页` `/admin`）、`resources`（admin-only，`成员与权限` `/admin/users`、`模型与路由` `/admin/models`、`服务配置` `/admin/integration`）、`account`（个人空间的现有三项）。
- 在 `isConsoleNavActive` 首先专门处理 `href === "/admin"`：`return pathname === "/admin"`；保留 `/account` 的精确匹配，其他项使用既有子路径匹配。

- [ ] **步骤 4：更新侧栏、壳和 header 的亮色工作区样式**

修改 `ConsoleSidebar`：

- 品牌区显示小蓝色渐变方形图标和 `Axis Control`，副文本“AI Platform”。
- group label 使用 `text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400`；导航项用 `rounded-lg px-3 py-2 text-sm`。
- active 使用 `bg-blue-50 text-blue-700`、图标 `text-blue-600`；inactive 使用 `text-slate-600 hover:bg-slate-50 hover:text-slate-950`。不要通过黑色透明度或 dark 变体实现亮色主题。
- footer 仍然保留“返回对话”“退出登录”和当前用户，但使用浅灰分隔线、圆形首字母头像、角色文字；现有 `useSignOut` 和按钮 disabled 行为不变。

修改 `ConsoleShell`：根为 `min-h-dvh bg-[#f6f8fb]`；桌面 `aside` 为 `w-60 border-slate-200 bg-white`；main 画布为 `max-w-[1440px] px-4 py-6 md:px-8 md:py-8 xl:px-10`。移动抽屉同样强制亮色 `bg-white`，保留现有 `Sheet` 语义和 `MenuIcon`。

扩展 `ConsolePageHeaderProps` 加入可选 `eyebrow?: string` 和 `action?: ReactNode`，不破坏既有调用。输出顶部小标签、`text-3xl` 标题及右侧 action 容器，标题区不再采用旧 `mb-8` 低密度样式。

- [ ] **步骤 5：运行导航测试和 TypeScript，确认绿灯**

运行：

```bash
npm test -- components/console/console-nav.test.ts
npx tsc --noEmit
```

预期：2 个导航测试通过，TypeScript 退出码 0。

- [ ] **步骤 6：提交工作区重构**

```bash
git add components/console/console-nav.ts components/console/console-nav.test.ts components/console/console-sidebar.tsx components/console/console-shell.tsx components/console/console-page-header.tsx
git commit -m "feat: redesign console navigation and shell"
```

## 任务 5：重构个人空间为统一的亮色分析界面

**文件：**

- 修改：`app/(console)/account/page.tsx`
- 修改：`app/(console)/account/usage/page.tsx`
- 修改：`app/(console)/account/archived/page.tsx`
- 修改：`components/console/account/overview-cards.tsx`
- 修改：`components/console/account/activity-panel.tsx`
- 修改：`components/console/account/usage-section.tsx`
- 修改：`components/console/account/profile-section.tsx`
- 修改：`components/console/account/archived-list.tsx`

- [ ] **步骤 1：编写失败的活动图表可访问性测试**

在 `components/console/account/activity-panel.test.tsx` 新建：

```tsx
import { render, screen } from "@testing-library/react";
import { expect, it } from "vitest";
import { AccountActivityPanel } from "./activity-panel";

it("labels the activity trend with totals instead of relying on bar color", () => {
  render(<AccountActivityPanel activity={[
    { date: "2026-08-12", messageCount: 3, threadCount: 1 },
    { date: "2026-08-13", messageCount: 0, threadCount: 0 },
  ]} />);
  expect(screen.getByRole("img", { name: "近 14 天活跃：共 3 条消息，1 天有活动" })).toBeInTheDocument();
  expect(screen.getByText("3 条消息")).toBeInTheDocument();
});
```

- [ ] **步骤 2：运行测试，确认红灯**

运行：

```bash
npm test -- components/console/account/activity-panel.test.tsx
```

预期：失败，因为当前的活动区块没有 `role="img"` 和要求的 label。

- [ ] **步骤 3：最小化改造个人页面与统计组件**

修改三张 account page，在 `ConsolePageHeader` 分别提供：

```tsx
{ eyebrow: "个人空间", title: "账号资料", description: "账号身份、角色与注册信息" }
{ eyebrow: "个人空间", title: "我的用量", description: "会话、消息、Token 与近 14 天趋势" }
{ eyebrow: "个人空间", title: "归档会话", description: "已归档会话会保存在云端，可随时恢复" }
```

对于 `AccountOverviewCards`，保留同一四项数值和 `formatTokenCount`，根布局仍为四列响应式 grid，但每项统一使用 `rounded-2xl border-slate-200 bg-white p-5 shadow-sm`，图标置于淡蓝方形背景；归档数据不得改变。

对于 `AccountActivityPanel`，保留每日期 / tooltip / 高度算法，将图表容器设为 `role="img"`，使用测试指定的 label；活动柱使用 `bg-blue-500`，零值 `bg-slate-100`，并在柱图下保留总消息和活跃天数的文本摘要。

对于 `AccountUsageSection`、`AccountProfileSection`、`AccountArchivedList`，只更换容器和间距：使用 `ConsoleSection` 或与它相同的边界/白色表面，保留所有查询数据、恢复流程、按钮 action、空态文案和 loading 状态。不得将会话恢复由浏览器 Supabase 客户端改为不同 API。

- [ ] **步骤 4：运行个人空间测试，确认绿灯**

运行：

```bash
npm test -- components/console/account/activity-panel.test.tsx
npx tsc --noEmit
```

预期：测试通过，TypeScript 退出码 0。

- [ ] **步骤 5：提交个人空间视觉重构**

```bash
git add app/(console)/account/page.tsx app/(console)/account/usage/page.tsx app/(console)/account/archived/page.tsx components/console/account/overview-cards.tsx components/console/account/activity-panel.tsx components/console/account/activity-panel.test.tsx components/console/account/usage-section.tsx components/console/account/profile-section.tsx components/console/account/archived-list.tsx
git commit -m "feat: refresh account console workspace"
```

## 任务 6：重构管理员资源管理面板，保留所有写操作

**文件：**

- 修改：`app/(console)/admin/users/page.tsx`
- 修改：`app/(console)/admin/models/page.tsx`
- 修改：`app/(console)/admin/integration/page.tsx`
- 修改：`components/console/admin/user-management-panel.tsx`
- 修改：`components/console/admin/model-management-panel.tsx`
- 修改：`components/console/admin/integration-settings-panel.tsx`
- 测试：`components/console/admin/user-management-panel.test.tsx`

- [ ] **步骤 1：编写失败的用户面板本地筛选测试**

创建 `components/console/admin/user-management-panel.test.tsx`，mock `/api/admin/users`，测试 UI filter 不增加服务器请求：

```tsx
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, expect, it, vi } from "vitest";
import { UserManagementPanel } from "./user-management-panel";

beforeEach(() => vi.stubGlobal("fetch", vi.fn().mockResolvedValue(
  new Response(JSON.stringify({ users: [
    { id: "u-1", username: "alice", role: "admin", createdAt: "2026-08-01T00:00:00Z", lastSignInAt: null },
    { id: "u-2", username: "bob", role: "user", createdAt: "2026-08-02T00:00:00Z", lastSignInAt: null },
  ] }), { status: 200 }),
)));

it("filters already loaded users locally by username and role", async () => {
  render(<UserManagementPanel currentUserId="u-1" />);
  await screen.findByText("alice");
  fireEvent.change(screen.getByRole("searchbox", { name: "搜索用户" }), { target: { value: "bob" } });
  expect(screen.queryByText("alice")).not.toBeInTheDocument();
  expect(screen.getByText("bob")).toBeInTheDocument();
  fireEvent.change(screen.getByRole("combobox", { name: "按角色筛选" }), { target: { value: "admin" } });
  await waitFor(() => expect(screen.getByText("没有匹配的用户")).toBeInTheDocument());
  expect(fetch).toHaveBeenCalledTimes(1);
});
```

- [ ] **步骤 2：运行测试，确认红灯**

运行：

```bash
npm test -- components/console/admin/user-management-panel.test.tsx
```

预期：失败，因为当前页面无搜索框与角色筛选器。

- [ ] **步骤 3：实现用户面板筛选与亮色资源表**

在 `UserManagementPanel` 新增 `query`、`roleFilter: "all" | AppUserRole`，使用 `useMemo` 在已加载 `users` 数组中对 `username.toLowerCase().includes(query.trim().toLowerCase())` 和角色过滤。不要把筛选值追加到 `/api/admin/users`，以保证既有 API 合同不变。

表上方增加：

- `aria-label="搜索用户"` 的 `type="search"` 输入；
- `aria-label="按角色筛选"` 的 select（全部角色、管理员、普通用户）；
- `已加载 N 位用户` 的文本。

表行显示用户名首字母头像、role badge，保留 ID、注册时间、最近登录、role `<select>`、当前账号不可删除、PATCH 加载图标、DELETE 二次确认和现有错误消息。表容器使用 `border-slate-200 bg-white`，hover 为 `bg-slate-50/70`。

- [ ] **步骤 4：统一模型与集成面板的亮色层级，绝不改变接口 payload**

在 `ModelManagementPanel`：

- 顶部由“标题 + 已配置模型数 + 保存模型配置”组成固定工具栏；保持 `PUT /api/admin/models` payload 内字段完全相同。
- provider tabs 从胶囊堆叠改为带底部 active 蓝色边的紧凑 tabs；表格仍保留启用、ID、名称、描述、Context、Backend、类型、排序 / 删除的每项编辑与按钮。
- “从网关添加模型”作为有明确说明的次级 `ConsoleSection`；保留 `GET /api/admin/models/gateway`、搜索、获取全部、添加及其 success / error 文案。

在 `IntegrationSettingsPanel`：

- 加载完成后从 `settings` 显示三项无敏感配置状态：AI API Key、Tavily API Key、最后更新；禁止将 `aiApiKeyHint` 或 `tavilyApiKeyHint` 放在新的状态卡中。
- 将两个 AI 字段置于标题“AI 网关”的 section，两个 Tavily 字段置于“联网搜索”的 section；保留密码输入、留空不覆盖、`PUT /api/admin/integration` 字段名和 `POST /api/admin/integration/test` 行为。
- “测试 AI 连接”放在 AI 网关 section 的 action 区，保持禁用状态、请求状态和现有成功 / 失败消息。

三个 admin page 用 `eyebrow="资源管理"`，标题分别为“成员与权限”“模型与路由”“服务配置”；保留现有服务器端 `requireAdmin` / `notFound`。

- [ ] **步骤 5：运行资源面板测试与全测试套件**

运行：

```bash
npm test -- components/console/admin/user-management-panel.test.tsx
npm test
npx tsc --noEmit
```

预期：用户筛选测试通过；所有已有的 dashboard / navigation / account 测试通过；TypeScript 无错误。

- [ ] **步骤 6：提交资源管理重构**

```bash
git add app/(console)/admin/users/page.tsx app/(console)/admin/models/page.tsx app/(console)/admin/integration/page.tsx components/console/admin/user-management-panel.tsx components/console/admin/user-management-panel.test.tsx components/console/admin/model-management-panel.tsx components/console/admin/integration-settings-panel.tsx
git commit -m "feat: refresh admin resource management"
```

## 任务 7：端到端构建、响应式视觉和诊断验证

**文件：**

- 仅在发现真实问题时修改：由以下验证命令定位的具体文件。

- [ ] **步骤 1：在干净构建下运行完整静态验证**

运行：

```bash
npm test
npx tsc --noEmit
npm run build
```

预期：Vitest 全部通过，TypeScript 退出码 0，Next.js production build 退出码 0。

- [ ] **步骤 2：启动本地应用并执行管理员页面浏览器检查**

运行：

```bash
npm run dev
```

使用现有 Playwright 环境创建或临时运行下列检查（登录凭证仅使用仓库已有本地测试账号，不要输出 cookie 值）：

```ts
await page.goto("http://127.0.0.1:3000/admin");
await page.screenshot({ path: "/tmp/admin-desktop.png", fullPage: true });
await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await page.getByRole("button", { name: "打开导航" }).click();
await expect(page.getByText("控制台首页")).toBeVisible();
await page.screenshot({ path: "/tmp/admin-mobile.png", fullPage: true });
```

人工核对截图：亮色蓝灰背景、侧栏白色、当前导航蓝色高亮；桌面图表和资源表未横向裁切；移动侧栏从左侧打开，主内容不发生重叠。若测试账号不是管理员，改为只检查 `/account/usage` 的桌面和窄屏布局，并记录管理员视图需要由可用管理员账号复核，而不绕过授权。

- [ ] **步骤 3：运行编辑文件诊断并修正真实错误**

运行：

```text
lens_diagnostics mode=all severity=all
```

只对报告的阻断错误或直接由重构引入的告警进行最小修复；不得用 `@ts-ignore`、`eslint-disable` 或虚假空实现压制问题。每次修复后重新运行对应的最小 Vitest 文件，再运行：

```bash
npm test
npx tsc --noEmit
npm run build
```

- [ ] **步骤 4：审阅 API 数据泄漏和需求覆盖**

运行：

```bash
git diff HEAD~6..HEAD -- app/api/admin/dashboard lib/admin/fetch-dashboard-stats.ts lib/admin/dashboard-types.ts
rg -n "aiApiKeyHint|tavilyApiKeyHint|content" app/api/admin/dashboard lib/admin/fetch-dashboard-stats.ts lib/admin/dashboard-types.ts
```

预期：`AdminDashboardData` 或路由响应中不出现原始 `content`、密钥 value 或 key hint。`content` 只可存在于服务层 select / `parseChatMessageUsage` 调用范围，且不得进入 return DTO。

以规格逐项检查：亮色 shell、管理员首页、真实 KPI / 图表、配置状态而非伪健康度、用户模型集成原功能保留、个人空间、权限和移动导航均应有对应实现与验证。

- [ ] **步骤 5：提交最终验证后的修复（仅在存在修复时）**

```bash
git status --short
git add <由本任务实际修改的文件>
git commit -m "fix: polish control center verification findings"
```

若 `git status --short` 没有本任务产生的相关变更，不创建空提交。
