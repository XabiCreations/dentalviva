import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types/user'
import { getProfile } from './authService'

interface AuthState {
  user: User | null
  session: Session | null
  profile: Profile | null
  loading: boolean
}

interface AuthContextValue extends AuthState {
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    session: null,
    profile: null,
    loading: true,
  })

  const loadProfile = async (user: User) => {
    try {
      const profile = await getProfile(user.id)
      // Sync profiles.email from auth only when auth has a real email (not the DNI-based fake one)
      const authEmailIsFake = user.email?.endsWith('@patients.dentaviva.es') ?? true
      if (!authEmailIsFake && user.email && profile.email !== user.email) {
        await supabase.from('profiles').update({ email: user.email }).eq('id', user.id)
        profile.email = user.email
      }
      setState(prev => ({ ...prev, profile }))
    } catch {
      setState(prev => ({ ...prev, profile: null }))
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        loading: false,
      }))
      if (session?.user) loadProfile(session.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setState(prev => ({
        ...prev,
        session,
        user: session?.user ?? null,
        profile: session ? prev.profile : null,
        loading: false,
      }))
      if (session?.user) loadProfile(session.user)
    })

    return () => subscription.unsubscribe()
  }, [])

  const refreshProfile = async () => {
    if (state.user) await loadProfile(state.user)
  }

  return (
    <AuthContext.Provider value={{ ...state, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}
