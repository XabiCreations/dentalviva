/**
 * Seed del panel de administración de DentalViva.
 *
 * Uso:
 *   npx tsx --env-file=.env.local scripts/seed-admin.ts
 *
 * Requiere en .env.local:
 *   VITE_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY,
 *   SEED_DENTIST_1_PASSWORD  → Dr. Carlos Mendoza  (carlos.mendoza@dentaviva.es)
 *   SEED_DENTIST_2_PASSWORD  → Dra. Ana García      (ana.garcia@dentaviva.es)
 *   SEED_DENTIST_3_PASSWORD  → Dr. Luis Torres      (luis.torres@dentaviva.es)
 */

import { createClient } from '@supabase/supabase-js'

// ─── Env vars ─────────────────────────────────────────────────────────────────

const SUPABASE_URL     = process.env.VITE_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const PWD1             = process.env.SEED_DENTIST_1_PASSWORD
const PWD2             = process.env.SEED_DENTIST_2_PASSWORD
const PWD3             = process.env.SEED_DENTIST_3_PASSWORD

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌  Falta VITE_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local')
  process.exit(1)
}
if (!PWD1 || !PWD2 || !PWD3) {
  console.error('❌  Faltan SEED_DENTIST_[1|2|3]_PASSWORD en .env.local')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})

// ─── IDs originales de la clínica (ya existen en DB) ─────────────────────────

const MENDOZA = '35174ed1-4a1a-47fb-bb56-8adadafc0f29'  // Dr. Carlos Mendoza — Implantología
const ANA     = '35a7d5ae-0c3f-4adf-8c26-c64a5f861255'  // Dra. Ana García    — Ortodoncia
const TORRES  = '5c941484-83dd-44da-8beb-992191781680'  // Dr. Luis Torres    — Estética Dental

// ─── Definición de dentistas ──────────────────────────────────────────────────

const DENTIST_DEFS = [
  { dentistId: MENDOZA, email: 'carlos.mendoza@dentaviva.es', password: PWD1, name: 'Dr. Carlos Mendoza', specialty: 'Implantología',  dni: 'DENTIST-MENDOZA' },
  { dentistId: ANA,     email: 'ana.garcia@dentaviva.es',     password: PWD2, name: 'Dra. Ana García',    specialty: 'Blanqueamiento Dental', dni: 'DENTIST-ANA'     },
  { dentistId: TORRES,  email: 'luis.torres@dentaviva.es',    password: PWD3, name: 'Dr. Luis Torres',    specialty: 'Estética Dental', dni: 'DENTIST-TORRES'  },
]

// ─── Citas ────────────────────────────────────────────────────────────────────

type CitaInsert = {
  dentist_id: string
  patient_name: string; patient_phone: string | null
  patient_email: string | null; patient_birth_date: string | null
  tratamiento: string; fecha: string; hora: string; duration_min: number
  estado: 'pendiente' | 'confirmada' | 'completada' | 'cancelada' | 'no_asistio'
  source: 'web' | 'telefono' | 'presencial' | 'whatsapp'
  notes: string | null; user_id: null; tipo: 'cita'
}

// Dates relative to seed baseline: 2026-08-10 (today)
const CITAS: CitaInsert[] = [
  // ── Dr. Luis Torres — pasado ──────────────────────────────────────────────
  { dentist_id: TORRES, patient_name: 'Lorenzo Vega Morales',         patient_phone: '612 345 678', patient_email: 'lorenzo.vega@email.com',     patient_birth_date: '1985-03-12', tratamiento: 'Limpieza dental',                    fecha: '2026-07-28', hora: '09:00', duration_min: 45,  estado: 'completada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Elena Ramos Fuentes',          patient_phone: '634 567 890', patient_email: 'elena.ramos@email.com',      patient_birth_date: '1992-07-08', tratamiento: 'Empaste',                            fecha: '2026-07-30', hora: '11:00', duration_min: 60,  estado: 'completada', source: 'telefono',   notes: 'Muela inferior derecha',                         user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Sofía Navarro Castillo',       patient_phone: '656 789 012', patient_email: 'sofia.navarro@email.com',    patient_birth_date: '1998-11-22', tratamiento: 'Estética dental',                    fecha: '2026-08-01', hora: '10:00', duration_min: 30,  estado: 'no_asistio', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Rafael Serrano Blanco',        patient_phone: '678 901 234', patient_email: 'rafael.serrano@email.com',   patient_birth_date: '1978-05-30', tratamiento: 'Blanqueamiento dental',              fecha: '2026-08-04', hora: '09:30', duration_min: 90,  estado: 'completada', source: 'presencial', notes: 'Alergia a la penicilina — usar alternativa',      user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Patricia Molina Ortega',       patient_phone: '690 123 456', patient_email: 'patricia.molina@email.com',  patient_birth_date: '1990-09-15', tratamiento: 'Blanqueamiento dental',              fecha: '2026-08-07', hora: '10:00', duration_min: 120, estado: 'completada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Antonio Jiménez Díaz',         patient_phone: '601 234 567', patient_email: 'antonio.jimenez@email.com',  patient_birth_date: '1965-02-18', tratamiento: 'Estética dental',                    fecha: '2026-08-08', hora: '09:00', duration_min: 30,  estado: 'completada', source: 'telefono',   notes: null,                                             user_id: null, tipo: 'cita' },
  // ── Dr. Luis Torres — hoy (2026-08-10) ───────────────────────────────────
  { dentist_id: TORRES, patient_name: 'Isabel Moreno García',         patient_phone: '623 456 789', patient_email: 'isabel.moreno@email.com',    patient_birth_date: '1988-04-25', tratamiento: 'Estética dental',                    fecha: '2026-08-10', hora: '09:00', duration_min: 45,  estado: 'confirmada', source: 'web',        notes: 'Primera visita. Sensibilidad dental alta.',      user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Javier López Sánchez',         patient_phone: '645 678 901', patient_email: 'javier.lopez@email.com',     patient_birth_date: '1982-12-03', tratamiento: 'Blanqueamiento dental',              fecha: '2026-08-10', hora: '11:00', duration_min: 60,  estado: 'confirmada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Carmen Pérez Rodríguez',       patient_phone: '667 890 123', patient_email: 'carmen.perez@email.com',     patient_birth_date: '1975-08-14', tratamiento: 'Estética dental',                    fecha: '2026-08-10', hora: '13:00', duration_min: 45,  estado: 'pendiente',  source: 'whatsapp',   notes: null,                                             user_id: null, tipo: 'cita' },
  // ── Dr. Luis Torres — próximas ────────────────────────────────────────────
  { dentist_id: TORRES, patient_name: 'Alejandro Martínez Fernández', patient_phone: '612 111 222', patient_email: 'alejandro.m@email.com',      patient_birth_date: '1993-06-07', tratamiento: 'Estética dental',                    fecha: '2026-08-11', hora: '09:00', duration_min: 30,  estado: 'confirmada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Teresa Rodríguez García',      patient_phone: '634 222 333', patient_email: 'teresa.rodriguez@email.com', patient_birth_date: '1971-01-19', tratamiento: 'Blanqueamiento dental',              fecha: '2026-08-11', hora: '11:00', duration_min: 90,  estado: 'pendiente',  source: 'telefono',   notes: 'Solicita presupuesto para tratamiento completo', user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Pilar García Sánchez',         patient_phone: '656 333 444', patient_email: 'pilar.garcia@email.com',     patient_birth_date: '1960-10-05', tratamiento: 'Estética dental',                    fecha: '2026-08-13', hora: '10:00', duration_min: 45,  estado: 'pendiente',  source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: TORRES, patient_name: 'Francisco González Ruiz',      patient_phone: '678 444 555', patient_email: 'francisco.g@email.com',      patient_birth_date: '1987-03-28', tratamiento: 'Blanqueamiento dental',              fecha: '2026-08-14', hora: '09:30', duration_min: 120, estado: 'confirmada', source: 'whatsapp',   notes: null,                                             user_id: null, tipo: 'cita' },

  // ── Dra. Ana García — pasado ──────────────────────────────────────────────
  { dentist_id: ANA,    patient_name: 'Diego Morales Soto',           patient_phone: '611 555 666', patient_email: 'diego.morales@email.com',    patient_birth_date: '2001-09-14', tratamiento: 'Revisión brackets',                  fecha: '2026-07-30', hora: '10:00', duration_min: 45,  estado: 'completada', source: 'telefono',   notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: ANA,    patient_name: 'Valentina Cruz Herrera',       patient_phone: '633 666 777', patient_email: 'valentina.cruz@email.com',   patient_birth_date: '2003-05-22', tratamiento: 'Ajuste ortodoncia',                  fecha: '2026-08-01', hora: '11:00', duration_min: 30,  estado: 'completada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: ANA,    patient_name: 'Héctor Vargas Ríos',           patient_phone: '655 777 888', patient_email: 'hector.vargas@email.com',    patient_birth_date: '1995-12-11', tratamiento: 'Ortodoncia Invisalign — inicial',    fecha: '2026-08-05', hora: '09:00', duration_min: 60,  estado: 'cancelada',  source: 'web',        notes: 'Canceló por viaje',                              user_id: null, tipo: 'cita' },
  { dentist_id: ANA,    patient_name: 'Adriana Santos Vidal',         patient_phone: '677 888 999', patient_email: 'adriana.santos@email.com',   patient_birth_date: '1999-07-03', tratamiento: 'Colocación brackets',                fecha: '2026-08-06', hora: '10:30', duration_min: 120, estado: 'completada', source: 'presencial', notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: ANA,    patient_name: 'Marcos Delgado Reyes',         patient_phone: '699 999 000', patient_email: 'marcos.delgado@email.com',   patient_birth_date: '2000-02-17', tratamiento: 'Revisión Invisalign',                fecha: '2026-08-08', hora: '11:00', duration_min: 30,  estado: 'completada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  // ── Dra. Ana García — hoy ────────────────────────────────────────────────
  { dentist_id: ANA,    patient_name: 'Lucía Fernández Vega',         patient_phone: '612 000 111', patient_email: 'lucia.fernandez@email.com',  patient_birth_date: '2004-08-30', tratamiento: 'Ajuste ortodoncia',                  fecha: '2026-08-10', hora: '10:30', duration_min: 30,  estado: 'confirmada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: ANA,    patient_name: 'Miguel Sánchez Torres',        patient_phone: '634 111 222', patient_email: 'miguel.sanchez@email.com',   patient_birth_date: '1996-04-12', tratamiento: 'Revisión brackets',                  fecha: '2026-08-10', hora: '12:00', duration_min: 45,  estado: 'confirmada', source: 'telefono',   notes: 'Rotura de bracket inferior — urgente',            user_id: null, tipo: 'cita' },
  { dentist_id: ANA,    patient_name: 'Ana Blanco Moreno',            patient_phone: '656 222 333', patient_email: 'ana.blanco@email.com',       patient_birth_date: '1989-11-07', tratamiento: 'Consulta ortodoncia Invisalign',     fecha: '2026-08-10', hora: '16:00', duration_min: 60,  estado: 'pendiente',  source: 'whatsapp',   notes: null,                                             user_id: null, tipo: 'cita' },
  // ── Dra. Ana García — próximas ────────────────────────────────────────────
  { dentist_id: ANA,    patient_name: 'Roberto Aguilar Cano',         patient_phone: '678 333 444', patient_email: 'roberto.aguilar@email.com',  patient_birth_date: '2002-03-19', tratamiento: 'Ajuste ortodoncia',                  fecha: '2026-08-11', hora: '10:00', duration_min: 30,  estado: 'confirmada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: ANA,    patient_name: 'Natalia Herrero Montoya',      patient_phone: '600 444 555', patient_email: 'natalia.herrero@email.com',  patient_birth_date: '1997-06-24', tratamiento: 'Consulta ortodoncia',                fecha: '2026-08-12', hora: '09:00', duration_min: 60,  estado: 'pendiente',  source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: ANA,    patient_name: 'Daniel Rubio Pascual',         patient_phone: '622 555 666', patient_email: 'daniel.rubio@email.com',     patient_birth_date: '2001-01-31', tratamiento: 'Revisión Invisalign',                fecha: '2026-08-17', hora: '11:00', duration_min: 30,  estado: 'confirmada', source: 'telefono',   notes: null,                                             user_id: null, tipo: 'cita' },

  // ── Dr. Carlos Mendoza — pasado ───────────────────────────────────────────
  { dentist_id: MENDOZA,patient_name: 'Fernando Ibáñez Correa',       patient_phone: '644 666 777', patient_email: 'fernando.ibanez@email.com',  patient_birth_date: '1970-08-09', tratamiento: 'Implante dental — colocación',       fecha: '2026-08-01', hora: '10:00', duration_min: 180, estado: 'completada', source: 'presencial', notes: 'Paciente con diabetes controlada — protocolo especial', user_id: null, tipo: 'cita' },
  { dentist_id: MENDOZA,patient_name: 'Marina Vidal Fuente',          patient_phone: '666 777 888', patient_email: 'marina.vidal@email.com',     patient_birth_date: '1983-02-14', tratamiento: 'Revisión implante',                  fecha: '2026-08-04', hora: '12:00', duration_min: 30,  estado: 'completada', source: 'telefono',   notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: MENDOZA,patient_name: 'Hugo Romero Campos',           patient_phone: '688 888 999', patient_email: 'hugo.romero@email.com',      patient_birth_date: '1979-05-28', tratamiento: 'Corona sobre implante',              fecha: '2026-08-06', hora: '09:00', duration_min: 90,  estado: 'no_asistio', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: MENDOZA,patient_name: 'Claudia Núñez Reina',          patient_phone: '610 999 000', patient_email: 'claudia.nunez@email.com',    patient_birth_date: '1994-10-16', tratamiento: 'Consulta implantes',                 fecha: '2026-08-08', hora: '10:00', duration_min: 60,  estado: 'completada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  // ── Dr. Carlos Mendoza — hoy ──────────────────────────────────────────────
  { dentist_id: MENDOZA,patient_name: 'Beatriz Guerrero Prieto',      patient_phone: '632 000 111', patient_email: 'beatriz.guerrero@email.com', patient_birth_date: '1986-07-21', tratamiento: 'Implante dental — consulta inicial', fecha: '2026-08-10', hora: '09:30', duration_min: 60,  estado: 'confirmada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: MENDOZA,patient_name: 'Sergio Llorente Cabrera',      patient_phone: '654 111 222', patient_email: 'sergio.llorente@email.com',  patient_birth_date: '1981-03-06', tratamiento: 'Revisión implante',                  fecha: '2026-08-10', hora: '11:30', duration_min: 30,  estado: 'pendiente',  source: 'whatsapp',   notes: 'Molestias desde ayer',                           user_id: null, tipo: 'cita' },
  // ── Dr. Carlos Mendoza — próximas ────────────────────────────────────────
  { dentist_id: MENDOZA,patient_name: 'Inés Pardo Villanueva',        patient_phone: '676 222 333', patient_email: 'ines.pardo@email.com',       patient_birth_date: '1968-12-02', tratamiento: 'Implante dental — cirugía',           fecha: '2026-08-11', hora: '09:00', duration_min: 180, estado: 'confirmada', source: 'presencial', notes: 'Traer análisis de sangre reciente',               user_id: null, tipo: 'cita' },
  { dentist_id: MENDOZA,patient_name: 'Gonzalo Esteban Fuertes',      patient_phone: '698 333 444', patient_email: 'gonzalo.esteban@email.com',  patient_birth_date: '1955-04-17', tratamiento: 'Implantes múltiples — consulta',     fecha: '2026-08-13', hora: '10:00', duration_min: 90,  estado: 'pendiente',  source: 'telefono',   notes: null,                                             user_id: null, tipo: 'cita' },
  { dentist_id: MENDOZA,patient_name: 'Raquel Pedraza Simón',         patient_phone: '620 444 555', patient_email: 'raquel.pedraza@email.com',   patient_birth_date: '1991-09-09', tratamiento: 'Colocación corona',                  fecha: '2026-08-18', hora: '09:30', duration_min: 60,  estado: 'confirmada', source: 'web',        notes: null,                                             user_id: null, tipo: 'cita' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function findOrCreateAuthUser(
  email: string,
  password: string,
  extra: { full_name: string; dni: string },
): Promise<string> {
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  if (listErr) throw listErr

  const existing = list?.users?.find(u => u.email === email)
  if (existing) {
    console.log(`  ↩  Auth user ya existe: ${email}`)
    return existing.id
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: { full_name: extra.full_name, birth_date: '1980-01-01', dni: extra.dni },
  })
  if (error) {
    console.error(`  ❌  Error creando auth user ${email}:`, error.message, error.status)
    throw error
  }
  console.log(`  ✓  Auth user creado: ${email}`)
  return data.user.id
}

async function deleteOldAuthUsers() {
  const OLD_EMAILS = [
    'maria.garcia@dentaviva.es',
    'carlos.ruiz@dentaviva.es',
    'ana.fernandez@dentaviva.es',
  ]

  const { data: list } = await supabase.auth.admin.listUsers({ perPage: 1000 })
  for (const email of OLD_EMAILS) {
    const user = list?.users?.find(u => u.email === email)
    if (user) {
      const { error } = await supabase.auth.admin.deleteUser(user.id)
      if (error) console.warn(`  ⚠  No se pudo eliminar ${email}:`, error.message)
      else console.log(`  ✓  Auth user eliminado: ${email}`)
    }
  }
}

// ─── Seed functions ───────────────────────────────────────────────────────────

async function seedDentists() {
  for (const def of DENTIST_DEFS) {
    const authUserId = await findOrCreateAuthUser(def.email, def.password!, { full_name: def.name, dni: def.dni })

    // Update existing dentist row with auth user_id and professional email
    const { error } = await supabase
      .from('dentists')
      .update({ user_id: authUserId, email: def.email, name: def.name, specialty: def.specialty })
      .eq('id', def.dentistId)

    if (error) {
      console.error(`  ❌  Error actualizando dentista ${def.name}:`, error.message)
      throw error
    }
    console.log(`  ✓  Dentista vinculado: ${def.name}`)
  }
}

async function seedCitas() {
  const { error: delErr } = await supabase
    .from('citas')
    .delete()
    .in('dentist_id', [MENDOZA, ANA, TORRES])

  if (delErr) {
    console.error('  ❌  Error limpiando citas:', delErr.message)
    throw delErr
  }

  const { error } = await supabase.from('citas').insert(CITAS as never[])
  if (error) {
    console.error('  ❌  Error insertando citas:', error.message)
    throw error
  }
  console.log(`  ✓  ${CITAS.length} citas insertadas`)
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('\n🦷  DentalViva — Seed del panel de administración\n')

  console.log('→ Eliminando auth users del seed anterior…')
  await deleteOldAuthUsers()

  console.log('\n→ Creando cuentas auth y vinculando dentistas originales…')
  await seedDentists()

  console.log('\n→ Citas de ejemplo…')
  await seedCitas()

  console.log('\n✅  Seed completado.\n')
  console.log('Credenciales de desarrollo:')
  console.log('  Dr. Carlos Mendoza  → carlos.mendoza@dentaviva.es  / DentaViva2026!')
  console.log('  Dra. Ana García     → ana.garcia@dentaviva.es      / DentaViva2026!')
  console.log('  Dr. Luis Torres     → luis.torres@dentaviva.es     / DentaViva2026!')
  console.log()
}

main().catch(err => {
  console.error('\n❌  Error en el seed:', err)
  process.exit(1)
})
