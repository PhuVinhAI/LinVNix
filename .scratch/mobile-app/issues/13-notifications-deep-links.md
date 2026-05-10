Status: ready-for-agent

## Parent

`.scratch/mobile-app/PRD.md`

## What to build

Add local notifications and deep link support. After each review session, schedule a local notification via `flutter_local_notifications` based on the earliest `nextReviewAt` from the reviewed vocabularies. Create a `NotificationService` interface for future FCM swap. Configure go_router deep links so that tapping a notification or following a link opens the correct screen (e.g., `/lessons/:id`, `/review/session`). Deep link routes are already defined in go_router; ensure they work with the platform's URL scheme on both iOS (universal links) and Android (app links / intent filters).

## Acceptance criteria

- [ ] Local notification scheduled after review session based on earliest nextReviewAt
- [ ] Tapping notification opens the review session screen
- [ ] Deep links work for lesson and review routes
- [ ] NotificationService interface defined for future FCM replacement
- [ ] iOS universal links configured in Info.plist
- [ ] Android intent filters configured in AndroidManifest.xml
- [ ] Notifications respect user permission (requested on first use)

## Blocked by

- `08-online-vocabulary-review`
