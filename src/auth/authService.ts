import { supabase } from '../lib/supabase'
import type { LoginCredentials, RegisterCredentials, Profile } from '../types/user'
import { subscribeNewsletter } from '../services/newsletterService'

const DNI_REGEX = /^[0-9]{8}[A-Za-z]$/

const capitalize = (s: string) =>
  s.trim().replace(/\b\w/g, c => c.toUpperCase())

export function validateDni(dni: string): boolean {
  return DNI_REGEX.test(dni.trim())
}

export function isDniFormat(value: string): boolean {
  return DNI_REGEX.test(value.trim())
}

export async function signIn({ identifier, password }: LoginCredentials) {
  let email = identifier

  if (isDniFormat(identifier)) {
    const { data: dniEmail, error: dniError } = await supabase
      .rpc('get_email_by_dni', { p_dni: identifier })

    if (dniError || !dniEmail) {
      throw new Error('No se encontró ninguna cuenta con ese DNI.')
    }

    email = dniEmail
  }

  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error(translateAuthError(error.message))
  return data
}

export async function signUp(credentials: RegisterCredentials) {
  const { full_name, last_name, dni, email, password, phone, newsletter } = credentials
  const normalizedName     = capitalize(full_name)
  const normalizedLastName = last_name?.trim() ? capitalize(last_name) : ''
  const displayName = normalizedLastName
    ? `${normalizedName} ${normalizedLastName}`
    : normalizedName

  // Si no hay email real, generamos uno interno basado en el DNI para Supabase auth
  const authEmail = email?.trim() || `${dni.toLowerCase().replace(/\W/g, '')}@patients.dentaviva.es`

  // Si hay email real, verificar si existe una cuenta fantasma y limpiarla
  if (email?.trim()) {
    const { data: checkResult, error: checkError } = await supabase.rpc('cleanup_ghost_account', {
      p_email: authEmail,
    })
    if (!checkError && checkResult === 'has_account') {
      throw new Error('Ya existe una cuenta con ese correo electrónico.')
    }
    // 'available' o 'ghost_cleaned' → continúa con el registro
  }

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email: authEmail,
    password,
    options: {
      data: {
        full_name: normalizedName,
        last_name: normalizedLastName,
        dni,
        phone: phone?.trim() || null,
      },
    },
  })

  if (authError) throw new Error(translateAuthError(authError.message))
  if (!authData.user) throw new Error('No se pudo crear el usuario.')

  // Actualizar last_name y phone en el perfil (el trigger crea el perfil con full_name)
  const profileUpdate: { last_name?: string; phone?: string } = {}
  if (normalizedLastName) profileUpdate.last_name = normalizedLastName
  if (phone?.trim()) profileUpdate.phone = phone.trim()
  if (Object.keys(profileUpdate).length > 0) {
    await supabase.from('profiles').update(profileUpdate).eq('id', authData.user.id)
  }

  // Link newsletter subscription via SECURITY DEFINER RPC (bypasses RLS)
  if (email?.trim()) {
    await supabase.rpc('link_newsletter_subscription', {
      p_email:     email.trim().toLowerCase(),
      p_user_id:   authData.user.id,
      p_full_name: displayName,
    })
  }

  // Suscribir al newsletter si el usuario marcó el checkbox (error silencioso — no bloquea el registro)
  if (newsletter && email?.trim()) {
    try {
      await subscribeNewsletter(displayName, email.trim().toLowerCase())
    } catch (err) {
      console.error('[signUp] Newsletter subscription failed silently:', err)
    }
  }

  return authData
}

export async function signOut() {
  const { showLogoutOverlay } = await import('../lib/logoutOverlay')
  await showLogoutOverlay()
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
