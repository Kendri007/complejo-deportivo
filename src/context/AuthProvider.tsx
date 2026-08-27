import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session, User } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'

export type Role = 'client' | 'complex_admin' | 'super_admin'

export type Profile = {
  id: string
  full_name: string | null
  avatar_url: string | null
  phone: string | null
  role: Role
}

type AuthContextValue = {
  session: Session | null
  user: User | null
  profile: Profile | null
  role: Role | null
  loading: boolean
  refreshProfile: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

async function fetchProfile(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, phone, role')
    .eq('id', userId)
    .single()
  return (data as Profile | null) ?? null
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  // Arranca en loading hasta que se resuelva la sesion inicial. Cada vez que
  // la sesion cambia (login/signup/logout) vuelve a ponerse en loading hasta
  // que el profile del nuevo usuario termine de cargar: si no, un guard que
  // lee `role` justo en ese instante ve null y rebota al usuario al home,
  // aunque tenga sesion valida.
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true

    async function syncSession(newSession: Session | null) {
      if (!active) return
      setSession(newSession)
      if (newSession?.user) {
        setLoading(true)
        const p = await fetchProfile(newSession.user.id)
        if (!active) return
        setProfile(p)
        setLoading(false)
      } else {
        setProfile(null)
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => syncSession(session))

    const { data: subscription } = supabase.auth.onAuthStateChange((_event, session) => {
      syncSession(session)
    })

    return () => {
      active = false
      subscription.subscription.unsubscribe()
    }
  }, [])

  async function refreshProfile() {
    const {
      data: { session: freshSession },
    } = await supabase.auth.getSession()
    setSession(freshSession)
    if (!freshSession?.user) return
    const p = await fetchProfile(freshSession.user.id)
    setProfile(p)
  }

  const value: AuthContextValue = {
    session,
    user: session?.user ?? null,
    profile,
    role: profile?.role ?? null,
    loading,
    refreshProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>')
  return ctx
}
