import { useQuery } from '@tanstack/react-query'
import { getSportByKey, listSports } from '@/features/sports/api'

export function useSports() {
  return useQuery({ queryKey: ['sports'], queryFn: listSports })
}

export function useSportByKey(key: string) {
  return useQuery({ queryKey: ['sports', key], queryFn: () => getSportByKey(key) })
}
