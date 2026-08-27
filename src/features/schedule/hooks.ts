import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createBlackoutDate,
  deleteBlackoutDate,
  listBlackoutDates,
  listOperatingHours,
  replaceOperatingHours,
} from '@/features/schedule/api'
import type { BlackoutDateInsert } from '@/features/schedule/types'

export function useOperatingHours(courtId: string | undefined) {
  return useQuery({
    queryKey: ['operating-hours', courtId],
    queryFn: () => listOperatingHours(courtId!),
    enabled: !!courtId,
  })
}

export function useReplaceOperatingHours(courtId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (rows: { day_of_week: number; open_time: string; close_time: string }[]) =>
      replaceOperatingHours(courtId, rows),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['operating-hours', courtId] }),
  })
}

export function useBlackoutDates(complexId: string | undefined, courtId: string | undefined) {
  return useQuery({
    queryKey: ['blackout-dates', complexId, courtId],
    queryFn: () => listBlackoutDates(complexId!, courtId!),
    enabled: !!complexId && !!courtId,
  })
}

export function useCreateBlackoutDate(complexId: string, courtId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: BlackoutDateInsert) => createBlackoutDate(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['blackout-dates', complexId, courtId] }),
  })
}

export function useDeleteBlackoutDate(complexId: string, courtId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteBlackoutDate(id),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ['blackout-dates', complexId, courtId] }),
  })
}
