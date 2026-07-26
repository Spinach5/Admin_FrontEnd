# 校园管理系统前端

基于 React 19 + TypeScript + Vite 构建的校园管理后台系统，提供管理员、店铺、食品、事务、教材、社团等多模块管理功能。

## 项目概述

本项目是一个综合性校园管理平台的前端系统，主要面向学校管理人员，提供以下功能模块：

- **管理员管理**：系统管理员账户的增删改查
- **用户管理**：普通用户的管理与权限控制
- **店铺管理**：食堂摊位信息管理
- **食品管理**：各类食品信息维护
- **事务管理**：校园事务发布与分类管理
- **教材管理**：二手教材流转与分类管理
- **材料管理**：教材库存管理，支持按学期和班级批量导入
- **社团管理**：学生社团信息维护
- **对话管理**：买卖双方沟通消息查询
- **Excel 导入**：支持数据的 Excel 批量导入功能

## 技术栈

| 类别 | 技术 | 版本 | 说明 |
|------|------|------|------|
| 框架 | React | 19.x | UI 框架 |
| 语言 | TypeScript | 6.x | 类型安全的 JavaScript 超集 |
| 构建工具 | Vite | 8.x | 快速的前端开发构建工具 |
| UI 组件库 | Material UI (MUI) | 9.x | 基于 Material Design 的组件库 |
| CSS 方案 | Emotion | 11.x | CSS-in-JS 样式解决方案 |
| HTTP 客户端 | Axios | 1.x | 基于 Promise 的 HTTP 请求库 |
| 路由 | React Router DOM | 7.x | 客户端路由管理 |
| 通知提示 | Notistack | 3.x | Snackbar 通知管理 |
| 代码规范 | ESLint | 10.x | JavaScript/TypeScript 代码检查工具 |

## 项目结构

```
frontEnd/
├── src/
│   ├── api/                          # API 接口层
│   │   ├── client.ts                 # Axios 客户端实例（JWT 拦截器、401 处理）
│   │   ├── types.ts                  # 全局 TypeScript 类型定义
│   │   ├── auth.ts                   # 登录认证接口
│   │   ├── admin.ts                  # 管理员接口
│   │   ├── users.ts                  # 用户接口
│   │   ├── shops.ts                  # 店铺接口
│   │   ├── foods.ts                  # 食品接口
│   │   ├── affairs.ts                # 事务接口
│   │   ├── affairCategories.ts       # 事务分类接口
│   │   ├── books.ts                  # 教材接口
│   │   ├── bookCategories.ts         # 教材分类接口
│   │   ├── clubs.ts                  # 社团接口
│   │   ├── materials.ts              # 材料接口
│   │   ├── conversations.ts          # 对话接口
│   │   └── excel.ts                  # Excel 导入接口
│   │
│   ├── components/                   # 组件层
│   │   ├── Auth/                     # 认证相关组件
│   │   │   ├── LoginPage.tsx         # 登录页面
│   │   │   ├── ChangePasswordPage.tsx # 修改密码页面
│   │   │   └── ProtectedRoute.tsx    # 路由守卫组件
│   │   │
│   │   ├── Layout/                   # 布局组件
│   │   │   ├── AppLayout.tsx         # 主布局容器（侧边栏 + 顶部栏 + 内容区）
│   │   │   ├── Sidebar.tsx           # 侧边导航栏
│   │   │   └── TopBar.tsx            # 顶部工具栏
│   │   │
│   │   ├── Common/                   # 通用组件
│   │   │   ├── DataTable.tsx         # 通用数据表格（支持加载/错误/空状态）
│   │   │   ├── ConfirmDialog.tsx    # 确认对话框
│   │   │   ├── PaginationBar.tsx     # 分页组件
│   │   │   └── SearchBar.tsx         # 搜索栏组件
│   │   │
│   │   ├── Admin/                    # 管理员管理
│   │   ├── User/                     # 用户管理
│   │   ├── Shop/                     # 店铺管理
│   │   ├── Food/                     # 食品管理
│   │   ├── Affair/                   # 事务管理
│   │   ├── AffairCategory/           # 事务分类管理
│   │   ├── Book/                     # 教材管理
│   │   ├── BookCategory/             # 教材分类管理
│   │   ├── Club/                     # 社团管理
│   │   ├── Material/                 # 材料管理
│   │   ├── Conversation/             # 对话管理
│   │   └── Excel/                    # Excel 导入
│   │       └── ExcelImportDialog.tsx # Excel 导入对话框
│   │
│   ├── context/
│   │   └── AuthContext.tsx           # 认证状态 Context（Token/User 管理）
│   │
│   ├── theme/
│   │   └── theme.ts                  # MUI 主题配置（颜色、字体、圆角等）
│   │
│   ├── App.tsx                       # 应用根组件（路由配置）
│   ├── main.tsx                      # 应用入口
│   └── index.css                     # 全局样式
│
├── .env                              # 环境变量配置
├── .env.example                      # 环境变量示例
├── vite.config.ts                    # Vite 配置（代理、插件）
├── tsconfig.json                     # TypeScript 配置
├── eslint.config.js                  # ESLint 配置
├── package.json                      # 项目依赖配置
└── README.md                         # 项目说明文档
```

## 架构设计

### 认证流程

1. 用户通过登录页面进行认证，后端返回 JWT Token 和用户信息
2. Token 和用户信息通过 `AuthContext` 存储在 `localStorage` 中
3. Axios 客户端请求拦截器自动为每个请求附加 `Authorization: Bearer <token>` 请求头
4. 响应拦截器检测到 401 状态码时，自动清除认证信息并跳转到登录页
5. `ProtectedRoute` 组件检查 Token 是否存在，无 Token 则重定向到登录页

### API 层设计

- 每个业务模块对应一个独立的 API 文件
- 所有 API 函数返回 `ApiResponse<T>` 类型，结构为：
  ```typescript
  interface ApiResponse<T = unknown> {
    success: boolean;
    data?: T;
    message?: string;
    total?: number;
  }
  ```
- 统一的 Axios 客户端实例，配置了请求超时（15s）和错误处理

### CRUD 模式

各业务模块遵循统一的 CRUD 实现模式：

1. `*List` 组件负责状态管理（数据数组、加载状态、错误信息）
2. 使用 `DataTable` 通用组件展示数据列表
3. 使用 `*Form` 组件进行新增和编辑操作
4. 使用 `ConfirmDialog` 组件进行删除确认
5. 通过 `enqueueSnackbar` 实现操作反馈提示

### 路由与懒加载

- 所有业务页面通过 `React.lazy` 和 `Suspense` 实现路由级别代码分割
- 登录页独立于主布局，不受认证保护
- 其他页面嵌套在 `AppLayout` 下，通过 `<Outlet />` 渲染子路由

## 环境配置

复制 `.env.example` 为 `.env` 并根据实际情况修改：

```bash
cp .env.example .env
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `VITE_API_URL` | 后端 API 基础地址 | `http://localhost:3001/api` |

## 快速开始

### 前置条件

- Node.js >= 18.x
- npm >= 9.x

### 安装依赖

```bash
npm install
```

### 开发模式

启动开发服务器，默认运行在 `http://localhost:5173`：

```bash
npm run dev
```

开发服务器会将 `/api` 请求代理到后端服务 `http://localhost:3001`。

### 生产构建

```bash
npm run build
```

该命令会先执行 TypeScript 类型检查，然后进行 Vite 生产构建，产物输出到 `dist/` 目录。

### 预览生产构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

## 主题配置

项目使用 MUI 自定义主题，配置位于 `src/theme/theme.ts`：

- **主色调**：`#2e9bfa`（蓝色）
- **次色调**：`#f50057`（品红色）
- **背景色**：`#f5f5f5`（浅灰色）
- **字体**：Noto Sans SC / Roboto / Helvetica / Arial
- **圆角**：按钮 6px，对话框和卡片 12px

## 通用组件

### DataTable

通用数据表格组件，支持：
- 泛型类型约束 `T extends { id: number }`
- 自定义列渲染函数
- 加载状态（骨架屏）
- 错误状态（重试按钮）
- 空数据状态
- 编辑和删除操作回调

### ExcelImportDialog

Excel 批量导入对话框，支持：
- 文件选择与上传
- 数据预览
- 批量确认导入

## 开发说明

### 新增业务模块

添加新业务模块的标准步骤：

1. 在 `src/api/` 下创建 API 接口文件
2. 在 `src/components/` 下创建对应文件夹和组件
3. 在 `src/App.tsx` 中添加路由配置
4. 在 `src/components/Layout/Sidebar.tsx` 中添加导航菜单项

### API 文件规范

```typescript
import client from './client';
import type { ApiResponse } from './types';

// 获取列表
export async function getX(): Promise<ApiResponse<XType[]>> {
  const res = await client.get<ApiResponse<XType[]>>('/resource');
  return res.data;
}

// 创建
export async function createX(data: Partial<XType>): Promise<ApiResponse<XType>> {
  const res = await client.post<ApiResponse<XType>>('/resource', data);
  return res.data;
}

// 更新
export async function updateX(id: number, data: Partial<XType>): Promise<ApiResponse<XType>> {
  const res = await client.put<ApiResponse<XType>>(`/resource/${id}`, data);
  return res.data;
}

// 删除
export async function deleteX(id: number): Promise<ApiResponse<void>> {
  const res = await client.delete<ApiResponse<void>>(`/resource/${id}`);
  return res.data;
}
```

## 常见问题

### 开发时 API 请求失败？

确保后端服务已启动在 `http://localhost:3001`。如需修改后端地址，更新 `.env` 文件中的 `VITE_API_URL`。

### 如何处理 401 错误？

系统已自动处理 401 响应，会清除本地认证信息并跳转到登录页。如果需要自定义处理逻辑，可修改 `src/api/client.ts` 中的响应拦截器。

### 如何添加新的环境变量？

1. 在 `.env.example` 中添加变量说明
2. 在 `.env` 中设置实际值
3. 在代码中通过 `import.meta.env.VITE_XXX` 访问

## 许可证

本项目仅供学习和开发使用。
