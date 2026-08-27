import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCourt,
  deleteCourt,
  getCourt,
  listActiveCourtsForComplex,
  listAllCourtsByComplex,
  listCourtsByComplexAndSport,
  updateCourt,
} from '@/features/courts/api'
import type { CourtInsert, CourtUpdate } from '@/features/courts/types'

export function useCourts(complexId: string | undefined, sportId: string | undefined) {
  return useQuery({
    queryKey: ['courts', complexId, sportId],
    queryFn: () => listCourtsByComplexAndSport(complexId!, sportId!),
    enabled: !!complexId && !!sportId,
  })
}

export function useActiveCourts(complexId: string | undefined) {
  return useQuery({
    queryKey: ['courts', complexId, 'active'],
    queryFn: () => listActiveCourtsForComplex(complexId!),
    enabled: !!complexId,
  })
}

export function useCourt(courtId: string | undefined) {
  return useQuery({
    queryKey: ['court', courtId],
    queryFn: () => getCourt(courtId!),
    enabled: !!courtId,
  })
}

export function useAllCourts(complexId: string | undefined) {
  return useQuery({
    queryKey: ['courts', complexId, 'all'],
    queryFn: () => listAllCourtsByComplex(complexId!),
    enabled: !!complexId,
  })
}

export function useCreateCourt(complexId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CourtInsert) => createCourt(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', complexId] }),
  })
}

export function useUpdateCourt(complexId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CourtUpdate }) => updateCourt(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', complexId] }),
  })
}

export function useDeleteCourt(complexId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCourt(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', complexId] }),
  })
}
