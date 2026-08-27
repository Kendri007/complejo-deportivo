import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  cancelReservation,
  createReservation,
  getAvailableSlots,
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

export function useCreateReservation() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: createReservation,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['available-slots', variables.courtId] })
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
