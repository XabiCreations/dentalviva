import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { signUp, validateDni } from '../auth/authService'

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

interface FieldErrors {
  full_name?: string
  birth_date?: string
  dni?: string
  email?: string
  password?: string
  confirm_password?: string
}

function validate(fields: {
  full_name: string
  birth_date: string
  dni: string
  email: string
  password: string
  confirm_password: string
}): FieldErrors {
  const errors: FieldErrors = {}

  if (!fields.full_name.trim()) errors.full_name = 'El nombre es obligatorio.'
  if (!fields.birth_date) errors.birth_date = 'La fecha de nacimiento es obligatoria.'
  if (!fields.dni.trim()) {
    errors.dni = 'El DNI es obligatorio.'
  } else if (!validateDni(fields.dni.trim())) {
    errors.dni = 'El DNI no es válido.'
  }
  if (!fields.email.trim()) {
    errors.email = 'El correo es obligatorio.'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email)) {
    errors.email = 'El formato del correo no es válido.'
  }
  if (!fields.password) {
    errors.password = 'La contraseña es obligatoria.'
  } else if (fields.password.length < 8) {
    errors.password = 'Mínimo 8 caracteres.'
  } else if (!/[A-Z]/.test(fields.password)) {
    errors.password = 'Debe incluir al menos una mayúscula.'
  } else if (!/[0-9]/.test(fields.password)) {
    errors.password = 'Debe incluir al menos un número.'
  }
  if (!fields.confirm_password) {
    errors.confirm_password = 'Confirma tu contraseña.'
  } else if (fields.password !== fields.confirm_password) {
    errors.confirm_password = 'Las contraseñas no coinciden.'
  }

  return errors
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

export default function RegisterPage() {
  const navigate = useNavigate()
  const [fields, setFields] = useState({
    full_name: '', birth_date: '', dni: '', email: '', password: '', confirm_password: '',
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [serverError, setServerError] = useState('')
  const [loading, setLoading] = useState(false)

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFields(prev => ({ ...prev, [key]: e.target.value }))
    setFieldErrors(prev => ({ ...prev, [key]: undefined }))
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setServerError('')

    const errors = validate(fields)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return
    }

    setLoading(true)
    try {
      await signUp(fields)
      navigate('/', { replace: true })
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Error al crear la cuenta.')
    } finally {
      setLoading(false)
    }
  }

  const inputClass = (hasError?: string) =>
    `w-full px-4 py-3 rounded-xl border text-text text-sm placeholder:text-muted/50
    focus:outline-none focus:ring-2 transition-all ${
      hasError
        ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
        : 'border-border focus:border-primary focus:ring-primary/20'
    }`

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden">
        <div className="flex-1 relative">
          <img
            src="/images/backgrounds/background-image.webp"
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
            <span className="text-white text-xl font-bold">DentalViva</span>
          </div>
          <div className="border-l-4 border-white/30 pl-5">
            <p className="text-white/70 text-sm mb-1">Únete a</p>
            <h2 className="text-white text-2xl font-bold mb-2">Portal de Pacientes</h2>
            <p className="text-white/70 text-sm leading-relaxed">
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
            <span className="text-lg font-bold text-text">DentalViva</span>
          </Link>

          <h1 className="text-3xl font-bold text-text mb-1">Crear cuenta</h1>
          <p className="text-muted text-sm mb-8">Completa tus datos para registrarte</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
            {/* Full name */}
            <div>
              <label htmlFor="full_name" className="block text-sm font-medium text-text mb-1.5">
                Nombre completo
              </label>
              <input
                id="full_name"
                type="text"
                autoComplete="name"
                value={fields.full_name}
                onChange={set('full_name')}
                placeholder="Introduce tu nombre completo"
                className={inputClass(fieldErrors.full_name)}
              />
              <FieldError message={fieldErrors.full_name} />
            </div>

            {/* Birth date */}
            <div>
              <label htmlFor="birth_date" className="block text-sm font-medium text-text mb-1.5">
                Fecha de nacimiento
              </label>
              <input
                id="birth_date"
                type="date"
                value={fields.birth_date}
                onChange={set('birth_date')}
                max={new Date().toISOString().split('T')[0]}
                className={inputClass(fieldErrors.birth_date)}
              />
              <FieldError message={fieldErrors.birth_date} />
            </div>

            {/* DNI */}
            <div>
              <label htmlFor="dni" className="block text-sm font-medium text-text mb-1.5">
                DNI
              </label>
              <input
                id="dni"
                type="text"
                autoComplete="off"
                value={fields.dni}
                onChange={set('dni')}
                placeholder="12345678A"
                className={inputClass(fieldErrors.dni)}
              />
              <FieldError message={fieldErrors.dni} />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                value={fields.email}
                onChange={set('email')}
                placeholder="tuemail@ejemplo.com"
                className={inputClass(fieldErrors.email)}
              />
              <FieldError message={fieldErrors.email} />
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={fields.password}
                  onChange={set('password')}
                  placeholder="Crea una contraseña segura"
                  className={inputClass(fieldErrors.password) + ' pr-12'}
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
              <FieldError message={fieldErrors.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label htmlFor="confirm_password" className="block text-sm font-medium text-text mb-1.5">
                Confirmar contraseña
              </label>
              <div className="relative">
                <input
                  id="confirm_password"
                  type={showConfirm ? 'text' : 'password'}
                  autoComplete="new-password"
                  value={fields.confirm_password}
                  onChange={set('confirm_password')}
                  placeholder="Repite tu contraseña"
                  className={inputClass(fieldErrors.confirm_password) + ' pr-12'}
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
              <FieldError message={fieldErrors.confirm_password} />
            </div>

            {/* Server error */}
            {serverError && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
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

          <p className="mt-6 text-sm text-muted text-center">
            ¿Ya tienes cuenta?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>

          <div className="mt-6">
            <Link to="/" className="text-xs text-muted hover:text-text transition-colors">
              ← Volver a la web
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
