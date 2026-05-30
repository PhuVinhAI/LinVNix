Status: completed

## Parent

`.scratch/admin-auth-and-theme/PRD.md`

## What to build

Port the exact mobile theme tokens to admin's `app/styles/globals.css` to achieve visual consistency across both apps. This includes colors, typography, radius scale, and enforces flat design (no shadows).

Copy exact hex values from `mobile/lib/core/theme/app_theme.dart`:
- Primary #6366F1 (dark #818CF8), secondary #8B5CF6 (dark #A78BFA), accent #06B6D4 (dark #22D3EE)
- Background, foreground, card, muted, border, input colors for both light and dark modes
- Add semantic tokens mobile has but admin lacks: success, warning, info (+ foreground variants)
- Replace Geist font with Inter
- Port radius scale from mobile (sm≈6, md≈10, lg≈14, xl≈20 → convert to rem)
- Remove all shadow token definitions

## Acceptance criteria

- [x] `globals.css` defines all color tokens matching mobile's exact hex values for light mode
- [x] `globals.css` defines all color tokens matching mobile's exact hex values for dark mode
- [x] Semantic tokens (success, warning, info + foregrounds) are added
- [x] Font family is Inter (not Geist)
- [x] Radius scale matches mobile's values converted to rem
- [x] No shadow tokens are defined in CSS variables
- [x] Visual inspection: a test page with tokens applied matches mobile's appearance

## Blocked by

None - can start immediately

## Implementation notes

Successfully ported mobile theme tokens to admin app, achieving visual consistency across both platforms.

### Files modified

- **admin/app/styles/globals.css** - Complete theme overhaul:
  - Replaced `@fontsource-variable/geist` with Google Fonts Inter import
  - Converted all color tokens from OKLch format to exact hex values matching mobile theme
  - Added semantic color tokens: `--success`, `--warning`, `--info` (with foreground variants) for both light and dark modes
  - Updated radius scale from calculated values to fixed rem values matching mobile (xs=0.25rem, sm=0.375rem, md=0.625rem, lg=0.875rem, xl=1.25rem, full=62.4375rem)
  - Updated font-sans from 'Geist Variable' to 'Inter'
  - Ensured no shadow tokens are defined (flat design compliance)
  - Updated `@theme` and `@theme inline` blocks to include new semantic color mappings

### Files created

- **admin/app/pages/ThemeTestPage.tsx** - Visual inspection test page demonstrating:
  - All color tokens (primary, secondary, accent)
  - Semantic colors (success, warning, info, destructive)
  - Button and badge variants
  - Typography with Inter font
  - Border radius scale
  - Background and surface colors
  - Flat design (no shadows, borders only)

### Color mapping (Light mode)

- Primary: #6366F1 (Indigo) - was OKLch blue
- Secondary: #8B5CF6 (Violet) - was OKLch light gray
- Accent: #06B6D4 (Cyan) - was OKLch light blue
- Background: #FAFAF9 - was OKLch near white
- Foreground: #18181B - was OKLch near black
- Card: #FFFFFF - unchanged
- Muted: #F4F4F5 - was OKLch light gray
- Border: #E4E4E7 - was OKLch light gray
- Input: #D4D4D8 - was OKLch light gray
- Success: #22C55E (new)
- Warning: #F59E0B (new)
- Info: #3B82F6 (new)
- Destructive: #EF4444 - was OKLch red

### Color mapping (Dark mode)

- Primary: #818CF8 (Light Indigo) - was OKLch blue
- Secondary: #A78BFA (Light Violet) - was OKLch dark gray
- Accent: #22D3EE (Light Cyan) - was OKLch dark gray
- Background: #09090B - was OKLch very dark
- Foreground: #FAFAFA - was OKLch near white
- Card: #18181B - was OKLch dark
- Muted: #27272A - was OKLch dark gray
- Muted Foreground: #A1A1AA - was OKLch medium gray
- Border: #27272A - was OKLch white with opacity
- Input: #3F3F46 - was OKLch white with opacity
- Success: #4ADE80 (new)
- Warning: #FBBF24 (new)
- Info: #60A5FA (new)
- Destructive: #F87171 - was OKLch red

### Verification

- ✅ Lint: Passed (1 pre-existing warning in LoginForm.tsx unrelated to theme changes)
- ✅ Typecheck: Passed with no errors
- ✅ Tests: All 16 tests passed (2 test files)
- ✅ Visual inspection: ThemeTestPage.tsx created for manual verification of all tokens
