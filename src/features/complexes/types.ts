import type { Database } from '@/types/database.types'

export type Complex = Database['public']['Tables']['complexes']['Row']
export type ComplexInsert = Database['public']['Tables']['complexes']['Insert']
export type ComplexUpdate = Database['public']['Tables']['complexes']['Update']

export type ComplexAdmin = Database['public']['Tables']['complex_admins']['Row'] & {
  profiles: { full_name: string | null; avatar_url: string | null } | null
}
