// Placeholder — se reemplaza en el paso 2 (schema + RLS) generando los tipos
// reales con `supabase gen types typescript --project-id <id> > src/types/database.types.ts`.
export type Database = {
  public: {
    Tables: Record<string, never>
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
