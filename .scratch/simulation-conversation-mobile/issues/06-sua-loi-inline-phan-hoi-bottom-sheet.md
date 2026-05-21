Status: ready-for-agent

## Parent

`.scratch/simulation-conversation-mobile/PRD.md`

## What to build

Add **Sửa lỗi inline** (correction underlines) on learner chat bubbles and the **Phản hồi lượt nhắn** bottom sheet. This slice enhances the chat screen built in slice 05.

**CorrectionTextSpanBuilder** — pure function (testable with unit tests):
- Input: message text + corrections[] (sorted by startIndex)
- Output: List<TextSpan> with underline decorations on corrected ranges
- Error severity → red underline, warning severity → amber underline, thickness 2
- Overlapping ranges merged
- Uncorrected segments → normal TextSpan

**Learner bubble rendering:** Replace plain `Text` with `RichText` using `CorrectionTextSpanBuilder` output. Each corrected `TextSpan` gets a `GestureRecognizer` — tapping a correction opens the feedback bottom sheet scrolled to that correction.

**Feedback icon:** Left side of learner bubble (only when `reviewAvailable: true` or corrections exist). Icon 16px `c.mutedForeground`. Tap opens feedback bottom sheet from top.

**Feedback bottom sheet** — `AppBottomSheet.show` with `DraggableScrollableSheet` (0.4/0.6/0.9):
- Header: "Feedback" (titleSmall/w600) + close icon
- Section 1 — Corrections: list of items, each: original word (strikethrough, `c.error`) → arrow → corrected word (`c.success`, w600) + `AppBadge` for type (Spelling/Grammar)
- Divider
- Section 2 — Review: AI commentary text (bodyMedium/c.foreground). Only shown when `reviewAvailable: true` and `review != null`

When opened by tapping a specific correction on a bubble, scroll to that correction item with a subtle highlight animation.

## Acceptance criteria

- [ ] `CorrectionTextSpanBuilder` correctly splits text into TextSpan list with underline styles at correct positions
- [ ] Error severity shows red underline, warning shows amber underline, thickness 2
- [ ] Overlapping correction ranges are merged correctly
- [ ] No corrections → plain TextSpan (no decoration)
- [ ] Learner bubble renders corrections as underlined text via RichText
- [ ] Tapping a correction on bubble opens feedback bottom sheet scrolled to that correction
- [ ] Feedback icon (16px) appears left of learner bubble only when corrections or review exist; tapping opens sheet from top
- [ ] Feedback bottom sheet lists corrections with original (strikethrough red) → corrected (green bold) + type badge (Spelling/Grammar)
- [ ] Review section shows AI commentary when available; hidden when `reviewAvailable: false` or review is null
- [ ] DraggableScrollableSheet with correct snap sizes (0.4/0.6/0.9)
- [ ] Unit tests for CorrectionTextSpanBuilder: overlapping ranges, edge cases, mixed severities

## Blocked by

- `.scratch/simulation-conversation-mobile/issues/05-chat-core-group-bubbles-compose-bar.md`
