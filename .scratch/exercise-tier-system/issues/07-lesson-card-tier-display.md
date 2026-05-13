Status: `ready-for-agent`

## Parent

`.scratch/exercise-tier-system/PRD.md`

## What to build

Show tier achievement and progress on lesson list cards so users see their status at a glance.

Backend: Add `tierSummary` field to each lesson in `GET /lessons/module/:moduleId` response. Shape: `{currentTier: ExerciseTier, unlockedTiers: ExerciseTier[], tiers: Array<{tier: ExerciseTier, status: 'completed'|'in_progress'|'locked', percentCorrect: number}>}`. Computed by TierProgressService.

Mobile: Lesson list card (`_LessonCard` in module_detail_screen) shows a colored border corresponding to the highest unlocked tier. Below the card title, a compact tier timeline: "Basic ✓ · Easy 80% · 🔒🔒🔒" where each tier shows ✓ (completed), % (in progress), 🔒 (locked). Information only — no tap-to-navigate shortcut on tier badges.

## Acceptance criteria

- [ ] GET /lessons/module/:moduleId includes tierSummary per lesson
- [ ] tierSummary computed correctly by TierProgressService
- [ ] Mobile lesson card shows colored border matching highest unlocked tier
- [ ] Compact tier timeline below card title with ✓ / % / 🔒 per tier
- [ ] Tier badges are informational only (no tap navigation)
- [ ] Lint + typecheck pass

## Blocked by

- `.scratch/exercise-tier-system/issues/02-tier-progress-unlock.md`
