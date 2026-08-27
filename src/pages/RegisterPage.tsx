import { useState, useEffect, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, Check, AlertTriangle } from 'lucide-react'
import { signUp, validateDni } from '../auth/authService'
import { supabase } from '../lib/supabase'

const PASSWORD_CRITERIA = [
  { label: 'Mínimo 8 caracteres',           test: (p: string) => p.length >= 8 },
  { label: 'Al menos 1 símbolo (!,?,&,...)', test: (p: string) => /[!?,&.@#$%^*()\-_=+[\]{}|;'":<>/\\]/.test(p) },
  { label: 'Al menos una mayúscula',         test: (p: string) => /[A-Z]/.test(p) },
]

type PasswordState = 'pristine' | 'valid' | 'invalid' | 'empty'

function getPasswordState(password: string, touched: boolean): PasswordState {
  if (!touched && !password) return 'pristine'
  if (touched && !password) return 'empty'
  if (PASSWORD_CRITERIA.every(c => c.test(password))) return 'valid'
  return 'invalid'
}

function DentalLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#EBF4FF" />
      <path
        d="M16 7C12.5 7 10 9.5 10 12C10 13.5 10.5 15 11 16.5C11.7 18.5 12 20.5 12 22C12 23.1 12.9 24 14 24C15.1 24 16 23.1 16 22V20C16 20 16 22 18 22C19.1 22 20 23.1 20 22C20 20.5 20.3 18.5 21 16.5C21.5 15 22 13.5 22 12C22 9.5 19.5 7 16 7Z"
        fill="#2A7FD4"
      />
    </svg>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-body-sm text-red-600">{message}</p>
}

type Fields = {
  full_name: string
  last_name: string
  dni: string
  phone: string
  email: string
  password: string
  confirm_password: string
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fields, setFields] = useState<Fields>({
    full_name: '', last_name: '', dni: '', phone: '', email: '', password: '', confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [passwordTouched, setPasswordTouched] = useState(false)
  const [touched, setTouched] = useState<Set<keyof Fields>>(new Set())
  const [newsletter, setNewsletter] = useState(false)
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email.trim())
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)

  useEffect(() => {
    if (!hasValidEmail) { setIsSubscribed(null); return }
    const timer = setTimeout(async () => {
      try {
        const { data } = await supabase.rpc('is_email_subscribed', {
          p_email: fields.email.trim().toLowerCase(),
        })
        setIsSubscribed(data === true)
      } catch {
        setIsSubscribed(false)
      }
    }, 500)
    return () => clearTimeout(timer)
  }, [fields.email, hasValidEmail])

  const set = (key: keyof Fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields(prev => ({ ...prev, [key]: e.target.value }))
  }

  const touch = (key: keyof Fields) =>
    setTouched(prev => new Set([...prev, key]))

  function getLiveError(key: keyof Fields): string | undefined {
    const v = fields[key]
    switch (key) {
      case 'full_name':
        return !v.trim() ? 'El nombre es obligatorio.' : undefined
      case 'last_name':
        return !v.trim() ? 'El apellido es obligatorio.' : undefined
      case 'dni':
        if (!v.trim()) return 'El DNI es obligatorio.'
        return !validateDni(v.trim()) ? 'El DNI no es válido.' : undefined
      case 'phone':
        return !v.trim() ? 'El teléfono es obligatorio.' : undefined
      case 'email':
        return v.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
          ? 'El formato del correo no es válido.'
          : undefined
      case 'confirm_password':
        if (!v) return 'Confirma tu contraseña.'
        return v !== fields.password ? 'Las contraseñas no coinciden.' : undefined
      case 'password':
        return !PASSWORD_CRITERIA.every(c => c.test(v))
          ? 'La contraseña no cumple los requisitos.'
          : undefined
    }
  }

  const getError = (key: keyof Fields) =>
    touched.has(key) ? getLiveError(key) : undefined

  const isFieldValid = (key: keyof Fields): boolean => {
    if (!touched.has(key)) return false
    if (key === 'email' && !fields[key].trim()) return false
    return getLiveError(key) === undefined
  }

  const fieldBorder = (key: keyof Fields): string => {
    if (getError(key)) return 'border-red-400 focus:border-red-400 focus:ring-red-200'
    if (isFieldValid(key)) return 'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200'
    return 'border-border focus:border-primary focus:ring-primary/20'
  }

  const fieldClass = (key: keyof Fields, extra = '') =>
    `w-full px-4 py-3 rounded-xl border text-text text-body-sm placeholder:text-muted focus:outline-none focus:ring-2 transition-all ${extra} ${fieldBorder(key)}`

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    const allKeys = Object.keys(fields) as Array<keyof Fields>
    setTouched(new Set(allKeys))
    setPasswordTouched(true)

    const hasErrors = allKeys.some(k => getLiveError(k) !== undefined)
    if (hasErrors) return

    setLoading(true)
    try {
      await signUp({ ...fields, newsletter: hasValidEmail && !isSubscribed && newsletter })
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden">
        <div className="flex-1 relative">
          <img
            src="/images/backgrounds/bg-login.webp"
            alt="Clínica dental DentalViva"
            className="absolute inset-0 w-full h-full object-cover object-[80%_center]"
          />
        </div>
        <div className="bg-primary p-10 shrink-0">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <svg width="20" height="20" viewBox="0 0 32 32" fill="none">
                <path
                  d="M16 7C12.5 7 10 9.5 10 12C10 13.5 10.5 15 11 16.5C11.7 18.5 12 20.5 12 22C12 23.1 12.9 24 14 24C15.1 24 16 23.1 16 22V20C16 20 16 22 18 22C19.1 22 20 23.1 20 22C20 20.5 20.3 18.5 21 16.5C21.5 15 22 13.5 22 12C22 9.5 19.5 7 16 7Z"
                  fill="white"
                />
              </svg>
            </div>
            <span className="text-white text-body-lg font-bold">DentalViva</span>
          </div>
          <div className="border-l-4 border-white/30 pl-5">
            <p className="text-white/70 text-body-sm mb-1">Únete a</p>
            <h2 className="text-white text-h5 font-bold mb-2">Portal de Pacientes</h2>
            <p className="text-white/70 text-body-sm leading-relaxed">
              Crea tu cuenta y accede a tu historial clínico, citas y seguimiento de tratamientos.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-8">
          <Link to="/" className="flex items-center gap-2 mb-8">
            <DentalLogo />
            <span className="text-body-lg font-bold text-text">DentalViva</span>
          </Link>

          <h1 className="text-h4 font-bold text-text mb-1">Crear cuenta</h1>
          <p className="text-muted text-body-sm mb-8">Completa tus datos para registrarte</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Nombre + Apellido */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="full_name" className="block text-body-sm font-medium text-text mb-1.5">
                  Nombre
                </label>
                <input
                  id="full_name"
                  type="text"
                  autoComplete="given-name"
                  value={fields.full_name}
                  onChange={set('full_name')}
                  onBlur={() => touch('full_name')}
                  placeholder="Nombre"
                  className={fieldClass('full_name')}
                />
                <FieldError message={getError('full_name')} />
              </div>
              <div>
                <label htmlFor="last_name" className="block text-body-sm font-medium text-text mb-1.5">
                  Apellido
                </label>
                <input
                  id="last_name"
                  type="text"
                  autoComplete="family-name"
                  value={fields.last_name}
                  onChange={set('last_name')}
                  onBlur={() => touch('last_name')}
                  placeholder="Apellido"
                  className={fieldClass('last_name')}
                />
                <FieldError message={getError('last_name')} />
              </div>
            </div>

            {/* DNI + Teléfono */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="dni" className="block text-body-sm font-medium text-text mb-1.5">
                  DNI
                </label>
                <input
                  id="dni"
                  type="text"
                  autoComplete="off"
                  value={fields.dni}
                  onChange={set('dni')}
                  onBlur={() => touch('dni')}
                  placeholder="12345678A"
                  className={fieldClass('dni')}
                />
                <FieldError message={getError('dni')} />
              </div>
              <div>
                <label htmlFor="phone" className="block text-body-sm font-medium text-text mb-1.5">
                  Teléfono
                </label>
                <input
                  id="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={9}
                  value={fields.phone}
                  onChange={set('phone')}
                  onBlur={() => touch('phone')}
                  placeholder="123 456 789"
                  className={fieldClass('phone')}
                />
                <FieldError message={getError('phone')} />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-body-sm font-medium text-text mb-1.5">
                Correo electrónico <span className="text-muted font-normal">(opcional)</span>
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={fields.email}
                onChange={set('email')}
                onBlur={() => touch('email')}
                placeholder="tu@gmail.com"
                className={fieldClass('email')}
              />
              <FieldError message={getError('email')} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-body-sm font-medium text-text mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={fields.password}
                  onChange={set('password')}
                  onBlur={() => setPasswordTouched(true)}
                  placeholder="Introduce una contraseña"
                  className={(() => {
                    const state = getPasswordState(fields.password, passwordTouched)
                    const border = {
                      pristine: 'border-border focus:border-primary focus:ring-primary/20',
                      valid:    'border-emerald-500 focus:border-emerald-500 focus:ring-emerald-200',
                      invalid:  'border-red-400 focus:border-red-400 focus:ring-red-200',
                      empty:    'border-amber-400 focus:border-amber-400 focus:ring-amber-200',
                    }[state]
                    return `w-full px-4 py-3 pr-12 rounded-xl border text-text text-body-sm placeholder:text-muted focus:outline-none focus:ring-2 transition-all ${border}`
                  })()}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                  aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Feedback en tiempo real */}
              <div className="mt-2 flex flex-col gap-1.5">
                {getPasswordState(fields.password, passwordTouched) === 'empty' && (
                  <p className="flex items-center gap-1.5 text-body-sm text-amber-600">
                    <AlertTriangle size={13} strokeWidth={2} className="shrink-0" />
                    Introduce tu contraseña
                  </p>
                )}
                {PASSWORD_CRITERIA.map(({ label, test }) => {
                  const met = fields.password ? test(fields.password) : false
                  const color = !fields.password ? 'text-muted' : met ? 'text-emerald-600' : 'text-red-600'
                  return (
                    <p key={label} className={`flex items-center gap-1.5 text-body-sm ${color}`}>
                      <Check size={13} strokeWidth={2.5} className="shrink-0" />
                      {label}
                    </p>
                  )
                })}
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm_password" className="block text-body-sm font-medium text-text mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={fields.confirm_password}
                  onChange={set('confirm_password')}
                  onBlur={() => touch('confirm_password')}
                  placeholder="Repite la contraseña"
                  className={fieldClass('confirm_password', 'pr-12')}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(v => !v)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                  aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                >
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <FieldError message={getError('confirm_password')} />
            </div>

            {/* Newsletter opt-in */}
            {hasValidEmail && isSubscribed === false && (
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative flex-shrink-0 mt-0.5">
                  <input
                    type="checkbox"
                    checked={newsletter}
                    onChange={e => setNewsletter(e.target.checked)}
                    className="peer sr-only"
                  />
                  <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all
                    ${newsletter
                      ? 'bg-primary border-primary'
                      : 'border-border bg-white group-hover:border-primary/50'
                    }`}
                  >
                    {newsletter && (
                      <svg width="11" height="8" viewBox="0 0 11 8" fill="none">
                        <path d="M1 4L4 7L10 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                </div>
                <span className="text-body-sm text-muted leading-snug group-hover:text-text transition-colors">
                  Quiero recibir consejos semanales para cuidar mi boca
                </span>
              </label>
            )}

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-body-sm px-4 py-3 rounded-xl">
                {serverError}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl mt-1
                hover:bg-primary/90 active:scale-[0.99] transition-all duration-150
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              Crear cuenta
            </button>
          </form>

          <p className="mt-6 text-body-sm text-muted text-center">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>

          <div className="mt-6">
            <Link to="/" className="text-body-sm text-muted hover:text-text transition-colors">
              ← Volver a la web
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
