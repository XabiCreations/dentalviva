import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { DentistRow } from '../lib/supabase'

interface AdminAuthState {
  user: User | null
  dentist: DentistRow | null
  loading: boolean
}

interface AdminAuthContextValue extends AdminAuthState {
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextValue | null>(null)

async function fetchDentistForUser(userId: string): Promise<DentistRow | null> {
  const { data } = await supabase
    .from('dentists')
    .select('id, user_id, name, email, specialty, avatar_url, created_at')
    .eq('user_id', userId)
    .single()
  return (data as DentistRow) ?? null
}

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AdminAuthState>({ user: null, dentist: null, loading: true })

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      const user = session?.user ?? null
      const dentist = user ? await fetchDentistForUser(user.id) : null
      setState({ user, dentist, loading: false })
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const user = session?.user ?? null
      const dentist = user ? await fetchDentistForUser(user.id) : null
      setState({ user, dentist, loading: false })
    })

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    await supabase.auth.signOut()
    setState({ user: null, dentist: null, loading: false })
  }

  return (
    <AdminAuthContext.Provider value={{ ...state, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth(): AdminAuthContextValue {
  const ctx = useContext(AdminAuthContext)
  if (!ctx) throw new Error('useAdminAuth must be used inside AdminAuthProvider')
  return ctx
}
