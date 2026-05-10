Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Implement the complete email/password authentication flow. Create the auth feature with data layer (AuthRepository calling `/auth/register`, `/auth/login`, `/auth/verify-email`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/refresh`, `/auth/logout`), domain layer (auth models via freezed, domain exceptions), and presentation layer (login screen, register screen, email verification screen, forgot/reset password screens). Store JWT access and refresh tokens in flutter_secure_storage. Implement AuthInterceptor that attaches `Authorization: Bearer <access_token>` to every request. Implement TokenRefreshInterceptor that on 401 calls `POST /auth/refresh` with stored refresh token, rotates both tokens in secure storage, and retries the original request. Implement auto-logout when refresh fails. Session persists across app restarts — on launch, check for stored access token; if expired but refresh token valid, auto-refresh; if both expired, redirect to login. The go_router auth redirect guard (from slice 01) now works with real auth state via a Riverpod auth provider. After login, user lands on the Home tab.

## Acceptance criteria

- [ ] User can register with email, password, and full name
- [ ] User can verify email via token from email link
- [ ] User can log in with email and password
- [ ] User can request password reset and reset via email token
- [ ] User can log out (revokes refresh token server-side)
- [ ] Session persists across app restarts (auto-login if tokens valid)
- [ ] Access token refreshes automatically on 401 without user noticing
- [ ] User is redirected to login when both tokens are expired
- [ ] Auth tokens are stored in flutter_secure_storage (encrypted)
- [ ] AuthInterceptor attaches bearer token to all authenticated requests
- [ ] Unit tests for AuthInfrastructure (token storage, refresh rotation, auto-logout)

## Blocked by

- `01-project-scaffold-navigation-shell`
