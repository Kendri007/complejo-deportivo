import { supabase } from '@/lib/supabase'
import type { CourtInsert, CourtUpdate } from '@/features/courts/types'

export async function listCourtsByComplexAndSport(complexId: string, sportId: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*, court_sports!inner(sport_id, sports(id, key, label))')
    .eq('complex_id', complexId)
    .eq('court_sports.sport_id', sportId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function listAllCourtsByComplex(complexId: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*, court_sports(sport_id, sports(id, key, label))')
    .eq('complex_id', complexId)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function listActiveCourtsForComplex(complexId: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*, court_sports(sport_id, sports(id, key, label))')
    .eq('complex_id', complexId)
    .eq('is_active', true)
    .order('created_at', { ascending: true })
  if (error) throw error
  return data
}

export async function getCourt(id: string) {
  const { data, error } = await supabase
    .from('courts')
    .select(
      '*, court_sports(sport_id, sports(id, key, label)), complexes(name, payment_pago_movil, payment_binance, payment_zinli, payment_zelle)',
    )
    .eq('id', id)
    .single()
  if (error) throw error
  return data
}

export async function createCourt(input: CourtInsert) {
  const { data, error } = await supabase.from('courts').insert(input).select().single()
  if (error) throw error
  return data
}

export async function updateCourt(id: string, patch: CourtUpdate) {
  const { data, error } = await supabase
    .from('courts')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function deleteCourt(id: string) {
  const { error } = await supabase.from('courts').delete().eq('id', id)
  if (error) throw error
}

export async function addSportToCourt(courtId: string, sportId: string) {
  const { error } = await supabase
    .from('court_sports')
    .insert({ court_id: courtId, sport_id: sportId })
  if (error) throw error
}

// No deja sacar el deporte "principal" (courts.sport_id): esa cancha
// siempre necesita al menos ese, sacar todos los tags la dejaría sin
// ningún deporte asociado. Solo se pueden quitar los deportes extra.
export async function removeSportFromCourt(courtId: string, sportId: string, primarySportId: string) {
  if (sportId === primarySportId) {
    throw new Error('No podés quitar el deporte principal de la cancha.')
  }
  const { error } = await supabase
    .from('court_sports')
    .delete()
    .eq('court_id', courtId)
    .eq('sport_id', sportId)
  if (error) throw error
}
