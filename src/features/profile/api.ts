import { supabase } from '@/lib/supabase'

export async function updateMyProfile(userId: string, patch: { full_name?: string; phone?: string | null }) {
  const { data, error } = await supabase
    .from('profiles')
    .update(patch)
    .eq('id', userId)
    .select()
    .single()
  if (error) throw error
  return data
}
