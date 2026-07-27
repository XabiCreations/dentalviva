import { Link } from 'react-router-dom'
import { LogOut, CheckCircle } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { signOut } from '../auth/authService'

function DentalLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#EBF4FF" />
      <path
        d="M16 7C12.5 7 10 9.5 10 12C10 13.5 10.5 15 11 16.5C11.7 18.5 12 20.5 12 22C12 23.1 12.9 24 14 24C15.1 24 16 23.1 16 22V20C16 20 16 22 18 22C19.1 22 20 23.1 20 22C20 20.5 20.3 18.5 21 16.5C21.5 15 22 13.5 22 12C22 9.5 19.5 7 16 7Z"
        fill="#2A7FD4"
      />
    </svg>
  )
}

export default function UserPortalPage() {
  const { profile, loading } = useAuth()

  const handleSignOut = async () => {
    await signOut()
    // AuthContext listener will clear state; redirect happens via ProtectedRoute
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between shadow-nav">
        <Link to="/" className="flex items-center gap-2">
          <DentalLogo />
          <span className="text-base font-bold text-text">DentalViva</span>
        </Link>
        <button
          onClick={handleSignOut}
          className="flex items-center gap-2 text-sm text-muted hover:text-text
            px-4 py-2 rounded-xl border border-border hover:border-border/80
            transition-all duration-150"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </div>

          <h1 className="text-h2 text-text font-bold mb-2">
            Has entrado con éxito
          </h1>

          <p className="text-muted text-lg">
            Bienvenido,{' '}
            <span className="font-semibold text-text">
              {profile?.full_name ?? '—'}
            </span>
          </p>

          <p className="text-muted text-sm mt-6">
            Tu portal de paciente está en construcción. Próximamente podrás consultar tus citas, historial clínico y resultados.
          </p>

          <Link
            to="/"
            className="inline-block mt-8 text-sm text-primary font-medium hover:underline"
          >
            ← Volver a la web
          </Link>
        </div>
      </main>
    </div>
  )
}
