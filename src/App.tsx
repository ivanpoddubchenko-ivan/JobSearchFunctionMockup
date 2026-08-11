import { useState, useEffect } from 'react'

// ─── Theme ───────────────────────────────────────────────────────────────────

type Theme = 'light' | 'dark'

function useTheme() {
  const [theme, setTheme] = useState<Theme>('light')
  useEffect(() => { document.documentElement.setAttribute('data-theme', theme) }, [theme])
  const toggle = () => setTheme(t => (t === 'light' ? 'dark' : 'light'))
  return { theme, toggle }
}

// ─── CSS var tokens ──────────────────────────────────────────────────────────

const v = {
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

// ─── Data ────────────────────────────────────────────────────────────────────

const ROLES = [
  { id: 'student',        label: 'Student',        desc: 'Currently enrolled in full-time education' },
  { id: 'graduate',       label: 'Graduate',       desc: 'Recently completed a degree or qualification' },
  { id: 'professional',   label: 'Professional',   desc: 'Employed and exploring opportunities' },
  { id: 'career_changer', label: 'Career Changer', desc: 'Moving into a new field or industry' },
  { id: 'employer',       label: 'Employer',       desc: 'Posting roles and finding talent' },
  { id: 'partner',        label: 'Partner',        desc: 'Education provider or recruitment partner' },
]

const JOBS = [
  {
    id: 1,
    title: 'UX Research Lead',
    company: 'Monzo',
    location: 'London, UK',
    type: 'Full-time',
    salary: '£65,000 – £80,000',
    sector: 'Technology',
    posted: '2 days ago',
    tags: ['Remote-friendly', 'Senior', 'Research'],
    logo: 'MZ',
    color: '#ff4f64',
    url: 'https://monzo.com/careers',
    desc: "Lead qualitative and quantitative research across Monzo's personal finance products, working closely with product and design teams.",
    saved: false,
    status: null as string | null,
  },
  {
    id: 2,
    title: 'Graduate Software Engineer',
    company: 'Rolls-Royce',
    location: 'Derby, UK',
    type: 'Full-time',
    salary: '£32,000 – £38,000',
    sector: 'Engineering',
    posted: '1 day ago',
    tags: ['Graduate Scheme', 'On-site', 'Engineering'],
    logo: 'RR',
    color: '#5b5ce2',
    url: 'https://careers.rolls-royce.com',
    desc: 'Join the 2025 graduate engineering cohort developing next-generation aerospace propulsion systems.',
    saved: true,
    status: 'Applied' as string | null,
  },
  {
    id: 3,
    title: 'Data Analyst – Policy',
    company: 'NHS England',
    location: 'Leeds, UK',
    type: 'Full-time',
    salary: '£38,000 – £44,000',
    sector: 'Public Sector',
    posted: '4 hours ago',
    tags: ['Hybrid', 'Mid-level', 'Data'],
    logo: 'NHS',
    color: '#0ea5e9',
    url: 'https://www.jobs.nhs.uk',
    desc: 'Analyse population health data to inform national policy decisions within the NHS Transformation Directorate.',
    saved: false,
    status: 'Interview' as string | null,
  },
  {
    id: 4,
    title: 'Product Manager',
    company: 'Deliveroo',
    location: 'London, UK',
    type: 'Full-time',
    salary: '£70,000 – £90,000',
    sector: 'Technology',
    posted: '3 days ago',
    tags: ['Hybrid', 'Senior', 'Product'],
    logo: 'DL',
    color: '#10b981',
    url: 'https://careers.deliveroo.co.uk',
    desc: "Own the roadmap for Deliveroo's restaurant supply-side tools, driving growth across 40+ markets.",
    saved: false,
    status: null as string | null,
  },
  {
    id: 5,
    title: 'Sustainability Consultant',
    company: 'Arup',
    location: 'Edinburgh, UK',
    type: 'Full-time',
    salary: '£42,000 – £55,000',
    sector: 'Consulting',
    posted: '1 week ago',
    tags: ['Hybrid', 'Mid-level', 'Environment'],
    logo: 'AP',
    color: '#f97316',
    url: 'https://www.arup.com/careers',
    desc: 'Deliver net-zero carbon strategies for major infrastructure and built-environment clients across Scotland.',
    saved: true,
    status: 'Saved' as string | null,
  },
  {
    id: 6,
    title: 'Clinical Pharmacist',
    company: 'Boots UK',
    location: 'Manchester, UK',
    type: 'Part-time',
    salary: '£45,000 pro rata',
    sector: 'Healthcare',
    posted: '5 days ago',
    tags: ['On-site', 'Mid-level', 'Healthcare'],
    logo: 'BT',
    color: '#8b5cf6',
    url: 'https://boots.jobs',
    desc: 'Provide expert clinical advice and medication management in a busy community pharmacy setting.',
    saved: false,
    status: null as string | null,
  },
]

const SECTORS = ['All', 'Technology', 'Engineering', 'Public Sector', 'Consulting', 'Healthcare']
const TYPES   = ['All types', 'Full-time', 'Part-time', 'Contract', 'Internship']

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  Applied:   { bg: 'rgba(91,92,226,0.1)',   color: '#5b5ce2' },
  Interview: { bg: 'rgba(245,158,11,0.1)',  color: '#d97706' },
  Saved:     { bg: 'rgba(100,116,139,0.1)', color: '#64748b' },
  Offer:     { bg: 'rgba(16,185,129,0.1)',  color: '#059669' },
}

// ─── Atoms ───────────────────────────────────────────────────────────────────

function Logo() {
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

function ThemeToggle({ theme, toggle }: { theme: Theme; toggle: () => void }) {
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

function Badge({ children, active }: { children: React.ReactNode; active?: boolean }) {
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

function JobCard({ job, onClick, isSelected }: { job: typeof JOBS[0]; onClick: () => void; isSelected: boolean }) {
  const [hovered, setHovered] = useState(false)
  const ss = job.status ? STATUS_STYLE[job.status] : null

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
            {ss && (
              <span style={{
                flexShrink: 0, padding: '3px 10px', borderRadius: v.rBadge,
                background: ss.bg, color: ss.color, fontSize: '0.7rem', fontWeight: 600,
              }}>
                {job.status}
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

function JobDetail({ job, onClose }: { job: typeof JOBS[0]; onClose: () => void }) {
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
        <button style={{
          padding: '11px 0', borderRadius: v.rBtn, fontSize: '0.875rem', fontWeight: 500, cursor: 'pointer',
          background: v.purpleBg, color: v.purple, border: 'none', transition: 'opacity 0.15s',
        }}>
          {job.saved ? '★ Saved to tracker' : '☆ Save to tracker'}
        </button>
      </div>
    </div>
  )
}

// ─── Tracker ─────────────────────────────────────────────────────────────────

function TrackerView() {
  const tracked = JOBS.filter(j => j.status)
  const stages  = ['Saved', 'Applied', 'Interview', 'Offer']

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h2 style={{ fontWeight: 700, fontSize: 'clamp(1.4rem, 3vw, 1.75rem)', color: v.text, margin: 0, letterSpacing: '-0.025em' }}>Application Tracker</h2>
          <p style={{ fontSize: '0.875rem', color: v.dim, margin: '6px 0 0' }}>Track your applications across all stages</p>
        </div>
        <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '6px 14px', borderRadius: 8, background: v.purpleBg, color: v.purple }}>
          {tracked.length} active
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }}>
        {stages.map(stage => {
          const jobs = tracked.filter(j => j.status === stage)
          const ss = STATUS_STYLE[stage] ?? STATUS_STYLE['Saved']
          return (
            <div key={stage}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ fontSize: '0.72rem', fontWeight: 600, color: v.muted, textTransform: 'uppercase', letterSpacing: '0.07em' }}>{stage}</span>
                <span style={{ width: 20, height: 20, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: ss.bg, color: ss.color, fontSize: '0.65rem', fontWeight: 700 }}>
                  {jobs.length}
                </span>
              </div>
              <div style={{ minHeight: 100, borderRadius: v.rCard, padding: 8, background: v.bgSubtle, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {jobs.map(job => (
                  <div key={job.id} style={{ borderRadius: 10, padding: '12px 14px', background: v.surface, boxShadow: v.shadowSm }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <div style={{ width: 22, height: 22, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center', background: job.color + '18', color: job.color, fontSize: '0.5rem', fontWeight: 700 }}>
                        {job.logo}
                      </div>
                      <span style={{ fontSize: '0.78rem', fontWeight: 600, color: v.text, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{job.company}</span>
                    </div>
                    <p style={{ fontSize: '0.75rem', color: v.muted, lineHeight: 1.4, margin: 0 }}>{job.title}</p>
                    <p style={{ fontSize: '0.68rem', color: v.dim, margin: '6px 0 0' }}>{job.posted}</p>
                  </div>
                ))}
                {jobs.length === 0 && (
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 64 }}>
                    <span style={{ color: v.xdim, fontSize: '1.2rem' }}>—</span>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Auth Modal ──────────────────────────────────────────────────────────────

function AuthModal({ onClose }: { onClose: () => void }) {
  const [mode, setMode] = useState<'signin' | 'join'>('join')
  const [selectedRole, setSelectedRole] = useState('')

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      background: 'rgba(10,10,30,0.4)', backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        width: '100%', maxWidth: 440, borderRadius: 20, padding: '32px 32px 28px', position: 'relative',
        background: v.surface, boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
      }}>
        <button onClick={onClose} style={{
          position: 'absolute', top: 16, right: 16, width: 30, height: 30, borderRadius: 8,
          background: v.bgSubtle, border: 'none', color: v.dim, cursor: 'pointer', fontSize: '1.1rem',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>×</button>

        <Logo />

        <div style={{ display: 'flex', padding: 4, background: v.bgSubtle, borderRadius: 12, margin: '22px 0 18px' }}>
          {(['join', 'signin'] as const).map(m => (
            <button key={m} onClick={() => setMode(m)} style={{
              flex: 1, padding: '8px 0', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
              background: mode === m ? v.surface : 'transparent',
              color: mode === m ? v.text : v.dim,
              border: 'none', boxShadow: mode === m ? v.shadowSm : 'none', transition: 'all 0.15s',
            }}>
              {m === 'join' ? 'Create account' : 'Sign in'}
            </button>
          ))}
        </div>

        {mode === 'join' && (
          <div style={{ marginBottom: 18 }}>
            <p style={{ color: v.dim, fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>I am a</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {ROLES.map(role => (
                <button key={role.id} onClick={() => setSelectedRole(role.id)} style={{
                  textAlign: 'left', padding: '11px 13px', borderRadius: 12, cursor: 'pointer',
                  background: selectedRole === role.id ? v.purpleBg : v.bgSubtle,
                  border: `1.5px solid ${selectedRole === role.id ? v.purple : 'transparent'}`,
                  color: selectedRole === role.id ? v.purple : v.muted, transition: 'all 0.15s',
                }}>
                  <p style={{ fontSize: '0.8rem', fontWeight: 700, margin: '0 0 2px' }}>{role.label}</p>
                  <p style={{ fontSize: '0.68rem', lineHeight: 1.4, color: selectedRole === role.id ? v.purple : v.dim, opacity: 0.85, margin: 0 }}>{role.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { type: 'email',    placeholder: 'Email address' },
            { type: 'password', placeholder: mode === 'join' ? 'Create password' : 'Password' },
          ].map(f => (
            <input key={f.type} type={f.type} placeholder={f.placeholder} style={{
              padding: '11px 15px', borderRadius: v.rInput, fontSize: '0.875rem', outline: 'none',
              background: v.bgSubtle, border: `1.5px solid transparent`, color: v.text,
              fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s',
            }}
              onFocus={e => (e.currentTarget.style.borderColor = v.purple)}
              onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
            />
          ))}
          <button style={{
            marginTop: 4, padding: '12px 0', borderRadius: v.rBtn, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
            background: v.purple, color: '#fff', border: 'none', transition: 'opacity 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
          >
            {mode === 'join' ? 'Create my account' : 'Sign in'}
          </button>
        </div>

        {mode === 'join' && (
          <p style={{ fontSize: '0.78rem', textAlign: 'center', color: v.dim, margin: '16px 0 0' }}>
            Already have an account?{' '}
            <button onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: v.purple, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
              Sign in
            </button>
          </p>
        )}
      </div>
    </div>
  )
}

// ─── App ─────────────────────────────────────────────────────────────────────

export default function App() {
  const { theme, toggle } = useTheme()
  const [activeTab,   setActiveTab]   = useState<'listings' | 'tracker'>('listings')
  const [selectedJob, setSelectedJob] = useState<typeof JOBS[0] | null>(JOBS[0])
  const [showAuth,    setShowAuth]    = useState(false)
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

  return (
    <div style={{ background: v.bg, minHeight: '100vh', color: v.text, transition: 'background 0.25s' }}>

      {/* ── Nav ── */}
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

          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
            <ThemeToggle theme={theme} toggle={toggle} />
            <button onClick={() => setShowAuth(true)} style={{ fontSize: '0.82rem', fontWeight: 600, color: v.dim, background: 'none', border: 'none', cursor: 'pointer', padding: '7px 10px' }}>
              Sign in
            </button>
            <button onClick={() => setShowAuth(true)} style={{
              fontSize: '0.82rem', fontWeight: 700, padding: '8px 18px', borderRadius: v.rBtn,
              background: v.purple, color: '#fff', border: 'none', cursor: 'pointer', transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.85'}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
            >
              Join free
            </button>
          </div>
        </div>
      </header>

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

      {/* ── Tracker ── */}
      {activeTab === 'tracker' && (
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 28px 48px' }}>
          <TrackerView />
        </div>
      )}

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

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
