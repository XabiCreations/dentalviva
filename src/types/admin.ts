// ─── Estado de cita ──────────────────────────────────────────────────────────
export type AppointmentStatus =
  | 'pendiente'
  | 'confirmada'
  | 'completada'
  | 'cancelada'
  | 'no_asistio'

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
  user_id: string
  dentist_id: string | null
  tratamiento: string | null
  fecha: string              // 'YYYY-MM-DD'
  hora: string               // 'HH:MM'
  duration_min: number
  estado: AppointmentStatus
  // Computed via JOIN with profiles — not stored in citas table
  patient_name: string | null
  patient_phone: string | null
  patient_email: string | null
  created_at: string
  dentist?: Dentist | null
}

// ─── Payload para crear una cita desde el panel ───────────────────────────────
export interface CreateAppointmentPayload {
  dentist_id: string
  user_id: string
  tratamiento: string
  fecha: string
  hora: string
  duration_min: number
  estado: AppointmentStatus
}

// ─── Paciente (fila de profiles) ─────────────────────────────────────────────
export interface PatientRow {
  id: string
  full_name: string
  last_name: string
  dni: string
  email: string
  phone: string
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
