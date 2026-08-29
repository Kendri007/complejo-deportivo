import { supabase } from '@/lib/supabase'

export function signInWithPassword(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password })
}

export function signUpWithPassword(email: string, password: string, fullName: string) {
  return supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName } },
  })
}

export function signInWithGoogle(redirectPath = '/app') {
  return supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}${redirectPath}` },
  })
}

export function signOut() {
  return supabase.auth.signOut()
}

export async function fetchUserRole(userId: string) {
  const { data } = await supabase.from('profiles').select('role').eq('id', userId).single()
  return data?.role ?? 'client'
}

export function homeRouteForRole(role: string) {
  if (role === 'super_admin') return '/super-admin'
  if (role === 'complex_admin') return '/admin'
  return '/app'
}
