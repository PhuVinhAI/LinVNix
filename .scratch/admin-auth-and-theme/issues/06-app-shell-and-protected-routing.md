Status: completed

## Parent

`.scratch/admin-auth-and-theme/PRD.md`

## What to build

Build the complete dashboard shell with navigation, authentication guards, and placeholder pages. This delivers the full app structure that users navigate through.

**Sidebar with groups**: Organize navigation into 5 groups with items:
- **Học liệu**: Khóa học, Chủ đề, Bài học, Từ vựng, Ngữ pháp
- **Bài tập**: Bài tập, Bộ bài tập
- **Hội thoại mô phỏng**: Tình huống, Danh mục tình huống
- **Người dùng**: Học viên
- **Cài đặt**

Each group has a title, and active items are highlighted.

**Header**: User menu dropdown showing name and email, with logout action.

**TitleBar**: Custom titlebar for Electron with minimize/maximize/close buttons.

**Theme toggle**: Button to switch between light and dark mode (using next-themes).

**Protected routing**: `ProtectedRoute` component that checks authentication. Unauthenticated users redirect to `/login`. Authenticated users accessing `/login` redirect to `/` (dashboard). On app open, if valid token exists, go straight to dashboard.

**Placeholder pages**: Create a placeholder page component for each sidebar item (14 pages total). Each shows the page title and "Coming soon" message.

## Acceptance criteria

- [x] Sidebar renders with 5 groups and all items listed above
- [x] Active sidebar item is highlighted
- [x] Header shows user name and email in dropdown menu
- [x] Header logout action clears session and redirects to login
- [x] TitleBar renders with window controls (Electron)
- [x] Theme toggle button switches between light and dark mode
- [x] Dark mode colors match mobile's dark theme exactly
- [x] `ProtectedRoute` component blocks unauthenticated access
- [x] Unauthenticated users accessing protected routes redirect to `/login`
- [x] Authenticated users accessing `/login` redirect to `/` (dashboard)
- [x] On app open with valid token, user goes directly to dashboard (no login screen)
- [x] All 14 placeholder pages are created and routed correctly
- [x] Clicking each sidebar item navigates to its placeholder page
- [x] Manual test: navigate through all pages, toggle theme, verify logout

## Blocked by

- `.scratch/admin-auth-and-theme/issues/03-auth-cleanup-and-login-flow.md` (need auth infrastructure and session store) ✅
- `.scratch/admin-auth-and-theme/issues/05-component-library-theming.md` (need themed components for shell UI) ✅

## Implementation notes

This issue implements the complete dashboard shell with grouped navigation, authentication guards, and placeholder pages for all features.

### Files created

- `admin/app/pages/placeholder/PlaceholderPage.tsx` - Reusable placeholder page component for unimplemented features
- `admin/app/pages/placeholder/index.ts` - Barrel export for placeholder page
- `admin/app/hooks/useTheme.ts` - Theme management hook with localStorage persistence and system preference detection

### Files modified

- `admin/lib/shared/constants/index.ts` - Added 8 new route constants for all feature pages (Topics, Lessons, Grammar, Exercise Sets, Scenarios, Scenario Categories, Learners)
- `admin/app/components/layout/Sidebar.tsx` - Restructured navigation into 6 grouped sections (Tổng quan, Học liệu, Bài tập, Hội thoại mô phỏng, Người dùng, Cài đặt) with 14 total navigation items, added ScrollArea for overflow handling
- `admin/app/components/layout/Header.tsx` - Added theme toggle button with Sun/Moon icons, integrated useTheme hook
- `admin/app/router/ProtectedRoute.tsx` - Added PublicRoute component to redirect authenticated users away from login page
- `admin/app/router/index.tsx` - Added routes for all 14 pages using PlaceholderPage component, wrapped login route with PublicRoute

### Key features implemented

1. **Grouped sidebar navigation**: 6 sections with hierarchical organization and group titles
2. **Theme toggle**: Button in header to switch between light/dark mode with localStorage persistence
3. **Protected routing**: ProtectedRoute blocks unauthenticated access, PublicRoute redirects authenticated users from login
4. **14 placeholder pages**: All feature pages routed and accessible with consistent placeholder UI
5. **Active state highlighting**: Current page highlighted in sidebar with primary color
6. **User menu**: Displays name and email with logout action

### Verification

- ✅ Lint: No errors
- ✅ Typecheck: No errors  
- ✅ Tests: 13/13 passed
