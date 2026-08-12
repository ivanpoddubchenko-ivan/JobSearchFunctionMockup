import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { JOBS } from '../data/jobs'
import { v, useTheme, Logo, UserMenu, JobDetail } from '../components/shared'
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

export default function Profile() {
  useTheme()
  const navigate = useNavigate()
  const [tab, setTab] = useState<Tab>('general')

  return (
    <div style={{ background: v.bg, minHeight: '100vh', color: v.text }}>
      <header style={{ background: v.surface, boxShadow: `0 1px 0 ${v.border}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 28px', height: 60, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
          <button onClick={() => navigate('/')} style={{ cursor: 'pointer', display: 'flex', background: 'none', border: 'none', padding: 0 }}>
            <Logo />
          </button>
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
          {tab === 'saved' && <SavedTab />}
          {tab === 'settings' && <SettingsTab />}
        </div>
      </div>
    </div>
  )
}
