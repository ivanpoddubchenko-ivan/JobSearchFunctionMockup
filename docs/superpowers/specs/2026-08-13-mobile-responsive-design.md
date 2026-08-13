# Mobile responsive adaptation

## Context

The app (`Dashboard.tsx`, `LoginPage.tsx`, `Profile.tsx`) is styled almost
entirely with inline `style={{}}` objects using fixed pixel values and CSS-var
tokens (the `v` object in `src/components/shared.tsx`) — there is no
Tailwind-class usage despite Tailwind v4 being configured. The one existing
precedent for viewport-dependent behavior is `.login-image-panel` in
`src/index.css` (a `className` + `@media (max-width: 860px)` rule that hides
the login photo panel).

On narrow viewports today:

- **Dashboard header** (`Dashboard.tsx:28-54`): logo, a search box
  (`flex: 1, maxWidth: 340`), and the avatar/"Log out" group sit in one
  `justify-content: space-between` row inside a fixed `height: 60` header —
  there isn't enough width for all three below ~600px, so the search input
  gets crushed.
- **Listings split view** (`Dashboard.tsx:115-140`): `gridTemplateColumns:
  selectedJob ? '1fr 1.5fr' : '1fr'` puts the job list and the sticky
  `JobDetail` panel side by side. On a phone-width screen a `1.5fr` column has
  no usable width.
- **Profile page** (`Profile.tsx:150`): `gridTemplateColumns: '220px 1fr'`
  puts a vertical tab nav (General/Saved/Settings) to the left of the tab
  content. `SavedTab` (`Profile.tsx:70-115`) reuses the exact same
  list+sticky-detail split-view pattern as the dashboard.
- **Login** (`LoginPage.tsx`, `src/components/login/*`): already close —
  `.login-image-panel` hides the photo below 860px, and the sign-in/register
  forms are already fluid (`width: '100%', maxWidth: 400`, no fixed widths in
  `SignInForm.tsx`/`RegisterWizard.tsx`/`DateOfBirthField.tsx`). Needs a
  visual QA pass rather than a redesign.

**Hard constraint (explicit user requirement):** desktop behavior, layout,
and functionality must not change. All changes must be inert above the
breakpoint.

## Approach

**Technique:** add `className` attributes to existing elements (their
current inline `style` objects are left untouched) and add new rules to
`src/index.css` inside `@media` blocks, following the same pattern as
`.login-image-panel`. Where a mobile rule must override a value currently set
via inline `style` (e.g. `gridTemplateColumns`, `position: sticky`), the CSS
rule uses `!important` — a stylesheet `!important` rule is the one thing in
CSS that outranks a plain inline style, so this is the only way to get
breakpoint-conditional values onto elements whose desktop value is computed
in JS, without introducing a `useIsMobile()`-style hook or any new React
state. No component's `.tsx` logic, state, props, or data changes — this is a
CSS/markup-only, additive change.

**Breakpoint:** a single new `@media (max-width: 768px)` used for every rule
described below. This is independent of and does not replace the existing
`860px` breakpoint on `.login-image-panel`.

Because every new rule lives inside `@media (max-width: 768px)`, nothing
renders differently at any wider viewport — verified per-section in Testing
below.

## Changes

### 1. Dashboard header (`Dashboard.tsx:28-54`)

- Add `className="dash-header-inner"` to the header's inner flex row
  (`Dashboard.tsx:29`), `className="dash-header-search"` to the search
  `<div>` (`Dashboard.tsx:33`), and `className="dash-header-actions"` to the
  actions `<div>` wrapping `UserMenu` (`Dashboard.tsx:50`). The outer
  `<header>` (`Dashboard.tsx:28`) gets `className="dash-header"`.
- New CSS (`src/index.css`, inside `@media (max-width: 768px)`):
  - `.dash-header { height: auto; }` and `.dash-header-inner { height: auto;
    flex-wrap: wrap; padding-top: 10px; padding-bottom: 10px; }` — the header
    grows to fit two rows instead of clipping at the fixed `60px` height.
  - `.dash-header-actions { order: 2; }` and `.dash-header-search { order: 3;
    flex-basis: 100%; max-width: none !important; }` — logo (default
    `order: 0`) and the actions group share row 1 (they fit: ~103px logo +
    ~100px avatar/"Log out" well within a 320–428px viewport minus padding),
    the search box drops to its own full-width row 2. `max-width: none` needs
    `!important` to beat the inline `maxWidth: 340`.

### 2. Dashboard page padding (`Dashboard.tsx:57, 96`)

- Add `className="page-shell"` to the two `maxWidth: 1200, margin: '0 auto'`
  wrapper `<div>`s (hero at `Dashboard.tsx:57`, listings at
  `Dashboard.tsx:96`) alongside their existing inline styles.
- New CSS: `.page-shell { }` at `@media (max-width: 768px)` overrides the
  horizontal padding component of the inline `padding` shorthand — since
  inline `padding` is a single property, this needs `padding-left: 16px
  !important; padding-right: 16px !important;` (top/bottom values are left
  alone, only the 28px side gutters shrink to 16px).

### 3. Dashboard listings split view → mobile overlay (`Dashboard.tsx:115-140`)

- Add `className="listings-grid"` to the grid `<div>` (`Dashboard.tsx:115`)
  and `className="job-detail-panel"` to the detail-panel `<div>`
  (`Dashboard.tsx:131-136`, the one wrapping `<JobDetail>`).
- New CSS at `@media (max-width: 768px)`:
  - `.listings-grid { grid-template-columns: 1fr !important; }` — collapses
    the grid to one column regardless of the JS-computed `1fr`/`1fr 1.5fr`
    value, so the job list always takes the full row width.
  - `.job-detail-panel { position: fixed !important; inset: 0 !important;
    top: 0 !important; z-index: 50; max-height: 100vh !important; border-radius:
    0 !important; margin: 0; }` — when a job is selected, the panel (which
    the grid no longer reserves space for, since it's now `position: fixed`
    and out of flow) becomes a full-screen overlay above the job list. The
    existing `×` close button inside `JobDetail` (`shared.tsx:195`) already
    calls `onClose`, so closing works with no JS changes.
- This same pair of classes/rules is reused verbatim for Profile's Saved tab
  (see §5) since it renders the identical grid+sticky-panel structure.

### 4. Profile page layout (`Profile.tsx:150-169`)

- Add `className="profile-grid"` to the two-column grid `<div>`
  (`Profile.tsx:150`) and `className="profile-tabs"` to the `<nav>`
  (`Profile.tsx:151`).
- New CSS at `@media (max-width: 768px)`:
  - `.profile-grid { grid-template-columns: 1fr !important; }` — sidebar and
    content stack vertically.
  - `.profile-tabs { flex-direction: row !important; overflow-x: auto;
    gap: 8px !important; }` — the vertical tab list becomes a horizontal,
    scrollable-if-needed row above the tab content, reusing the tab buttons'
    existing active/inactive styling unchanged.

### 5. Profile Saved tab (`Profile.tsx:87-111`)

- Add the same `className="listings-grid"` (to `Profile.tsx:87`) and
  `className="job-detail-panel"` (to `Profile.tsx:102-107`) used in §3. No
  new CSS — the `@media` rules from §3 already cover both usages.

### 6. Login QA pass

- No planned structural changes. During implementation, open
  `LoginPage.tsx` at 320px, 375px, and 414px widths in devtools and confirm:
  the two-step register wizard's role grid (`RegisterWizard.tsx:90`, fixed
  `gridTemplateColumns: '1fr 1fr'`), the day/month/year selects
  (`DateOfBirthField.tsx:73`, `flex: 1 / 1.6 / 1`), and the mode-switch tabs
  render without overflow or clipped text.
- Fix only concrete overflow/clipping bugs found during that pass, scoped as
  narrowly as possible (e.g. a single `@media` rule), and record what was
  found and changed in the implementation plan/PR — do not restructure the
  login page preemptively.

## Testing

No test framework is configured (`package.json` only has `format: oxfmt`) —
verification is manual, same as prior specs in this project:

- `pnpm dev`, then in browser devtools responsive mode check 320px, 375px,
  414px (phone) and 768px (the breakpoint boundary itself, both just above
  and just below) for Dashboard, `/login`, and `/profile`.
- At each of those widths: no horizontal scroll/overflow, no clipped text,
  header/search/listings/profile-tabs behave as described above, job
  select/unsave/sort/filter/search still work identically to desktop.
- Above 768px (e.g. 1024px, 1440px): pixel-compare against the current
  behavior (before this change) to confirm nothing shifted — this is the
  hard constraint and gets explicit verification, not just a skim.
- `pnpm build` to confirm no TypeScript/bundling errors (all changes are
  `className` additions and CSS, so this mainly guards against typos in the
  JSX edits).
- Browser console checked for new errors/warnings at each width.

## Non-goals

- No JS-based viewport detection (`useIsMobile()`, `matchMedia`, resize
  listeners) — everything is CSS media queries.
- No changes to any component's props, state, data flow, or business logic.
- No changes to desktop (>768px) rendering — enforced by scoping every new
  rule inside `@media (max-width: 768px)`.
- No hamburger menu / bottom nav — the header has too little navigation
  (logo, search, avatar menu) to need one.
- No body-scroll-lock behind the mobile job-detail overlay — a
  `position: fixed; inset: 0` layer with its own `overflow-y: auto` is
  sufficient without adding new JS.
- No restructuring of the login page beyond fixing concretely observed
  overflow bugs, if any are found.
- No changes to `.login-image-panel`'s existing 860px breakpoint.
