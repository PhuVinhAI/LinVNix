Status: done

## Parent

PRD: `.scratch/architecture-deepening/PRD.md`

## What to build

Tạo module TokenLifecycle sở hữu email verification token lifecycle. Interface:

- `createVerificationToken(userId) → { token, expiresAt }` — tạo token 32 bytes, hết hạn 24h
- `verifyEmailToken(token) → { userId, email, fullName }` — tìm token chưa dùng, kiểm tra hết hạn, đánh dấu đã dùng

Module nội bộ sở hữu `EmailVerificationToken` entity và repository của nó. AuthService inject `TokenLifecycle` thay vì `@InjectRepository(EmailVerificationToken)`, ủy quyền tạo + xác thực email token cho TokenLifecycle.

Viết Jest *.spec.ts cho TokenLifecycle — test tạo → xác thực → hết hạn cho email verification, dùng in-memory repository adapter.

## Acceptance criteria

- [x] `TokenLifecycle` module tồn tại với `createVerificationToken` + `verifyEmailToken`
- [x] AuthService không còn inject `@InjectRepository(EmailVerificationToken)`
- [x] AuthService ủy quyền email verification cho TokenLifecycle
- [x] Jest *.spec.ts cho TokenLifecycle email verification pass
- [x] Auth integration tests (`auth.test.ts`, `email-queue.test.ts`) vẫn pass
- [x] HTTP API contract không đổi

## Blocked by

None - can start immediately
