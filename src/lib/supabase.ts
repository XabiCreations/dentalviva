import { createClient } from '@supabase/supabase-js'
import type { Profile } from '../types/user'
import type { AppointmentStatus, AppointmentSource } from '../types/admin'

const supabaseUrl      = import.meta.env.VITE_SUPABASE_URL as string
const supabaseAnonKey  = import.meta.env.VITE_SUPABASE_ANON_KEY as string

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY environment variables')
}

// ─── Raw DB row types — usados en los servicios ───────────────────────────────

export interface DentistRow {
  id: string
  user_id: string
  name: string
  email: string
  specialty: string
  avatar_url: string | null
  created_at: string
}

export interface CitaRow {
  id: string
  user_id: string | null
  dentist_id: string | null
  tipo: 'cita'
  tratamiento: string | null
  fecha: string
  hora: string
  duration_min: number
  estado: AppointmentStatus
  source: AppointmentSource
  notes: string | null
  patient_name: string | null
  patient_phone: string | null
  patient_email: string | null
  patient_birth_date: string | null
  created_at: string
}

// ─── Database type para createClient ─────────────────────────────────────────
// Los tipos de fila deben ser object types (no interfaces) para que
// @supabase/postgrest-js infiera los resultados correctamente.

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string
          birth_date: string
          dni: string
          email: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name: string
          birth_date: string
          dni: string
          email: string
        }
        Update: {
          full_name?: string
          birth_date?: string
          dni?: string
          email?: string
        }
        Relationships: never[]
      }
      dentists: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string
          specialty: string
          avatar_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email: string
          specialty: string
          avatar_url?: string | null
        }
        Update: {
          name?: string
          email?: string
          specialty?: string
          avatar_url?: string | null
        }
        Relationships: never[]
      }
      citas: {
        Row: {
          id: string
          user_id: string | null
          dentist_id: string | null
          tipo: 'cita'
          tratamiento: string | null
          fecha: string
          hora: string
          duration_min: number
          estado: AppointmentStatus
          source: AppointmentSource
          notes: string | null
          patient_name: string | null
          patient_phone: string | null
          patient_email: string | null
          patient_birth_date: string | null
          created_at: string
        }
        Insert: {
          user_id?: string | null
          dentist_id?: string | null
          tipo: 'cita'
          tratamiento?: string | null
          fecha: string
          hora: string
          duration_min?: number
          estado?: AppointmentStatus
          source?: AppointmentSource
          notes?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          patient_email?: string | null
          patient_birth_date?: string | null
        }
        Update: {
          user_id?: string | null
          dentist_id?: string | null
          tratamiento?: string | null
          fecha?: string
          hora?: string
          duration_min?: number
          estado?: AppointmentStatus
          source?: AppointmentSource
          notes?: string | null
          patient_name?: string | null
          patient_phone?: string | null
          patient_email?: string | null
          patient_birth_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'citas_dentist_id_fkey'
            columns: ['dentist_id']
            isOneToOne: false
            referencedRelation: 'dentists'
            referencedColumns: ['id']
          }
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
  }
}

// Re-export Profile para que no haya imports rotos en archivos que ya lo usan
export type { Profile }

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)
