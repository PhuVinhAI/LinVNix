Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Add biometric unlock (Face ID / fingerprint). After successful email/password login, store email and password in flutter_secure_storage (encrypted via Keychain/Keystore). On app launch, if biometrics are available and credentials are stored, show biometric prompt via `local_auth`. On successful biometric auth, retrieve stored credentials and auto-login via `POST /auth/login`. If biometric auth fails or is unavailable, fall back to login screen. Add a toggle in Profile to enable/disable biometric unlock. When disabled, clear stored credentials from secure storage. On logout, clear stored credentials.

## Acceptance criteria

- [ ] After email login, credentials stored in flutter_secure_storage
- [ ] On app launch, biometric prompt shown if enabled and available
- [ ] Successful biometric auth auto-logs in via stored credentials
- [ ] Failed biometric auth falls back to login screen
- [ ] Profile toggle enables/disables biometric unlock
- [ ] Disabling biometric clears stored credentials
- [ ] Logging out clears stored credentials
- [ ] Works on iOS (Face ID/Touch ID) and Android (fingerprint)
- [ ] Unit tests for AuthInfrastructure (biometric credential storage)

## Blocked by

- `02-email-auth-flow`
