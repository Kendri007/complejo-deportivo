import { supabase } from '@/lib/supabase'
import type { ComplexAdmin, ComplexInsert, ComplexUpdate } from '@/features/complexes/types'

export async function listComplexes() {
  const { data, error } = await supabase
    .from('complexes')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return data
}

export async function registerComplex(input: {
  name: string
  address?: string | null
  lat?: number | null
  lng?: number | null
  phone?: string | null
}) {
  const { data, error } = await supabase.rpc('register_complex', {
    complex_name: input.name,
    complex_address: input.address,
    complex_lat: input.lat,
    complex_lng: input.lng,
    complex_phone: input.phone,
  })
  if (error) throw error
  return data
}

export async function listFeaturedComplexes(limit = 6) {
  const { data, error } = await supabase
    .from('complexes')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(limit)
  if (error) throw error
  return data
}

export async function nearbyComplexes(lat: number, lng: number, radiusKm = 25) {
  const { data, error } = await supabase.rpc('nearby_complexes', {
    user_lat: lat,
    user_lng: lng,
    radius_km: radiusKm,
  })
  if (error) throw error
  return data
}

export async function listMyManagedComplexes() {
  // Filtro explícito por user_id: la policy de complex_admins también deja
  // pasar todas las filas a un super_admin (or is_super_admin()), así que
  // sin este filtro un super_admin viendo "mis complejos" recibiría las
  // asignaciones de admin de TODO el mundo, no solo las propias.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('complex_admins')
    .select('complexes(*)')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
  if (error) throw error
  return data.map((row) => row.complexes).filter((c): c is NonNullable<typeof c> => c !== null)
}

export async function getComplex(id: string) {
  const { data, error } = await supabase.from('complexes').select('*').eq('id', id).single()
  if (error) throw error
  return data
}

export async function createComplex(input: ComplexInsert) {
  const { data, error } = await supabase.from('complexes').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateComplex(id: string, patch: ComplexUpdate) {
  const { data, error } = await supabase
    .from('complexes')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteComplex(id: string) {
  const { error } = await supabase.from('complexes').delete().eq('id', id)
  if (error) throw error
}

export async function listComplexAdmins(complexId: string) {
  const { data, error } = await supabase
    .from('complex_admins')
    .select('*, profiles(full_name, avatar_url)')
    .eq('complex_id', complexId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data as ComplexAdmin[]
}

export async function addComplexAdminByEmail(complexId: string, email: string) {
  const { data: userId, error: rpcError } = await supabase.rpc('find_user_id_by_email', {
    target_email: email.trim().toLowerCase(),
  })
  if (rpcError) throw rpcError
  if (!userId) throw new Error('No existe ningún usuario registrado con ese email.')

  const { error } = await supabase
    .from('complex_admins')
    .insert({ complex_id: complexId, user_id: userId })
  if (error) throw error
}

export async function removeComplexAdmin(complexAdminRowId: string) {
  const { error } = await supabase.from('complex_admins').delete().eq('id', complexAdminRowId)
  if (error) throw error
}
