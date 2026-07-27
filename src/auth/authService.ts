import { supabase } from '../lib/supabase'
import type { LoginCredentials, RegisterCredentials, Profile } from '../types/user'

const DNI_REGEX = /^[0-9]{8}[A-Za-z]$/

export function validateDni(dni: string): boolean {
  return DNI_REGEX.test(dni.trim())
}

export function isDniFormat(value: string): boolean {
  return DNI_REGEX.test(value.trim())
}

export async function signIn({ identifier, password }: LoginCredentials) {
  let email = identifier

  if (isDniFormat(identifier)) {
    const { data, error } = await supabase
      .from('profiles')
      .select('email')
      .eq('dni', identifier.toUpperCase())
      .single()

    if (error || !data) {
      throw new Error('No se encontró ninguna cuenta con ese DNI.')
    }
    email = data.email
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(translateAuthError(error.message))
  return data
}

export async function signUp(credentials: RegisterCredentials) {
  const { full_name, birth_date, dni, email, password } = credentials

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name, birth_date, dni },
    },
  })

  if (authError) throw new Error(translateAuthError(authError.message))
  if (!authData.user) throw new Error('No se pudo crear el usuario.')

  return authData
}

export async function signOut() {
  const { error } = await supabase.auth.signOut()
  if (error) throw new Error(error.message)
}

export async function getProfile(userId: string): Promise<Profile> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error || !data) throw new Error('No se pudo obtener el perfil del usuario.')
  return data
}

function translateAuthError(message: string): string {
  if (message.includes('Invalid login credentials')) return 'Correo, DNI o contraseña incorrectos.'
  if (message.includes('Email not confirmed')) return 'Confirma tu correo electrónico antes de iniciar sesión.'
  if (message.includes('User already registered')) return 'Ya existe una cuenta con ese correo electrónico.'
  if (message.includes('Password should be at least')) return 'La contraseña debe tener al menos 6 caracteres.'
  if (message.includes('after') && message.includes('second')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  if (message.includes('rate limit') || message.includes('too many requests')) return 'Demasiados intentos. Espera un momento e inténtalo de nuevo.'
  return message
}
