import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { LogOut, CalendarDays, ClipboardList, User, Clock, Stethoscope } from 'lucide-react'
import { useAuth } from '../auth/AuthContext'
import { signOut } from '../auth/authService'
import { getCitasByUser, cancelCita, type Cita, type EstadoCita } from '../services/citasService'

// ── Helpers ───────────────────────────────────────────────────────────────────

function formatFecha(fechaStr: string): string {
  return new Date(fechaStr + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function canCancel(cita: Cita): boolean {
  if (cita.estado !== 'pendiente') return false
  const diffMs = Date.now() - new Date(cita.created_at).getTime()
  return diffMs < 24 * 60 * 60 * 1000
}

// ── Sub-components ────────────────────────────────────────────────────────────

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

const ESTADO_CONFIG: Record<EstadoCita | string, { label: string; className: string }> = {
  pendiente:  { label: 'Pendiente',  className: 'bg-amber-100 text-amber-700' },
  confirmada: { label: 'Confirmada', className: 'bg-blue-100 text-blue-700' },
  cancelada:  { label: 'Cancelada',  className: 'bg-gray-100 text-gray-500' },
  realizada:  { label: 'Realizada',  className: 'bg-green-100 text-green-700' },
}

function EstadoBadge({ estado }: { estado: string }) {
  const config = ESTADO_CONFIG[estado] ?? ESTADO_CONFIG['pendiente']
  return (
    <span className={['inline-block text-body-sm font-semibold px-2.5 py-1 rounded-full', config.className].join(' ')}>
      {config.label}
    </span>
  )
}

interface CitaCardProps {
  cita: Cita
  onCancel: (id: string) => Promise<void>
}

function CitaCard({ cita, onCancel }: CitaCardProps) {
  const [confirming, setConfirming] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const tratamiento = cita.tratamiento?.trim() || 'Sin especificar'
  const dentistaNombre = cita.dentist?.name ?? 'Por asignar'
  const dentistaEspecialidad = cita.dentist?.specialty

  const handleCancel = async () => {
    setCancelling(true)
    setError(null)
    try {
      await onCancel(cita.id)
    } catch {
      setError('No se pudo cancelar. Inténtalo de nuevo.')
    } finally {
      setCancelling(false)
      setConfirming(false)
    }
  }

  return (
    <article className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
      {/* Top bar: estado + acción */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-border/60">
        <EstadoBadge estado={cita.estado ?? 'pendiente'} />

        {canCancel(cita) && !confirming && (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="text-body-sm text-muted hover:text-red-600 font-medium transition-colors duration-150"
          >
            Cancelar reserva
          </button>
        )}

        {confirming && (
          <div className="flex items-center gap-3">
            <span className="text-body-sm text-text">¿Confirmar cancelación?</span>
            <button
              type="button"
              onClick={handleCancel}
              disabled={cancelling}
              className="text-body-sm font-semibold text-red-600 hover:text-red-700 disabled:opacity-50 transition-colors"
            >
              {cancelling ? 'Cancelando…' : 'Sí, cancelar'}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="text-body-sm text-muted hover:text-text transition-colors"
            >
              No
            </button>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Tratamiento */}
        <div className="flex items-start gap-3">
          <Stethoscope size={15} className="text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-[11px] text-muted font-medium uppercase tracking-wide mb-0.5">Tratamiento</p>
            <p className="text-body-sm font-semibold text-text">{tratamiento}</p>
          </div>
        </div>

        {/* Profesional */}
        <div className="flex items-start gap-3">
          <User size={15} className="text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-[11px] text-muted font-medium uppercase tracking-wide mb-0.5">Profesional</p>
            <p className="text-body-sm font-semibold text-text">{dentistaNombre}</p>
            {dentistaEspecialidad && (
              <p className="text-body-sm text-muted mt-0.5">{dentistaEspecialidad}</p>
            )}
          </div>
        </div>

        {/* Fecha */}
        <div className="flex items-start gap-3">
          <CalendarDays size={15} className="text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-[11px] text-muted font-medium uppercase tracking-wide mb-0.5">Fecha</p>
            <p className="text-body-sm font-semibold text-text capitalize">{formatFecha(cita.fecha)}</p>
          </div>
        </div>

        {/* Hora */}
        <div className="flex items-start gap-3">
          <Clock size={15} className="text-primary mt-0.5 shrink-0" strokeWidth={1.5} />
          <div>
            <p className="text-[11px] text-muted font-medium uppercase tracking-wide mb-0.5">Hora</p>
            <p className="text-body-sm font-semibold text-text">{cita.hora}</p>
          </div>
        </div>
      </div>

      {error && (
        <p className="px-5 pb-4 text-body-sm text-red-600">{error}</p>
      )}
    </article>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function HistorialPage() {
  const { user, loading: authLoading } = useAuth()
  const [citas, setCitas] = useState<Cita[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (authLoading || !user) return
    let cancelled = false

    async function fetchCitas() {
      try {
        setIsLoading(true)
        setError(null)
        const result = await getCitasByUser(user!.id)
        if (!cancelled) setCitas(result)
      } catch {
        if (!cancelled) setError('No se pudo cargar el historial. Inténtalo de nuevo.')
      } finally {
        if (!cancelled) setIsLoading(false)
      }
    }

    fetchCitas()
    return () => { cancelled = true }
  }, [user, authLoading])

  const handleCancel = async (citaId: string) => {
    await cancelCita(citaId)
    setCitas(prev =>
      prev.map(c => c.id === citaId ? { ...c, estado: 'cancelada' } : c)
    )
  }

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" aria-label="Cargando historial" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-border px-6 py-4 flex items-center justify-between shadow-nav">
        <Link to="/" className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg">
          <DentalLogo />
          <span className="text-body-sm font-bold text-text">DentalViva</span>
        </Link>
        <button
          onClick={() => signOut()}
          className="flex items-center gap-2 text-body-sm text-muted hover:text-text px-4 py-2 rounded-xl border border-border hover:border-border/80 transition-all duration-150"
        >
          <LogOut size={14} strokeWidth={1.5} />
          Cerrar sesión
        </button>
      </header>

      {/* Main */}
      <main className="flex-1 px-4 py-10 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <ClipboardList size={22} strokeWidth={1.5} className="text-primary shrink-0" />
            <h1 className="text-h5 font-bold text-text">Mi historial</h1>
          </div>
          <p className="text-muted text-body-sm mb-8 ml-9">Todas tus citas reservadas.</p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl px-5 py-4 text-body-sm text-red-700" role="alert">
              {error}
            </div>
          )}

          {!error && citas.length === 0 && (
            <div className="bg-white border border-border rounded-2xl shadow-card px-6 py-12 text-center">
              <CalendarDays size={40} strokeWidth={1} className="text-border mx-auto mb-4" />
              <p className="text-text font-medium mb-1">Todavía no tienes citas registradas</p>
              <p className="text-muted text-body-sm">Cuando reserves una cita, aparecerá aquí.</p>
            </div>
          )}

          {!error && citas.length > 0 && (
            <ol className="flex flex-col gap-4" aria-label="Listado de citas">
              {citas.map(cita => (
                <li key={cita.id}>
                  <CitaCard cita={cita} onCancel={handleCancel} />
                </li>
              ))}
            </ol>
          )}

          <div className="mt-10 text-center">
            <Link to="/" className="inline-block text-body-sm text-primary font-medium hover:underline">
              &larr; Volver a la web
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
