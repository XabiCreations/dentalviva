import { createClient } from '@supabase/supabase-js'
import type { Profile } from '../types/user'
import type { AppointmentStatus } from '../types/admin'

const supabaseUrl      = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

// ─── Raw DB row types — usados en los servicios ───────────────────────────────

export interface DentistRow {
  id: string
  user_id: string | null
  name: string
  email: string | null
  specialty: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface CitaRow {
  id: string
  user_id: string | null
  dentist_id: string | null
  tratamiento: string | null
  fecha: string
  hora: string
  duration_min: number
  estado: AppointmentStatus
  created_at: string
}

// ─── Database type para createClient ─────────────────────────────────────────

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          last_name: string
          dni: string
          email: string
          phone: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          dni: string
          email: string
          last_name: string
          phone: string
        }
        Update: {
          full_name?: string
          last_name?: string
          dni?: string
          email?: string
          phone?: string
          updated_at?: string
        }
        Relationships: never[]
      }
      dentists: {
        Row: {
          id: string
          user_id: string | null
          name: string
          email: string | null
          specialty: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          email?: string | null
          specialty?: string | null
          avatar_url?: string | null
        }
        Update: {
          name?: string
          email?: string | null
          specialty?: string | null
          avatar_url?: string | null
          updated_at?: string
        }
        Relationships: never[]
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string
          user_id: string | null
          status: string
          subscribed_at: string
          created_at: string
        }
        Insert: {
          email: string
          name: string
          user_id?: string | null
          status?: string
        }
        Update: {
          name?: string
          user_id?: string | null
          status?: string
        }
        Relationships: never[]
      }
      citas: {
        Row: {
          id: string
          user_id: string | null
          dentist_id: string | null
          tratamiento: string | null
          fecha: string
          hora: string
          duration_min: number
          estado: AppointmentStatus
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          dentist_id?: string | null
          tratamiento?: string | null
          fecha: string
          hora: string
          duration_min?: number
          estado?: AppointmentStatus
        }
        Update: {
          dentist_id?: string | null
          tratamiento?: string | null
          fecha?: string
          hora?: string
          duration_min?: number
          estado?: AppointmentStatus
        }
        Relationships: [
          {
            foreignKeyName: 'citas_dentist_id_fkey'
            columns: ['dentist_id']
            isOneToOne: false
            referencedRelation: 'dentists'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'citas_user_id_fkey'
            columns: ['user_id']
            isOneToOne: false
            referencedRelation: 'profiles'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      cleanup_ghost_account: {
        Args: { p_email: string }
        Returns: string
      }
      link_newsletter_subscription: {
        Args: { p_email: string; p_user_id: string; p_full_name: string }
        Returns: undefined
      }
      subscribe_newsletter: {
        Args: { p_name: string; p_email: string }
        Returns: undefined
      }
      is_email_subscribed: {
        Args: { p_email: string }
        Returns: boolean
      }
      get_all_patients: {
        Args: Record<never, never>
        Returns: {
          id: string; full_name: string; last_name: string
          dni: string; email: string; phone: string; created_at: string
        }[]
      }
      admin_update_patient: {
        Args: { p_id: string; p_full_name: string; p_last_name: string | null; p_dni: string; p_email: string; p_phone: string | null }
        Returns: undefined
      }
      admin_delete_patient: {
        Args: { p_id: string; p_delete_newsletter?: boolean }
        Returns: undefined
      }
      update_user_email: {
        Args: { p_new_email: string }
        Returns: undefined
      }
      get_email_by_dni: {
        Args: { p_dni: string }
        Returns: string | null
      }
      current_dentist_id: {
        Args: Record<never, never>
        Returns: string
      }
    }
  }
}

// Re-export Profile para que no haya imports rotos en archivos que ya lo usan
export type { Profile }

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
