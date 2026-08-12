import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { v } from '../shared'
import { useAuth } from '../../context/AuthContext'
import { PasswordField } from './PasswordField'

export function SignInForm() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!email || !password) return
    login(email, 'professional')
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
      <button type="submit" style={{
        marginTop: 4, padding: '12px 0', borderRadius: v.rBtn, fontWeight: 700, fontSize: '0.875rem', cursor: 'pointer',
        background: v.purple, color: '#fff', border: 'none', transition: 'opacity 0.15s',
      }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.opacity = '0.88'}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.opacity = '1'}
      >
        Sign in
      </button>
    </form>
  )
}
