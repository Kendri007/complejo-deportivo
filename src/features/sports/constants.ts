import type { Database } from '@/types/database.types'

type Sport = Database['public']['Tables']['sports']['Row']

export const SPORT_ORDER = ['futbol', 'beach_volley', 'beach_tenis', 'tenis', 'padel']

export function sortSports<T extends Pick<Sport, 'key'>>(sports: T[]): T[] {
  return [...sports].sort((a, b) => SPORT_ORDER.indexOf(a.key) - SPORT_ORDER.indexOf(b.key))
}
