import { supabase } from '../lib/supabase'

export type EstadoCita = 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_asistio'

export interface Dentist {
  id: string
  name: string
  specialty: string | null
}

export interface CreateCitaParams {
  userId: string
  tratamiento: string | null
  fecha: Date
  hora: string
}

export interface Cita {
  id: string
  user_id: string
  tratamiento: string | null
  fecha: string
  hora: string
  patient_name: string | null
  estado: EstadoCita
  created_at: string
  dentist_id: string | null
  dentist: Dentist | null
}

// Asignación fija por tratamiento → ID de dentista
// 'Ortodoncia' queda fuera → reparto aleatorio entre los 3
const TREATMENT_DENTIST_MAP: Record<string, string> = {
  'Implantes dentales':    '35174ed1-4a1a-47fb-bb56-8adadafc0f29', // Dr. Carlos Mendoza
  'Blanqueamiento dental': '35a7d5ae-0c3f-4adf-8c26-c64a5f861255', // Dra. Ana García
  'Estética dental':       '5c941484-83dd-44da-8beb-992191781680', // Dr. Luis Torres
}

export async function createCita({ userId, tratamiento, fecha, hora }: CreateCitaParams) {
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser || authUser.id !== userId) {
    throw new Error('Tu sesión ha expirado. Por favor, cierra sesión e inicia de nuevo.')
  }

  const { data: dentists } = await supabase
    .from('dentists')
    .select('id')
    .not('user_id', 'is', null)

  const fixedId = tratamiento ? TREATMENT_DENTIST_MAP[tratamiento] : null
  const dentist = fixedId
    ? dentists?.find(d => d.id === fixedId)
    : dentists?.[Math.floor(Math.random() * (dentists?.length ?? 1))]

  const { error } = await supabase.from('citas').insert({
    user_id:    userId,
    tratamiento,
    fecha:      fecha.toLocaleDateString('sv-SE'),
    hora,
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
    .select('*, dentist:dentists(id, name, specialty), profiles(full_name, last_name)')
    .eq('user_id', userId)
    .order('fecha', { ascending: false })
    .order('hora', { ascending: false })

  if (error) {
    console.error('[getCitasByUser] Supabase error:', error)
    throw new Error('No se pudieron cargar las citas.')
  }

  return (data ?? []).map((row: any) => {
    const p = row.profiles
    const patient_name = p?.full_name
      ? (p.last_name ? `${p.full_name} ${p.last_name}` : p.full_name)
      : null
    return { ...row, patient_name, profiles: undefined }
  }) as Cita[]
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
