import { supabase } from '@/lib/supabase'

export async function uploadComplexPhoto(complexId: string, file: File) {
  const ext = file.name.split('.').pop() || 'jpg'
  const path = `${complexId}/${Date.now()}.${ext}`

  const { error } = await supabase.storage
    .from('complex-photos')
    .upload(path, file, { upsert: true, cacheControl: '3600' })
  if (error) throw error

  const { data } = supabase.storage.from('complex-photos').getPublicUrl(path)
  return data.publicUrl
}
