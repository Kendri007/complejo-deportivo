import type { Database } from '@/types/database.types'

export type Court = Database['public']['Tables']['courts']['Row']
export type CourtInsert = Database['public']['Tables']['courts']['Insert']
export type CourtUpdate = Database['public']['Tables']['courts']['Update']
export type Sport = Database['public']['Tables']['sports']['Row']

export type CourtWithSports = Court & {
  court_sports: { sport_id: string; sports: Pick<Sport, 'id' | 'key' | 'label'> | null }[]
}

export function courtSportLabels(court: CourtWithSports) {
  return court.court_sports
    .map((cs) => cs.sports?.label)
    .filter((label): label is string => !!label)
    .join(' · ')
}
