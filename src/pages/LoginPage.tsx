import { useState, FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { signIn } from '../auth/authService'

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

export default function LoginPage() {
  const navigate = useNavigate()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (!identifier.trim()) { setError('Introduce tu correo o DNI.'); return }
    if (!password) { setError('Introduce tu contraseña.'); return }

    setLoading(true)
    try {
      await signIn({ identifier: identifier.trim(), password })
      navigate('/', { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al iniciar sesión.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-[45%] flex-col relative overflow-hidden">
        {/* Dental image */}
        <div className="flex-1 relative">
          <img
            src="/images/backgrounds/bg-login.webp"
            alt="Clínica dental DentalViva"
            className="absolute inset-0 w-full h-full object-cover object-[80%_center]"
          />
        </div>
        {/* Brand panel */}
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
            <p className="text-white/70 text-body-sm mb-1">Bienvenido a</p>
            <h2 className="text-white text-h5 font-bold mb-2">Portal de Pacientes</h2>
            <p className="text-white/70 text-body-sm leading-relaxed">
              Accede a tu historial, citas y resultados de tratamiento desde un solo lugar.
            </p>
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <Link to="/" className="lg:hidden flex items-center gap-2 mb-8">
            <DentalLogo />
            <span className="text-body-lg font-bold text-text">DentalViva</span>
          </Link>

          {/* Logo desktop */}
          <Link to="/" className="hidden lg:flex items-center gap-2 mb-8">
            <DentalLogo />
            <span className="text-body-lg font-bold text-text">DentalViva</span>
          </Link>

          <h1 className="text-h4 font-bold text-text mb-1">Acceder</h1>
          <p className="text-muted text-body-sm mb-8">Introduce tus datos para acceder a tu cuenta</p>

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Identifier */}
            <div>
              <label htmlFor="identifier" className="block text-body-sm font-medium text-text mb-1.5">
                Correo electrónico o DNI
              </label>
              <input
                id="identifier"
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={e => setIdentifier(e.target.value)}
                placeholder="Correo electrónico o DNI"
                className="w-full px-4 py-3 rounded-xl border border-border text-text text-body-sm placeholder:text-muted
                  focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
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
                  autoComplete="current-password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Introduce tu contraseña"
                  className="w-full px-4 py-3 pr-12 rounded-xl border border-border text-text text-body-sm placeholder:text-muted
                    focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
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

            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-body-sm px-4 py-3 rounded-xl">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-semibold py-3 rounded-xl
                hover:bg-primary/90 active:scale-[0.99] transition-all duration-150
                disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              )}
              Iniciar sesión
            </button>
          </form>

          <p className="mt-6 text-body-sm text-muted text-center">
            ¿No tienes cuenta?{' '}
            <Link to="/registro" className="text-primary font-semibold hover:underline">
              Regístrate
            </Link>
          </p>

          <div className="mt-8">
            <Link to="/" className="text-body-sm text-muted hover:text-text transition-colors">
              ← Volver a la web
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
