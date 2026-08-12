# User Profile Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/profile` page reachable from the dashboard header avatar, with three vertically-tabbed sections: read-only account info, the user's saved jobs (with unsave), and a placeholder password-change action.

**Architecture:** One new route (`/profile`) and one new page component (`src/pages/Profile.tsx`) that reuses existing shared atoms (`v`, `Logo`, `JobDetail`) and `AuthContext` state (`user`, `savedJobIds`, `toggleSavedJob`). `UserMenu` moves from being a `Dashboard.tsx`-local function to a named export in `shared.tsx` so both pages can render it. `AuthContext` gains one new derived field (`dob`) read from data Supabase already stores.

**Tech Stack:** React 19, TypeScript 5.7, React Router 7, Vite 8, inline styles with CSS-var tokens (`v` object in `shared.tsx`), Supabase Auth (`user_metadata`) — no new dependencies.

## Global Constraints

- Spec: `docs/superpowers/specs/2026-08-12-user-profile-page-design.md` — every task below implements a section of it.
- No test framework is configured in this project (no jest/vitest/playwright — `package.json` only has `format: oxfmt`). Verification is manual: run `pnpm dev`, view in browser, check the console for errors. Do not invent a test framework for this change.
- Tab switching on `/profile` is local component state (`useState`), not part of the URL. There is no nested routing.
- The "Change password" button in the Settings tab has no `onClick` and must stay that way — no real password-change functionality in this change.
- `JobCard` (in `shared.tsx`) is not touched by this plan — the Saved tab uses its own local row component instead (see spec's "Tab: Saved" section for rationale).
- `JobDetail` (in `shared.tsx`) is reused unmodified.
- The Saved tab's list and count are derived from `useAuth().user.savedJobIds` filtered against `JOBS`, never from any per-job field on `JOBS` itself.

---

### Task 1: Add `dob` to `AuthContext`

**Files:**
- Modify: `src/context/AuthContext.tsx:5-10` (`AuthUser` type), `:29-43` (`toAuthUser`)

**Interfaces:**
- Produces: `AuthUser.dob: string` — the raw `YYYY-MM-DD` string from `user_metadata.date_of_birth`, or `''` if absent/malformed. Consumed by Task 2's `GeneralTab`.

- [ ] **Step 1: Add `dob` to the `AuthUser` type**

Current (`src/context/AuthContext.tsx:5-10`):

```tsx
export type AuthUser = {
  name: string
  email: string
  role: string
  savedJobIds: number[]
}
```

Change to:

```tsx
export type AuthUser = {
  name: string
  email: string
  role: string
  dob: string
  savedJobIds: number[]
}
```

- [ ] **Step 2: Compute and return `dob` in `toAuthUser`**

Current (`src/context/AuthContext.tsx:29-43`):

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

Change to:

```tsx
function toAuthUser(supabaseUser: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): AuthUser | null {
  if (!supabaseUser?.email) return null
  const meta = supabaseUser.user_metadata ?? {}
  const fullName = typeof meta.full_name === 'string' ? meta.full_name : ''
  const role = typeof meta.role === 'string' ? meta.role : ''
  const dob = typeof meta.date_of_birth === 'string' ? meta.date_of_birth : ''
  const savedJobIds = Array.isArray(meta.saved_job_ids)
    ? meta.saved_job_ids.filter((id): id is number => typeof id === 'number')
    : []
  return {
    name: fullName || supabaseUser.email.split('@')[0] || 'You',
    email: supabaseUser.email,
    role,
    dob,
    savedJobIds,
  }
}
```

- [ ] **Step 3: Verify the project still type-checks**

Run: `pnpm --dir /Users/inverita/BHMP/repo build`
Expected: build succeeds with no TypeScript errors.

- [ ] **Step 4: Verify the new field is wired end-to-end in source**

Run: `grep -n "dob" /Users/inverita/BHMP/repo/src/context/AuthContext.tsx`
Expected: 3 matches — the type field, the `const dob = ...` line, and the `dob,` in the returned object.

- [ ] **Step 5: Commit**

```bash
git add src/context/AuthContext.tsx
git commit -m "Add dob to AuthUser, sourced from Supabase date_of_birth metadata"
```

---

### Task 2: Add `/profile` route, page shell, and General tab

**Files:**
- Modify: `src/components/shared.tsx` (add `useNavigate` import, add exported `UserMenu`)
- Modify: `src/pages/Dashboard.tsx:1-35` (drop local `UserMenu` and now-unused imports, import `UserMenu` from `shared.tsx`)
- Modify: `src/App.tsx` (add `/profile` route)
- Create: `src/pages/Profile.tsx`

**Interfaces:**
- Consumes: `useAuth()` → `{ user: AuthUser | null; logout: () => Promise<void> }` (from `AuthContext`, `user.dob` from Task 1); `v`, `useTheme`, `Logo` (from `shared.tsx`, unchanged signatures).
- Produces: `UserMenu` — named export from `shared.tsx`, no props, renders the avatar (now a button that navigates to `/profile`) + "Log out". `Profile` — default export from `src/pages/Profile.tsx`, no props, routed at `/profile`.

- [ ] **Step 1: Move `UserMenu` into `shared.tsx` as a named export**

In `src/components/shared.tsx`, add `useNavigate` to the imports at the top. Current line 1:

```tsx
import { useState, useEffect } from 'react'
```

Change to:

```tsx
import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
```

Then add this new exported function right after the `Badge` component (after the closing `}` that currently ends the `Badge` function, before the `// ─── Job Card ───` comment):

```tsx
export function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null
  const initials = user.name.slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <button
        onClick={() => navigate('/profile')}
        title={user.email}
        style={{
          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: v.purpleBg, color: v.purple, fontSize: '0.7rem', fontWeight: 700,
          border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Inter, sans-serif',
        }}
      >
        {initials}
      </button>
      <button onClick={handleLogout} style={{
        fontSize: '0.82rem', fontWeight: 600, color: v.dim, background: 'none', border: 'none', cursor: 'pointer', padding: '7px 10px',
      }}>
        Log out
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Remove the local `UserMenu` from `Dashboard.tsx` and import it from `shared.tsx`**

Current (`src/pages/Dashboard.tsx:1-35`):

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JOBS, SECTORS, TYPES } from '../data/jobs'
import { v, useTheme, Logo, JobCard, JobDetail } from '../components/shared'
import { useAuth } from '../context/AuthContext'

function UserMenu() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null
  const initials = user.name.slice(0, 2).toUpperCase()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{
        width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: v.purpleBg, color: v.purple, fontSize: '0.7rem', fontWeight: 700,
      }} title={user.email}>
        {initials}
      </div>
      <button onClick={handleLogout} style={{
        fontSize: '0.82rem', fontWeight: 600, color: v.dim, background: 'none', border: 'none', cursor: 'pointer', padding: '7px 10px',
      }}>
        Log out
      </button>
    </div>
  )
}

export default function Dashboard() {
```

Change to:

```tsx
import { useState } from 'react'
import { JOBS, SECTORS, TYPES } from '../data/jobs'
import { v, useTheme, Logo, JobCard, JobDetail, UserMenu } from '../components/shared'

export default function Dashboard() {
```

- [ ] **Step 3: Verify no dangling references**

Run: `grep -rn "function UserMenu" /Users/inverita/BHMP/repo/src`
Expected: one match, in `src/components/shared.tsx` (not `Dashboard.tsx`).

- [ ] **Step 4: Create `src/pages/Profile.tsx` with the page shell and General tab**

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v, useTheme, Logo, UserMenu } from '../components/shared'
import { useAuth } from '../context/AuthContext'

type Tab = 'general' | 'saved' | 'settings'

const TABS: { id: Tab; label: string }[] = [
  { id: 'general', label: 'General' },
  { id: 'saved', label: 'Saved' },
  { id: 'settings', label: 'Settings' },
]

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ borderRadius: 10, padding: '14px 16px', background: v.bgSubtle }}>
      <p style={{ color: v.dim, fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>{label}</p>
      <p style={{ fontSize: '0.9rem', fontWeight: 600, color: v.text, margin: 0 }}>{value || '—'}</p>
    </div>
  )
}

function GeneralTab() {
  const { user } = useAuth()
  if (!user) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <InfoBlock label="Full name" value={user.name} />
      <InfoBlock label="Email" value={user.email} />
      <InfoBlock label="Date of birth" value={user.dob} />
    </div>
  )
}

export default function Profile() {
  useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('general')

  return (
    <div style={{ background: v.bg, minHeight: '100vh', color: v.text }}>
      <header style={{ background: v.surface, boxShadow: `0 1px 0 ${v.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <div onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex' }}>
            <Logo />
          </div>
          <UserMenu />
        </div>
      </header>

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 28px 48px', display: 'grid', gridTemplateColumns: '220px 1fr', gap: 28, alignItems: 'start' }}>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              textAlign: 'left', padding: '10px 14px', borderRadius: 9, fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', border: 'none',
              background: tab === t.id ? v.purple : 'transparent',
              color: tab === t.id ? '#fff' : v.dim,
              transition: 'all 0.15s',
            }}>
              {t.label}
            </button>
          ))}
        </nav>

        <div style={{ borderRadius: v.rCard, padding: 24, background: v.surface, boxShadow: v.shadow }}>
          {tab === 'general' && <GeneralTab />}
        </div>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Add the `/profile` route**

Current (`src/App.tsx`):

```tsx
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
      </Routes>
    </AuthProvider>
  )
}
```

Change to:

```tsx
import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth } from './components/RequireAuth'
import LoginPage from './pages/LoginPage'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<RequireAuth><Dashboard /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
      </Routes>
    </AuthProvider>
  )
}
```

- [ ] **Step 6: Run a production build**

Run: `pnpm --dir /Users/inverita/BHMP/repo build`
Expected: build succeeds with no TypeScript or bundling errors.

- [ ] **Step 7: Verify visually**

Run: `pnpm --dir /Users/inverita/BHMP/repo dev`, log in, then:
- On the dashboard, click the avatar in the header → URL changes to `/profile`, page renders.
- Profile header shows: logo (top-left) — user avatar + "Log out" (top-right). No search bar.
- Left column shows three tab buttons: General, Saved, Settings. "General" is active (purple) by default.
- Right column shows three info blocks: Full name, Email, Date of birth — values match the signed-in account (date of birth shows the raw `YYYY-MM-DD` string, or `—` if the account has none).
- Click the logo → navigates back to `/`.
- Navigate to `/profile` again, click "Log out" → redirected to `/login`, same as it did from the dashboard.
- No console errors.

- [ ] **Step 8: Commit**

```bash
git add src/App.tsx src/components/shared.tsx src/pages/Dashboard.tsx src/pages/Profile.tsx
git commit -m "Add /profile route with header, vertical tabs, and General tab"
```

---

### Task 3: Build the Saved tab

**Files:**
- Modify: `src/pages/Profile.tsx` (imports, add `SavedRow` and `SavedTab`, wire the `saved` tab branch)

**Interfaces:**
- Consumes: `JobDetail` from `../components/shared` (existing, unmodified) — `{ job: typeof JOBS[0]; onClose: () => void }`; `useAuth().toggleSavedJob(jobId: number): Promise<void>` (existing, unmodified); `JOBS` from `../data/jobs`.
- Produces: nothing consumed by later tasks.

- [ ] **Step 1: Update the imports at the top of `src/pages/Profile.tsx`**

Current:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v, useTheme, Logo, UserMenu } from '../components/shared'
import { useAuth } from '../context/AuthContext'
```

Change to:

```tsx
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JOBS } from '../data/jobs'
import { v, useTheme, Logo, UserMenu, JobDetail } from '../components/shared'
import { useAuth } from '../context/AuthContext'
```

- [ ] **Step 2: Add `SavedRow` and `SavedTab` after `GeneralTab`**

Insert this after the `GeneralTab` function (before `export default function Profile()`):

```tsx
function SavedRow({ job, onClick, onUnsave }: { job: typeof JOBS[0]; onClick: () => void; onUnsave: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', display: 'flex', alignItems: 'center', gap: 12,
        borderRadius: v.rCard, padding: '14px 16px',
        background: v.surface, boxShadow: v.shadowSm,
        border: 'none', cursor: 'pointer',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontWeight: 600, fontSize: '0.875rem', color: v.text, margin: 0 }}>{job.title}</p>
        <p style={{ fontSize: '0.78rem', color: v.dim, margin: '3px 0 0' }}>{job.company}</p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
          <span style={{ color: v.purple, fontSize: '0.78rem', fontWeight: 600 }}>{job.salary}</span>
          <span style={{ color: v.dim, fontSize: '0.72rem' }}>{job.posted}</span>
        </div>
      </div>
      <span
        role="button"
        aria-label="Remove from saved"
        onClick={e => { e.stopPropagation(); onUnsave() }}
        style={{ flexShrink: 0, fontSize: '1.1rem', color: v.purple, cursor: 'pointer', lineHeight: 1 }}
        title="Remove from saved"
      >
        ★
      </span>
    </button>
  )
}

function SavedTab() {
  const { user, toggleSavedJob } = useAuth()
  const [selectedJob, setSelectedJob] = useState<typeof JOBS[0] | null>(null)
  const savedIds = user?.savedJobIds ?? []
  const savedJobs = JOBS.filter(j => savedIds.includes(j.id))

  return (
    <div>
      <p style={{ fontSize: '0.82rem', color: v.dim, margin: '0 0 14px' }}>
        <span style={{ color: v.text, fontWeight: 600 }}>{savedJobs.length}</span> saved roles
      </p>
      {savedJobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '64px 0', color: v.dim }}>
          <p style={{ fontSize: '2rem', margin: '0 0 12px' }}>—</p>
          <p style={{ fontSize: '0.875rem', margin: 0 }}>No saved roles yet</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: selectedJob ? '1fr 1.5fr' : '1fr', gap: 14 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {savedJobs.map(job => (
              <SavedRow
                key={job.id}
                job={job}
                onClick={() => setSelectedJob(job)}
                onUnsave={() => {
                  toggleSavedJob(job.id)
                  if (selectedJob?.id === job.id) setSelectedJob(null)
                }}
              />
            ))}
          </div>
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
      )}
    </div>
  )
}
```

- [ ] **Step 3: Wire the `saved` tab branch**

Current (inside `Profile`'s render, the tab content area):

```tsx
        <div style={{ borderRadius: v.rCard, padding: 24, background: v.surface, boxShadow: v.shadow }}>
          {tab === 'general' && <GeneralTab />}
        </div>
```

Change to:

```tsx
        <div style={{ borderRadius: v.rCard, padding: 24, background: v.surface, boxShadow: v.shadow }}>
          {tab === 'general' && <GeneralTab />}
          {tab === 'saved' && <SavedTab />}
        </div>
```

- [ ] **Step 4: Run a production build**

Run: `pnpm --dir /Users/inverita/BHMP/repo build`
Expected: build succeeds with no TypeScript or bundling errors.

- [ ] **Step 5: Verify visually**

Run: `pnpm --dir /Users/inverita/BHMP/repo dev`, log in.
- On the dashboard (`/`), open a job's detail panel and click "☆ Save to tracker" for two different jobs (button becomes "★ Saved to tracker").
- Navigate to `/profile`, click the "Saved" tab.
- Heading reads "2 saved roles"; both saved jobs are listed with title/company/salary/posted.
- Click a saved row → the same detail panel layout as the dashboard opens on the right (title, type/salary/sector/posted grid, description, tags, "Apply" link, "★ Saved to tracker" button).
- Click the ★ on a row (not the row itself) → that job disappears from the list, heading updates to "1 saved roles"; if its detail panel was open, the panel closes.
- Unsave the remaining job → heading reads "0 saved roles" and the "No saved roles yet" empty state shows.
- No console errors throughout.

- [ ] **Step 6: Commit**

```bash
git add src/pages/Profile.tsx
git commit -m "Add Saved tab to profile page with unsave and job detail panel"
```

---

### Task 4: Build the Settings tab

**Files:**
- Modify: `src/pages/Profile.tsx` (add `SettingsTab`, wire the `settings` tab branch)

**Interfaces:**
- Consumes: nothing new.
- Produces: nothing consumed elsewhere.

- [ ] **Step 1: Add `SettingsTab` after `SavedTab`**

Insert this after the `SavedTab` function (before `export default function Profile()`):

```tsx
function SettingsTab() {
  return (
    <div>
      <p style={{ color: v.dim, fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Password</p>
      <p style={{ fontSize: '0.85rem', color: v.muted, margin: '0 0 14px', lineHeight: 1.6 }}>
        Update the password you use to sign in.
      </p>
      <button style={{
        padding: '11px 20px', borderRadius: v.rBtn, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
        background: v.purpleBg, color: v.purple, border: 'none',
      }}>
        Change password
      </button>
    </div>
  )
}
```

- [ ] **Step 2: Wire the `settings` tab branch**

Current:

```tsx
        <div style={{ borderRadius: v.rCard, padding: 24, background: v.surface, boxShadow: v.shadow }}>
          {tab === 'general' && <GeneralTab />}
          {tab === 'saved' && <SavedTab />}
        </div>
```

Change to:

```tsx
        <div style={{ borderRadius: v.rCard, padding: 24, background: v.surface, boxShadow: v.shadow }}>
          {tab === 'general' && <GeneralTab />}
          {tab === 'saved' && <SavedTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
```

- [ ] **Step 3: Verify no dangling references**

Run: `grep -n "onClick" /Users/inverita/BHMP/repo/src/pages/Profile.tsx | grep -i "change password"`
Expected: no output (the "Change password" button has no `onClick`).

- [ ] **Step 4: Verify visually**

With `pnpm dev` running, on `/profile` click the "Settings" tab.
Expected: "Password" label, one line of description text, and a "Change password" button styled like the dashboard's secondary buttons. Clicking it does nothing (no navigation, no console error, no visual state change).

- [ ] **Step 5: Commit**

```bash
git add src/pages/Profile.tsx
git commit -m "Add Settings tab with a non-functional Change password button"
```

---

### Task 5: Full build and final visual pass

**Files:** none (verification only)

- [ ] **Step 1: Run a production build**

Run: `pnpm --dir /Users/inverita/BHMP/repo build`
Expected: build succeeds with no TypeScript or bundling errors.

- [ ] **Step 2: Full visual pass in the browser**

With `pnpm dev` running (or `pnpm preview` against the build output), log in and walk through:
- Dashboard (`/`) header avatar → navigates to `/profile`.
- `/profile` header: logo (no search bar) — avatar + "Log out". Logo click → back to `/`.
- General tab: Full name, Email, Date of birth all match the signed-in account.
- Saved tab: save/unsave a job from the dashboard, confirm it appears/disappears here with the count staying accurate; row click opens the detail panel; ★ unsaves without opening the detail panel.
- Settings tab: "Change password" button renders and is inert.
- "Log out" from `/profile` → redirected to `/login`, same as from the dashboard.
- Existing dashboard behavior (search, sector/type filters, sort, job selection, save/unsave from the job detail panel) is unaffected.
- Browser console has no new errors or warnings compared to before this change.

- [ ] **Step 3: Confirm final `git status` is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean` (everything from Tasks 1-4 already committed).
