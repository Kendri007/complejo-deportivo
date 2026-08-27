import { supabase } from '@/lib/supabase'

export async function listSports() {
  const { data, error } = await supabase.from('sports').select('*').order('label')
  if (error) throw error
  return data
}

export async function getSportByKey(key: string) {
  const { data, error } = await supabase.from('sports').select('*').eq('key', key).single()
  if (error) throw error
  return data
}
