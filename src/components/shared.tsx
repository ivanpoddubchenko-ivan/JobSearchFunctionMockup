import { useState, useEffect } from 'react'
import { JOBS } from '../data/jobs'
import { useAuth } from '../context/AuthContext'
import bhmpLogo from '../assets/bhmp-logo.avif'

// ─── Theme ───────────────────────────────────────────────────────────────────

export type Theme = 'light' | 'dark'

export function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])
  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))
  return { theme, toggle }
}

// ─── CSS var tokens ──────────────────────────────────────────────────────────

export const v = {
  bg:           'var(--bg)',
  bgSubtle:     'var(--bg-subtle)',
  surface:      'var(--surface)',
  surfaceRaised:'var(--surface-raised)',
  border:       'var(--border)',
  borderSubtle: 'var(--border-subtle)',
  shadow:       'var(--shadow)',
  shadowSm:     'var(--shadow-sm)',
  text:         'var(--text)',
  muted:        'var(--text-muted)',
  dim:          'var(--text-dim)',
  xdim:         'var(--text-xdim)',
  purple:       'var(--purple)',
  purpleHover:  'var(--purple-hover)',
  purpleBg:     'var(--purple-bg)',
  purpleBorder: 'var(--purple-border)',
  purpleFg:     'var(--purple-fg)',
  rCard:        'var(--radius-card)',
  rBtn:         'var(--radius-btn)',
  rInput:       'var(--radius-input)',
  rBadge:       'var(--radius-badge)',
}

// ─── Atoms ───────────────────────────────────────────────────────────────────

export function Logo() {
  return (
    <img
      src={bhmpLogo} alt="BHMP Network"
      style={{ height: 30, width: 'auto', display: 'block', flexShrink: 0 }}
    />
  )
}

export function ThemeToggle({ theme, toggle }: { theme: Theme; toggle: () => void }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 2, padding: 3,
      background: v.bgSubtle, borderRadius: 10, border: `1px solid ${v.border}`,
    }}>
      {(['light', 'dark'] as Theme[]).map(m => (
        <button key={m} onClick={toggle} style={{
          padding: '4px 12px', borderRadius: 7, fontSize: '0.75rem', fontWeight: 500,
          cursor: 'pointer', border: 'none', transition: 'all 0.15s',
          background: theme === m ? v.surface : 'transparent',
          color: theme === m ? v.text : v.dim,
          boxShadow: theme === m ? v.shadowSm : 'none',
        }}>
          {m === 'light' ? '☀ Light' : '☾ Dark'}
        </button>
      ))}
    </div>
  )
}

export function Badge({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '3px 9px', borderRadius: v.rBadge,
      fontSize: '0.72rem', fontWeight: 500,
      background: active ? v.purpleBg : v.bgSubtle,
      color: active ? v.purple : v.dim,
    }}>
      {children}
    </span>
  )
}

// ─── Job Card ────────────────────────────────────────────────────────────────

export function JobCard({ job, onClick, isSelected }: { job: typeof JOBS[0]; onClick: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false)
  const { user } = useAuth()
  const isSaved = user?.savedJobIds.includes(job.id) ?? false

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        width: '100%', textAlign: 'left', display: 'block',
        borderRadius: v.rCard, padding: '18px 20px',
        background: isSelected ? v.surface : hovered ? v.surface : v.surface,
        boxShadow: isSelected
          ? `0 0 0 2px ${v.purple}, ${v.shadow}`
          : hovered ? v.shadow : v.shadowSm,
        border: 'none', cursor: 'pointer', outline: 'none',
        transition: 'box-shadow 0.18s',
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        <div style={{
          width: 42, height: 42, borderRadius: 12, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: job.color + '18', color: job.color,
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
        }}>
          {job.logo}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
            <div>
              <p style={{ fontWeight: 600, fontSize: '0.875rem', color: v.text, lineHeight: 1.3, margin: 0 }}>{job.title}</p>
              <p style={{ fontSize: '0.78rem', color: v.dim, margin: '3px 0 0' }}>{job.company} · {job.location}</p>
            </div>
            {isSaved && (
              <span style={{
                flexShrink: 0, padding: '3px 10px', borderRadius: v.rBadge,
                background: 'rgba(100,116,139,0.1)', color: '#64748b', fontSize: '0.7rem', fontWeight: 600,
              }}>
                Saved
              </span>
            )}
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, margin: '10px 0 0' }}>
            <Badge>{job.type}</Badge>
            {job.tags.slice(0, 2).map(tg => <Badge key={tg}>{tg}</Badge>)}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '10px 0 0' }}>
            <span style={{ color: v.purple, fontSize: '0.78rem', fontWeight: 600 }}>{job.salary}</span>
            <span style={{ color: v.dim, fontSize: '0.72rem' }}>{job.posted}</span>
          </div>
        </div>
      </div>
    </button>
  )
}

// ─── Job Detail ──────────────────────────────────────────────────────────────

export function JobDetail({ job, onClose }: { job: typeof JOBS[0]; onClose: () => void }) {
  const { user, toggleSavedJob } = useAuth()
  const isSaved = user?.savedJobIds.includes(job.id) ?? false
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
        <span style={{ color: v.dim, fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>Role detail</span>
        <button onClick={onClose} style={{ background: v.bgSubtle, border: 'none', borderRadius: 8, width: 28, height: 28, cursor: 'pointer', color: v.dim, fontSize: '1.1rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
      </div>

      <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start', marginBottom: 22 }}>
        <div style={{
          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: job.color + '18', color: job.color,
          fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
        }}>
          {job.logo}
        </div>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', color: v.text, lineHeight: 1.2, margin: 0, letterSpacing: '-0.02em' }}>
            {job.title}
          </h2>
          <p style={{ margin: '5px 0 0', fontSize: '0.82rem', color: v.dim }}>{job.company} · {job.location}</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 22 }}>
        {[['Type', job.type], ['Salary', job.salary], ['Sector', job.sector], ['Posted', job.posted]].map(([k, val]) => (
          <div key={k} style={{ borderRadius: 10, padding: '11px 14px', background: v.bgSubtle }}>
            <p style={{ color: v.dim, fontSize: '0.68rem', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 4px' }}>{k}</p>
            <p style={{ fontSize: '0.82rem', fontWeight: 600, color: v.text, margin: 0 }}>{val}</p>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 20 }}>
        <p style={{ color: v.dim, fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>About the role</p>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: v.muted, margin: 0 }}>{job.desc}</p>
        <p style={{ fontSize: '0.85rem', lineHeight: 1.65, color: v.muted, margin: '10px 0 0' }}>
          You will join a high-performing team and contribute from day one. Collaborative culture, flexible working arrangements, and a strong commitment to professional development.
        </p>
      </div>

      <div style={{ marginBottom: 22 }}>
        <p style={{ color: v.dim, fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.07em', margin: '0 0 8px' }}>Tags</p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {job.tags.map(tg => <Badge key={tg}>{tg}</Badge>)}
          <Badge active>{job.sector}</Badge>
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <a href={job.url} target="_blank" rel="noopener noreferrer"
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            padding: '12px 0', borderRadius: v.rBtn, fontWeight: 600, fontSize: '0.875rem',
            background: v.purple, color: '#fff', textDecoration: 'none', transition: 'opacity 0.15s',
          }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          Apply on {job.company}&apos;s website
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4.5M9.5 2.5V7.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
        <button onClick={() => toggleSavedJob(job.id)} style={{
          padding: '11px 0', borderRadius: v.rBtn, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
          background: v.purpleBg, color: v.purple, border: 'none', transition: 'opacity 0.15s',
        }}>
          {isSaved ? '★ Saved to tracker' : '☆ Save to tracker'}
        </button>
      </div>
    </div>
  )
}
