# Architecture & File Overview

This document provides a complete summary of every file in the frontend codebase and its specific purpose to facilitate AI agent comprehension and codebase navigation.

---

## 1. Project Configuration & Root Files

- **`frontend/package.json`**: Defines project dependencies (`next`, `react`, `better-auth`, `@tanstack/react-query`, `zustand`, Radix primitives, Lucide icons) and scripts (`dev`, `build`, `start`, `lint`).
- **`frontend/tsconfig.json`**: TypeScript configuration, including path aliases (`@/*` pointing to `./src/*`).
- **`frontend/components.json`**: Configuration file for `shadcn/ui` component aliases and styles.
- **`frontend/.env.local`**: Active local environment configuration storing secret keys, Google OAuth IDs, database URLs, and application endpoints.
- **`frontend/.env.example`**: Template environment file listing required environment variables without sensitive secrets.

---

## 2. Authentication & Core Infrastructure (`src/lib`, `src/proxy.ts`)

- **`src/lib/auth.ts`**: Server-side Better Auth setup configuring Google OAuth social provider and PostgreSQL database persistence.
- **`src/lib/auth-client.ts`**: React client-side Better Auth setup exporting `signIn`, `signOut`, and `useSession` hooks.
- **`src/lib/api-client.ts`**: Typed `fetch` wrapper configured for the FastAPI backend (`POST /documents`, `GET /documents`, `POST /chat`, `GET/DELETE /conversations`). Automatically extracts the session token from cookies and injects `Authorization: Bearer <token>` headers into every request.
- **`src/lib/utils.ts`**: Utility module containing the `cn(...)` helper function combining `clsx` and `tailwind-merge` for dynamic CSS class generation.
- **`src/proxy.ts`**: Next.js Edge proxy (middleware layer) that evaluates session cookies on requests to enforce protected route navigation (`/dashboard/*`) and redirect authenticated users away from `/login`.

---

## 3. Global Providers, Types & Stores (`src/providers`, `src/store`, `src/types`, `src/hooks`)

- **`src/types/index.ts`**: TypeScript type definitions for `User`, `Session`, `AuthSession`, `Document`, `Conversation`, `ChatMessage`, and `ChatResponse`.
- **`src/store/ui-store.ts`**: Lightweight Zustand store managing UI-only state (desktop sidebar collapsed state and mobile sheet drawer open state).
- **`src/hooks/use-auth-guard.ts`**: Custom React hook checking `useSession()` status and automatically redirecting unauthenticated users to `/login`.
- **`src/providers/index.tsx`**: Top-level client provider wrapping the application with TanStack Query's `QueryClientProvider` and `TooltipProvider`.

---

## 4. App Router Routes & Layouts (`src/app`)

- **`src/app/layout.tsx`**: Root layout wrapping the entire app with Geist fonts, global CSS, and `Providers`.
- **`src/app/globals.css`**: Global CSS file defining Tailwind CSS v4 directives, custom theme properties, dark mode overrides, and CSS variable color tokens (OKLCH).
- **`src/app/page.tsx`**: Root landing route (`/`) that immediately redirects users to `/dashboard`.
- **`src/app/api/auth/[...all]/route.ts`**: Dynamic API route handler delegating incoming auth HTTP requests (`GET`/`POST`) to Better Auth's `toNextJsHandler`.
- **`src/app/login/layout.tsx`**: Layout wrapper providing specific metadata for the `/login` route.
- **`src/app/login/page.tsx`**: Login page UI featuring Google OAuth sign-in, animated background effects, error handling, and redirection logic.
- **`src/app/dashboard/layout.tsx`**: Dashboard layout configuration delegating shell rendering and metadata setup.
- **`src/app/dashboard/dashboard-shell.tsx`**: Protected layout wrapper embedding `AuthGuard`, `Sidebar`, `MobileSidebar`, and `Navbar` around main dashboard content.
- **`src/app/dashboard/page.tsx`**: Protected main dashboard view with personalized welcome messages and quick action cards for uploading documents and viewing conversations.
- **`src/app/dashboard/conversations/page.tsx`**: Placeholder route (`/dashboard/conversations`) for past chat history.
- **`src/app/dashboard/settings/page.tsx`**: Placeholder route (`/dashboard/settings`) for user settings.

---

## 5. UI Components (`src/components`, `src/features`)

- **`src/features/auth/auth-guard.tsx`**: Wrapper component rendering a loading spinner while validating sessions and conditionally mounting protected children.
- **`src/features/auth/index.ts`**: Barrel export file exposing the `AuthGuard` feature.
- **`src/components/dashboard/sidebar.tsx`**: Desktop collapsible sidebar and mobile drawer sheet containing navigation items (Documents, Conversations, Settings).
- **`src/components/dashboard/navbar.tsx`**: Top bar header featuring sidebar toggle buttons and a user profile dropdown displaying Google avatars, user names, and logout triggers.
- **`src/components/ui/button.tsx`**: Reusable Button component powered by Radix UI `Slot` and CVA styling variants.
- **`src/components/ui/avatar.tsx`**: Radix UI Avatar primitive wrapper displaying user profile images with fallback initials.
- **`src/components/ui/dropdown-menu.tsx`**: Radix UI DropdownMenu components for rendering accessible popover menus.
- **`src/components/ui/separator.tsx`**: Radix UI Separator primitive wrapper for horizontal and vertical divider lines.
- **`src/components/ui/sheet.tsx`**: Radix UI Dialog-backed sliding drawer sheet for mobile navigation.
- **`src/components/ui/skeleton.tsx`**: Pulse animation placeholder for loading states.
- **`src/components/ui/tooltip.tsx`**: Accessible tooltip component structure.
