# Saved Status, Working Sort, and Dropdown Arrow Fix Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the four hardcoded job statuses with a single real "Saved" status persisted per user via Supabase, make the "Sort: Most recent · Salary" control actually sort the listings, and fix the "All types" dropdown's arrow icon sitting flush against the edge.

**Architecture:** Pure frontend edit across four existing files — `src/data/jobs.ts`, `src/context/AuthContext.tsx`, `src/components/shared.tsx`, `src/pages/Dashboard.tsx`. No new components, no new routes, no new Supabase tables — saved job IDs live in the existing `user_metadata` blob alongside `full_name`/`role`.

**Tech Stack:** React 19, TypeScript 5.7, Vite 8, Supabase Auth (`@supabase/supabase-js`), inline styles with CSS-var tokens (`v` object in `shared.tsx`).

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-12-saved-status-sort-dropdown-design.md` — every task below implements a section of it.
- No test framework is configured in this project (no jest/vitest/playwright — `package.json` only has `format: oxfmt`). Verification is manual: run `pnpm dev`, view in browser, check the console for errors. Do not invent a test framework for this change.
- No new Supabase table/migration — saved job IDs are stored as `saved_job_ids: number[]` in the existing `user_metadata`, the same mechanism already used for `full_name`/`role`.
- No reverse/toggle-direction behavior on the sort buttons — clicking a button just makes it the active sort.
- Don't touch sector filter pills, the search input, routing, or the login page — out of scope per spec.

---

### Task 1: Add saved-job persistence to `AuthContext`

**Files:**
- Modify: `src/context/AuthContext.tsx` (the `AuthUser` type, `toAuthUser`, `AuthContextValue` type, and the `AuthProvider` body)

**Interfaces:**
- Consumes: nothing new (still wraps `supabase.auth.*`).
- Produces: `AuthUser.savedJobIds: number[]`; `useAuth()` now also returns `toggleSavedJob: (jobId: number) => Promise<void>`. Both are consumed by Task 2.

This task lands first and is backward-compatible with everything that currently reads `useAuth()` — it only adds new fields/methods, so the app keeps working unmodified after this task alone.

- [ ] **Step 1: Add `savedJobIds` to the `AuthUser` type**

Current:

```tsx
export type AuthUser = {
  name: string
  email: string
  role: string
}
```

Replace with:

```tsx
export type AuthUser = {
  name: string
  email: string
  role: string
  savedJobIds: number[]
}
```

- [ ] **Step 2: Parse `saved_job_ids` out of `user_metadata` in `toAuthUser`**

Current:

```tsx
function toAuthUser(supabaseUser: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): AuthUser | null {
  if (!supabaseUser?.email) return null
  const meta = supabaseUser.user_metadata ?? {}
  const fullName = typeof meta.full_name === 'string' ? meta.full_name : ''
  const role = typeof meta.role === 'string' ? meta.role : ''
  return {
    name: fullName || supabaseUser.email.split('@')[0] || 'You',
    email: supabaseUser.email,
    role,
  }
}
```

Replace with:

```tsx
function toAuthUser(supabaseUser: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): AuthUser | null {
  if (!supabaseUser?.email) return null
  const meta = supabaseUser.user_metadata ?? {}
  const fullName = typeof meta.full_name === 'string' ? meta.full_name : ''
  const role = typeof meta.role === 'string' ? meta.role : ''
  const savedJobIds = Array.isArray(meta.saved_job_ids)
    ? meta.saved_job_ids.filter((id): id is number => typeof id === 'number')
    : []
  return {
    name: fullName || supabaseUser.email.split('@')[0] || 'You',
    email: supabaseUser.email,
    role,
    savedJobIds,
  }
}
```

- [ ] **Step 3: Add `toggleSavedJob` to the `AuthContextValue` type**

Current:

```tsx
type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, details: SignUpDetails) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
}
```

Replace with:

```tsx
type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, details: SignUpDetails) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  toggleSavedJob: (jobId: number) => Promise<void>
}
```

- [ ] **Step 4: Implement `toggleSavedJob` in `AuthProvider`**

Find the `logout` function in `AuthProvider`:

```tsx
  const logout = async () => {
    await supabase.auth.signOut()
  }
```

Add `toggleSavedJob` directly after it (still inside `AuthProvider`, before the `return (`):

```tsx
  const logout = async () => {
    await supabase.auth.signOut()
  }

  const toggleSavedJob = async (jobId: number) => {
    if (!user) return
    const nextIds = user.savedJobIds.includes(jobId)
      ? user.savedJobIds.filter(id => id !== jobId)
      : [...user.savedJobIds, jobId]
    await supabase.auth.updateUser({ data: { saved_job_ids: nextIds } })
  }
```

`supabase.auth.updateUser` triggers Supabase's own `USER_UPDATED` event, which the `onAuthStateChange` listener already set up in this file's `useEffect` picks up automatically — so `user.savedJobIds` refreshes on its own with no manual `setUser` call needed here.

- [ ] **Step 5: Expose `toggleSavedJob` from the provider**

Current:

```tsx
  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout }}>
      {children}
    </AuthContext.Provider>
  )
```

Replace with:

```tsx
  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout, toggleSavedJob }}>
      {children}
    </AuthContext.Provider>
  )
```

- [ ] **Step 6: Verify the app still builds and runs**

Run: `pnpm --dir /Users/inverita/BHMP/repo build`
Expected: build succeeds with no TypeScript errors (nothing consumes `savedJobIds`/`toggleSavedJob` yet, so this is purely additive).

- [ ] **Step 7: Commit**

```bash
git add src/context/AuthContext.tsx
git commit -m "Add saved-job persistence (saved_job_ids) to AuthContext"
```

---

### Task 2: Replace hardcoded statuses with real Saved state

**Files:**
- Modify: `src/data/jobs.ts` (remove `status`/`saved` fields and `STATUS_STYLE`; add `postedDaysAgo`/`salaryMin`)
- Modify: `src/components/shared.tsx` (imports, `JobCard`, `JobDetail`)

**Interfaces:**
- Consumes: `useAuth()` → `{ user, toggleSavedJob }` from Task 1 (`user.savedJobIds: number[]`, `toggleSavedJob: (jobId: number) => Promise<void>`).
- Produces: `JOBS` entries now carry `postedDaysAgo: number` and `salaryMin: number` (consumed by Task 3's sort) and no longer carry `status`/`saved`.

- [ ] **Step 1: Rewrite `src/data/jobs.ts`**

Replace the entire file with:

```ts
export const ROLES = [
  { id: 'student',        label: 'Student',        desc: 'Currently enrolled in full-time education' },
  { id: 'graduate',       label: 'Graduate',       desc: 'Recently completed a degree or qualification' },
  { id: 'professional',   label: 'Professional',   desc: 'Employed and exploring opportunities' },
  { id: 'career_changer', label: 'Career Changer', desc: 'Moving into a new field or industry' },
  { id: 'employer',       label: 'Employer',       desc: 'Posting roles and finding talent' },
  { id: 'partner',        label: 'Partner',        desc: 'Education provider or recruitment partner' },
]

export const JOBS = [
  {
    id: 1,
    title: 'UX Research Lead',
    company: 'Monzo',
    location: 'London, UK',
    type: 'Full-time',
    salary: '£65,000 – £80,000',
    salaryMin: 65000,
    sector: 'Technology',
    posted: '2 days ago',
    postedDaysAgo: 2,
    tags: ['Remote-friendly', 'Senior', 'Research'],
    logo: 'MZ',
    color: '#ff4f64',
    url: 'https://monzo.com/careers',
    desc: "Lead qualitative and quantitative research across Monzo's personal finance products, working closely with product and design teams.",
  },
  {
    id: 2,
    title: 'Graduate Software Engineer',
    company: 'Rolls-Royce',
    location: 'Derby, UK',
    type: 'Full-time',
    salary: '£32,000 – £38,000',
    salaryMin: 32000,
    sector: 'Engineering',
    posted: '1 day ago',
    postedDaysAgo: 1,
    tags: ['Graduate Scheme', 'On-site', 'Engineering'],
    logo: 'RR',
    color: '#5b5ce2',
    url: 'https://careers.rolls-royce.com',
    desc: 'Join the 2025 graduate engineering cohort developing next-generation aerospace propulsion systems.',
  },
  {
    id: 3,
    title: 'Data Analyst – Policy',
    company: 'NHS England',
    location: 'Leeds, UK',
    type: 'Full-time',
    salary: '£38,000 – £44,000',
    salaryMin: 38000,
    sector: 'Public Sector',
    posted: '4 hours ago',
    postedDaysAgo: 0.17,
    tags: ['Hybrid', 'Mid-level', 'Data'],
    logo: 'NHS',
    color: '#0ea5e9',
    url: 'https://www.jobs.nhs.uk',
    desc: 'Analyse population health data to inform national policy decisions within the NHS Transformation Directorate.',
  },
  {
    id: 4,
    title: 'Product Manager',
    company: 'Deliveroo',
    location: 'London, UK',
    type: 'Full-time',
    salary: '£70,000 – £90,000',
    salaryMin: 70000,
    sector: 'Technology',
    posted: '3 days ago',
    postedDaysAgo: 3,
    tags: ['Hybrid', 'Senior', 'Product'],
    logo: 'DL',
    color: '#10b981',
    url: 'https://careers.deliveroo.co.uk',
    desc: "Own the roadmap for Deliveroo's restaurant supply-side tools, driving growth across 40+ markets.",
  },
  {
    id: 5,
    title: 'Sustainability Consultant',
    company: 'Arup',
    location: 'Edinburgh, UK',
    type: 'Full-time',
    salary: '£42,000 – £55,000',
    salaryMin: 42000,
    sector: 'Consulting',
    posted: '1 week ago',
    postedDaysAgo: 7,
    tags: ['Hybrid', 'Mid-level', 'Environment'],
    logo: 'AP',
    color: '#f97316',
    url: 'https://www.arup.com/careers',
    desc: 'Deliver net-zero carbon strategies for major infrastructure and built-environment clients across Scotland.',
  },
  {
    id: 6,
    title: 'Clinical Pharmacist',
    company: 'Boots UK',
    location: 'Manchester, UK',
    type: 'Part-time',
    salary: '£45,000 pro rata',
    salaryMin: 45000,
    sector: 'Healthcare',
    posted: '5 days ago',
    postedDaysAgo: 5,
    tags: ['On-site', 'Mid-level', 'Healthcare'],
    logo: 'BT',
    color: '#8b5cf6',
    url: 'https://boots.jobs',
    desc: 'Provide expert clinical advice and medication management in a busy community pharmacy setting.',
  },
]

export const SECTORS = ['All', 'Technology', 'Engineering', 'Public Sector', 'Consulting', 'Healthcare']
export const TYPES   = ['All types', 'Full-time', 'Part-time', 'Contract', 'Internship']
```

(This drops `status`, `saved`, and the `STATUS_STYLE` export that existed at the end of the old file.)

- [ ] **Step 2: Update the `shared.tsx` import line**

Current (line 1-2):

```tsx
import { useState, useEffect } from 'react'
import { JOBS, STATUS_STYLE } from '../data/jobs'
```

Replace with:

```tsx
import { useState, useEffect } from 'react'
import { JOBS } from '../data/jobs'
import { useAuth } from '../context/AuthContext'
```

(Leave the existing `import bhmpLogo from '../assets/bhmp-logo.avif'` line where it is, right after.)

- [ ] **Step 3: Update `JobCard` to read saved state from `useAuth()`**

Current:

```tsx
export function JobCard({ job, onClick, isSelected }: { job: typeof JOBS[0]; onClick: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false)
  const ss = job.status ? STATUS_STYLE[job.status] : null
```

Replace with:

```tsx
export function JobCard({ job, onClick, isSelected }: { job: typeof JOBS[0]; onClick: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false)
  const { user } = useAuth()
  const isSaved = user?.savedJobIds.includes(job.id) ?? false
```

Then find the badge block:

```tsx
            {ss && (
              <span style={{
                flexShrink: 0, padding: '3px 10px', borderRadius: v.rBadge,
                background: ss.bg, color: ss.color, fontSize: '0.7rem', fontWeight: 600,
              }}>
                {job.status}
              </span>
            )}
```

Replace with:

```tsx
            {isSaved && (
              <span style={{
                flexShrink: 0, padding: '3px 10px', borderRadius: v.rBadge,
                background: 'rgba(100,116,139,0.1)', color: '#64748b', fontSize: '0.7rem', fontWeight: 600,
              }}>
                Saved
              </span>
            )}
```

- [ ] **Step 4: Update `JobDetail` to read and toggle saved state via `useAuth()`**

Current:

```tsx
export function JobDetail({ job, onClose }: { job: typeof JOBS[0]; onClose: () => void }) {
  return (
```

Replace with:

```tsx
export function JobDetail({ job, onClose }: { job: typeof JOBS[0]; onClose: () => void }) {
  const { user, toggleSavedJob } = useAuth()
  const isSaved = user?.savedJobIds.includes(job.id) ?? false
  return (
```

Then find the save button:

```tsx
        <button style={{
          padding: '11px 0', borderRadius: v.rBtn, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
          background: v.purpleBg, color: v.purple, border: 'none', transition: 'opacity 0.15s',
        }}>
          {job.saved ? '★ Saved to tracker' : '☆ Save to tracker'}
        </button>
```

Replace with:

```tsx
        <button onClick={() => toggleSavedJob(job.id)} style={{
          padding: '11px 0', borderRadius: v.rBtn, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
          background: v.purpleBg, color: v.purple, border: 'none', transition: 'opacity 0.15s',
        }}>
          {isSaved ? '★ Saved to tracker' : '☆ Save to tracker'}
        </button>
```

- [ ] **Step 5: Verify no dangling references**

Run: `grep -rn "STATUS_STYLE\|job\.status\|job\.saved" /Users/inverita/BHMP/repo/src`
Expected: no output (no matches).

- [ ] **Step 6: Verify visually**

With `pnpm dev` running, log in and reload the dashboard.

Expected: no job card shows a status badge on first load (fresh account has no saved jobs). Click a job, click "☆ Save to tracker" in the detail panel — the button flips to "★ Saved to tracker" and the corresponding card immediately shows a grey "Saved" badge. Reload the page — the badge and button state persist (backed by `user_metadata`). Click "★ Saved to tracker" again — badge disappears, button reverts to "☆ Save to tracker", and this also persists across reload. No console errors.

- [ ] **Step 7: Commit**

```bash
git add src/data/jobs.ts src/components/shared.tsx
git commit -m "Replace hardcoded job statuses with a real, persisted Saved status"
```

---

### Task 3: Make the Sort control work

**Files:**
- Modify: `src/pages/Dashboard.tsx` (state declarations, `filtered`, the Sort buttons)

**Interfaces:**
- Consumes: `job.postedDaysAgo: number` and `job.salaryMin: number` from Task 2's `JOBS` data.
- Produces: `Dashboard` has a `sortBy: 'recent' | 'salary'` state; `filtered` is sorted according to it before being rendered/passed to `JobCard`.

- [ ] **Step 1: Add `sortBy` state and apply it to `filtered`**

Current:

```tsx
  const [selectedJob, setSelectedJob] = useState<typeof JOBS[0] | null>(JOBS[0])
  const [sector,      setSector]      = useState('All')
  const [jobType,     setJobType]     = useState('All types')
  const [query,       setQuery]       = useState('')

  const filtered = JOBS.filter(j => {
    const q = query.toLowerCase()
    return (
      (!q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)) &&
      (sector  === 'All'       || j.sector === sector) &&
      (jobType === 'All types' || j.type   === jobType)
    )
  })
```

Replace with:

```tsx
  const [selectedJob, setSelectedJob] = useState<typeof JOBS[0] | null>(JOBS[0])
  const [sector,      setSector]      = useState('All')
  const [jobType,     setJobType]     = useState('All types')
  const [query,       setQuery]       = useState('')
  const [sortBy,      setSortBy]      = useState<'recent' | 'salary'>('recent')

  const filtered = JOBS.filter(j => {
    const q = query.toLowerCase()
    return (
      (!q || j.title.toLowerCase().includes(q) || j.company.toLowerCase().includes(q) || j.location.toLowerCase().includes(q)) &&
      (sector  === 'All'       || j.sector === sector) &&
      (jobType === 'All types' || j.type   === jobType)
    )
  }).sort((a, b) => (
    sortBy === 'recent' ? a.postedDaysAgo - b.postedDaysAgo : b.salaryMin - a.salaryMin
  ))
```

- [ ] **Step 2: Wire the Sort buttons**

Current:

```tsx
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: v.dim }}>
            Sort:
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.purple, fontSize: '0.78rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Most recent</button>
            <span>·</span>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: v.dim, fontSize: '0.78rem', fontFamily: 'Inter, sans-serif' }}>Salary</button>
          </div>
```

Replace with:

```tsx
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: v.dim }}>
            Sort:
            <button onClick={() => setSortBy('recent')} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif',
              color: sortBy === 'recent' ? v.purple : v.dim, fontWeight: sortBy === 'recent' ? 600 : 400,
            }}>Most recent</button>
            <span>·</span>
            <button onClick={() => setSortBy('salary')} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif',
              color: sortBy === 'salary' ? v.purple : v.dim, fontWeight: sortBy === 'salary' ? 600 : 400,
            }}>Salary</button>
          </div>
```

- [ ] **Step 3: Verify visually**

With `pnpm dev` running, reload the dashboard.

Expected: "Most recent" is active (purple) by default and the list is ordered NHS (4 hours ago) → Rolls-Royce (1 day) → Monzo (2 days) → Deliveroo (3 days) → Boots (5 days) → Arup (1 week). Click "Salary" — it turns purple, "Most recent" turns dim, and the list reorders to Deliveroo (£70k) → Monzo (£65k) → Boots (£45k) → Arup (£42k) → NHS (£38k) → Rolls-Royce (£32k). Click "Most recent" again — order and highlighting revert. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "Make the Most recent / Salary sort control functional"
```

---

### Task 4: Fix the "All types" dropdown arrow

**Files:**
- Modify: `src/pages/Dashboard.tsx` (the `<select>` for `jobType`)

**Interfaces:** none — purely visual, no new state or props.

- [ ] **Step 1: Wrap the select and replace the native arrow with a custom one**

Current:

```tsx
          <select value={jobType} onChange={e => setJobType(e.target.value)} style={{
            padding: '6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', outline: 'none',
            background: v.surface, color: v.dim, border: 'none', boxShadow: v.shadowSm, fontFamily: 'Inter, sans-serif',
          }}>
            {TYPES.map(tp => <option key={tp}>{tp}</option>)}
          </select>
```

Replace with:

```tsx
          <div style={{ position: 'relative', display: 'inline-flex' }}>
            <select value={jobType} onChange={e => setJobType(e.target.value)} style={{
              padding: '6px 28px 6px 14px', borderRadius: 8, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer', outline: 'none',
              background: v.surface, color: v.dim, border: 'none', boxShadow: v.shadowSm, fontFamily: 'Inter, sans-serif',
              appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
            }}>
              {TYPES.map(tp => <option key={tp}>{tp}</option>)}
            </select>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: v.dim,
            }}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
```

- [ ] **Step 2: Verify visually**

With `pnpm dev` running, reload the dashboard and zoom in on the "All types" control.

Expected: the chevron now sits 14px from the right edge — the same inset the text has on the left — instead of flush against the border. The dropdown still opens and filters by type correctly on selection. No console errors.

- [ ] **Step 3: Commit**

```bash
git add src/pages/Dashboard.tsx
git commit -m "Fix All types dropdown arrow sitting flush against the edge"
```

---

### Task 5: Full build + final verification pass

**Files:** none (verification only)

- [ ] **Step 1: Run a production build to catch type/syntax errors**

Run: `pnpm --dir /Users/inverita/BHMP/repo build`
Expected: build succeeds with no TypeScript or bundling errors.

- [ ] **Step 2: Full visual pass in the browser**

With `pnpm dev` running (or `pnpm preview` against the build output), log in and check the dashboard:
- No job card shows a status badge until you save it; saving/unsaving via "Save to tracker" in the detail panel toggles the card's "Saved" badge immediately and survives a page reload.
- "Sort: Most recent · Salary" — clicking either button re-orders the list and updates which label is highlighted purple; the default on load is "Most recent".
- The "All types" dropdown's arrow sits with even spacing from the edge, matching the left-side text inset, and the dropdown still filters correctly.
- Sector filters, search, and job selection all still work exactly as before this change.
- Browser console has no new errors or warnings compared to before the change.

- [ ] **Step 3: Confirm final `git status` is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean` (everything from Tasks 1-4 already committed).
