# User profile page

## Context

There is currently no way for a signed-in user to see their own account
details or the list of jobs they've saved — `savedJobIds` and
`toggleSavedJob` already exist on `AuthContext` (wired up ahead of this
change, in support of a separate in-flight "saved status" feature), but
nothing in the UI surfaces the saved list itself, and there is no account
page at all. This adds a `/profile` page reachable from the dashboard header.

## Changes

### 1. Routing and navigation

- New route `/profile` in `src/App.tsx`, wrapped in `RequireAuth` the same
  way `/` is.
- `UserMenu` (defined in `src/pages/Dashboard.tsx`, also reused on the new
  page) — clicking the avatar navigates to `/profile`. "Log out" keeps its
  current behavior.
- On the profile page, clicking `Logo` in the header navigates back to `/`.
- No nested routes — tab switching within `/profile` is local component
  state, not part of the URL. Reloading the page always lands on the first
  tab.

### 2. Page structure (`src/pages/Profile.tsx`, new file)

- Header: same as `Dashboard.tsx`'s header (`Logo` — `UserMenu`), but
  **without** the search bar. Same sticky/`v.surface`/`v.border` styling.
- Below the header, inside the `maxWidth: 1200` centered container: a
  two-column layout.
  - **Left column**: a narrow vertical tab list — three full-width buttons,
    `General`, `Saved`, `Settings`. Active tab styled like the sector filter
    pills on the dashboard (`v.purple` background / white text when active,
    `v.dim` text otherwise).
  - **Right column**: the content of the selected tab, inside a `v.surface`
    card (`borderRadius: v.rCard`, `boxShadow: v.shadow`, padding ~24px) —
    visually consistent with the job detail panel on the dashboard.
- Local state: `const [tab, setTab] = useState<'general' | 'saved' |
  'settings'>('general')`.

### 3. Tab: General

Read-only account info, three fields sourced from `useAuth().user`:

| Field | Source |
|---|---|
| Full name | `user.name` |
| Email | `user.email` |
| Date of birth | `user.dob` (new field, see below) |

Rendered as stacked label/value blocks matching the info-grid style already
used in `JobDetail` (`src/components/shared.tsx`): `v.bgSubtle` background,
small uppercase dim label, bold value below it. Date of birth is displayed
as the raw stored string (`YYYY-MM-DD`), no reformatting. If `dob` is empty
(e.g. an older account created before this field existed), the value renders
as `—`.

**`AuthContext` change required:** `AuthUser` currently has no `dob` field,
even though `signUp` already stores `date_of_birth` in
`user_metadata` (`src/context/AuthContext.tsx:72`). Add:

- `AuthUser.dob: string` (empty string when absent).
- In `toAuthUser`, read `meta.date_of_birth` the same way `full_name` and
  `role` are already read (`typeof meta.date_of_birth === 'string' ?
  meta.date_of_birth : ''`).

No other `AuthContext` changes — `savedJobIds`/`toggleSavedJob` already
exist and are reused as-is.

### 4. Tab: Saved

- Heading: `"{savedJobIds.length} saved roles"`.
- List sourced by filtering the `JOBS` mock array
  (`src/data/jobs.ts`) against `useAuth().savedJobIds` — **not** the legacy
  per-job `saved`/`status` fields on `JOBS`. This keeps the tab correct
  regardless of whether the separate in-flight change that removes those
  legacy fields and `STATUS_STYLE` has landed yet.
- Layout mirrors the dashboard's split view: a list on the left, and when a
  row is clicked, the existing `JobDetail` component (imported from
  `shared.tsx`, unmodified) renders in a `sticky` panel on the right — same
  `selectedJob` local-state pattern as `Dashboard.tsx`.
- List rows are a **new, local (non-exported) row component defined in
  `Profile.tsx`**, not a reuse of the shared `JobCard`. Rationale: `JobCard`
  is actively touched by the separate in-flight saved-status/sort change;
  keeping the profile page's row markup local avoids coupling two
  in-progress changes to the same shared component. The row shows title,
  company, salary, and posted-time (same fields `JobCard` shows today),
  plus a **★ unsave button** on the right edge. Clicking the star calls
  `toggleSavedJob(job.id)` with `stopPropagation()` (so it doesn't also
  trigger row selection); the row disappears from the list immediately
  since it's derived from `savedJobIds`. Clicking anywhere else on the row
  selects it, opening it in the `JobDetail` panel exactly as described
  above.
- Empty state (`savedJobIds.length === 0`): centered `"No saved roles yet"`
  message, styled like the dashboard's "No roles match your filters" empty
  state.

### 5. Tab: Settings

- One section: a "Password" label, a short one-line description, and a
  **"Change password"** button styled as a secondary action (same visual
  treatment as the "☆ Save to tracker" button in `JobDetail`: `v.purpleBg`
  background, `v.purple` text).
- The button has **no `onClick` handler** — it renders as a normal,
  visually-enabled button that does nothing when clicked. No disabled
  state, no "coming soon" label. Password-change functionality itself is
  out of scope for this change.

## Non-goals

- No edit functionality for General-tab fields (name/email/dob stay
  read-only).
- No actual password-change flow — the button is a visual placeholder only.
- No new Supabase tables or migrations — `dob` is read from the
  `user_metadata.date_of_birth` value that already exists.
- No per-tab URLs / deep linking — tab state resets to `General` on reload.
- No changes to `Dashboard.tsx`'s own job listing/filtering/sort behavior.
- No changes to the shared `JobCard` component (the profile page's saved
  list uses its own local row component instead, see Tab: Saved above).
