import { useState, type FormEvent, type CSSProperties, type FocusEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { ROLES } from '../../data/jobs'
import { v } from '../shared'
import { useAuth } from '../../context/AuthContext'
import { PasswordField } from './PasswordField'
import { DateOfBirthField } from './DateOfBirthField'

const inputStyle: CSSProperties = {
  width: '100%', padding: '11px 15px', borderRadius: v.rInput, fontSize: '0.875rem', outline: 'none',
  background: v.bgSubtle, border: '1.5px solid transparent', color: v.text,
  fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s', boxSizing: 'border-box',
}

function focusPurple(e: FocusEvent<HTMLInputElement>) { e.currentTarget.style.borderColor = v.purple }
function blurTransparent(e: FocusEvent<HTMLInputElement>) { e.currentTarget.style.borderColor = 'transparent' }

const DISABLED_ROLES = new Set(['employer', 'partner'])

function StepIndicator({ step }: { step: 1 | 2 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
      {[1, 2].map(n => (
        <div key={n} style={{
          flex: 1, height: 4, borderRadius: 2,
          background: n <= step ? v.purple : v.bgSubtle, transition: 'background 0.2s',
        }} />
      ))}
      <span style={{ fontSize: '0.72rem', fontWeight: 600, color: v.dim, whiteSpace: 'nowrap' }}>
        Step {step} of 2
      </span>
    </div>
  )
}

export function RegisterWizard() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const [step, setStep] = useState<1 | 2>(1)
  const [selectedRole, setSelectedRole] = useState('')
  const [fullName, setFullName] = useState('')
  const [dob, setDob] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!fullName || !dob || !email || !password || !confirmPassword) return
    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    setError('')
    login(email, selectedRole, fullName)
    navigate('/')
  }

  if (step === 1) {
    return (
      <div>
        <StepIndicator step={1} />
        <p style={{ color: v.dim, fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 10px' }}>I am a</p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
          {ROLES.map(role => {
            const disabledRole = DISABLED_ROLES.has(role.id)
            const selected = selectedRole === role.id
            return (
              <button
                key={role.id}
                type="button"
                disabled={disabledRole}
                onClick={() => setSelectedRole(role.id)}
                style={{
                  position: 'relative', textAlign: 'left', padding: '16px 18px', borderRadius: 12,
                  cursor: disabledRole ? 'not-allowed' : 'pointer',
                  background: disabledRole ? v.bgSubtle : selected ? v.purpleBg : v.surface,
                  boxShadow: disabledRole || selected ? 'none' : v.shadowSm,
                  border: `1.5px solid ${selected ? v.purple : 'transparent'}`,
                  opacity: disabledRole ? 0.6 : 1, transition: 'all 0.15s',
                }}
              >
                <p style={{ fontSize: '0.85rem', fontWeight: 700, margin: '0 0 3px', color: disabledRole ? v.dim : selected ? v.purple : v.text }}>
                  {role.label}
                </p>
                <p style={{ fontSize: '0.72rem', lineHeight: 1.45, margin: 0, color: disabledRole ? v.dim : selected ? v.purple : v.muted }}>
                  {role.desc}
                </p>
                {disabledRole && (
                  <span style={{
                    position: 'absolute', top: 10, right: 10, fontSize: '0.6rem', fontWeight: 700,
                    textTransform: 'uppercase', letterSpacing: '0.04em', color: v.dim,
                    background: v.surface, padding: '2px 7px', borderRadius: 999,
                  }}>
                    Soon
                  </span>
                )}
              </button>
            )
          })}
        </div>
        <button
          type="button"
          disabled={!selectedRole}
          onClick={() => setStep(2)}
          style={{
            width: '100%', padding: '12px 0', borderRadius: v.rBtn, fontWeight: 700, fontSize: '0.875rem',
            background: selectedRole ? v.purple : v.bgSubtle, color: selectedRole ? '#fff' : v.dim,
            border: 'none', cursor: selectedRole ? 'pointer' : 'not-allowed', transition: 'opacity 0.15s',
          }}
        >
          Next
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <StepIndicator step={2} />
      <button type="button" onClick={() => setStep(1)} style={{
        display: 'flex', alignItems: 'center', gap: 4, background: 'none', border: 'none', cursor: 'pointer',
        color: v.dim, fontSize: '0.78rem', fontWeight: 600, padding: 0, marginBottom: 16,
      }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M7.5 2.5 3.5 6l4 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
        Back
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <input type="text" placeholder="Full name" required value={fullName}
          onChange={e => setFullName(e.target.value)} style={inputStyle} onFocus={focusPurple} onBlur={blurTransparent} />
        <DateOfBirthField value={dob} onChange={setDob} />
        <input type="email" placeholder="Email address" required value={email}
          onChange={e => setEmail(e.target.value)} style={inputStyle} onFocus={focusPurple} onBlur={blurTransparent} />
        <PasswordField value={password} onChange={setPassword} placeholder="Create password" required />
        <PasswordField value={confirmPassword} onChange={setConfirmPassword} placeholder="Confirm password" required />

        {error && (
          <p style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>{error}</p>
        )}

        <button type="submit" style={{
          marginTop: 4, padding: '12px 0', borderRadius: v.rBtn, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
          background: v.purple, color: '#fff', border: 'none', transition: 'opacity 0.15s',
        }}
          onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
          onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
        >
          Create my account
        </button>
      </div>
    </form>
  )
}
