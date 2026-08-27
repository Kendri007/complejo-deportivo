import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { cancelReservationAsAdmin, listComplexReservations } from '@/features/reservations/api'

export function useComplexReservations(complexId: string | undefined) {
  return useQuery({
    queryKey: ['complex-reservations', complexId],
    queryFn: () => listComplexReservations(complexId!),
    enabled: !!complexId,
  })
}

export function useCancelReservationAsAdmin(complexId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (reservationId: string) => cancelReservationAsAdmin(reservationId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['complex-reservations', complexId] }),
  })
}
