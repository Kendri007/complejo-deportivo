import type { Database } from '@/types/database.types'

export type PlatformSettings = Database['public']['Tables']['platform_settings']['Row']
export type SubscriptionPayment = Database['public']['Tables']['subscription_payments']['Row']
