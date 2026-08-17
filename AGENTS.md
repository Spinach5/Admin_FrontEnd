# AGENTS.md

面向 AI 代理的项目说明书。阅读本文件后，任何 AI 均可快速理解本项目的定位、结构、技术栈、运行方式与关键约定，从而独立完成开发、调试与维护任务。

## 目录

- [项目简介](#项目简介)
- [技术栈](#技术栈)
- [快速开始](#快速开始)
- [目录结构](#目录结构)
- [入口与数据流](#入口与数据流)
- [核心概念与约定](#核心概念与约定)
- [API 接口层](#api-接口层)
- [环境变量](#环境变量)
- [常见任务](#常见任务)
- [部署](#部署)
- [注意事项与待补充](#注意事项与待补充)

## 项目简介

本项目是「校园管理系统」的**纯前端**单页应用（SPA），面向学校管理人员提供后台管理界面。后端为独立的 API 服务（默认 `http://localhost:3001`，不在本仓库内）。

主要功能模块：

| 模块 | 路由 | 说明 |
|------|------|------|
| 管理员管理 | `/admin` | 系统管理员账户 CRUD |
| 用户管理 | `/users` | 普通用户管理，含冻结、软删/硬删 |
| 书籍列表 | `/books` | 二手教材信息维护（含图片上传） |
| 书籍种类 | `/book-categories` | 教材分类管理 |
| 教材管理 | `/materials` | 教材库存，支持按学期/班级查询与批量导入 |
| 餐厅列表 | `/shops` | 食堂摊位信息 |
| 食物列表 | `/foods` | 食品信息 |
| 事务列表 | `/affairs` | 校园事务发布 |
| 事务种类 | `/affair-categories` | 事务分类 |
| 社团列表 | `/clubs` | 学生社团信息 |
| 聊天记录 | `/conversations` | 买卖双方沟通消息查询 |
| 修改密码 | `/change-password` | 当前账户改密 |

## 技术栈

| 类别 | 技术 | 版本 | 用途 |
|------|------|------|------|
| 框架 | React | 19.x | UI |
| 语言 | TypeScript | 6.x | 类型安全 |
| 构建 | Vite | 8.x | 开发/构建 |
| UI 库 | Material UI (MUI) | 9.x | 组件库 |
| CSS | Emotion | 11.x | CSS-in-JS（由 MUI 内置使用） |
| HTTP | Axios | 1.x | 请求客户端 |
| 路由 | react-router-dom | 7.x | 客户端路由 |
| 通知 | notistack | 3.x | Snackbar 反馈 |
| Lint | ESLint + typescript-eslint | 10.x | 代码检查 |

## 快速开始

> 包管理器：仓库同时存在 `package-lock.json` 与 `pnpm-lock.yaml`，README/文档统一以 **npm** 为准。

```bash
npm install        # 安装依赖
npm run dev        # 启动开发服务器，默认 http://localhost:5173
npm run build      # 类型检查(tsc -b) + 生产构建，产物输出 dist/
npm run lint       # ESLint 全量检查
npm run preview    # 本地预览生产构建
```

开发服务器将 `/api` 请求代理到 `http://localhost:3001`（见 [vite.config.ts](file:///home/zqw/biancheng/Project/frontEnd/vite.config.ts)）。运行前需确保后端服务已启动。

## 目录结构

```
frontEnd/
├── index.html                  # HTML 入口，挂载 #root
├── vite.config.ts              # Vite 配置（React 插件 + /api 代理）
├── tsconfig.json               # 引用 app / node 两个子配置
├── tsconfig.app.json           # 源码编译配置（src）
├── tsconfig.node.json          # 构建脚本配置（vite.config.ts）
├── eslint.config.js            # ESLint 扁平配置
├── .env.example                # 环境变量示例
├── deploy.sh                   # 部署脚本（构建 + rsync + 重启 nginx）
├── public/                     # 静态资源（favicon、登录背景图）
└── src/
    ├── main.tsx                # 应用入口（createRoot）
    ├── App.tsx                 # 根组件：Provider 装配 + 路由表
    ├── index.css               # 全局样式
    ├── api/                    # API 层（一资源一模块 + 客户端 + 类型）
    │   ├── client.ts           # Axios 实例（JWT 拦截器、401 处理、15s 超时）
    │   ├── types.ts            # 全部共享类型（ApiResponse、各实体接口）
    │   ├── auth.ts             # 登录/登出/改密/当前用户/模块
    │   ├── admin.ts            # 管理员（/admin/admins）
    │   ├── users.ts            # 普通用户（冻结、软删/硬删）
    │   ├── shops.ts  foods.ts  # 店铺 / 食品
    │   ├── affairs.ts  affairCategories.ts  # 事务 / 事务分类
    │   ├── books.ts  bookCategories.ts      # 书籍 / 书籍分类（含图片上传）
    │   ├── clubs.ts            # 社团
    │   ├── materials.ts        # 教材（查询/班级/学期/预览/导入）
    │   ├── conversations.ts    # 聊天会话与消息
    │   └── excel.ts            # 通用 Excel 预览/导入
    ├── components/
    │   ├── Layout/             # AppLayout、Sidebar、TopBar
    │   ├── Auth/               # LoginPage、ChangePasswordPage、ProtectedRoute
    │   ├── Common/             # DataTable、ConfirmDialog、PaginationBar、SearchBar
    │   ├── Excel/              # ExcelImportDialog（通用导入弹窗）
    │   ├── Admin/  User/       # 各业务模块的 *List + *Form
    │   ├── Shop/  Food/  Affair/  AffairCategory/
    │   ├── Book/  BookCategory/  Club/  Material/  Conversation/
    ├── context/
    │   └── AuthContext.tsx     # 认证状态（token + user，localStorage 持久化）
    └── theme/
        └── theme.ts            # MUI 主题（主色 #2e9bfa、圆角、字体）
```

## 入口与数据流

1. `main.tsx` 通过 `createRoot` 渲染 `<App />`。
2. `App.tsx` 按层级包裹 Provider：`ThemeProvider` → `CssBaseline` → `SnackbarProvider` → `AuthProvider` → `BrowserRouter` → `Routes`。
3. 路由分两类：
   - `/login` 独立、无需认证；
   - `/` 由 `ProtectedRoute` 包裹 `AppLayout`，内部通过 `<Outlet />` 渲染各业务页，`index` 重定向到 `/admin`，兜底 `*` 重定向到 `/`。
4. 所有业务页面通过 `React.lazy` + `Suspense` 做路由级代码分割。

**认证数据流**：登录页调用 `auth.ts` 的 `login()` → 成功后 `AuthContext.login()` 将 `token` 与 `user` 写入 `localStorage` → Axios 请求拦截器为每个请求附加 `Authorization: Bearer <token>` → 响应拦截器捕获 401 时清除本地凭证并跳转 `/login` → `ProtectedRoute` 依据 `token` 是否存在决定是否放行。

## 核心概念与约定

### 统一响应结构 `ApiResponse<T>`

所有接口返回 `ApiResponse<T>`（定义于 `types.ts`）：

```typescript
interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  total?: number;
}
```

### CRUD 模式（每个业务模块统一遵循）

- `*List` 组件持有状态：数据数组、`loading`、`error`、表单/删除弹窗开关、分页、搜索关键字。
- 展示用通用组件 `DataTable<T>`（`T extends { id: number }`），自带加载骨架、错误重试、空态、编辑/删除回调。
- 新增/编辑用 `*Form` 弹窗；删除用 `ConfirmDialog`；成功/失败用 `enqueueSnackbar` 反馈。
- 列表多为**前端分页与搜索**（一次拉全量，再 `slice` + 过滤），仅 `materials` 走带参数的接口查询。

### 通用组件

- `DataTable<T>`：泛型表格，`Column<T>[]` 定义列，`render` 自定义单元格；内置 loading/error/empty/pagination。
- `PaginationBar`：上/下页 + 每页条数（20/50/100）。
- `SearchBar`：按字段 + 关键词搜索，字段列表由调用方传入 `SearchField[]`。
- `ConfirmDialog`：确认/取消弹窗。
- `ExcelImportDialog`：通用 `.xlsx` 导入（上传 → 预览 → 确认导入），`table` 参数指定目标表（`shops`/`foods`/`affairs`）。
- `MaterialExcelImportDialog`：教材专用导入（需指定学期）。

### 布局与导航

- `AppLayout`：`TopBar`（固定 AppBar）+ `Sidebar`（240px 永久 Drawer）+ 内容区（`flexGrow`，`ml: 240px`、`mt: 64px`）。
- `Sidebar` 的菜单项是**静态数组** `menuItems`（位于 `Sidebar.tsx`），未使用 `auth.ts` 的 `getModules()` 动态渲染。
- 激活菜单高亮主色 `primary.main`。

### 主题

`theme.ts` 定义：主色 `#2e9bfa`、次色 `#f50057`、背景 `#f5f5f5`、字体 `Noto Sans SC`；按钮圆角 6px、对话框/卡片 12px、按钮 `textTransform: none`。

## API 接口层

`src/api/` 下每个资源一个文件，导出类型化的异步函数，返回 `res.data`（即 `ApiResponse`）。基地址来自 `VITE_API_URL`，超时 15s，请求/响应拦截器见 [client.ts](file:///home/zqw/biancheng/Project/frontEnd/src/api/client.ts)。

主要端点对照：

| 资源 | 文件 | 端点（相对） |
|------|------|------|
| 认证 | `auth.ts` | `/auth/login` `/auth/logout` `/auth/me` `/auth/change-password` `/modules` |
| 管理员 | `admin.ts` | `/admin/admins`（GET/POST）`/admin/admins/:id`（PUT/DELETE） |
| 用户 | `users.ts` | `/users` `/users/:id` `/users/:id/hard`（硬删）`/users/:id/freeze`（冻结） |
| 店铺/食品/事务 | `shops.ts` `foods.ts` `affairs.ts` | 标准 CRUD |
| 事务分类 | `affairCategories.ts` | `/affair-categories` |
| 书籍 | `books.ts` | `/books` `/books/:id` `/books/upload-image` `/books/categories` |
| 书籍分类 | `bookCategories.ts` | `/book/categories/detail` `/book/categories` |
| 社团 | `clubs.ts` | `/clubs` `/clubs/categories` |
| 教材 | `materials.ts` | `/materials` `/materials/classes` `/materials/semesters` `/materials/preview` `/materials/import` |
| 会话 | `conversations.ts` | `/conversations/user/:userId` `/conversations/:id/messages` `/conversations/:id` |
| Excel | `excel.ts` | `/excel/preview` `/excel/import?table=` |

**实现注意事项**：

- 部分后端返回字段为 `snake_case`（如 `book_id`、`school_id`），API 层在内部用 `mapXxx` 函数映射为前端使用的 `id`/驼峰字段（见 `books.ts`、`materials.ts`、`conversations.ts`）。
- Go 后端 `sql.NullString`/`sql.NullFloat64` 序列化为 `{ String, Valid }` / `{ Float64, Valid }` 对象，前端需用 `nullStr`/`nullNum` 等辅助函数归一化（见 `materials.ts`）。
- `bookCategories.ts` 中 `school_id` 被**硬编码为 `'hbut'`**，创建/查询均默认该校，改动时需注意。

## 环境变量

复制 `.env.example` 为 `.env` 后按需修改：

```bash
cp .env.example .env
```

| 变量名 | 必填 | 默认值 | 用途 |
|--------|------|--------|------|
| `VITE_API_URL` | 否 | 无（未设置时 axios 无 baseURL） | 后端 API 基地址，如 `http://localhost:3001/api` |

> 注意：`client.ts` 直接读取 `import.meta.env.VITE_API_URL`，未在代码中提供回退值；`.env.example` 给出 `http://localhost:3001/api` 作为示例。新增变量需以 `VITE_` 前缀暴露给客户端。

## 常见任务

### 新增业务模块

标准步骤：

1. 在 `src/api/` 新建接口文件（参考 `shops.ts` 的 CRUD 模板）。
2. 在 `src/components/<Module>/` 下创建 `<Module>List.tsx` + `<Module>Form.tsx`（参考 `ShopList.tsx`/`ShopForm.tsx`）。
3. 在 `src/App.tsx` 用 `lazy` 引入并添加路由。
4. 在 `src/components/Layout/Sidebar.tsx` 的 `menuItems` 添加菜单项。

### API 文件模板

```typescript
import client from './client';
import type { ApiResponse, SomeType } from './types';

export async function getSome() {
  const res = await client.get<ApiResponse<SomeType[]>>('/resource');
  return res.data;
}
export async function createSome(data: Omit<SomeType, 'id'>) {
  const res = await client.post<ApiResponse>('/resource', data);
  return res.data;
}
export async function updateSome(id: number, data: Omit<SomeType, 'id'>) {
  const res = await client.put<ApiResponse>(`/resource/${id}`, data);
  return res.data;
}
export async function deleteSome(id: number) {
  const res = await client.delete<ApiResponse>(`/resource/${id}`);
  return res.data;
}
```

### 调试

- 前端接口报 401/跨域：确认后端已在 `http://localhost:3001` 启动，并核对 `.env` 的 `VITE_API_URL`。
- 401 会自动清除凭证并跳转 `/login`，若需自定义逻辑改 `client.ts` 响应拦截器。
- 类型检查与构建：`npm run build`；代码检查：`npm run lint`。

## 部署

`deploy.sh` 为生产部署脚本（非跨平台通用，需自行按环境调整）：

1. `npm run build` 构建；
2. 通过 `rsync` 将 `dist/` 同步到远程服务器 `SSH_ALIAS=server` 的 `REMOTE_DIR=/home/www/project/react`；
3. SSH 到服务器执行 `sudo systemctl restart nginx` 重启 Nginx。

> 涉及真实服务器地址、SSH 别名、Nginx 配置，属于环境敏感信息，部署前请确认与当前环境一致。

## 注意事项与待补充

**约定与规范**

- 无测试框架与 `test` 脚本，当前项目**无自动化测试**。
- 未发现 `commitlint`/`CONTRIBUTING`/CI 配置（无 `.github`、`.gitlab-ci.yml` 等），**提交规范待补充**。
- 代码注释与文案以中文为主。

**待补充/需人工确认**

- Node.js 版本要求：README 声明 `>= 18.x`，但 Vite 8 / TypeScript 6 通常要求更高的 Node（20+），实际最低版本待确认。
- 后端 API 文档与数据字典未随仓库提供，字段语义以 `types.ts` 与各 API 模块的映射逻辑为准。
- `auth.ts` 的 `getModules()` 目前未参与侧边栏渲染（侧边栏为静态数组），其用途待确认。

> 更多面向开发者的细节可参考 [CLAUDE.md](file:///home/zqw/biancheng/Project/frontEnd/CLAUDE.md) 与 [README.md](file:///home/zqw/biancheng/Project/frontEnd/README.md)，但注意 `CLAUDE.md` 的目录说明已过时，未包含 `Book`、`BookCategory`、`Club`、`Conversation`、`Material`、`User` 等模块，以本文为准。
