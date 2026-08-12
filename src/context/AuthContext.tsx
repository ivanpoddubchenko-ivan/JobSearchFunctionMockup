import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabaseClient'

export type AuthUser = {
  name: string
  email: string
  role: string
  dob: string
  savedJobIds: number[]
}

type SignUpDetails = {
  fullName: string
  dob: string
  role: string
}

type AuthContextValue = {
  user: AuthUser | null
  loading: boolean
  signUp: (email: string, password: string, details: SignUpDetails) => Promise<{ error: string | null; needsEmailConfirmation: boolean }>
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  logout: () => Promise<void>
  toggleSavedJob: (jobId: number) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function toAuthUser(supabaseUser: { email?: string | null; user_metadata?: Record<string, unknown> } | null | undefined): AuthUser | null {
  if (!supabaseUser?.email) return null
  const meta = supabaseUser.user_metadata ?? {}
  const fullName = typeof meta.full_name === 'string' ? meta.full_name : ''
  const role = typeof meta.role === 'string' ? meta.role : ''
  const dob = typeof meta.date_of_birth === 'string' ? meta.date_of_birth : ''
  const savedJobIds = Array.isArray(meta.saved_job_ids)
    ? meta.saved_job_ids.filter((id): id is number => typeof id === 'number')
    : []
  return {
    name: fullName || supabaseUser.email.split('@')[0] || 'You',
    email: supabaseUser.email,
    role,
    dob,
    savedJobIds,
  }
}

function errorMessage(error: AuthError | null): string | null {
  return error ? error.message : null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(toAuthUser(data.session?.user))
      setLoading(false)
    })

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(toAuthUser(session?.user))
      setLoading(false)
    })

    return () => subscription.subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, details: SignUpDetails) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: details.fullName, date_of_birth: details.dob, role: details.role },
      },
    })
    return { error: errorMessage(error), needsEmailConfirmation: !error && !data.session }
  }

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    return { error: errorMessage(error) }
  }

  const logout = async () => {
    await supabase.auth.signOut()
  }

  const toggleSavedJob = async (jobId: number) => {
    if (!user) return
    const nextIds = user.savedJobIds.includes(jobId)
      ? user.savedJobIds.filter(id => id !== jobId)
      : [...user.savedJobIds, jobId]
    await supabase.auth.updateUser({ data: { saved_job_ids: nextIds } })
  }

  return (
    <AuthContext.Provider value={{ user, loading, signUp, signIn, logout, toggleSavedJob }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
