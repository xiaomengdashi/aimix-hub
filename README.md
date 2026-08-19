# Aimix Hub

自托管多模型 AI 聚合工作台：在统一的界面中使用 ChatGPT、Claude、Gemini 及国产模型对话，内置绘图工作台、联网搜索、Artifacts 与亮色管理中控台。基于 Next.js 16 与 Supabase 构建，多用户隔离，密钥不落环境文件。

## 功能概览

### 多模型对话

- 模型目录由管理员在后台配置，支持 **OpenAI / Anthropic / Google** 多后端，从 AI 网关一键拉取
- 分应用入口：ChatGPT / Claude / Gemini / 国产，各自独立会话列表
- 流式输出，Markdown + KaTeX 公式 + Mermaid 图表渲染，Shiki 代码高亮
- 消息操作：复制、重新生成、编辑后重发；提问目录快速定位历史消息
- **联网搜索**：对话可调用 Tavily 检索实时信息（后台配置密钥）

### 场景模式

空对话页可切换模式，注入对应系统提示词：

| 模式 | 说明 |
| ------ | ------ |
| **Write** | 写作、润色、邮件、提纲扩写 |
| **Learn** | 概念讲解、练习题、知识总结 |
| **Code** | 代码审查、Debug、功能实现 |
| **From Drive** | 处理上传或粘贴的文档（尚未对接 Google Drive） |
| **From Calendar** | 日程与待办规划（尚未对接 Google Calendar） |

### Image Studio 绘图工作台

- 独立绘图界面（`/image`），多会话管理
- 生成模型同样由后台模型目录控制，用量计入统计

### 管理中控台（Axis Control）

亮色管理后台，侧栏分组为总览 / 资源管理 / 个人空间：

- **控制台首页**（`/admin`）：总用户、14 天活跃用户、消息量、Token 用量四项 KPI；消息与 Token 双序列趋势图；应用使用分布；服务配置状态与待处理事项
- **成员与权限**（`/admin/users`）：本地搜索与角色筛选、分配 admin/user 角色、删除用户（连带其会话与消息）
- **模型与路由**（`/admin/models`）：从网关发现模型、启停 / 编辑 / 排序，控制运行时可见模型
- **服务配置**（`/admin/integration`）：AI 网关与 Tavily 地址密钥，连接测试；密钥只显示配置状态，不回显内容
- **我的用量**（`/account/usage`）：个人会话、消息、Token 统计与 14 天活跃趋势
- **归档会话**（`/account/archived`）：云端归档，可随时恢复

普通用户仅能看到个人空间菜单；所有管理页面与接口由 `requireAdmin` 在服务端保护。

## 技术栈

- **框架**：Next.js 16（App Router、Turbopack）、React 19
- **对话运行时**：`@assistant-ui/react`、`@assistant-ui/react-ai-sdk`、Vercel AI SDK（`ai`）
- **模型后端**：`@ai-sdk/openai`、`@ai-sdk/anthropic`、`@ai-sdk/google`
- **认证与数据库**：Supabase（`@supabase/ssr`，RLS 行级安全）
- **样式**：Tailwind CSS 4、Radix UI、lucide-react
- **测试**：Vitest + Testing Library

## 环境要求

- Node.js **22**（见 `.nvmrc`）
- npm
- [Supabase](https://supabase.com/) 项目（登录、会话持久化、后台配置存储）
- 一个 OpenAI 兼容的 **AI 网关**地址与密钥（在管理后台配置，无需写入环境变量）

## 快速开始

### 1. 克隆并安装依赖

```bash
git clone https://github.com/xiaomengdashi/aimix-hub.git
cd aimix-hub
npm install
```

### 2. 配置环境变量

复制示例文件并填写 Supabase 连接信息：

```bash
cp .env.example .env.local
```

`.env.local` 需包含（三个值都来自 Supabase Dashboard → Settings → API）：

```env
# Supabase 项目地址
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
# 匿名公开密钥
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOi...
# service_role 密钥（服务端管理 RPC 使用，推荐 legacy eyJ 格式）
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOi...
```

> AI 网关与 Tavily 密钥**不需要**环境变量——部署后在管理后台 `/admin/integration` 中配置，存储于数据库。

### 3. 初始化 Supabase 数据库

1. 在 [Supabase Dashboard](https://supabase.com/dashboard) 创建项目
2. 打开 **SQL Editor**，**按文件名顺序执行 `supabase/migrations/` 下的全部迁移脚本**（001 → 014，共 15 个文件）

这些脚本会创建会话、消息、用户角色、模型目录、集成配置等全部表与 RPC，并启用行级安全。跳过任何一个都会导致对应功能（登录角色、管理后台等）不可用。

### 4. 配置 Supabase Authentication

在 **Authentication → Providers → Email** 中：

- 启用 **Email + Password**
- 本地开发建议关闭 **Confirm email**（否则注册后需邮件验证才能登录）
- **Site URL** 设为 `http://localhost:3000`

更详细的引导见应用内 `/setup` 页面（未配置 Supabase 时自动跳转）。

### 5. 启动开发服务器

```bash
npm run dev
```

浏览器访问 [http://localhost:3000](http://localhost:3000)。

### 6. 首次部署后的管理员配置

1. 注册首个账号
2. 在 Supabase 中将该用户设为管理员（`user_profiles` 表 `app_role` 字段设为 `admin`，或参考 `supabase/migrations/006_user_roles.sql`）
3. 以管理员身份进入 `/admin/integration`，填写 AI 网关地址与密钥，点击「测试 AI 连接」验证
4. 进入 `/admin/models`，从网关拉取并启用所需模型

### 测试

```bash
npm test          # Vitest 全量运行
npm run test:watch
```

### 生产构建

```bash
npm run build
npm start
```

部署时同步配置上述 Supabase 环境变量，并将 Supabase **Site URL** / **Redirect URLs** 改为生产域名。

## 使用说明

### 注册与登录

1. 访问 `/login`
2. 输入用户名与**至少 6 位**密码，首次使用选择「注册」，之后选择「登录」

### 开始对话

1. 登录后进入首页，默认打开上次会话或新建对话
2. 输入问题，**Enter** 发送，**Shift + Enter** 换行
3. 空对话页可切换 Write / Learn / Code 等模式，或点击建议卡片
4. 通过应用入口（ChatGPT / Claude / Gemini / 国产 / 绘图）切换模型目录与界面
5. 点击输入框左侧 **「+」** 上传文件作为上下文

### 管理后台

管理员从任意控制台页面左侧栏进入「控制台首页」「成员与权限」「模型与路由」「服务配置」。侧栏底部为当前账号与退出登录按钮。

## 项目结构（简要）

```
app/
  (console)/            # 控制台（亮色中控后台）
    admin/              #   管理员：首页概览 / 用户 / 模型 / 集成配置
    account/            #   所有用户：资料 / 用量 / 归档会话
  api/                  # 路由：chat、admin/*、images、auth、thread-title
  [provider]/           # 对话界面（按应用入口）
  image/                # Image Studio 绘图工作台
  login/                # 登录 / 注册
  setup/                # Supabase 配置引导
components/
  console/              # 控制台外壳、侧栏、后台面板、图表
  assistant-ui/         # 对话 UI、模式、主题、附件
  auth/                 # 登录表单、用户菜单
  image-studio/         # 绘图工作台组件
lib/
  admin/                # 管理端聚合、模型目录、集成设置
  chat/                 # 模型、模式、会话存储、上下文用量
  ai-gateway/           # 网关模型发现与后端推断
  supabase/             # 客户端与服务端
supabase/migrations/    # 数据库迁移 SQL（001-014）
```

## 常见问题

**访问任意页面都跳到 `/setup`**
`NEXT_PUBLIC_SUPABASE_URL` 或 `NEXT_PUBLIC_SUPABASE_ANON_KEY` 未配置，按上文填写 `.env.local` 后重启。

**登录后发送消息报 401**
检查 Supabase 会话 Cookie；确认反向代理未剥离 Cookie。

**聊天无响应或报错**
以管理员进入 `/admin/integration`，点击「测试 AI 连接」验证网关可达；进入 `/admin/models` 确认已启用模型。查看终端与浏览器控制台的具体错误。

**管理后台提示需配置密钥 / 无可用模型**
对应 `/admin/integration` 与 `/admin/models` 的待处理事项，控制台首页会汇总提示。

**注册成功但无法登录**
若 Supabase 开启了邮箱确认，需先验证邮件，或在 Dashboard 关闭「Confirm email」。

## 许可证

本项目为私有部署示例应用（`package.json` 中 `"private": true`）。使用前请遵守所用模型 API、AI 网关及 Supabase 的服务条款。
