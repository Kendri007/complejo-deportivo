import { useMutation } from '@tanstack/react-query'
import { useAuth } from '@/context/AuthProvider'
import { updateMyProfile } from '@/features/profile/api'

export function useUpdateMyProfile() {
  const { user, refreshProfile } = useAuth()
  return useMutation({
    mutationFn: (patch: { full_name?: string; phone?: string | null }) =>
      updateMyProfile(user!.id, patch),
    onSuccess: () => refreshProfile(),
  })
}
