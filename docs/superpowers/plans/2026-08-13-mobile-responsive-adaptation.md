# Mobile Responsive Adaptation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `Dashboard.tsx`, `LoginPage.tsx`, and `Profile.tsx` usable on
phone-width viewports (≤768px) without changing any desktop (>768px)
rendering, data, or component logic.

**Architecture:** Additive `className` attributes on existing elements
(their inline `style` objects are left untouched) paired with new
`@media (max-width: 768px)` rules in `src/index.css`, following the existing
`.login-image-panel` pattern. Rules that must beat an inline style use
`!important` — the one CSS mechanism that outranks inline styles from a
stylesheet. No new components, no new React state, no new dependencies.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8, plain CSS media queries
(no Tailwind utility classes, no `matchMedia`/resize-listener hooks).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-13-mobile-responsive-design.md` —
  every task below implements a section of it.
- No test framework is configured in this project (no jest/vitest/playwright
  — `package.json` only has `format: oxfmt`). Verification is manual: run
  `pnpm dev`, use browser devtools responsive mode at 320/375/414/768px, and
  check the console for errors. Do not invent a test framework for this
  change.
- Every new CSS rule lives inside `@media (max-width: 768px)`. Nothing may
  change how the app renders above 768px — each task's verification step
  explicitly checks this, not just the mobile behavior.
- Do not touch any component's props, state, data flow, or business logic.
  Every code change in this plan is either a `className` addition to an
  existing JSX element or a new/edited rule in `src/index.css`.
- Do not add a `useIsMobile()` hook, `matchMedia`, or any resize listener.
- Do not touch `.login-image-panel` or its existing `860px` breakpoint.
- Do not restructure the login page beyond a narrowly-scoped fix for a
  concretely observed overflow/clipping bug (Task 6) — no preemptive changes.

---

### Task 1: Dashboard header — two-row mobile layout

**Files:**
- Modify: `src/pages/Dashboard.tsx:29,33,50` (add `className` to the header's
  inner row, the search box, and the actions group)
- Modify: `src/index.css` (new `@media (max-width: 768px)` block)

**Interfaces:** none — pure `className`/CSS addition, no props or state change.

- [ ] **Step 1: Add `className`s to the header's inner elements**

Current (`src/pages/Dashboard.tsx:28-53`):

```tsx
      <header style={{ background: v.surface, boxShadow: `0 1px 0 ${v.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Logo />

          {/* Search bar — matches the reference */}
          <div style={{
            flex: 1, maxWidth: 340,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: v.rInput,
            background: v.bgSubtle, border: `1px solid ${v.border}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: v.dim, flexShrink: 0 }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text" placeholder="Search roles, companies…"
              value={query} onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.82rem', color: v.text, fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <UserMenu />
          </div>
        </div>
      </header>
```

Replace with (only three `className` attributes added, nothing else
changed):

```tsx
      <header style={{ background: v.surface, boxShadow: `0 1px 0 ${v.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div className="dash-header-inner" style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <Logo />

          {/* Search bar — matches the reference */}
          <div className="dash-header-search" style={{
            flex: 1, maxWidth: 340,
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 14px', borderRadius: v.rInput,
            background: v.bgSubtle, border: `1px solid ${v.border}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ color: v.dim, flexShrink: 0 }}>
              <circle cx="6" cy="6" r="4.5" stroke="currentColor" strokeWidth="1.3"/>
              <path d="M9.5 9.5L12.5 12.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
            </svg>
            <input
              type="text" placeholder="Search roles, companies…"
              value={query} onChange={e => setQuery(e.target.value)}
              style={{ flex: 1, background: 'transparent', border: 'none', outline: 'none', fontSize: '0.82rem', color: v.text, fontFamily: 'Inter, sans-serif' }}
            />
          </div>

          <div className="dash-header-actions" style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <UserMenu />
          </div>
        </div>
      </header>
```

- [ ] **Step 2: Add the mobile media query block to `index.css`**

Current (`src/index.css:24-28`):

```css
@media (max-width: 860px) {
  .login-image-panel { display: none; }
}

/* ── Light (default) ── */
```

Replace with:

```css
@media (max-width: 860px) {
  .login-image-panel { display: none; }
}

/* ── Mobile (≤768px) ── */
@media (max-width: 768px) {
  .dash-header-inner {
    height: auto !important;
    flex-wrap: wrap;
    padding-top: 10px !important;
    padding-bottom: 10px !important;
  }
  .dash-header-actions { order: 2; }
  .dash-header-search {
    order: 3;
    flex-basis: 100%;
    max-width: none !important;
  }
}

/* ── Light (default) ── */
```

(Logo keeps the default `order: 0`, so the visual order becomes
logo → actions → search. `flex-wrap: wrap` plus `justify-content:
space-between`, both already set, put logo and actions on row 1 — they fit
comfortably together well under a 320px content width — and the
`flex-basis: 100%` search box wraps to its own full-width row 2.)

- [ ] **Step 3: Verify visually**

Run: `pnpm --dir /Users/inverita/BHMP/repo dev`, open `/` in browser
devtools responsive mode.

At 375px width: header shows logo + avatar/"Log out" on row 1, the search
box full-width on row 2 below. Typing in search still filters the list.

At 1024px (or any width >768px): header is unchanged from before this
task — logo, search, avatar/"Log out" all in a single row. No console
errors at either width.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx src/index.css
git commit -m "Wrap dashboard header search to its own row on mobile"
```

---

### Task 2: Dashboard page padding on mobile

**Files:**
- Modify: `src/pages/Dashboard.tsx:57,96` (add `className="page-shell"` to
  the hero and listings wrapper `<div>`s)
- Modify: `src/index.css` (extend the mobile block from Task 1)

**Interfaces:** none.

- [ ] **Step 1: Add `className="page-shell"` to the hero wrapper**

Current (`src/pages/Dashboard.tsx:57`):

```tsx
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 28px 24px' }}>
```

Replace with:

```tsx
      <div className="page-shell" style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 28px 24px' }}>
```

- [ ] **Step 2: Add `className="page-shell"` to the listings wrapper**

Current (`src/pages/Dashboard.tsx:96`):

```tsx
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px 48px' }}>
```

Replace with:

```tsx
      <div className="page-shell" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px 48px' }}>
```

- [ ] **Step 3: Add the `.page-shell` rule to the mobile media block**

Current (`src/index.css`, inside the block added in Task 1):

```css
  .dash-header-search {
    order: 3;
    flex-basis: 100%;
    max-width: none !important;
  }
}
```

Replace with:

```css
  .dash-header-search {
    order: 3;
    flex-basis: 100%;
    max-width: none !important;
  }

  .page-shell {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}
```

- [ ] **Step 4: Verify visually**

With `pnpm dev` running, reload `/` at 375px width: the hero heading and the
job-list/filter area now sit 16px from the screen edges instead of 28px
(more usable width on a phone). Vertical padding (44px top on the hero, 48px
bottom on the listings) is unchanged.

At >768px: 28px side padding is unchanged from before this task.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx src/index.css
git commit -m "Reduce dashboard side padding on mobile"
```

---

### Task 3: Dashboard listings split view → mobile full-screen overlay

**Files:**
- Modify: `src/pages/Dashboard.tsx:115,131` (add `className`s to the grid
  and the detail-panel `<div>`)
- Modify: `src/index.css` (extend the mobile block from Task 2)

**Interfaces:**
- Consumes: `JobDetail`'s existing `onClose` prop (`src/components/shared.tsx:188`,
  unchanged) — its `×` button already exists and calls `onClose`, so it
  becomes the overlay's close control with no code change.
- Produces: the `.job-detail-panel` / `.listings-grid` `className` pair
  is reused as-is by Task 5 (Profile's Saved tab) — same names, same CSS.

- [ ] **Step 1: Add `className="listings-grid"` to the split-view grid**

Current (`src/pages/Dashboard.tsx:115`):

```tsx
        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1.5fr' : '1fr', gap: 14 }}>
```

Replace with:

```tsx
        <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1.5fr' : '1fr', gap: 14 }}>
```

- [ ] **Step 2: Add `className="job-detail-panel"` to the detail panel**

Current (`src/pages/Dashboard.tsx:130-139`):

```tsx
          {/* Detail panel */}
          {selectedJob && (
            <div style={{
              borderRadius: v.rCard, padding: 24,
              background: v.surface, boxShadow: v.shadow,
              position: 'sticky', top: 76, alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 5.5rem)', overflowY: 'auto',
            }}>
              <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
            </div>
          )}
```

Replace with:

```tsx
          {/* Detail panel */}
          {selectedJob && (
            <div className="job-detail-panel" style={{
              borderRadius: v.rCard, padding: 24,
              background: v.surface, boxShadow: v.shadow,
              position: 'sticky', top: 76, alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 5.5rem)', overflowY: 'auto',
            }}>
              <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
            </div>
          )}
```

- [ ] **Step 3: Add `.listings-grid` and `.job-detail-panel` rules to the mobile media block**

Current (`src/index.css`, inside the block from Task 2):

```css
  .page-shell {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }
}
```

Replace with:

```css
  .page-shell {
    padding-left: 16px !important;
    padding-right: 16px !important;
  }

  .listings-grid { grid-template-columns: 1fr !important; }
  .job-detail-panel {
    position: fixed !important;
    inset: 0 !important;
    z-index: 50;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
}
```

(Forcing the grid to one column keeps the list full-width. Switching the
panel from `sticky` to `fixed` with `inset: 0` takes it out of the grid flow
entirely and makes it cover the full viewport — the grid no longer reserves
any space for it, so no separate "hide the list" rule is needed.)

- [ ] **Step 4: Verify visually**

With `pnpm dev` running, at 375px width on `/`: the job list renders in a
single column. Click a job card — `JobDetail` now covers the entire screen
(no visible list underneath). Click the existing `×` in the panel's top-right
— the overlay closes and the list is visible again. Saving/unsaving a job
from inside the overlay still works.

At >768px: unchanged two-column split view (`1fr 1.5fr` when a job is
selected), sticky detail panel — identical to before this task.

- [ ] **Step 5: Commit**

```bash
git add src/pages/Dashboard.tsx src/index.css
git commit -m "Turn dashboard job detail into a full-screen overlay on mobile"
```

---

### Task 4: Profile page — stacked layout + horizontal tabs on mobile

**Files:**
- Modify: `src/pages/Profile.tsx:150-151` (add `className`s to the grid and
  the tab `<nav>`)
- Modify: `src/index.css` (extend the mobile block from Task 3)

**Interfaces:** none.

- [ ] **Step 1: Add `className`s to the profile grid and tab nav**

Current (`src/pages/Profile.tsx:150-151`):

```tsx
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 28px 48px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
```

Replace with:

```tsx
      <div className="profile-grid" style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 28px 48px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>
        <nav className="profile-tabs" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
```

- [ ] **Step 2: Add `.profile-grid` and `.profile-tabs` rules to the mobile media block**

Current (`src/index.css`, inside the block from Task 3):

```css
  .job-detail-panel {
    position: fixed !important;
    inset: 0 !important;
    z-index: 50;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }
}
```

Replace with:

```css
  .job-detail-panel {
    position: fixed !important;
    inset: 0 !important;
    z-index: 50;
    max-height: 100vh !important;
    border-radius: 0 !important;
  }

  .profile-grid { grid-template-columns: 1fr !important; }
  .profile-tabs {
    flex-direction: row !important;
    overflow-x: auto;
    gap: 8px !important;
  }
}
```

- [ ] **Step 3: Verify visually**

With `pnpm dev` running, log in and go to `/profile` at 375px width: the
General/Saved/Settings tabs render as a horizontal row above the content
(not a left sidebar); the content area is full-width below them. Clicking
each tab still switches content correctly.

At >768px: unchanged left sidebar (`220px 1fr` grid, vertical tab list) —
identical to before this task.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Profile.tsx src/index.css
git commit -m "Stack profile sidebar into horizontal tabs on mobile"
```

---

### Task 5: Profile Saved tab — reuse the mobile overlay classes

**Files:**
- Modify: `src/pages/Profile.tsx:87,101-110` (add `className`s to the Saved
  tab's grid and detail panel, reusing the classes/CSS from Task 3)

**Interfaces:**
- Consumes: `.listings-grid` / `.job-detail-panel` CSS rules from Task 3
  (`src/index.css`, no changes needed here — they already apply to any
  element with these class names).

- [ ] **Step 1: Add `className="listings-grid"` to the Saved tab's grid**

Current (`src/pages/Profile.tsx:87`):

```tsx
        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1.5fr' : '1fr', gap: 14 }}>
```

Replace with:

```tsx
        <div className="listings-grid" style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1.5fr' : '1fr', gap: 14 }}>
```

- [ ] **Step 2: Add `className="job-detail-panel"` to the Saved tab's detail panel**

Current (`src/pages/Profile.tsx:101-110`):

```tsx
          {selectedJob && (
            <div style={{
              borderRadius: v.rCard, padding: 24,
              background: v.surface, boxShadow: v.shadow,
              position: 'sticky', top: 76, alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 5.5rem)', overflowY: 'auto',
            }}>
              <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
            </div>
          )}
```

Replace with:

```tsx
          {selectedJob && (
            <div className="job-detail-panel" style={{
              borderRadius: v.rCard, padding: 24,
              background: v.surface, boxShadow: v.shadow,
              position: 'sticky', top: 76, alignSelf: 'flex-start',
              maxHeight: 'calc(100vh - 5.5rem)', overflowY: 'auto',
            }}>
              <JobDetail job={selectedJob} onClose={() => setSelectedJob(null)} />
            </div>
          )}
```

- [ ] **Step 3: Verify visually**

With `pnpm dev` running: on `/` (desktop or mobile width), save 1–2 jobs via
"☆ Save to tracker". Go to `/profile` → Saved tab at 375px width: saved
roles list in a single column. Tap a row — its detail opens as a
full-screen overlay (same as the dashboard's). The `×` closes it. Tapping
the ★ on a row still unsaves without opening the overlay.

At >768px: unchanged side-by-side split view in the Saved tab — identical
to before this task.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Profile.tsx
git commit -m "Turn profile Saved tab job detail into a mobile overlay"
```

---

### Task 6: Login mobile QA pass

**Files:** none planned — this task is a verification pass. Only touch a
file if a concrete bug is found (see Step 3).

**Interfaces:** none.

- [ ] **Step 1: Open `/login` in devtools responsive mode**

Run: `pnpm --dir /Users/inverita/BHMP/repo dev`, open `/login`, switch to
devtools responsive mode.

- [ ] **Step 2: Check each of these at 320px, 375px, and 414px width**

For both the "Create account" and "Sign in" tabs:

1. No horizontal scrollbar/page overflow at any of the three widths.
2. Mode-switch tabs ("Create account" / "Sign in"): both labels fully
   visible, not wrapped or clipped.
3. `RegisterWizard` step 1 (role grid, `RegisterWizard.tsx:90`, 2 fixed
   columns): all 6 role cards fully visible, label/description text
   wraps but is not clipped, the "Soon" badge on Employer/Partner does not
   overlap the card's own text.
4. `RegisterWizard` step 2 fields, including `DateOfBirthField`'s Day /
   Month / Year selects (`DateOfBirthField.tsx:73-107`, 3 selects in a
   row): all three selects are visible side by side without forcing page
   overflow. (A long month name being visually truncated *inside* its own
   select box is normal native `<select>` behavior, not a bug — only flag
   it if the row itself overflows the viewport or the selects overlap each
   other.)
5. `SignInForm` (email + password fields, submit button): renders without
   overflow.

- [ ] **Step 3: Fix only if a genuine overflow/clipping bug was found**

If everything in Step 2 passed at all three widths: make no code changes,
skip Step 4 (no commit), and move to Task 7.

If a specific element genuinely overflows the viewport or clips text
unreadably: apply the smallest possible fix — typically one `@media
(max-width: 768px)` rule scoped to that element's existing class (or a new
single-purpose class if it has none), following the same
`className`-plus-stylesheet-rule pattern as Tasks 1–5. Do not restructure
any surrounding layout beyond that one fix.

- [ ] **Step 4: Commit (only if Step 3 made a change)**

```bash
git add <changed files>
git commit -m "Fix <specific overflow/clipping bug> on mobile login"
```

---

### Task 7: Full build + final cross-page verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run a production build to catch type/syntax errors**

Run: `pnpm --dir /Users/inverita/BHMP/repo build`
Expected: build succeeds with no TypeScript or bundling errors.

- [ ] **Step 2: Full mobile visual pass**

With `pnpm dev` running (or `pnpm preview` against the build output), in
devtools responsive mode at 320px, 375px, 414px, and 768px (the breakpoint
boundary, tested just below it e.g. 767px):

- `/`: header wraps to two rows (logo/avatar row, full-width search row);
  hero and filters usable with 16px side padding; job list is a single
  column; selecting a job opens a full-screen detail overlay that closes via
  `×`; sector/type filters, search, and sort all still work.
- `/login`: no overflow on either the "Create account" or "Sign in" flow
  (per Task 6's findings).
- `/profile`: tabs render as a horizontal row above stacked, full-width
  content; General/Saved/Settings all render correctly; Saved tab's job
  detail opens as the same full-screen overlay as the dashboard.
- Browser console has no new errors or warnings at any of these widths.

- [ ] **Step 3: Desktop regression check (the hard constraint)**

At 1024px and 1440px, for `/`, `/login`, and `/profile`: compare against the
behavior before this change (e.g. via `git stash` or checking out the
commit before Task 1, if needed for a side-by-side) — confirm the header is
a single row, the dashboard split view is `1fr`/`1fr 1.5fr` as before, the
profile page has its left sidebar, and side padding is still 28px. Nothing
should look or behave differently from before this plan at these widths.

- [ ] **Step 4: Confirm final `git status` is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean` (everything from Tasks 1–6
already committed).
