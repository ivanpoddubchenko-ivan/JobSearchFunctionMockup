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
