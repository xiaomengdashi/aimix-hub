# Claude Clone

基于 [Next.js](https://nextjs.org/) 与 [assistant-ui](https://www.assistant-ui.com/) 构建的 Claude 风格对话应用。支持多模型切换、场景化对话模式、双套 UI 主题，并通过 Supabase 实现用户登录与会话云端持久化。

## 功能概览

### 对话与模型

- 接入 **Anthropic 兼容 API**（默认 `ANTHROPIC_BASE_URL` 指向中转服务，可自行修改）
- 可选模型：
  - **Sonnet 4.6** — 日常均衡之选（默认）
  - **Opus 4.7** — 复杂任务
  - **Haiku 4.5** — 快速、省 token
- 流式输出，支持 Markdown 渲染与 **Shiki** 代码高亮
- 消息操作：复制、重新生成、编辑后重发等

### 场景模式（Mode）

在 **Claude 主题** 的空对话页可通过模式标签切换，每种模式会注入对应的系统提示词，并提供快捷建议卡片：

| 模式 | 说明 |
|------|------|
| **Write** | 写作、润色、邮件、提纲扩写 |
| **Learn** | 概念讲解、练习题、知识总结 |
| **Code** | 代码审查、Debug、功能实现 |
| **From Drive** | 基于上传文件或粘贴内容处理文档（尚未对接 Google Drive） |
| **From Calendar** | 日程与待办规划（尚未对接 Google Calendar） |

### 界面主题

可在设置中切换两套 UI（选择会保存在浏览器 `localStorage`）：

- **Claude** — 仿 Claude 官网的暖色布局，含模式标签、附件上传等
- **shadcn** — 经典侧边栏 + 顶栏布局，含会话列表、模型选择器

### 会话管理

- 多会话（Thread）列表，侧边栏新建、切换、归档
- 对话记录保存在 **Supabase**（`threads` / `messages` 表，按用户隔离 RLS）
- 自动生成会话标题（调用 Haiku 模型）
- 记住上次打开的会话（本地 `localStorage`）

### 用户系统

- 使用 **用户名 + 密码** 注册/登录（内部映射为 Supabase Email 认证）
- 账户页查看资料、退出登录
- 未登录访问会跳转 `/login`；未配置 Supabase 会跳转 `/setup`

## 技术栈

- **框架**：Next.js 16（App Router）、React 19
- **对话运行时**：`@assistant-ui/react`、`@assistant-ui/react-ai-sdk`、Vercel AI SDK
- **模型**：`@ai-sdk/anthropic`
- **认证与数据库**：Supabase（`@supabase/ssr`）
- **样式**：Tailwind CSS 4、Radix UI

## 环境要求

- Node.js 18+
- npm（或 pnpm / yarn）
- [Supabase](https://supabase.com/) 项目（登录与会话持久化）
- Anthropic 兼容 API 密钥

## 快速开始

### 1. 克隆并安装依赖

```bash
git clone <你的仓库地址> claude-clone
cd claude-clone
npm install
```

### 2. 配置环境变量

复制示例文件并填写：

```bash
cp .env.example .env.local
```

`.env.local` 需包含：

```env
# Anthropic 兼容 API
ANTHROPIC_API_KEY=你的密钥
ANTHROPIC_BASE_URL=https://yunwu.ai/v1

# Supabase（Settings → API）
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
```

> `ANTHROPIC_BASE_URL` 可改为你自己的 Anthropic 代理或官方端点（需以 `/v1` 结尾或可被自动补全）。

### 3. 初始化 Supabase 数据库

1. 在 [Supabase Dashboard](https://supabase.com/dashboard) 创建项目  
2. 打开 **SQL Editor**，执行仓库中的迁移脚本：

   `supabase/migrations/001_chat_threads.sql`

   该脚本会创建 `threads`、`messages` 表并启用行级安全（RLS）。

### 4. 配置 Supabase Authentication

在 **Authentication → Providers → Email** 中：

- 启用 **Email + Password**
- 本地开发建议关闭 **Confirm email**（否则注册后需邮件验证才能登录）
- **Site URL** 设为 `http://localhost:3000`

更详细的图文说明见应用内 `/setup` 页面（在未配置 Supabase 时自动跳转）。

### 5. 启动开发服务器

```bash
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)，注册账号后即可开始对话。

### 生产构建

```bash
npm run build
npm start
```

部署时请同步配置上述环境变量，并将 Supabase **Site URL** / **Redirect URLs** 改为你的生产域名。

### 自建服务器（替代 Vercel + Supabase Cloud）

完整迁移步骤（含 Docker、Nginx、数据 `pg_dump`、Storage 同步）见 **[deploy/README.md](deploy/README.md)**。

```bash
cp deploy/.env.example deploy/.env   # 填写域名与密钥
sudo bash deploy/scripts/server-setup.sh
bash deploy/scripts/setup-supabase.sh
# … 见 deploy/README.md
```

## 使用说明

### 注册与登录

1. 访问 `/login`
2. 输入用户名（需符合项目校验规则）与至少 6 位密码
3. 首次使用选择「注册」，之后选择「登录」

### 开始对话

1. 登录后进入首页，默认打开上次会话或新建对话
2. 在输入框输入问题，按 **Enter** 发送（**Shift + Enter** 换行）
3. **Claude 主题**：空对话页可切换 Write / Learn / Code 等模式，或点击建议卡片快速填入提示词
4. **shadcn 主题**：通过顶栏 **ModelPicker** 切换模型；左侧边栏管理历史会话

### 附件

在 **Claude 主题** 下，点击输入框左侧 **「+」** 可上传文件作为上下文（Drive / Calendar 模式会提示尚未对接云端，可先上传或粘贴内容）。

### 切换 UI 主题

在 **shadcn 主题** 顶栏使用主题切换按钮；选择 **Claude** 或 **shadcn**，刷新后仍会保持。

### 账户

点击用户菜单进入 **账户页**（`/account`），可查看资料并退出登录。

## 项目结构（简要）

```
app/
  api/chat/          # 流式聊天 API（模型 + 模式）
  api/thread-title/  # 会话标题生成
  login/             # 登录 / 注册
  setup/             # Supabase 配置引导
  account/           # 用户资料
components/
  assistant-ui/      # 对话 UI、模式、主题、附件等
  auth/              # 登录表单、用户菜单
lib/
  chat-modes.ts      # 场景模式定义
  chat-models.ts     # 模型列表
  supabase/          # Supabase 客户端与中间件
supabase/migrations/ # 数据库迁移 SQL
deploy/              # 自建部署脚本、Nginx 模板、Docker Compose
```

## 常见问题

**访问任意页面都跳到 `/setup`**  
说明 `NEXT_PUBLIC_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 未配置，请按上文填写 `.env.local` 并重启 `npm run dev`。

**登录后发送消息报 401**  
检查 Supabase 会话 Cookie 是否正常；确认 API 路由未被代理剥离 Cookie。

**聊天无响应或报错**  
确认 `ANTHROPIC_API_KEY` 有效，且 `ANTHROPIC_BASE_URL` 可访问；查看终端与浏览器控制台的具体错误信息。

**注册成功但无法登录**  
若 Supabase 开启了邮箱确认，需先验证邮件，或在 Dashboard 关闭「Confirm email」。

## 许可证

本项目为私有示例应用（`package.json` 中 `"private": true`）。使用前请遵守 Anthropic API 与 Supabase 的服务条款。
