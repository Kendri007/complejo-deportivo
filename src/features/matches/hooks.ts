import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getMatchDetails,
  joinMatch,
  leaveMatch,
  listMatchParticipants,
  listOpenMatches,
} from '@/features/matches/api'

export function useOpenMatches(sportKey?: string) {
  return useQuery({
    queryKey: ['open-matches', sportKey],
    queryFn: () => listOpenMatches(sportKey),
  })
}

export function useMatchDetails(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match', matchId],
    queryFn: () => getMatchDetails(matchId!),
    enabled: !!matchId,
  })
}

export function useMatchParticipants(matchId: string | undefined) {
  return useQuery({
    queryKey: ['match-participants', matchId],
    queryFn: () => listMatchParticipants(matchId!),
    enabled: !!matchId,
  })
}

export function useJoinMatch(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => joinMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] })
      queryClient.invalidateQueries({ queryKey: ['match-participants', matchId] })
      queryClient.invalidateQueries({ queryKey: ['open-matches'] })
    },
  })
}

export function useLeaveMatch(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => leaveMatch(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['match', matchId] })
      queryClient.invalidateQueries({ queryKey: ['match-participants', matchId] })
      queryClient.invalidateQueries({ queryKey: ['open-matches'] })
    },
  })
}
