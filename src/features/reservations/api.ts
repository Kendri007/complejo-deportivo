import { supabase } from '@/lib/supabase'
import type { PaymentMethod } from '@/types/database.types'

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

export async function listMyReservations() {
  // No basta con confiar en RLS acá: las policies de reservations también
  // le dan visibilidad a un complex_admin/super_admin sobre reservas ajenas
  // (para el panel de admin), así que sin este filtro explícito "Mis
  // reservas" les mostraba (y dejaba cancelar) reservas de otros clientes.
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('reservations')
    .select('*, courts(name, complexes(name), court_sports(sports(label)))')
    .eq('user_id', user.id)
    .eq('status', 'confirmed')
    .order('date', { ascending: true })
    .order('start_time', { ascending: true })
  if (error) throw error
  return data
}

export async function getWeekAvailability(courtId: string, startDate: string) {
  const { data, error } = await supabase.rpc('get_week_availability', {
    target_court_id: courtId,
    start_date: startDate,
  })
  if (error) throw error
  return data
}

export async function getAvailableSlots(courtId: string, date: string) {
  const { data, error } = await supabase.rpc('get_available_slots', {
    target_court_id: courtId,
    target_date: date,
  })
  if (error) throw error
  return data.map((row) => row.start_time)
}

export async function createReservation(input: {
  courtId: string
  date: string
  startTime: string
  type: 'private' | 'match'
  matchTargetPlayers?: number
  paymentMethod?: PaymentMethod
  paymentReference?: string
}) {
  const { data, error } = await supabase.rpc('create_reservation', {
    target_court_id: input.courtId,
    target_date: input.date,
    target_start_time: input.startTime,
    reservation_type: input.type,
    match_target_players: input.matchTargetPlayers ?? null,
    payment_method: input.paymentMethod ?? null,
    payment_reference: input.paymentReference || null,
  })
  if (error) throw error
  return data
}

export async function cancelReservation(reservationId: string) {
  const { error } = await supabase.rpc('cancel_reservation', {
    target_reservation_id: reservationId,
  })
  if (error) throw error
}

export async function getMatchIdForReservation(reservationId: string) {
  const { data, error } = await supabase
    .from('matches')
    .select('id')
    .eq('reservation_id', reservationId)
    .single()
  if (error) throw error
  return data.id
}
