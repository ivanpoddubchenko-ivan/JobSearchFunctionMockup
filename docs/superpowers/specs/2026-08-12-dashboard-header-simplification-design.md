# Dashboard header simplification

## Context

`Dashboard.tsx` (`/`, the main page) currently has a header with the "Pathways"
icon+text logo, a search bar, "Jobs"/"My Applications" nav tabs, a light/dark
theme toggle, and the user menu. This changes the header to a simpler, rebranded
version while everything below the header (job listings, filters, job
cards/detail panel) stays as-is.

## Changes

### 1. Logo

- New brand asset (dark-on-transparent `BHMP NETWORK` wordmark, provided by the
  user) is added at `src/assets/bhmp-logo.avif`.
- `Logo` in `src/components/shared.tsx` — currently a purple icon square plus
  the text "Pathways" — is replaced with a single `<img src={bhmpLogo}
  alt="BHMP Network" />`, sized to fit the 60px header (height ~28–30px, width
  auto). No text label next to it, since the wordmark is baked into the image.
- `Logo` is shared between `Dashboard.tsx` and `LoginPage.tsx`'s header
  region, but the login page actually renders its own `ImagePanel` (with the
  white login-only logo variant at `src/assets/login/bhmp-logo.avif`), so this
  change is scoped to the dashboard header only. Confirmed no other usages of
  `Logo` exist before changing it.

### 2. Nav tabs / tracker

- The `<nav>` block with "Jobs" / "My Applications" tabs and the `activeTab`
  state are removed from `Dashboard.tsx`. The page always renders the hero +
  filters + job listings split view (previously the "Jobs" tab content).
- The kanban tracker board (`TrackerView` in `shared.tsx`) becomes unreachable
  once its only entry point (the "My Applications" tab) is gone, so it is
  deleted as dead code.
- Out of scope for this change: the per-job status badge (Saved / Applied /
  Interview / Offer) on `JobCard`/`JobDetail` and the "☆ Save to tracker"
  button in `JobDetail`. These stay exactly as they are — they'll back a
  future profile page that lists a user's saved jobs. `STATUS_STYLE` in
  `src/data/jobs.ts` stays since those badges still use it.

### 3. Theme toggle

- The `<ThemeToggle .../>` render call is removed from the header.
- `useTheme()` and the underlying CSS variable/`data-theme` mechanism are
  left in place — theme just stays pinned to the `light` default since there's
  no more UI control to flip it. No CSS or theme-variable changes.

## Result layout

Header becomes: `Logo (image)` — `search bar` — `UserMenu (avatar + Log out)`,
using the existing `space-between` flex layout (no new layout code needed
beyond removing the tabs/toggle nodes).

## Non-goals

- No changes to job listings, filters, search behavior, or the job detail
  panel.
- No changes to auth, routing, or the login page.
- No new "saved jobs" / profile page — that's a separate future project.
