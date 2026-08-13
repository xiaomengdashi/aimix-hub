# 亮色中控后台重构设计

**日期：** 2026-08-13  
**状态：** 待用户审阅  
**范围：** `app/(console)`、`components/console` 及为管理员概览新增的只读聚合接口；不改变现有聊天、图像生成、认证和配置写入业务规则。

## 1. 目标与成功标准

将当前分散的“账号 / 管理”页面统一重构为亮色、信息密度适中的 AI 平台中控后台。后台必须：

1. 让管理员一进入控制台就能了解平台使用、模型配置和服务配置的当前状态。
2. 让管理员在不丢失现有功能的前提下完成用户、角色、模型目录与网关配置操作。
3. 让普通用户只看到自己的资料、用量和归档会话，绝不暴露管理数据或管理导航。
4. 保持移动端可用：桌面端为固定侧栏 + 主工作区，移动端折叠为抽屉导航。
5. 首页只展示有真实数据来源的图表和指标；不可观测的运行时健康度不虚构数值。

## 2. 已有功能与接口盘点

### 2.1 现有控制台页面

| 页面 | 现有能力 | 数据源 / 调用 |
| --- | --- | --- |
| `/account` | 显示用户名、身份角色、注册资料 | 服务端 `requireUser`、`getUserRole`、Supabase Auth |
| `/account/usage` | 会话、消息、Token、归档数量；14 天活跃；应用与绘图模型使用分布 | 服务端 `fetchUserAccountStats(user.id)`，读取 `threads`、`messages` |
| `/account/archived` | 显示云端已归档会话 | 服务端 `fetchUserAccountStats(user.id)` |
| `/admin/users` | 拉取用户；修改用户角色；删除非当前用户及其会话、消息 | `GET /api/admin/users`、`PATCH` / `DELETE /api/admin/users/:userId` |
| `/admin/models` | 分应用筛选模型；启停、编辑、排序、删除模型；从网关拉取和添加模型 | `GET` / `PUT /api/admin/models`；`GET /api/admin/models/gateway` |
| `/admin/integration` | 编辑 AI 网关和 Tavily 地址 / 密钥；测试 AI 网关连通性 | `GET` / `PUT /api/admin/integration`；`POST /api/admin/integration/test` |

所有 `/admin/*` 页面和 `/api/admin/*` 路由均由 `requireAdmin` 限制；控制台根布局由 `requireUser` 限制。这个授权边界保持不变。

### 2.2 已有 HTTP 接口合同

| 方法与路径 | 身份要求 | 请求 | 成功响应 | 用途 |
| --- | --- | --- | --- | --- |
| `GET /api/admin/users` | 管理员 | — | `{ users: ManagedUser[] }` | 管理员用户表 |
| `PATCH /api/admin/users/:userId` | 管理员 | `{ role: "admin" | "user" }` | `{ ok: true }` | 修改角色 |
| `DELETE /api/admin/users/:userId` | 管理员 | — | `{ ok: true }` | 删除用户及关联数据 |
| `GET /api/admin/models` | 管理员 | — | `{ models: ModelCatalogInput[] }` | 已配置模型目录 |
| `PUT /api/admin/models` | 管理员 | `{ models: ModelCatalogInput[] }` | `{ models: ModelCatalogInput[] }` | 整体保存模型目录 |
| `GET /api/admin/models/gateway` | 管理员 | — | `{ models: GatewayModelOption[] }` | 从当前 AI 网关发现模型 |
| `GET /api/admin/integration` | 管理员 | — | `{ settings: AdminIntegrationSettings }` | 读取脱敏后的集成设置 |
| `PUT /api/admin/integration` | 管理员 | `{ aiBaseUrl, aiApiKey?, tavilyBaseUrl?, tavilyApiKey? }` | `{ settings: AdminIntegrationSettings }` | 更新地址和密钥 |
| `POST /api/admin/integration/test` | 管理员 | — | `{ ok: true, count, modelsUrl }` | 请求网关模型列表验证连通性 |

失败响应维持现有约定：无权限为 `403` JSON；输入错误为 `400`；服务端加载/保存错误为 `500`；网关不可达为 `502`，均返回 `{ error: string }`。

## 3. 信息架构

### 管理员：两级操作空间

管理员进入 `/admin`（新增总览页）后，左侧菜单分成三个明确组：

- **总览**：`控制台首页`（`/admin`）、`运行分析`（第一期暂不单独创建路由，作为首页图表锚点）、`事件与告警`（第一期显示首页“需关注”清单，不创建伪审计页）。
- **资源管理**：`成员与权限`（`/admin/users`）、`模型与路由`（`/admin/models`）、`服务配置`（`/admin/integration`）。
- **个人空间**：`我的用量`（`/account/usage`）、`归档会话`（`/account/archived`）、`账号资料`（`/account`）。

这样“平台操作”和“个人使用”在导航中隔离，但仍允许管理员迅速进入自身信息。管理员导航的当前页采用淡蓝填充、蓝色图标和清晰文本，分组标签采用低对比度小型字。

### 普通用户：个人空间

普通用户不显示任何“总览”或“资源管理”入口，只看到三项个人空间菜单。现有服务器端 `requireAdmin` 仍是唯一可信任的保护；菜单过滤只是体验层。

## 4. 视觉与布局系统

采用用户确认的**亮色控制平面**：

- 页面底色：低饱和蓝灰 `#F6F8FB`；工作面：白色；主要文字：深蓝灰；唯一功能强调色为蓝色。
- 桌面：约 240px 白色侧栏、细分隔线、主工作区最大宽度放宽至 1440px，以容纳趋势图与操作表格。
- 顶部：面包屑、页面标题 / 数据说明、日期范围（首页）与紧凑辅助操作；移动端保留菜单按钮，隐藏非必要搜索位。
- 内容：以页面区块、分隔线和表格组织，卡片仅用于 KPI、图表和需独立操作的配置块；取消当前各页“统一小卡片堆叠”的视觉感。
- 动效：侧栏选中态与按钮/行 hover 使用 150–200ms 过渡；图表在首次进入时使用轻微描线或淡入，不使用循环和会影响读数的装饰动画；尊重 `prefers-reduced-motion`。

## 5. 新增管理员首页与数据设计

### 5.1 `/admin` 页面结构

1. **标题区**：系统概览、数据范围“最近 14 天”、数据更新时间说明。
2. **四个 KPI**：总用户数、14 天活跃用户数、14 天消息数、14 天 Token 用量。
3. **主图表**：14 天消息量和 Token 用量双序列趋势。必须使用真实 `messages.created_at` 和 `ai-sdk/v6` 消息中的使用量解析结果。
4. **模型使用分布**：按模型统计带 token 使用量的助手消息；若当前数据没有可解析模型 ID，则展示按应用（ChatGPT / Claude / Gemini / Other / Image）的真实使用分布，并明确标记统计维度。
5. **服务配置状态**：AI 网关地址、AI Key 是否配置、Tavily 是否配置、已启用模型数。这是“配置状态”，不是“在线状态”。提供跳转至服务配置 / 模型与路由的操作。
6. **近期管理活动**：第一期不显示虚构的操作日志。改用“需要处理”清单：未配置密钥、未启用模型、无法获得必要配置时的明确说明。审计日志在未来持久化管理动作后再加入。

### 5.2 新增接口

新增 `GET /api/admin/dashboard`，仅管理员可访问，接口负责把多次 Supabase 查询及设置读取收敛在服务端，客户端页面只获取一个安全、聚合后的只读对象。

```ts
type AdminDashboardResponse = {
  range: { start: string; end: string; days: 14 };
  overview: {
    totalUsers: number;
    activeUsers: number;
    messageCount: number;
    totalTokens: number;
    enabledModelCount: number;
  };
  activity: Array<{
    date: string;       // YYYY-MM-DD
    messageCount: number;
    tokenCount: number;
  }>;
  providerUsage: Array<{
    provider: AppId;
    messageCount: number;
    tokenCount: number;
  }>;
  modelUsage: Array<{
    modelId: string;
    label: string;
    messageCount: number;
    tokenCount: number;
  }>;
  integration: {
    aiBaseUrl: string | null;
    aiApiKeyConfigured: boolean;
    tavilyBaseUrl: string | null;
    tavilyApiKeyConfigured: boolean;
  };
  attention: Array<{
    id: "missing-ai-key" | "missing-tavily-key" | "no-enabled-models";
    level: "warning";
    title: string;
    description: string;
    href: "/admin/integration" | "/admin/models";
  }>;
};
```

该接口不返回任何原始密钥、用户个人身份资料、单条消息内容或会话标题。未授权时仍返回现有风格的 `403` JSON。

### 5.3 数据访问实现

新增纯服务层 `lib/admin/fetch-dashboard-stats.ts` 与对应类型文件。它复用账户统计中既有的 `parseChatMessageUsage`，但按全体数据做聚合：

- `profiles` / Auth 管理接口（依项目现有 `listManagedUsers` 所用策略）用于用户总数。
- `messages` 的 `created_at` 用于 14 天消息量和活跃用户去重。
- `messages` 的 `content` 仅在服务端通过既有解析器提取 Token；绝不传至浏览器。
- `threads.provider` 用于应用分布。
- `listManagedModels` 与 `getAdminIntegrationSettings` 用于配置状态。

若 Supabase schema 尚无单条聊天消息的模型 ID，首页不猜测模型使用量：渲染 provider 分布，并使组件的标题和空态与真实维度一致。

## 6. 现有页面重构边界

- **用户管理**：保留加载、角色切换、当前账号不可删除、二次确认删除、异常反馈；改为高可读的资源表（头像首字母、角色徽标、最近登录、行级操作），加入客户端搜索和角色筛选仅针对已加载列表，不改变接口。
- **模型与路由**：保留分应用标签、模型启停 / 编辑 / 排序 / 删除、网关拉取 / 添加、整体保存；重排为“当前目录 + 网关发现区”，使用表格和固定操作条，避免多个无层级的容器。
- **服务配置**：保留地址、密钥留空不覆盖、保存、连接测试和安全脱敏提示；分为“AI 网关”和“联网搜索”两个设置区，顶部显示当前配置状态。
- **个人用量**：保留所有现有统计与归档；用一致的亮色指标、趋势图和分布条替换当前通用卡片外观。
- **账号资料与归档**：保留字段和恢复入口（如已有），仅统一留白、标题、列表密度、空状态和按钮层级。

## 7. 组件边界

| 单元 | 职责 |
| --- | --- |
| `ConsoleShell` | 响应式整体布局、移动抽屉、内容宽度与顶部工作区；不拉取业务数据。 |
| `ConsoleSidebar` + `console-nav` | 根据角色渲染导航分组、活动态与账户区；不承担授权。 |
| `AdminDashboard` | 客户端加载、错误/重试、数据刷新；组合下列纯展示组件。 |
| Dashboard KPI / Trend / Distribution / Attention 组件 | 只接受结构化数据渲染；不直接调用 Supabase 或读取密钥。 |
| `fetchAdminDashboardStats` | 服务端聚合、默认 14 天范围、无敏感字段的返回类型。 |
| 现有管理面板 | 保持各自写操作与错误状态，视觉调整不把复杂业务逻辑迁移进页面。 |

## 8. 错误处理、空态与安全

- 首页获取失败显示包含“重试”按钮的错误区，不阻塞侧栏导航。
- 统计为零时图表显示基线与清晰的“所选周期暂无数据”，而非造数或隐藏模块。
- 配置密钥只显示“已配置 / 未配置”和现有 hint；所有接口与客户端状态均不得持久化、回显或记录完整密钥。
- 所有现有管理写操作继续在按钮禁用期间防重复提交，并原位显示成功或失败结果。
- 任何角色导航仅是辅助；页面和 API 的 `requireAdmin` 检查保持。

## 9. 测试与验证计划

1. 为 `fetchAdminDashboardStats` 写单元测试：14 天补零、活跃用户去重、Token 聚合、无模型 ID 的 provider 回退、缺失配置产生正确 attention 项、敏感字段不进入返回对象。
2. 为 `/api/admin/dashboard` 写路由测试：管理员成功、非管理员 `403`、服务层异常 `500`。
3. 为导航测试：管理员可见 `/admin` 与资源管理项；普通用户不可见它们；活动路由匹配正确。
4. 为首页展示组件测试：加载、成功、空态、失败重试；趋势图和分布可访问（文本摘要 / `aria-label`）。
5. 重构前后运行 TypeScript 检查、生产构建、相关测试和 `lens_diagnostics`；在桌面与窄视口进行浏览器视觉检查。

## 10. 非目标与后续扩展

本次不引入 RBAC 多角色体系、不修改数据库权限模型、不建立计费、不新增模型调用埋点、不创建告警推送服务，也不伪造服务 SLA。未来若要展示真实网关延迟、错误率和审计活动，需要新增请求遥测和管理操作审计表，再扩展首页的对应模块与接口。
