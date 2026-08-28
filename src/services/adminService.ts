import { createClient } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'
import type { AdminAppointment, AppointmentStatus, PatientRow, CreateAppointmentPayload } from '../types/admin'

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

type CitaRow = {
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

type ProfileSlice = {
  id: string
  full_name: string
  last_name: string
  phone: string
  email: string
}

// Fetches profiles for a list of user_ids and returns a lookup map
async function fetchProfileMap(userIds: string[]): Promise<Map<string, ProfileSlice>> {
  const map = new Map<string, ProfileSlice>()
  if (userIds.length === 0) return map

  const { data } = await supabase
    .from('profiles')
    .select('id, full_name, last_name, phone, email')
    .in('id', userIds)

  for (const p of data ?? []) {
    map.set(p.id, p as ProfileSlice)
  }
  return map
}

// Merges cita rows with their profile data
function mergeProfile(row: CitaRow, profileMap: Map<string, ProfileSlice>): AdminAppointment {
  const p = row.user_id ? profileMap.get(row.user_id) ?? null : null
  const patient_name = p?.full_name
    ? (p.last_name ? `${p.full_name} ${p.last_name}` : p.full_name)
    : null
  return {
    id:           row.id,
    user_id:      row.user_id ?? '',
    dentist_id:   row.dentist_id,
    tratamiento:  row.tratamiento,
    fecha:        row.fecha,
    hora:         row.hora,
    duration_min: row.duration_min,
    estado:       row.estado,
    created_at:   row.created_at,
    patient_name,
    patient_phone: p?.phone ?? null,
    patient_email: p?.email ?? null,
  }
}

async function enrichCitas(rows: CitaRow[]): Promise<AdminAppointment[]> {
  const userIds = [...new Set(rows.map(r => r.user_id).filter(Boolean))] as string[]
  const profileMap = await fetchProfileMap(userIds)
  return rows.map(r => mergeProfile(r, profileMap))
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
  return enrichCitas((data ?? []) as CitaRow[])
}

export async function getAllCitas(dentistId: string): Promise<AdminAppointment[]> {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('dentist_id', dentistId)
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })

  if (error) throw error
  return enrichCitas((data ?? []) as CitaRow[])
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
  return enrichCitas((data ?? []) as CitaRow[])
}

export async function getPatientDetails(userId: string, dentistId: string): Promise<PatientDetails> {
  const { data, error } = await supabase
    .from('citas')
    .select('*')
    .eq('dentist_id', dentistId)
    .eq('user_id', userId)
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })

  if (error) throw error

  const profileMap = await fetchProfileMap([userId])
  const all = ((data ?? []) as CitaRow[]).map(r => mergeProfile(r, profileMap))

  const { data: profile } = await supabase
    .from('profiles')
    .select('dni')
    .eq('id', userId)
    .single()

  return { totalCitas: all.length, lastCita: all[0] ?? null, dni: profile?.dni ?? null }
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
  return enrichCitas((data ?? []) as CitaRow[])
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
    : `${updates.dni.toLowerCase().replace(/\W/g, '')}@patients.dentalviva.es`
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

export async function adminCreateCita(payload: CreateAppointmentPayload): Promise<AdminAppointment> {
  const { data, error } = await supabase
    .from('citas')
    .insert({
      dentist_id:   payload.dentist_id,
      user_id:      payload.user_id,
      tratamiento:  payload.tratamiento,
      fecha:        payload.fecha,
      hora:         payload.hora.length === 5 ? payload.hora + ':00' : payload.hora,
      duration_min: payload.duration_min,
      estado:       payload.estado,
    })
    .select('*')
    .single()

  if (error) throw new Error(error.message)

  const profileMap = await fetchProfileMap([payload.user_id])
  return mergeProfile(data as CitaRow, profileMap)
}

export async function adminDeletePatient(id: string, deleteNewsletter = false): Promise<void> {
  const { error } = await supabase.rpc('admin_delete_patient', { p_id: id, p_delete_newsletter: deleteNewsletter })
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
    : `${data.dni.toLowerCase().replace(/\W/g, '')}@patients.dentalviva.es`

  if (hasRealEmail) {
    const { data: result } = await supabase.rpc('cleanup_ghost_account', { p_email: authEmail })
    if (result === 'has_account') {
      throw new Error('Ya existe un paciente con ese correo electrónico.')
    }
  }

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
    p_full_name: normalizedName,
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
