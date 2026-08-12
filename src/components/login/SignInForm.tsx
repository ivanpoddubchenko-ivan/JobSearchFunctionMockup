import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { v } from '../shared'
import { useAuth } from '../../context/AuthContext'
import { PasswordField } from './PasswordField'

export function SignInForm() {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    setError('')
    setSubmitting(true)
    const { error: signInError } = await signIn(email, password)
    setSubmitting(false)
    if (signInError) {
      setError(signInError)
      return
    }
    navigate('/')
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <input
        type="email" placeholder="Email address" required
        value={email} onChange={e => setEmail(e.target.value)}
        style={{
          padding: '11px 15px', borderRadius: v.rInput, fontSize: '0.875rem', outline: 'none',
          background: v.bgSubtle, border: `1.5px solid transparent`, color: v.text,
          fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = v.purple)}
        onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
      />
      <PasswordField value={password} onChange={setPassword} placeholder="Password" required />

      {error && (
        <p style={{ color: '#dc2626', fontSize: '0.75rem', fontWeight: 500, margin: 0 }}>{error}</p>
      )}

      <button type="submit" disabled={submitting} style={{
        marginTop: 4, padding: '12px 0', borderRadius: v.rBtn, fontWeight: 700, fontSize: '0.875rem',
        cursor: submitting ? 'not-allowed' : 'pointer', opacity: submitting ? 0.7 : 1,
        background: v.purple, color: '#fff', border: 'none', transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => !submitting && ((e.currentTarget as HTMLElement).style.opacity = '0.88')}
        onMouseLeave={e => !submitting && ((e.currentTarget as HTMLElement).style.opacity = '1')}
      >
        {submitting ? 'Signing in…' : 'Sign in'}
      </button>
    </form>
  )
}
