import { supabase } from '@/lib/supabase'

export async function listComplexReservations(complexId: string) {
  const { data: reservations, error } = await supabase
    .from('reservations')
    .select('*, courts!inner(name, complex_id)')
    .eq('courts.complex_id', complexId)
    .eq('status', 'confirmed')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
  if (error) throw error

  const userIds = [...new Set(reservations.map((r) => r.user_id))]
  let namesById: Record<string, string | null> = {}
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('public_profiles')
      .select('id, full_name')
      .in('id', userIds)
    if (profilesError) throw profilesError
    namesById = Object.fromEntries(profiles.map((p) => [p.id, p.full_name]))
  }

  return reservations.map((r) => ({ ...r, client_name: namesById[r.user_id] ?? null }))
}

export async function cancelReservationAsAdmin(reservationId: string) {
  const { error } = await supabase.rpc('cancel_reservation', {
    target_reservation_id: reservationId,
  })
  if (error) throw error
}
