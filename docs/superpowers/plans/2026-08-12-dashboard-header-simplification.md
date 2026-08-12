# Dashboard Header Simplification Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Simplify the `Dashboard.tsx` header — swap the "Pathways" logo for the new BHMP Network wordmark image, remove the "Jobs"/"My Applications" nav tabs (and the now-unreachable tracker kanban board), and hide the light/dark theme toggle.

**Architecture:** Pure frontend edit to two existing files (`src/components/shared.tsx`, `src/pages/Dashboard.tsx`) plus one new binary asset. No new components, no routing changes, no data-model changes.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8, inline styles with CSS-var tokens (`v` object in `shared.tsx`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-12-dashboard-header-simplification-design.md` — every task below implements a section of it.
- No test framework is configured in this project (no jest/vitest/playwright — `package.json` only has `format: oxfmt`). Verification is manual: run `pnpm dev`, view in browser, check the console for errors. Do not invent a test framework for this change.
- Don't touch `JobCard`, `JobDetail`, `STATUS_STYLE`, or `src/data/jobs.ts` — the status badge and "Save to tracker" button stay exactly as they are (out of scope per spec).
- Don't touch `LoginPage.tsx` / `src/components/login/*` — the login header/logo is separate and out of scope.
- Source logo file to copy in Task 1: `/Users/inverita/Desktop/o4bBmWkBICoaQvQc3rtPCtA3C4c.avif` (512×148, dark "BHMP NETWORK" wordmark on transparent background, already confirmed by the user).

---

### Task 1: Replace the header logo

**Files:**
- Create: `src/assets/bhmp-logo.avif` (copy of the user-provided file)
- Modify: `src/components/shared.tsx:1-2` (imports), `src/components/shared.tsx:43-60` (`Logo` function)

**Interfaces:**
- Produces: `Logo` (default-exported nothing, named export, no props) — same name/signature as before, so `Dashboard.tsx`'s `<Logo />` usage (untouched in this task) keeps working.

- [ ] **Step 1: Copy the logo asset into the project**

```bash
cp "/Users/inverita/Desktop/o4bBmWkBICoaQvQc3rtPCtA3C4c.avif" "/Users/inverita/BHMP/repo/src/assets/bhmp-logo.avif"
```

- [ ] **Step 2: Verify the file landed correctly**

Run: `file /Users/inverita/BHMP/repo/src/assets/bhmp-logo.avif`
Expected: `ISO Media, AVIF Image` (same as the source file)

- [ ] **Step 3: Add the image import to `shared.tsx`**

In `src/components/shared.tsx`, the file currently opens with:

```tsx
import { useState, useEffect } from 'react'
import { JOBS, STATUS_STYLE } from '../data/jobs'
```

Change it to:

```tsx
import { useState, useEffect } from 'react'
import { JOBS, STATUS_STYLE } from '../data/jobs'
import bhmpLogo from '../assets/bhmp-logo.avif'
```

- [ ] **Step 4: Replace the `Logo` component body**

Find this block (currently lines 43-60 of `src/components/shared.tsx`):

```tsx
export function Logo() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
      <div style={{
        width: 30, height: 30, borderRadius: 9, background: v.purple,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 11L7 3L12 11" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M4 8.5H10"       stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
        </svg>
      </div>
      <span style={{ fontWeight: 700, fontSize: '1rem', letterSpacing: '-0.02em', color: v.text }}>
        Pathways
      </span>
    </div>
  )
}
```

Replace it with:

```tsx
export function Logo() {
  return (
    <img
      src={bhmpLogo} alt="BHMP Network"
      style={{ height: 30, width: 'auto', display: 'block', flexShrink: 0 }}
    />
  )
}
```

- [ ] **Step 5: Start the dev server and verify visually**

Run: `pnpm --dir /Users/inverita/BHMP/repo dev` (or use the project's preview tooling), open the dashboard in a browser (log in if the auth gate kicks in).

Expected: the header's top-left shows the new dark "BHMP NETWORK" wordmark image at ~30px tall instead of the purple-square icon + "Pathways" text. No layout overflow, no broken-image icon, no console errors mentioning `bhmp-logo`.

- [ ] **Step 6: Commit**

```bash
git add src/assets/bhmp-logo.avif src/components/shared.tsx
git commit -m "Replace dashboard header logo with BHMP Network wordmark"
```

---

### Task 2: Remove nav tabs and the tracker board

**Files:**
- Modify: `src/pages/Dashboard.tsx:1-186` (imports, `activeTab` state, `<nav>` block, tab-conditional sections)
- Modify: `src/components/shared.tsx` (delete the `TrackerView` function)

**Interfaces:**
- Consumes: nothing new.
- Produces: `Dashboard` now always renders the hero + filters + listings split view that used to live behind `activeTab === 'listings'`. No more `activeTab` state exists anywhere in the file.

- [ ] **Step 1: Drop `TrackerView` from the `shared.tsx` import in `Dashboard.tsx`**

Current import (line 4):

```tsx
import { v, useTheme, Logo, ThemeToggle, JobCard, JobDetail, TrackerView } from '../components/shared'
```

Change to:

```tsx
import { v, useTheme, Logo, ThemeToggle, JobCard, JobDetail } from '../components/shared'
```

(`ThemeToggle` is removed in Task 3 — leave it here for now so this task's diff stays focused on tabs/tracker.)

- [ ] **Step 2: Remove the `activeTab` state**

Current line 39:

```tsx
  const [activeTab,   setActiveTab]   = useState<'listings' | 'tracker'>('listings')
```

Delete this line entirely.

- [ ] **Step 3: Remove the nav tabs block**

Current block (inside the header, right after the search bar `<div>` closes):

```tsx
          {/* Nav tabs */}
          <nav style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {[{ id: 'listings', label: 'Jobs' }, { id: 'tracker', label: 'My Applications' }].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id as any)} style={{
                padding: '7px 14px', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                background: activeTab === tab.id ? v.purple : 'transparent',
                color: activeTab === tab.id ? '#fff' : v.dim,
                transition: 'all 0.15s',
              }}>
                {tab.label}
              </button>
            ))}
          </nav>

```

Delete this block entirely (including the blank line after it).

- [ ] **Step 4: Make the hero section unconditional**

Current:

```tsx
      {/* ── Hero ── */}
      {activeTab === 'listings' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 28px 24px' }}>
          <h1 style={{ fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: v.text, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
            Find your next <span style={{ color: v.purple }}>opportunity.</span>
          </h1>
          <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: v.dim, maxWidth: '44ch', margin: '0 0 28px' }}>
            Every listing links directly to the employer&apos;s website — no on-platform applications.
          </p>

          {/* Sector + type filters */}
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
            {SECTORS.map(s => (
              <button key={s} onClick={() => setSector(s)} style={{
                padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: 'none',
                background: sector === s ? v.purple : v.surface,
                color: sector === s ? '#fff' : v.dim,
                boxShadow: sector === s ? 'none' : v.shadowSm,
                transition: 'all 0.15s',
              }}>
                {s}
              </button>
            ))}
            <select value={jobType} onChange={e => setJobType(e.target.value)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', outline: 'none',
              background: v.surface, color: v.dim, border: 'none', boxShadow: v.shadowSm, fontFamily: 'Inter, sans-serif',
            }}>
              {TYPES.map(tp => <option key={tp}>{tp}</option>)}
            </select>
          </div>
        </div>
      )}
```

Replace with the same JSX but without the `activeTab === 'listings' &&` guard:

```tsx
      {/* ── Hero ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 28px 24px' }}>
        <h1 style={{ fontWeight: 700, fontSize: 'clamp(1.8rem, 4vw, 2.6rem)', color: v.text, lineHeight: 1.1, letterSpacing: '-0.03em', margin: '0 0 10px' }}>
          Find your next <span style={{ color: v.purple }}>opportunity.</span>
        </h1>
        <p style={{ fontSize: '0.95rem', lineHeight: 1.6, color: v.dim, maxWidth: '44ch', margin: '0 0 28px' }}>
          Every listing links directly to the employer&apos;s website — no on-platform applications.
        </p>

        {/* Sector + type filters */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6 }}>
          {SECTORS.map(s => (
            <button key={s} onClick={() => setSector(s)} style={{
              padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: sector === s ? v.purple : v.surface,
              color: sector === s ? '#fff' : v.dim,
              boxShadow: sector === s ? 'none' : v.shadowSm,
              transition: 'all 0.15s',
            }}>
              {s}
            </button>
          ))}
          <select value={jobType} onChange={e => setJobType(e.target.value)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', outline: 'none',
            background: v.surface, color: v.dim, border: 'none', boxShadow: v.shadowSm, fontFamily: 'Inter, sans-serif',
          }}>
            {TYPES.map(tp => <option key={tp}>{tp}</option>)}
          </select>
        </div>
      </div>
```

- [ ] **Step 5: Delete the tracker section**

Current block:

```tsx
      {/* ── Tracker ── */}
      {activeTab === 'tracker' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 28px 48px' }}>
          <TrackerView />
        </div>
      )}

```

Delete this block entirely (including the blank line after it).

- [ ] **Step 6: Make the listings split view unconditional**

Current:

```tsx
      {/* ── Listings split view ── */}
      {activeTab === 'listings' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <p style={{ fontSize: '0.82rem', color: v.dim, margin: 0 }}>
              <span style={{ color: v.text, fontWeight: 600 }}>{filtered.length}</span> roles found
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: v.dim }}>
              Sort:
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.purple, fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Most recent</button>
              <span>·</span>
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.dim, fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}>Salary</button>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1.5fr' : '1fr', gap: 14 }}>
            {/* List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filtered.map(job => (
                <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} isSelected={selectedJob?.id === job.id} />
              ))}
              {filtered.length === 0 && (
                <div style={{ textAlign: 'center', padding: '64px 0', color: v.dim }}>
                  <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>—</p>
                  <p style={{ fontSize: '0.875rem', margin: 0 }}>No roles match your filters</p>
                </div>
              )}
            </div>

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
          </div>
        </div>
      )}
```

Replace with the same JSX but without the `activeTab === 'listings' &&` guard (drop the wrapping `{...}` and its parens, keep the inner `<div>` as the direct sibling of the hero `<div>`):

```tsx
      {/* ── Listings split view ── */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontSize: '0.82rem', color: v.dim, margin: 0 }}>
            <span style={{ color: v.text, fontWeight: 600 }}>{filtered.length}</span> roles found
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: v.dim }}>
            Sort:
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.purple, fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Most recent</button>
            <span>·</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.dim, fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}>Salary</button>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1.5fr' : '1fr', gap: 14 }}>
          {/* List */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {filtered.map(job => (
              <JobCard key={job.id} job={job} onClick={() => setSelectedJob(job)} isSelected={selectedJob?.id === job.id} />
            ))}
            {filtered.length === 0 && (
              <div style={{ textAlign: 'center', padding: '64px 0', color: v.dim }}>
                <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>—</p>
                <p style={{ fontSize: '0.875rem', margin: 0 }}>No roles match your filters</p>
              </div>
            )}
          </div>

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
        </div>
      </div>
```

- [ ] **Step 7: Delete the `TrackerView` function from `shared.tsx`**

In `src/components/shared.tsx`, delete the entire block starting at the `// ─── Tracker ───` comment through the end of the file (the whole `TrackerView` function, currently lines 235-291 including the section-header comment):

```tsx
// ─── Tracker ─────────────────────────────────────────────────────────────────

export function TrackerView() {
  ... (full function body) ...
}
```

Delete it entirely. `STATUS_STYLE` (imported from `../data/jobs` at the top of `shared.tsx`) stays — it's still used by `JobCard` and `JobDetail`.

- [ ] **Step 8: Verify no dangling references**

Run: `grep -rn "TrackerView\|activeTab" /Users/inverita/BHMP/repo/src`
Expected: no output (no matches).

- [ ] **Step 9: Verify visually**

With `pnpm dev` running, reload the dashboard.

Expected: no nav tabs in the header; the hero ("Find your next opportunity.") and the job list + detail panel show immediately without needing to click anything; sector/type filters and job selection still work; no console errors.

- [ ] **Step 10: Commit**

```bash
git add src/pages/Dashboard.tsx src/components/shared.tsx
git commit -m "Remove Jobs/My Applications nav tabs and the tracker board"
```

---

### Task 3: Hide the theme toggle

**Files:**
- Modify: `src/pages/Dashboard.tsx:1-4` (import), `:38` (hook call), `:94-97` (header actions block)

**Interfaces:**
- Consumes: `useTheme` from `../components/shared` (already imported before this task; signature unchanged: `() => { theme: Theme; toggle: () => void }`).
- Produces: `Dashboard` calls `useTheme()` for its side effect only — no `theme`/`toggle` bindings remain in the component.

- [ ] **Step 1: Drop `ThemeToggle` from the import**

After Task 2, line 4 reads:

```tsx
import { v, useTheme, Logo, JobCard, JobDetail } from '../components/shared'
```

(If you're doing this task standalone and Task 2 hasn't run, the line will still have `ThemeToggle` in it — remove it from wherever it appears in the import list.)

- [ ] **Step 2: Call `useTheme()` without destructuring**

Current line 38:

```tsx
  const { theme, toggle } = useTheme()
```

Change to:

```tsx
  useTheme()
```

This keeps the hook's side effect (setting `data-theme="light"` on `<html>` via its internal `useEffect`) without leaving unused `theme`/`toggle` locals now that nothing renders the toggle button.

- [ ] **Step 3: Remove the `ThemeToggle` render**

Current block:

```tsx
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <ThemeToggle theme={theme} toggle={toggle} />
            <UserMenu />
          </div>
```

Change to:

```tsx
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <UserMenu />
          </div>
```

- [ ] **Step 4: Verify no dangling references**

Run: `grep -rn "ThemeToggle" /Users/inverita/BHMP/repo/src/pages/Dashboard.tsx`
Expected: no output.

- [ ] **Step 5: Verify visually**

With `pnpm dev` running, reload the dashboard.

Expected: no light/dark toggle control in the header; header shows logo, search bar, then straight to the user avatar + "Log out"; page still renders in the light theme (default); no console errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "Hide theme toggle in dashboard header"
```

---

### Task 4: Full build + final visual pass

**Files:** none (verification only)

- [ ] **Step 1: Run a production build to catch type/syntax errors**

Run: `pnpm --dir /Users/inverita/BHMP/repo build`
Expected: build succeeds with no TypeScript or bundling errors.

- [ ] **Step 2: Full visual pass in the browser**

With `pnpm dev` running (or `pnpm preview` against the build output), log in and check the dashboard:
- Header shows: BHMP Network logo (image) — search bar — user avatar + "Log out". No nav tabs, no theme toggle.
- Hero + sector/type filters + job list + job detail panel render as before, unconditionally.
- Selecting a job, filtering by sector/type, and searching all still work exactly as before this change.
- Browser console has no new errors or warnings compared to before the change.

- [ ] **Step 3: Confirm final `git status` is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean` (everything from Tasks 1-3 already committed).
