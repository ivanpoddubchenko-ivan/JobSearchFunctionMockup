import { useState, useMemo, type CSSProperties, type FocusEvent } from 'react'
import { v } from '../shared'

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

const selectStyle: CSSProperties = {
  flex: 1, width: '100%', padding: '11px 30px 11px 12px', borderRadius: v.rInput, fontSize: '0.875rem', outline: 'none',
  background: v.bgSubtle, border: '1.5px solid transparent', color: v.text,
  fontFamily: 'Inter, sans-serif', transition: 'border-color 0.15s',
  appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
}

function ChevronIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 11 11" fill="none" style={{
      position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: v.dim,
    }}>
      <path d="M2.5 4L5.5 7L8.5 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month, 0).getDate()
}

type Part = number | ''

export function DateOfBirthField({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const initial = value ? value.split('-').map(Number) : []
  const [year, setYear] = useState<Part>(initial[0] || '')
  const [month, setMonth] = useState<Part>(initial[1] || '')
  const [day, setDay] = useState<Part>(initial[2] || '')

  const currentYear = new Date().getFullYear()
  const years = useMemo(() => Array.from({ length: 100 }, (_, i) => currentYear - i), [currentYear])
  const dayCount = year && month ? daysInMonth(year, month) : 31
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => i + 1), [dayCount])

  const commit = (y: Part, m: Part, d: Part) => {
    if (y && m && d) {
      onChange(`${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`)
    } else {
      onChange('')
    }
  }

  const handleDay = (d: Part) => { setDay(d); commit(year, month, d) }
  const handleMonth = (m: Part) => {
    let d = day
    if (d && m && Number(d) > daysInMonth(year || currentYear, m)) {
      d = daysInMonth(year || currentYear, m)
      setDay(d)
    }
    setMonth(m); commit(year, m, d)
  }
  const handleYear = (y: Part) => {
    let d = day
    if (d && y && month && Number(d) > daysInMonth(y, month)) {
      d = daysInMonth(y, month)
      setDay(d)
    }
    setYear(y); commit(y, month, d)
  }

  const focus = (e: FocusEvent<HTMLSelectElement>) => (e.currentTarget.style.borderColor = v.purple)
  const blur = (e: FocusEvent<HTMLSelectElement>) => (e.currentTarget.style.borderColor = 'transparent')

  return (
    <div style={{ display: 'flex', gap: 8 }} lang="en">
      <div style={{ position: 'relative', flex: 1 }}>
        <select
          value={day} required aria-label="Day"
          onChange={e => handleDay(Number(e.target.value))}
          style={selectStyle} onFocus={focus} onBlur={blur}
        >
          <option value="" disabled>Day</option>
          {days.map(dd => <option key={dd} value={dd}>{dd}</option>)}
        </select>
        <ChevronIcon />
      </div>
      <div style={{ position: 'relative', flex: 1.6 }}>
        <select
          value={month} required aria-label="Month"
          onChange={e => handleMonth(Number(e.target.value))}
          style={selectStyle} onFocus={focus} onBlur={blur}
        >
          <option value="" disabled>Month</option>
          {MONTHS.map((name, i) => <option key={name} value={i + 1}>{name}</option>)}
        </select>
        <ChevronIcon />
      </div>
      <div style={{ position: 'relative', flex: 1 }}>
        <select
          value={year} required aria-label="Year"
          onChange={e => handleYear(Number(e.target.value))}
          style={selectStyle} onFocus={focus} onBlur={blur}
        >
          <option value="" disabled>Year</option>
          {years.map(yy => <option key={yy} value={yy}>{yy}</option>)}
        </select>
        <ChevronIcon />
      </div>
    </div>
  )
}
