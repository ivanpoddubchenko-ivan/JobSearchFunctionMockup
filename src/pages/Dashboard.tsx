import { useState } from 'react'
import { JOBS, SECTORS, TYPES } from '../data/jobs'
import { v, useTheme, Logo, JobCard, JobDetail, UserMenu } from '../components/shared'

export default function Dashboard() {
  useTheme()
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

  return (
    <div style={{ background: v.bg, minHeight: '100vh', color: v.text, transition: 'background 0.25s' }}>

      {/* ── Nav ── */}
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

      {/* ── Hero ── */}
      <div className="page-shell" style={{ maxWidth: 1200, margin: '0 auto', padding: '44px 28px 24px' }}>
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
        </div>
      </div>

      {/* ── Listings split view ── */}
      <div className="page-shell" style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 28px 48px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <p style={{ fontSize: '0.82rem', color: v.dim, margin: 0 }}>
            <span style={{ color: v.text, fontWeight: 600 }}>{filtered.length}</span> roles found
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.78rem', color: v.dim }}>
            Sort:
            <button onClick={() => setSortBy('recent')} aria-pressed={sortBy === 'recent'} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif',
              color: sortBy === 'recent' ? v.purple : v.dim, fontWeight: sortBy === 'recent' ? 600 : 400,
            }}>Most recent</button>
            <span>·</span>
            <button onClick={() => setSortBy('salary')} aria-pressed={sortBy === 'salary'} style={{
              background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontFamily: 'Inter, sans-serif',
              color: sortBy === 'salary' ? v.purple : v.dim, fontWeight: sortBy === 'salary' ? 600 : 400,
            }}>Salary</button>
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
    </div>
  )
}
