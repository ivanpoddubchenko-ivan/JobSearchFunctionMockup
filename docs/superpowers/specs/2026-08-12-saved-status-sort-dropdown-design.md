# Saved status, working sort, and dropdown arrow fix

## Context

Three independent polish items on the dashboard (`/`, `Dashboard.tsx`):

1. Job cards currently show one of four hardcoded statuses (`Applied`,
   `Interview`, `Saved`, `Offer` — via `STATUS_STYLE` in `src/data/jobs.ts`),
   baked into the mock data and unrelated to any real user action. The only
   status that should exist is `Saved`, and only once the signed-in user
   actually clicks "Save to tracker" — which today has no `onClick` at all.
2. The "Sort: Most recent · Salary" control in the listings header renders
   two buttons with hardcoded active/inactive styling but no click handlers
   — clicking either does nothing.
3. The "All types" `<select>` renders the browser's native dropdown arrow,
   which ignores the box's `paddingRight: 14px` and sits flush against the
   right edge — inconsistent with the 14px breathing room the text gets on
   the left.

## Changes

### 1. Saved status, persisted per user

**Data (`src/data/jobs.ts`):**
- Remove `status` and `saved` from every `JOBS` entry, and remove
  `STATUS_STYLE` entirely. Saved/not-saved becomes a per-user runtime fact,
  not mock data — a fresh account has zero saved jobs regardless of what the
  old `saved: true` flags used to say.

**Persistence (`src/context/AuthContext.tsx`):**
- `AuthUser` gains `savedJobIds: number[]`. `toAuthUser` reads it from
  `meta.saved_job_ids` (an array of numbers), defaulting to `[]` when absent
  or malformed.
- New context method `toggleSavedJob(jobId: number): Promise<void>`:
  computes the next array (add if absent, remove if present) from the
  current `user.savedJobIds`, and calls `supabase.auth.updateUser({ data: {
  saved_job_ids: nextIds } })`. This mirrors the existing `full_name`/`role`
  storage in `user_metadata` — no new Supabase table needed. `updateUser`
  triggers Supabase's own `onAuthStateChange` (`USER_UPDATED`), which the
  provider already listens to, so `user` refreshes automatically — no manual
  `setUser` call needed in `toggleSavedJob`.
- `AuthContextValue` type and the provider's returned value both expose
  `toggleSavedJob`.

**UI (`src/components/shared.tsx`):**
- `JobCard` and `JobDetail` drop the `job.status`/`job.saved` reads. Both
  call `useAuth()` for `savedJobIds`/`toggleSavedJob` directly — no new
  props threaded through `Dashboard.tsx`.
- `JobCard`: badge shows only when `savedJobIds.includes(job.id)`, using one
  hardcoded style (no more 4-entry style map for a single remaining state):
  `background: 'rgba(100,116,139,0.1)'`, `color: '#64748b'`, text `Saved`
  (same visual as today's `Saved` status).
- `JobDetail`: the "☆/★ Save to tracker" button gets
  `onClick={() => toggleSavedJob(job.id)}`; label/icon driven by
  `savedJobIds.includes(job.id)` instead of `job.saved`.

### 2. Working sort

**`src/data/jobs.ts`:**
- Add two explicit numeric fields per job, computed by hand to match the
  existing display strings (avoids parsing "2 days ago" / "£65,000 –
  £80,000" at runtime):
  - `postedDaysAgo: number` (e.g. `'4 hours ago'` → `0.17`, `'1 day ago'` →
    `1`, `'2 days ago'` → `2`, `'1 week ago'` → `7`).
  - `salaryMin: number` — the lower bound of the salary range in whole
    pounds (e.g. `'£65,000 – £80,000'` → `65000`; `'£45,000 pro rata'` →
    `45000`).

**`src/pages/Dashboard.tsx`:**
- Add `const [sortBy, setSortBy] = useState<'recent' | 'salary'>('recent')`.
- Both Sort buttons get an `onClick` that calls `setSortBy('recent' |
  'salary')`; active styling (`v.purple` text / `v.dim`) is driven by
  `sortBy === ...` instead of being hardcoded to "Most recent".
- Before rendering, sort a copy of `filtered`:
  `'recent'` → ascending `postedDaysAgo` (smallest/most-recent first);
  `'salary'` → descending `salaryMin` (highest first). No reverse-on-click
  behavior — clicking a button just makes it the active sort.

### 3. Dropdown arrow fix

**`src/pages/Dashboard.tsx`** (the "All types" `<select>`):
- Wrap the `<select>` in a `position: relative` `<div>` (`display:
  inline-block` or matching flex-item sizing so it doesn't disturb the
  existing filter-row layout).
- `<select>` gets `appearance: 'none'`, `WebkitAppearance: 'none'`,
  `MozAppearance: 'none'`, and `paddingRight: 28px` (up from the current
  14px) so the option text never runs under the icon.
- Add a small chevron `<svg>` absolutely positioned inside the wrapper
  (`right: 14px` — matching the existing 14px left inset of the text —
  vertically centered, `pointer-events: none`, stroke color `v.dim`),
  styled consistently with the other inline SVG icons already used in the
  header (e.g. the search icon).

## Non-goals

- No changes to job filtering by sector/type or the search box.
- No UI for viewing the list of saved jobs (a "saved jobs" / profile view
  stays future work, as already noted in the README).
- No dedicated Supabase table/migration for saved jobs — `user_metadata` is
  sufficient for a handful of numeric IDs per user.
- No reverse/toggle-direction behavior on the sort buttons.
- No changes to the sector filter pills or the search input's own styling.
