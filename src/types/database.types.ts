// Tipos escritos a mano a partir de supabase/migrations/*.sql. Si en algún
// momento corrés `supabase gen types typescript --project-id <ref> > src/types/database.types.ts`
// (requiere `supabase login`), ese comando puede reemplazar este archivo sin
// romper nada siempre que la forma coincida.

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Role = 'client' | 'complex_admin' | 'super_admin'
export type ReservationStatus = 'confirmed' | 'cancelled'
export type ReservationType = 'private' | 'match'
export type MatchStatus = 'open' | 'full' | 'cancelled' | 'completed'
export type ParticipantStatus = 'joined' | 'left'

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          phone: string | null
          role: Role
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          phone?: string | null
          role?: Role
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
        Relationships: []
      }
      complexes: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          lat: number | null
          lng: number | null
          phone: string | null
          cover_image_url: string | null
          is_active: boolean
          created_by: string | null
          subscription_expires_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          lat?: number | null
          lng?: number | null
          phone?: string | null
          cover_image_url?: string | null
          is_active?: boolean
          created_by?: string | null
          subscription_expires_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['complexes']['Insert']>
        Relationships: []
      }
      complex_admins: {
        Row: {
          id: string
          complex_id: string
          user_id: string
          created_at: string
        }
        Insert: {
          id?: string
          complex_id: string
          user_id: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['complex_admins']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'complex_admins_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'complex_admins_complex_id_fkey'
            columns: ['complex_id']
            isOneToOne: false
            referencedRelation: 'complexes'
            referencedColumns: ['id']
          },
        ]
      }
      sports: {
        Row: {
          id: string
          key: string
          label: string
          icon: string | null
        }
        Insert: {
          id?: string
          key: string
          label: string
          icon?: string | null
        }
        Update: Partial<Database['public']['Tables']['sports']['Insert']>
        Relationships: []
      }
      courts: {
        Row: {
          id: string
          complex_id: string
          sport_id: string
          name: string
          variant: string | null
          surface: string | null
          is_indoor: boolean
          is_active: boolean
          price_per_hour: number | null
          default_capacity: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          complex_id: string
          sport_id: string
          name: string
          variant?: string | null
          surface?: string | null
          is_indoor?: boolean
          is_active?: boolean
          price_per_hour?: number | null
          default_capacity?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['courts']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'courts_complex_id_fkey'
            columns: ['complex_id']
            isOneToOne: false
            referencedRelation: 'complexes'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'courts_sport_id_fkey'
            columns: ['sport_id']
            isOneToOne: false
            referencedRelation: 'sports'
            referencedColumns: ['id']
          },
        ]
      }
      operating_hours: {
        Row: {
          id: string
          court_id: string
          day_of_week: number
          open_time: string
          close_time: string
        }
        Insert: {
          id?: string
          court_id: string
          day_of_week: number
          open_time: string
          close_time: string
        }
        Update: Partial<Database['public']['Tables']['operating_hours']['Insert']>
        Relationships: []
      }
      blackout_dates: {
        Row: {
          id: string
          complex_id: string
          court_id: string | null
          date: string
          all_day: boolean
          start_time: string | null
          end_time: string | null
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          complex_id: string
          court_id?: string | null
          date: string
          all_day?: boolean
          start_time?: string | null
          end_time?: string | null
          reason?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['blackout_dates']['Insert']>
        Relationships: []
      }
      reservations: {
        Row: {
          id: string
          court_id: string
          user_id: string
          date: string
          start_time: string
          end_time: string
          status: ReservationStatus
          type: ReservationType
          price: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          court_id: string
          user_id: string
          date: string
          start_time: string
          end_time: string
          status?: ReservationStatus
          type?: ReservationType
          price?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: Partial<Database['public']['Tables']['reservations']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'reservations_court_id_fkey'
            columns: ['court_id']
            isOneToOne: false
            referencedRelation: 'courts'
            referencedColumns: ['id']
          },
        ]
      }
      matches: {
        Row: {
          id: string
          reservation_id: string
          target_players: number
          status: MatchStatus
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          reservation_id: string
          target_players: number
          status?: MatchStatus
          created_by: string
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['matches']['Insert']>
        Relationships: []
      }
      match_participants: {
        Row: {
          id: string
          match_id: string
          user_id: string
          status: ParticipantStatus
          joined_at: string
        }
        Insert: {
          id?: string
          match_id: string
          user_id: string
          status?: ParticipantStatus
          joined_at?: string
        }
        Update: Partial<Database['public']['Tables']['match_participants']['Insert']>
        Relationships: []
      }
      platform_settings: {
        Row: {
          id: boolean
          monthly_price: number
        }
        Insert: {
          id?: boolean
          monthly_price?: number
        }
        Update: Partial<Database['public']['Tables']['platform_settings']['Insert']>
        Relationships: []
      }
      subscription_payments: {
        Row: {
          id: string
          complex_id: string
          amount: number
          months: number
          period_start: string
          period_end: string
          recorded_by: string | null
          created_at: string
        }
        Insert: {
          id?: string
          complex_id: string
          amount: number
          months?: number
          period_start: string
          period_end: string
          recorded_by?: string | null
          created_at?: string
        }
        Update: Partial<Database['public']['Tables']['subscription_payments']['Insert']>
        Relationships: [
          {
            foreignKeyName: 'subscription_payments_complex_id_fkey'
            columns: ['complex_id']
            isOneToOne: false
            referencedRelation: 'complexes'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: {
      public_profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      nearby_complexes: {
        Args: { user_lat: number; user_lng: number; radius_km?: number }
        Returns: {
          id: string
          name: string
          address: string | null
          lat: number | null
          lng: number | null
          cover_image_url: string | null
          distance_km: number
        }[]
      }
      get_available_slots: {
        Args: { target_court_id: string; target_date: string }
        Returns: { start_time: string }[]
      }
      create_reservation: {
        Args: {
          target_court_id: string
          target_date: string
          target_start_time: string
          reservation_type?: ReservationType
          match_target_players?: number | null
        }
        Returns: string
      }
      cancel_reservation: {
        Args: { target_reservation_id: string }
        Returns: undefined
      }
      join_match: {
        Args: { target_match_id: string }
        Returns: undefined
      }
      leave_match: {
        Args: { target_match_id: string }
        Returns: undefined
      }
      find_user_id_by_email: {
        Args: { target_email: string }
        Returns: string | null
      }
      list_open_matches: {
        Args: { filter_sport_key?: string | null; max_results?: number }
        Returns: {
          match_id: string
          target_players: number
          status: MatchStatus
          date: string
          start_time: string
          end_time: string
          court_id: string
          court_name: string
          complex_id: string
          complex_name: string
          sport_key: string
          sport_label: string
          joined_count: number
        }[]
      }
      get_match_details: {
        Args: { target_match_id: string }
        Returns: {
          match_id: string
          target_players: number
          status: MatchStatus
          created_by: string
          date: string
          start_time: string
          end_time: string
          court_id: string
          court_name: string
          complex_id: string
          complex_name: string
          sport_label: string
          joined_count: number
        }[]
      }
      record_subscription_payment: {
        Args: { target_complex_id: string; amount: number; months?: number }
        Returns: string
      }
      register_complex: {
        Args: {
          complex_name: string
          complex_address?: string | null
          complex_lat?: number | null
          complex_lng?: number | null
          complex_phone?: string | null
        }
        Returns: string
      }
    }
    Enums: Record<string, never>
  }
}
