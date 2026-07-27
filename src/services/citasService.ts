import { supabase } from '../lib/supabase'

export type CitaTipo = 'cita'

export type EstadoCita = 'pendiente' | 'confirmada' | 'cancelada' | 'realizada'

export interface Dentist {
  id: string
  nombre: string
  especialidad: string | null
}

export interface CreateCitaParams {
  userId: string
  tipo: CitaTipo
  tratamiento: string | null
  fecha: Date
  hora: string
  patientName: string | null
}

export interface Cita {
  id: string
  user_id: string
  tipo: CitaTipo
  tratamiento: string | null
  fecha: string
  hora: string
  patient_name: string | null
  estado: EstadoCita
  created_at: string
  dentist_id: string | null
  dentist: Dentist | null
}

export async function createCita({ userId, tipo, tratamiento, fecha, hora, patientName }: CreateCitaParams) {
  // Assign a dentist based on treatment, falling back to a random one
  const { data: dentists } = await supabase.from('dentists').select('id, especialidad')
  const dentist = dentists?.find(d =>
    tratamiento && d.especialidad &&
    tratamiento.toLowerCase().includes(d.especialidad.toLowerCase().split(' ')[0])
  ) ?? dentists?.[Math.floor(Math.random() * (dentists?.length ?? 1))]

  const { error } = await supabase.from('citas').insert({
    user_id: userId,
    tipo,
    tratamiento,
    fecha: fecha.toISOString().split('T')[0],
    hora,
    patient_name: patientName,
    dentist_id: dentist?.id ?? null,
  })

  if (error) {
    console.error('[createCita] Supabase error:', error)
    throw new Error(error.message ?? 'No se pudo guardar la cita. Inténtalo de nuevo.')
  }
}

export async function getCitasByUser(userId: string): Promise<Cita[]> {
  const { data, error } = await supabase
    .from('citas')
    .select('*, dentist:dentists(id, nombre, especialidad)')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })

  if (error) {
    console.error('[getCitasByUser] Supabase error:', error)
    throw new Error('No se pudo cargar el historial.')
  }
  return (data ?? []) as Cita[]
}

export async function cancelCita(citaId: string): Promise<void> {
  const { error } = await supabase
    .from('citas')
    .update({ estado: 'cancelada' })
    .eq('id', citaId)

  if (error) {
    console.error('[cancelCita] Supabase error:', error)
    throw new Error(error.message ?? 'No se pudo cancelar la cita. Inténtalo de nuevo.')
  }
}
