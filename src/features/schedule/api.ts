import { supabase } from '@/lib/supabase'
import type { BlackoutDateInsert } from '@/features/schedule/types'

export async function listOperatingHours(courtId: string) {
  const { data, error } = await supabase
    .from('operating_hours')
    .select('*')
    .eq('court_id', courtId)
    .order('day_of_week', { ascending: true })
  if (error) throw error
  return data
}

// Reemplaza todo el horario de la cancha por el set nuevo. Para un panel de
// admin de uso infrecuente, borrar+insertar es más simple y confiable que
// diffear fila por fila.
export async function replaceOperatingHours(
  courtId: string,
  rows: { day_of_week: number; open_time: string; close_time: string }[],
) {
  const { error: deleteError } = await supabase
    .from('operating_hours')
    .delete()
    .eq('court_id', courtId)
  if (deleteError) throw deleteError

  if (rows.length === 0) return

  const { error: insertError } = await supabase
    .from('operating_hours')
    .insert(rows.map((row) => ({ court_id: courtId, ...row })))
  if (insertError) throw insertError
}

export async function listBlackoutDates(complexId: string, courtId: string) {
  const { data, error } = await supabase
    .from('blackout_dates')
    .select('*')
    .eq('complex_id', complexId)
    .or(`court_id.eq.${courtId},court_id.is.null`)
    .order('date', { ascending: true })
  if (error) throw error
  return data
}

export async function createBlackoutDate(input: BlackoutDateInsert) {
  const { data, error } = await supabase.from('blackout_dates').insert(input).select().single()
  if (error) throw error
  return data
}

export async function deleteBlackoutDate(id: string) {
  const { error } = await supabase.from('blackout_dates').delete().eq('id', id)
  if (error) throw error
}
