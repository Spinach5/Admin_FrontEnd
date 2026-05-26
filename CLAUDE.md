# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev       # Start dev server on port 5173
npm run build     # TypeScript check + Vite production build
npm run lint      # ESLint across the project
npm run preview   # Preview production build locally
```

## Tech Stack

React 19 + TypeScript 6 + Vite 8. UI: MUI 9 (Material UI) with Emotion CSS-in-JS. HTTP: Axios with a shared client. Routing: react-router-dom v7. Notifications: notistack.

## Architecture

Standard React SPA. The Vite dev server proxies `/api` to `http://localhost:3001`.

### Project Structure

```
src/
  api/           # API layer — one module per resource + shared client + types
    client.ts    # Axios instance with JWT interceptor and 401 redirect
    types.ts     # All shared TypeScript interfaces (ApiResponse, User, Food, etc.)
  components/
    Common/      # Reusable: DataTable (generic, handles loading/empty/error), ConfirmDialog
    Layout/      # AppLayout (sidebar + topbar + Outlet), Sidebar, TopBar
    Auth/        # LoginPage, ChangePasswordPage, ProtectedRoute
    Admin/       # AdminList + AdminForm
    Shop/        # ShopList + ShopForm
    Food/        # FoodList + FoodForm
    Affair/      # AffairList + AffairForm
    AffairCategory/  # AffairCategoryList + AffairCategoryForm

    Excel/       # ExcelImportDialog (file upload → preview → import)
  context/
    AuthContext.tsx  # Auth state: token + user in localStorage, login/logout functions
  theme/
    theme.ts     # MUI theme: primary blue #2e9bfa, custom border-radius, Noto Sans SC font
```

### Key Patterns

**Auth flow**: On login, JWT token and user object stored in localStorage via `AuthContext`. The axios client's request interceptor attaches `Authorization: Bearer <token>` to every request. The 401 response interceptor clears auth and redirects to `/login`. `ProtectedRoute` checks token presence before rendering child routes.

**CRUD pattern**: Each resource follows the same pattern. A `*List` component owns the state (data array, loading, error, form dialog open/close, delete confirm). It renders `DataTable<T>` for display and `*Form`/`ConfirmDialog` for mutations. API calls return `ApiResponse<T>` (shape: `{ success: boolean, data?: T, message?: string }`). Success/failure feedback via `enqueueSnackbar` from notistack.

**API modules**: Each file in `src/api/` exports typed async functions (`getX`, `createX`, `updateX`, `deleteX`) that call the shared axios client and return `res.data` (the `ApiResponse`). The client base URL defaults to `VITE_API_URL` env var, falling back to `http://localhost:3001/api`.

**DataTable**: A generic table component constrained to `T extends { id: number }`. Accepts `Column<T>[]` with optional `render` function per column, plus `onEdit`/`onDelete` callbacks. Has built-in loading (skeleton), error (message + retry button), and empty states.

**Layout**: Permanent sidebar (240px) with MUI Drawer + fixed AppBar. Active route highlighted in primary blue. Sidebar menu items defined as a static array in `Sidebar.tsx`. Routes use nested layout: `AppLayout` wraps all authenticated routes and renders child routes via `<Outlet />`.
