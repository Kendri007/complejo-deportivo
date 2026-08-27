import { useQuery } from '@tanstack/react-query'
import { getSportByKey, listSports } from '@/features/sports/api'
import { sortSports } from '@/features/sports/constants'

export function useSports() {
  return useQuery({
    queryKey: ['sports'],
    queryFn: listSports,
    select: sortSports,
  })
}

export function useSportByKey(key: string) {
  return useQuery({ queryKey: ['sports', key], queryFn: () => getSportByKey(key) })
}
