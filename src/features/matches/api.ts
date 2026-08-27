import { supabase } from '@/lib/supabase'

export async function listOpenMatches(sportKey?: string) {
  const { data, error } = await supabase.rpc('list_open_matches', {
    filter_sport_key: sportKey ?? null,
  })
  if (error) throw error
  return data
}

export async function getMatchDetails(matchId: string) {
  const { data, error } = await supabase.rpc('get_match_details', {
    target_match_id: matchId,
  })
  if (error) throw error
  return data[0] ?? null
}

export async function listMatchParticipants(matchId: string) {
  const { data: participants, error } = await supabase
    .from('match_participants')
    .select('id, user_id, joined_at')
    .eq('match_id', matchId)
    .eq('status', 'joined')
    .order('joined_at', { ascending: true })
  if (error) throw error

  const userIds = participants.map((p) => p.user_id)
  let namesById: Record<string, { full_name: string | null; avatar_url: string | null }> = {}
  if (userIds.length > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from('public_profiles')
      .select('id, full_name, avatar_url')
      .in('id', userIds)
    if (profilesError) throw profilesError
    namesById = Object.fromEntries(profiles.map((p) => [p.id, p]))
  }

  return participants.map((p) => ({ ...p, profile: namesById[p.user_id] ?? null }))
}

export async function joinMatch(matchId: string) {
  const { error } = await supabase.rpc('join_match', { target_match_id: matchId })
  if (error) throw error
}

export async function leaveMatch(matchId: string) {
  const { error } = await supabase.rpc('leave_match', { target_match_id: matchId })
  if (error) throw error
}
