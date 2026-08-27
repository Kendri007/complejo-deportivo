import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  createCourt,
  deleteCourt,
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

export function useCreateCourt(complexId: string, sportId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: CourtInsert) => createCourt(input),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', complexId, sportId] }),
  })
}

export function useUpdateCourt(complexId: string, sportId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: CourtUpdate }) => updateCourt(id, patch),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', complexId, sportId] }),
  })
}

export function useDeleteCourt(complexId: string, sportId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => deleteCourt(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['courts', complexId, sportId] }),
  })
}
