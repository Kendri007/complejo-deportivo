import type { Database } from '@/types/database.types'

export type Court = Database['public']['Tables']['courts']['Row']
export type CourtInsert = Database['public']['Tables']['courts']['Insert']
export type CourtUpdate = Database['public']['Tables']['courts']['Update']
