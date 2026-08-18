// ─── Estado de cita ──────────────────────────────────────────────────────────
export type AppointmentStatus =
  | 'pendiente'
  | 'confirmada'
  | 'completada'
  | 'cancelada'
  | 'no_asistio'

// ─── Canal de origen de la cita ──────────────────────────────────────────────
export type AppointmentSource = 'web' | 'telefono' | 'presencial' | 'whatsapp'

// ─── Perfil del dentista ──────────────────────────────────────────────────────
export interface Dentist {
  id: string
  user_id: string
  name: string
  email: string
  specialty: string
  avatar_url: string | null
  created_at: string
}

// ─── Cita completa (admin) ────────────────────────────────────────────────────
export interface AdminAppointment {
  id: string
  user_id: string | null
  dentist_id: string | null
  tipo: 'cita'
  tratamiento: string | null
  fecha: string              // 'YYYY-MM-DD'
  hora: string               // 'HH:MM'
  duration_min: number
  estado: AppointmentStatus
  source: AppointmentSource
  notes: string | null
  patient_name: string | null
  patient_phone: string | null
  patient_email: string | null
  created_at: string
  dentist?: Dentist | null
}

// ─── Payload para crear una cita desde el panel ───────────────────────────────
export interface CreateAppointmentPayload {
  dentist_id: string
  patient_name: string
  patient_phone: string | null
  patient_email: string | null
  tratamiento: string
  fecha: string
  hora: string
  duration_min: number
  estado: AppointmentStatus
  source: AppointmentSource
  notes: string | null
  user_id?: string | null
}

// ─── Paciente (fila de profiles) ─────────────────────────────────────────────
export interface PatientRow {
  id: string
  full_name: string
  last_name: string | null
  dni: string
  email: string
  phone: string | null
  created_at: string
}

// ─── Parámetros de filtrado para la tabla de citas ───────────────────────────
export interface AppointmentFilters {
  search: string
  estado: AppointmentStatus | ''
  dentist_id: string | ''
  date_from: string
  date_to: string
}

// ─── Ordenación de la tabla ───────────────────────────────────────────────────
export type SortField = 'fecha' | 'hora' | 'patient_name' | 'estado'
export type SortDirection = 'asc' | 'desc'

export interface SortConfig {
  field: SortField
  direction: SortDirection
}
