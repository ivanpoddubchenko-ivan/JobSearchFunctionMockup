import { useState } from 'react'
import { v } from '../shared'

function EyeIcon({ off }: { off: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
      <path
        d="M1.5 8S3.8 3 8 3s6.5 5 6.5 5-2.3 5-6.5 5-6.5-5-6.5-5Z"
        stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"
      />
      <circle cx="8" cy="8" r="2" stroke="currentColor" strokeWidth="1.3"/>
      {off && <path d="M2.5 13.5 13.5 2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>}
    </svg>
  )
}

export function PasswordField({
  value, onChange, placeholder, required,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
  required?: boolean
}) {
  const [visible, setVisible] = useState(false)

  return (
    <div style={{ position: 'relative' }}>
      <input
        type={visible ? 'text' : 'password'}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          width: '100%', padding: '11px 42px 11px 15px', borderRadius: v.rInput, fontSize: '0.875rem', outline: 'none',
          background: v.bgSubtle, border: `1.5px solid transparent`, color: v.text,
          fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s', boxSizing: 'border-box',
        }}
        onFocus={e => (e.currentTarget.style.borderColor = v.purple)}
        onBlur={e => (e.currentTarget.style.borderColor = 'transparent')}
      />
      <button
        type="button"
        onClick={() => setVisible(s => !s)}
        aria-label={visible ? 'Hide password' : 'Show password'}
        style={{
          position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', cursor: 'pointer', color: v.dim,
          display: 'flex', alignItems: 'center', padding: 0,
        }}
      >
        <EyeIcon off={visible} />
      </button>
    </div>
  )
}
