import { useState, useEffect, useCallback } from 'react'
import {
  Phone, Clock, Stethoscope, CheckCircle,
  Calendar, MessageSquare, UserX,
} from 'lucide-react'
import { useAdminAuth } from '../../admin/AdminAuthContext'
import { Toast, type ToastData } from '../../admin/Toast'
import { ApproveButton, RejectButton, CallButton, EmailButton, RefreshButton } from '../../components/admin/ActionIconButtons'
import {
  getUpcomingAppointments,
  getPendingAppointments,
  updateAppointmentStatus,
} from '../../services/adminService'
import type { AdminAppointment } from '../../types/admin'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (name ?? '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]
function avatarColor(name: string): string {
  return AVATAR_COLORS[(name ?? ' ').charCodeAt(0) % AVATAR_COLORS.length]
}

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    weekday: 'short', day: 'numeric', month: 'short',
  })
}

function hm(hora: string): string {
  return hora.slice(0, 5)
}

// ─── ConfirmModal ─────────────────────────────────────────────────────────────

interface ConfirmModalProps {
  title: string
  description: string
  confirmLabel: string
  confirmClassName: string
  icon: React.ReactNode
  onConfirm: () => void
  onCancel: () => void
}

function ConfirmModal({ title, description, confirmLabel, confirmClassName, icon, onConfirm, onCancel }: ConfirmModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-xs p-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="mb-4">{icon}</div>
        <h3 className="text-body-lg font-bold text-text mb-1">{title}</h3>
        <p className="text-body-sm text-muted mb-6">{description}</p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl border border-border text-body-sm font-medium text-text hover:bg-surface transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className={`flex-1 py-2.5 rounded-xl text-body-sm font-semibold transition-colors ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── NextPatientCard ──────────────────────────────────────────────────────────

interface NextPatientCardProps {
  dentistId: string
  onToast: (t: ToastData) => void
  reloadTrigger?: number
}

function NextPatientCard({ dentistId, onToast, reloadTrigger }: NextPatientCardProps) {
  const [citas, setCitas] = useState<AdminAppointment[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [completing, setCompleting]         = useState(false)
  const [noAsisting, setNoAsisting]         = useState(false)
  const [pendingAction, setPendingAction]   = useState<'completada' | 'ausente' | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const list = await getUpcomingAppointments(dentistId)
      setCitas(list)
      setIndex(0)
    } finally {
      setLoading(false)
    }
  }, [dentistId])

  useEffect(() => { load() }, [load, reloadTrigger])

  const cita = citas[index] ?? null
  const hasPrev = index > 0
  const hasNext = index < citas.length - 1

  const handleComplete = async () => {
    if (!cita) return
    setCompleting(true)
    try {
      await updateAppointmentStatus(cita.id, 'completada')
      onToast({ message: 'Cita marcada como completada.', type: 'success' })
      await load()
    } catch {
      onToast({ message: 'No se pudo actualizar la cita.', type: 'error' })
    } finally {
      setCompleting(false)
    }
  }

  const handleNoAsistio = async () => {
    if (!cita) return
    setNoAsisting(true)
    try {
      await updateAppointmentStatus(cita.id, 'no_asistio')
      onToast({ message: 'Paciente marcado como ausente.', type: 'error' })
      await load()
    } catch {
      onToast({ message: 'No se pudo actualizar la cita.', type: 'error' })
    } finally {
      setNoAsisting(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white border border-border rounded-2xl shadow-card flex items-center justify-center h-[320px]">
        <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      </div>
    )
  }

  if (!cita) {
    return (
      <div className="bg-white border border-border rounded-2xl shadow-card flex flex-col items-center justify-center h-[320px] text-center px-6">
        <Calendar size={40} strokeWidth={1} className="text-border mb-4" />
        <p className="text-text font-semibold mb-1">No hay más citas hoy</p>
        <p className="text-muted text-body-sm">La agenda del día está libre.</p>
      </div>
    )
  }

  return (
    <>
    <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden h-[320px] flex flex-col">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
        <h2 className="text-body-sm font-semibold text-text">Siguiente paciente</h2>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIndex(i => i - 1)}
            disabled={!hasPrev}
            className="px-3 py-1.5 rounded-xl bg-surface text-primary text-body-sm font-medium
              hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Ver anterior
          </button>
          <span className="text-body-sm text-muted tabular-nums px-1">{index + 1} / {citas.length}</span>
          <button
            onClick={() => setIndex(i => i + 1)}
            disabled={!hasNext}
            className="px-3 py-1.5 rounded-xl bg-surface text-primary text-body-sm font-medium
              hover:bg-border transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Ver siguiente
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-6 flex-1 min-h-0 overflow-y-auto flex flex-col">
        {/* Avatar + name */}
        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-h5 font-bold shrink-0 ${avatarColor(cita.patient_name ?? '')}`}>
            {getInitials(cita.patient_name ?? '?')}
          </div>
          <div className="min-w-0">
            <p className="text-h5 font-bold text-text leading-tight truncate">{cita.patient_name}</p>
          </div>
        </div>

        {/* Cita details */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center gap-2.5">
            <Stethoscope size={14} className="text-muted shrink-0" strokeWidth={1.5} />
            <span className="text-body-sm text-text font-medium">{cita.tratamiento ?? 'Sin especificar'}</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Clock size={14} className="text-muted shrink-0" strokeWidth={1.5} />
            <span className="text-body-sm text-text">
              {cita.hora.slice(0, 5)}
              <span className="text-muted ml-1.5">· {cita.duration_min} min</span>
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1 mt-auto">
          <button
            onClick={() => setPendingAction('completada')}
            disabled={completing || noAsisting}
            className="flex-1 flex items-center justify-center gap-2 bg-primary text-white text-body-sm font-semibold
              py-2.5 rounded-xl hover:bg-primary/90 active:scale-[0.99] transition-all duration-150
              disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {completing
              ? <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              : <CheckCircle size={15} strokeWidth={2} />
            }
            Completada
          </button>
          <button
            onClick={() => setPendingAction('ausente')}
            disabled={noAsisting || completing}
            className="flex items-center justify-center gap-2 border border-border text-text text-body-sm font-medium
              px-4 py-2.5 rounded-xl hover:bg-surface transition-all duration-150
              disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {noAsisting
              ? <span className="w-4 h-4 rounded-full border-2 border-border border-t-muted animate-spin" />
              : <UserX size={15} strokeWidth={1.75} />
            }
            Ausente
          </button>
          {cita.patient_phone ? (
            <a
              href={`tel:${cita.patient_phone.replace(/\s/g, '')}`}
              className="flex items-center justify-center gap-2 border border-border text-text text-body-sm font-medium
                px-4 py-2.5 rounded-xl hover:bg-surface transition-all duration-150"
            >
              <Phone size={15} strokeWidth={1.75} />
              Llamar
            </a>
          ) : (
            <button disabled className="flex items-center justify-center gap-2 border border-border text-text text-body-sm font-medium
              px-4 py-2.5 rounded-xl opacity-40 cursor-not-allowed">
              <Phone size={15} strokeWidth={1.75} />
              Llamar
            </button>
          )}
          {cita.patient_email ? (
            <a
              href={`mailto:${cita.patient_email}`}
              className="flex items-center justify-center gap-2 border border-border text-text text-body-sm font-medium
                px-4 py-2.5 rounded-xl hover:bg-surface transition-all duration-150"
            >
              <MessageSquare size={15} strokeWidth={1.75} />
              Mensaje
            </a>
          ) : (
            <button disabled className="flex items-center justify-center gap-2 border border-border text-text text-body-sm font-medium
              px-4 py-2.5 rounded-xl opacity-40 cursor-not-allowed">
              <MessageSquare size={15} strokeWidth={1.75} />
              Mensaje
            </button>
          )}
        </div>

      </div>
    </div>

    {pendingAction === 'completada' && (
      <ConfirmModal
        icon={<CheckCircle size={28} className="text-primary" strokeWidth={1.75} />}
        title="Marcar como completada"
        description="¿Confirmas que la cita ha finalizado correctamente?"
        confirmLabel="Completada"
        confirmClassName="bg-primary text-white hover:bg-primary/90"
        onConfirm={() => { setPendingAction(null); handleComplete() }}
        onCancel={() => setPendingAction(null)}
      />
    )}

    {pendingAction === 'ausente' && (
      <ConfirmModal
        icon={<UserX size={28} className="text-muted" strokeWidth={1.75} />}
        title="Marcar como ausente"
        description="¿Confirmas que el paciente no se ha presentado a la cita?"
        confirmLabel="Ausente"
        confirmClassName="bg-surface border border-border text-text hover:bg-border"
        onConfirm={() => { setPendingAction(null); handleNoAsistio() }}
        onCancel={() => setPendingAction(null)}
      />
    )}
    </>
  )
}

// ─── PendingCard ──────────────────────────────────────────────────────────────

interface PendingCardProps {
  dentistId: string
  onToast: (t: ToastData) => void
  onApproved?: () => void
}

function PendingCard({ dentistId, onToast, onApproved }: PendingCardProps) {
  const [items, setItems] = useState<AdminAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [busyIds, setBusyIds] = useState<Set<string>>(new Set())

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setItems(await getPendingAppointments(dentistId))
    } finally {
      setLoading(false)
    }
  }, [dentistId])

  useEffect(() => { load() }, [load])

  const handleRefresh = async () => {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  const handle = async (id: string, action: 'approve' | 'reject') => {
    setBusyIds(prev => new Set([...prev, id]))
    try {
      if (action === 'approve') {
        await updateAppointmentStatus(id, 'confirmada')
        onToast({ message: 'Cita confirmada.', type: 'success' })
        onApproved?.()
      } else {
        await updateAppointmentStatus(id, 'cancelada')
        onToast({ message: 'Cita rechazada.', type: 'error' })
      }
      setItems(prev => prev.filter(c => c.id !== id))
    } catch {
      onToast({ message: 'No se pudo actualizar la cita.', type: 'error' })
    } finally {
      setBusyIds(prev => { const s = new Set(prev); s.delete(id); return s })
    }
  }

  return (
    <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden flex flex-col h-[320px]">
      {/* Card header — only when there are items or loading */}
      {(loading || items.length > 0) && (
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <h2 className="text-body-sm font-semibold text-text">Pendientes de aprobar</h2>
            {items.length > 0 && (
              <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-[12px] font-semibold rounded-full">
                {items.length}
              </span>
            )}
          </div>
          <RefreshButton onClick={handleRefresh} disabled={refreshing || loading} loading={refreshing} label="Actualizar" />
        </div>
      )}

      {/* List */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16">
            <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          </div>
        )}

        {!loading && items.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-center px-6">
            <CheckCircle size={40} strokeWidth={1} className="text-border mb-4" />
            <p className="text-text font-semibold mb-1">Todo al día</p>
            <p className="text-muted text-body-sm">No hay citas pendientes de aprobar.</p>
          </div>
        )}

        {!loading && items.length > 0 && (
          <ul className="divide-y divide-border/60">
            {items.map(cita => {
              const busy = busyIds.has(cita.id)
              return (
                <li key={cita.id} className="flex items-center gap-3 px-5 py-4">
                  {/* Avatar */}
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-body-sm font-bold shrink-0 ${avatarColor(cita.patient_name ?? '')}`}>
                    {getInitials(cita.patient_name ?? '?')}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-body-sm font-semibold text-text truncate">{cita.patient_name}</p>
                    <p className="text-[12px] text-muted truncate">{cita.tratamiento ?? '—'}</p>
                    <p className="text-[12px] text-muted mt-0.5">
                      {formatFecha(cita.fecha)} · {hm(cita.hora)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-1.5 shrink-0">
                    <ApproveButton onClick={() => handle(cita.id, 'approve')} disabled={busy} loading={busy} />
                    <RejectButton  onClick={() => handle(cita.id, 'reject')}  disabled={busy} loading={busy} />
                    <CallButton  phone={cita.patient_phone} />
                    <EmailButton email={cita.patient_email} />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const { dentist } = useAdminAuth()
  const [toast, setToast] = useState<ToastData | null>(null)
  const [nextTrigger, setNextTrigger] = useState(0)

  if (!dentist) return null

  const firstName = dentist.name.replace(/^(Dr\.|Dra\.)\s+/i, '').split(' ')[0]
  const today = new Date().toLocaleDateString('es-ES', {
    weekday: 'long', day: 'numeric', month: 'long',
    timeZone: 'Europe/Madrid',
  })

  return (
    <>
      <div className="p-6 lg:p-8">
        <div className="mb-8">
          <h1 className="text-h4 font-bold text-text mb-1">Buenos días, {firstName}</h1>
          <p className="text-muted text-body-sm capitalize">{today}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <NextPatientCard dentistId={dentist.id} onToast={setToast} reloadTrigger={nextTrigger} />
          <PendingCard     dentistId={dentist.id} onToast={setToast} onApproved={() => setNextTrigger(t => t + 1)} />
        </div>
      </div>

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </>
  )
}
