import type { Database } from '@/types/database.types'

export type OperatingHour = Database['public']['Tables']['operating_hours']['Row']
export type BlackoutDate = Database['public']['Tables']['blackout_dates']['Row']
export type BlackoutDateInsert = Database['public']['Tables']['blackout_dates']['Insert']

export const DAYS_OF_WEEK = [
  { value: 0, label: 'Domingo' },
  { value: 1, label: 'Lunes' },
  { value: 2, label: 'Martes' },
  { value: 3, label: 'Miércoles' },
  { value: 4, label: 'Jueves' },
  { value: 5, label: 'Viernes' },
  { value: 6, label: 'Sábado' },
] as const
