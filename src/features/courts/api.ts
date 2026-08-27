import { supabase } from '@/lib/supabase'
import type { CourtInsert, CourtUpdate } from '@/features/courts/types'

export async function listCourtsByComplexAndSport(complexId: string, sportId: string) {
  const { data, error } = await supabase
    .from('courts')
    .select('*')
    .eq('complex_id', complexId)
    .eq('sport_id', sportId)
    .order('created_at', { ascending: true })
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
