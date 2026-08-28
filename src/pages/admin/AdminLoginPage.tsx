import { useState, FormEvent, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAdminAuth } from '../../admin/AdminAuthContext'

function DentalLogo({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#EBF4FF" />
      <path
        d="M16 7C12.5 7 10 9.5 10 12C10 13.5 10.5 15 11 16.5C11.7 18.5 12 20.5 12 22C12 23.1 12.9 24 14 24C15.1 24 16 23.1 16 22V20C16 20 16 22 18 22C19.1 22 20 23.1 20 22C20 20.5 20.3 18.5 21 16.5C21.5 15 22 13.5 22 12C22 9.5 19.5 7 16 7Z"
        fill="#2A7FD4"
      />
    </svg>
  )
}

export default function AdminLoginPage() {
  const navigate = useNavigate()
  const { dentist, loading } = useAdminAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!loading && dentist) navigate('/admin', { replace: true })
  }, [loading, dentist, navigate])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    if (!email.trim()) { setError('Introduce tu correo electrónico.'); return }
    if (!password) { setError('Introduce tu contraseña.'); return }

    setSubmitting(true)
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
      if (authError) throw authError
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg.includes('Invalid login credentials')
        ? 'Correo o contraseña incorrectos.'
        : 'No se pudo iniciar sesión. Inténtalo de nuevo.')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    /* Page — bg image + white overlay */
    <div className="relative min-h-screen flex items-center justify-center p-6">
      {/* Background image */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/backgrounds/bg-testimonios.webp')" }}
        aria-hidden="true"
      />
      {/* White overlay 90% */}
      <div className="absolute inset-0 bg-white/95" aria-hidden="true" />

      {/* Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-card p-10">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-8">
          <DentalLogo size={32} />
          <span className="text-body-lg font-bold text-text">DentalViva</span>
          <span className="ml-1 px-2 py-0.5 text-[11px] font-semibold bg-primary-light text-primary rounded-full tracking-wide uppercase">
            Admin
          </span>
        </div>

        <h1 className="text-h4 font-bold text-text mb-1">Acceso para dentistas</h1>
        <p className="text-muted text-body-sm mb-8">Introduce tus credenciales de clínica</p>

        <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-body-sm font-medium text-text mb-1.5">
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="tu.nombre@dentalviva.es"
              className="w-full px-4 py-3 rounded-xl border border-border text-text text-body-sm placeholder:text-muted/50
                focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
            />
          </div>

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
                className="w-full px-4 py-3 pr-12 rounded-xl border border-border text-text text-body-sm placeholder:text-muted/50
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

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-body-sm px-4 py-3 rounded-xl" role="alert">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary text-white font-semibold py-3 rounded-xl
              hover:bg-primary/90 active:scale-[0.99] transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting && (
              <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
            )}
            Iniciar sesión
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border">
          <Link to="/" className="text-body-sm text-muted hover:text-text transition-colors">
            ← Volver a la web
          </Link>
        </div>
      </div>
    </div>
  )
}
