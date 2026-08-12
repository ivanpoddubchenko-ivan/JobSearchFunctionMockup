import { useState } from 'react'
import { v } from '../components/shared'
import { ImagePanel } from '../components/login/ImagePanel'
import { SignInForm } from '../components/login/SignInForm'
import { RegisterWizard } from '../components/login/RegisterWizard'

export default function LoginPage() {
  const [mode, setMode] = useState<'signin' | 'join'>('join')

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: v.bg }}>
      <ImagePanel />

      <div style={{
        flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16,
      }}>
        <div style={{ width: '100%', maxWidth: 400 }}>
          <h1 style={{
            fontSize: '1.6rem', fontWeight: 800, color: v.text, margin: '0 0 8px', letterSpacing: '-0.02em',
          }}>
            Welcome to the BHMP
          </h1>
          <p style={{ fontSize: '0.85rem', color: v.dim, lineHeight: 1.5, margin: '0 0 22px' }}>
            Create an account or sign in to connect with the BHMP Network community.
          </p>

          <div style={{ display: 'flex', padding: 4, background: v.bgSubtle, borderRadius: 12, margin: '0 0 22px' }}>
            {(['join', 'signin'] as const).map(m => (
              <button key={m} type="button" onClick={() => setMode(m)} style={{
                flex: 1, padding: '8px 0', borderRadius: 9, fontSize: '0.82rem', fontWeight: 600, cursor: 'pointer',
                background: mode === m ? v.surface : 'transparent',
                color: mode === m ? v.text : v.dim,
                border: 'none', boxShadow: mode === m ? v.shadowSm : 'none', transition: 'all 0.15s',
              }}>
                {m === 'join' ? 'Create account' : 'Sign in'}
              </button>
            ))}
          </div>

          {mode === 'join' ? <RegisterWizard /> : <SignInForm />}

          {mode === 'join' && (
            <p style={{ fontSize: '0.78rem', textAlign: 'center', color: v.dim, margin: '16px 0 0' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => setMode('signin')} style={{ background: 'none', border: 'none', color: v.purple, cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, padding: 0 }}>
                Sign in
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
