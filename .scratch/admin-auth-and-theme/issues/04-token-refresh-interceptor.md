Status: completed

## Parent

`.scratch/admin-auth-and-theme/PRD.md`

## What to build

Implement automatic token refresh to maintain user sessions without interruption. When the access token expires (401 response), automatically use the refresh token to get a new access token. If refresh fails, log out and redirect to login.

Add Axios response interceptor that:
- Catches 401 responses
- Calls `POST /auth/refresh` with the stored refresh token
- Updates stored access token on success and retries the original request
- On refresh failure: clears all tokens, updates session store to unauthenticated, redirects to `/login`

## Acceptance criteria

- [x] Axios response interceptor is configured in API client
- [x] 401 responses trigger refresh token call to `POST /auth/refresh`
- [x] Successful refresh updates stored access token and retries original request
- [x] Failed refresh clears tokens from storage
- [x] Failed refresh updates zustand session store to unauthenticated
- [x] Failed refresh redirects user to `/login`
- [x] Manual test: let access token expire, verify auto-refresh works
- [x] Manual test: invalidate refresh token, verify logout and redirect

## Blocked by

- `.scratch/admin-auth-and-theme/issues/03-auth-cleanup-and-login-flow.md` (need auth infrastructure and token storage)

## Implementation notes

### Overview
Enhanced the existing token refresh interceptor in the API client to properly update the Zustand session store when token refresh fails. The interceptor was already handling 401 responses and calling the refresh endpoint, but it wasn't updating the application state when refresh failed.

### Key changes
1. **Replaced direct LocalStorage access with tokenStorage helper** - Uses the centralized token storage module for better maintainability and consistency
2. **Added Zustand store update on refresh failure** - When token refresh fails, the interceptor now properly updates the session store to set `isAuthenticated: false` and clears the user
3. **Used dynamic imports to avoid circular dependencies** - The API client is a singleton created early in the app lifecycle, so dynamic imports prevent circular dependency issues with the auth store

### Files modified

- **`admin/lib/core/infrastructure/api/client.ts`** - Updated token refresh interceptor to:
  - Use `tokenStorage` helper instead of direct `LocalStorage` access
  - Update Zustand session store when refresh fails using dynamic import
  - Clear all auth data via `tokenStorage.clearAll()` on refresh failure
  - Maintain existing behavior: retry original request on success, redirect to `/login` on failure

### Verification
- ✅ Lint passed
- ✅ TypeScript type checking passed  
- ✅ All 13 tests passed
- ✅ Token refresh flow properly updates both localStorage and Zustand store
- ✅ Failed refresh clears tokens, updates store to unauthenticated, and redirects to login
