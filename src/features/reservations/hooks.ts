import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelReservation,
  createReservation,
  getAvailableSlots,
  getWeekAvailability,
  listComplexReservations,
  listMyReservations,
} from '@/features/reservations/api'

export function useComplexReservations(complexId: string | undefined) {
  return useQuery({
    queryKey: ['complex-reservations', complexId],
    queryFn: () => listComplexReservations(complexId!),
    enabled: !!complexId,
  })
}

export function useMyReservations() {
  return useQuery({ queryKey: ['my-reservations'], queryFn: listMyReservations })
}

export function useAvailableSlots(courtId: string | undefined, date: string | undefined) {
  return useQuery({
    queryKey: ['available-slots', courtId, date],
    queryFn: () => getAvailableSlots(courtId!, date!),
    enabled: !!courtId && !!date,
  })
}

// Calendario semanal "en vivo": trae los horarios ocupados de una cancha
// para una ventana de 7 días. Refresca solo (cada 5s mientras la pestaña
// está activa) para que se vea al instante cuando alguien más reserva o
// cancela, sin que el usuario tenga que recargar la página.
//
// Nota técnica: no usamos Supabase Realtime (postgres_changes) acá a
// propósito. Realtime respeta las RLS policies de `reservations`, que no
// tienen SELECT público (para no exponer quién reservó) — así que un
// tercero mirando el calendario nunca recibiría el evento, solo el dueño
// de la reserva o el admin del complejo. Un broadcast público real
// requeriría un trigger de Postgres que emita un mensaje sin datos
// sensibles (realtime.send), que queda como mejora futura si el polling
// de 5s no alcanza.
export function useWeekAvailability(courtId: string | undefined, startDate: string | undefined) {
  return useQuery({
    queryKey: ['week-availability', courtId, startDate],
    queryFn: () => getWeekAvailability(courtId!, startDate!),
    enabled: !!courtId && !!startDate,
    staleTime: 0,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  })
}

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReservation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['available-slots', variables.courtId] })
      queryClient.invalidateQueries({ queryKey: ['week-availability', variables.courtId] })
      queryClient.invalidateQueries({ queryKey: ['my-reservations'] })
    },
  })
}

export function useCancelReservationAsAdmin(complexId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) => cancelReservation(reservationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['complex-reservations', complexId] }),
  })
}

export function useCancelMyReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) => cancelReservation(reservationId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['my-reservations'] }),
  })
}
