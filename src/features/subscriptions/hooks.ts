import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getPlatformSettings,
  listSubscriptionPayments,
  recordSubscriptionPayment,
  updateMonthlyPrice,
} from '@/features/subscriptions/api'

export function usePlatformSettings() {
  return useQuery({ queryKey: ['platform-settings'], queryFn: getPlatformSettings })
}

export function useUpdateMonthlyPrice() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (price: number) => updateMonthlyPrice(price),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['platform-settings'] }),
  })
}

export function useSubscriptionPayments(complexId: string | undefined) {
  return useQuery({
    queryKey: ['subscription-payments', complexId],
    queryFn: () => listSubscriptionPayments(complexId!),
    enabled: !!complexId,
  })
}

export function useRecordSubscriptionPayment(complexId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (input: { amount: number; months: number }) =>
      recordSubscriptionPayment({ complexId, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subscription-payments', complexId] })
      queryClient.invalidateQueries({ queryKey: ['complexes', complexId] })
      queryClient.invalidateQueries({ queryKey: ['complexes'] })
    },
  })
}
