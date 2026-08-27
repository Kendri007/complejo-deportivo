import { useQuery } from '@tanstack/react-query'
import { listAllUsers } from '@/features/users/api'

export function useAllUsers() {
  return useQuery({ queryKey: ['all-users'], queryFn: listAllUsers })
}
