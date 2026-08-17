import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AdminAppointment, AppointmentStatus, PatientRow } from '../types/admin'

const capitalize = (s: string) => s.trim().replace(/\b\w/g, c => c.toUpperCase())

export interface PatientDetails {
  totalCitas: number
  lastCita: AdminAppointment | null
  dni: string | null
}

function getTodayMadrid(): string {
  return new Date().toLocaleDateString('sv-SE', { timeZone: 'Europe/Madrid' })
}

function getNowMadrid(): string {
  const d = new Date(new Date().toLocaleString('en-US', { timeZone: 'Europe/Madrid' }))
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

export async function getUpcomingAppointments(dentistId: string): Promise<AdminAppointment[]> {
  const today = getTodayMadrid()
  const now = getNowMadrid()

  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('dentist_id', dentistId)
    .eq('estado', 'confirmada')
    .or(`fecha.gt.${today},and(fecha.eq.${today},hora.gte.${now})`)
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })

  if (error) throw error
  return (data ?? []) as AdminAppointment[]
}

export async function getAllCitas(dentistId: string): Promise<AdminAppointment[]> {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('dentist_id', dentistId)
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })

  if (error) throw error
  return (data ?? []) as AdminAppointment[]
}

export async function getPendingAppointments(dentistId: string): Promise<AdminAppointment[]> {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('dentist_id', dentistId)
    .eq('estado', 'pendiente')
    .order('fecha', { ascending: true })
    .order('hora', { ascending: true })

  if (error) throw error
  return (data ?? []) as AdminAppointment[]
}

export async function getPatientDetails(
  userId: string | null,
  patientName: string | null,
  dentistId: string,
): Promise<PatientDetails> {
  let query = supabase.from('citas').select('*').eq('dentist_id', dentistId)
  query = userId
    ? query.eq('user_id', userId)
    : query.eq('patient_name', patientName ?? '')

  const { data, error } = await query
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })
  if (error) throw error

  const all = (data ?? []) as AdminAppointment[]

  let dni: string | null = null
  if (userId) {
    const { data: profile } = await supabase
      .from('profiles').select('dni').eq('id', userId).single()
    dni = profile?.dni ?? null
  }

  return { totalCitas: all.length, lastCita: all[0] ?? null, dni }
}

export async function getCitasByMonth(dentistId: string, year: number, month: number): Promise<AdminAppointment[]> {
  const from = `${year}-${String(month).padStart(2, '0')}-01`
  const to   = `${year}-${String(month).padStart(2, '0')}-${String(new Date(year, month, 0).getDate()).padStart(2, '0')}`

  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('dentist_id', dentistId)
    .gte('fecha', from)
    .lte('fecha', to)
    .order('hora', { ascending: true })

  if (error) throw error
  return (data ?? []) as AdminAppointment[]
}

export async function updateAppointmentStatus(id: string, estado: AppointmentStatus): Promise<void> {
  const { error } = await supabase.from('citas').update({ estado }).eq('id', id)
  if (error) throw error
}

// ─── Patients ─────────────────────────────────────────────────────────────────

export async function getAllPatients(): Promise<PatientRow[]> {
  const { data, error } = await supabase.rpc('get_all_patients')
  if (error) throw error
  return (data ?? []) as PatientRow[]
}

export async function adminUpdatePatient(
  id: string,
  updates: { full_name: string; last_name: string; dni: string; email: string; phone: string }
): Promise<void> {
  const authEmail = updates.email.trim()
    ? updates.email.trim().toLowerCase()
    : `${updates.dni.toLowerCase().replace(/\W/g, '')}@patients.dentaviva.es`
  const { error } = await supabase.rpc('admin_update_patient', {
    p_id:        id,
    p_full_name: updates.full_name,
    p_last_name: updates.last_name || null,
    p_dni:       updates.dni.toUpperCase(),
    p_email:     authEmail,
    p_phone:     updates.phone || null,
  })
  if (error) throw error
}

export async function adminDeletePatient(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_patient', { p_id: id })
  if (error) throw error
}

export async function adminCreatePatient(data: {
  full_name: string
  last_name: string
  dni: string
  email: string
  phone: string
  password: string
  newsletter: boolean
}): Promise<PatientRow> {
  const url = import.meta.env.VITE_SUPABASE_URL as string
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string

  const normalizedName     = capitalize(data.full_name)
  const normalizedLastName = data.last_name.trim() ? capitalize(data.last_name) : ''
  const displayName        = normalizedLastName ? `${normalizedName} ${normalizedLastName}` : normalizedName
  const hasRealEmail       = !!data.email.trim()
  const authEmail          = hasRealEmail
    ? data.email.trim().toLowerCase()
    : `${data.dni.toLowerCase().replace(/\W/g, '')}@patients.dentaviva.es`

  if (hasRealEmail) {
    const { data: result } = await supabase.rpc('cleanup_ghost_account', { p_email: authEmail })
    if (result === 'has_account') {
      throw new Error('Ya existe un paciente con ese correo electrónico.')
    }
  }

  // Isolated client so admin session is unaffected
  const tempClient = createClient(url, key, { auth: { persistSession: false } })
  const { data: authData, error: authError } = await tempClient.auth.signUp({
    email: authEmail,
    password: data.password,
    options: { data: { full_name: displayName, dni: data.dni.toUpperCase(), phone: data.phone || null } },
  })

  if (authError) throw new Error(authError.message)
  if (!authData.user) throw new Error('No se pudo crear el paciente.')

  const userId = authData.user.id

  await supabase.rpc('admin_update_patient', {
    p_id:        userId,
    p_full_name: displayName,
    p_last_name: normalizedLastName || null,
    p_dni:       data.dni.toUpperCase(),
    p_email:     authEmail,
    p_phone:     data.phone?.trim() || null,
  })

  if (data.newsletter && hasRealEmail) {
    try {
      await supabase.rpc('subscribe_newsletter', { p_name: displayName, p_email: authEmail })
    } catch { /* silent */ }
  }

  return {
    id:         userId,
    full_name:  displayName,
    last_name:  normalizedLastName || null,
    dni:        data.dni.toUpperCase(),
    email:      authEmail,
    phone:      data.phone?.trim() || null,
    created_at: new Date().toISOString(),
  }
}
