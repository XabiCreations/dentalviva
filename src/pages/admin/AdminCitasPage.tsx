import { useState, useEffect, useMemo } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, X, Phone, Mail, Copy, Check } from 'lucide-react'
import { useAdminAuth } from '../../admin/AdminAuthContext'
import { getAllCitas, getPatientDetails } from '../../services/adminService'
import type { PatientDetails } from '../../services/adminService'
import { CallButton, EmailButton } from '../../components/admin/ActionIconButtons'
import type { AdminAppointment, AppointmentStatus } from '../../types/admin'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const STATUS_FILTERS: { value: AppointmentStatus | 'all'; label: string }[] = [
  { value: 'all',        label: 'Todas' },
  { value: 'pendiente',  label: 'Pendiente' },
  { value: 'confirmada', label: 'Confirmada' },
  { value: 'completada', label: 'Completada' },
  { value: 'cancelada',  label: 'Cancelada' },
  { value: 'no_asistio', label: 'No asistió' },
]

const STATUS_BADGE: Record<AppointmentStatus, { label: string; className: string }> = {
  pendiente:  { label: 'Pendiente',  className: 'bg-amber-100 text-amber-700' },
  confirmada: { label: 'Confirmada', className: 'bg-blue-100 text-blue-700' },
  completada: { label: 'Completada', className: 'bg-emerald-100 text-emerald-700' },
  cancelada:  { label: 'Cancelada',  className: 'bg-red-100 text-red-600' },
  no_asistio: { label: 'No asistió', className: 'bg-surface text-muted' },
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return (name ?? '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700', 'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700', 'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700', 'bg-sky-100 text-sky-700',
]
function avatarColor(name: string): string {
  return AVATAR_COLORS[(name ?? ' ').charCodeAt(0) % AVATAR_COLORS.length]
}

function formatFecha(fecha: string): string {
  return new Date(fecha + 'T00:00:00').toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function hm(hora: string): string {
  return hora.slice(0, 5)
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────

type ColSort = 'patient_name' | 'fecha' | 'tratamiento' | 'estado'
type Dir = 'asc' | 'desc'

function sortCitas(list: AdminAppointment[], field: ColSort, dir: Dir): AdminAppointment[] {
  return [...list].sort((a, b) => {
    let av = '', bv = ''
    if (field === 'fecha') { av = `${a.fecha} ${a.hora}`; bv = `${b.fecha} ${b.hora}` }
    else { av = (a[field] ?? '').toLowerCase(); bv = (b[field] ?? '').toLowerCase() }
    return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
  })
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatusBadge({ estado }: { estado: AppointmentStatus }) {
  const { label, className } = STATUS_BADGE[estado]
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-lg text-[12px] font-semibold ${className}`}>
      {label}
    </span>
  )
}

interface SortIconProps { field: ColSort; current: ColSort; dir: Dir }
function SortIcon({ field, current, dir }: SortIconProps) {
  if (field !== current) return <ChevronsUpDown size={13} className="text-border" />
  return dir === 'asc'
    ? <ChevronUp size={13} className="text-primary" />
    : <ChevronDown size={13} className="text-primary" />
}

function InfoItem({ label, value, copyable }: { label: string; value: string; copyable?: boolean }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div>
      <div className="flex items-center gap-1.5 mb-0.5">
        <p className="text-body-sm font-semibold text-text">{label}</p>
        {copyable && value !== '—' && value !== '…' && (
          <button
            onClick={handleCopy}
            title="Copiar"
            className="p-1 rounded-md text-muted/40 hover:text-muted transition-colors"
          >
            {copied
              ? <Check size={12} strokeWidth={2.5} className="text-emerald-500" />
              : <Copy size={12} strokeWidth={1.75} />
            }
          </button>
        )}
      </div>
      <p className="text-body-sm text-muted break-all">{value}</p>
    </div>
  )
}

// ─── PatientModal ─────────────────────────────────────────────────────────────

interface PatientModalProps {
  cita: AdminAppointment
  dentistName: string
  dentistId: string
  onClose: () => void
}

function PatientModal({ cita, dentistName, dentistId, onClose }: PatientModalProps) {
  const [details, setDetails]   = useState<PatientDetails | null>(null)
  const [loading, setLoading]   = useState(true)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  useEffect(() => {
    setLoading(true)
    getPatientDetails(cita.user_id, cita.patient_name, dentistId)
      .then(setDetails)
      .finally(() => setLoading(false))
  }, [cita, dentistId])

  const name     = cita.patient_name ?? '—'
  const initials = getInitials(name)
  const color    = avatarColor(name)

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-4 p-6">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-h5 font-bold shrink-0 ${color}`}>
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="text-h5 font-bold text-text leading-tight">{name}</h2>
            <p className="text-body-sm text-muted mt-0.5">
              {loading ? '…' : `${details?.totalCitas ?? 0} ${details?.totalCitas === 1 ? 'cita' : 'citas'} en total`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors shrink-0"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Contact buttons */}
        <div className="flex gap-2.5 px-6 pb-5">
          {cita.patient_phone ? (
            <a
              href={`tel:${cita.patient_phone.replace(/\s/g, '')}`}
              className="flex-1 flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-body-sm font-medium text-text hover:bg-surface transition-colors"
            >
              <Phone size={14} strokeWidth={1.75} />
              Llamar
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-body-sm font-medium text-muted/40 cursor-not-allowed">
              <Phone size={14} strokeWidth={1.75} />
              Llamar
            </div>
          )}
          {cita.patient_email ? (
            <a
              href={`mailto:${cita.patient_email}`}
              className="flex-1 flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-body-sm font-medium text-text hover:bg-surface transition-colors"
            >
              <Mail size={14} strokeWidth={1.75} />
              Mensaje
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-center gap-2 border border-border rounded-xl py-2.5 text-body-sm font-medium text-muted/40 cursor-not-allowed">
              <Mail size={14} strokeWidth={1.75} />
              Mensaje
            </div>
          )}
        </div>

        <div className="border-t border-border/60" />

        {/* Info grid */}
        <div className="p-6 grid grid-cols-2 gap-5">
          <InfoItem label="ID Usuario" value={cita.user_id ?? '—'} copyable />
          <InfoItem label="DNI" value={loading ? '…' : (details?.dni ?? '—')} copyable />
        </div>

        <div className="border-t border-border/60" />

        {/* Last cita */}
        <div className="p-6">
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wide mb-4">Última cita</p>
          {loading ? (
            <div className="flex justify-center py-3">
              <div className="w-5 h-5 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : details?.lastCita ? (
            <div className="grid grid-cols-2 gap-5">
              <InfoItem label="Tratamiento"  value={details.lastCita.tratamiento ?? '—'} />
              <InfoItem label="Fecha"        value={formatFecha(details.lastCita.fecha)} />
              <InfoItem label="Hora"         value={`${hm(details.lastCita.hora)} · ${details.lastCita.duration_min} min`} />
              <InfoItem label="Atendido por" value={dentistName} />
            </div>
          ) : (
            <p className="text-body-sm text-muted/50 text-center py-1">Sin historial de citas</p>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCitasPage() {
  const { dentist } = useAdminAuth()
  const [citas, setCitas]           = useState<AdminAppointment[]>([])
  const [loading, setLoading]       = useState(true)
  const [search, setSearch]         = useState('')
  const [statusFilter, setStatus]   = useState<AppointmentStatus | 'all'>('all')
  const [page, setPage]             = useState(1)
  const [sortField, setSortField]   = useState<ColSort>('fecha')
  const [sortDir, setSortDir]       = useState<Dir>('desc')
  const [selectedCita, setSelected] = useState<AdminAppointment | null>(null)

  useEffect(() => {
    if (!dentist) return
    setLoading(true)
    getAllCitas(dentist.id)
      .then(setCitas)
      .finally(() => setLoading(false))
  }, [dentist])

  const handleSort = (field: ColSort) => {
    if (field === sortField) setSortDir(d => d === 'asc' ? 'desc' : 'asc')
    else { setSortField(field); setSortDir('asc') }
    setPage(1)
  }

  const filtered = useMemo(() => {
    let list = citas
    if (statusFilter !== 'all') list = list.filter(c => c.estado === statusFilter)
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c => (c.patient_name ?? '').toLowerCase().includes(q))
    }
    return sortCitas(list, sortField, sortDir)
  }, [citas, statusFilter, search, sortField, sortDir])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const th = (label: string, field: ColSort) => (
    <th
      onClick={() => handleSort(field)}
      className="px-4 py-3 text-left text-body-sm font-semibold text-text cursor-pointer select-none whitespace-nowrap"
    >
      <span className="flex items-center gap-1.5">
        {label}
        <SortIcon field={field} current={sortField} dir={sortDir} />
      </span>
    </th>
  )

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-h4 font-bold text-text mb-1">Citas</h1>
        <p className="text-muted text-body-sm">Historial completo de citas asignadas</p>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 border-b border-border/60">
          <div className="flex items-center gap-1.5 flex-wrap">
            {STATUS_FILTERS.map(f => (
              <button
                key={f.value}
                onClick={() => { setStatus(f.value); setPage(1) }}
                className={`px-3 py-1.5 rounded-xl text-body-sm font-medium transition-colors ${
                  statusFilter === f.value
                    ? 'bg-primary text-white'
                    : 'bg-surface text-muted hover:text-text'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar paciente..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-4 py-2 rounded-xl border border-border text-body-sm text-text placeholder:text-muted
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-52"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/60 border-b border-border/60">
              <tr>
                {th('Paciente',    'patient_name')}
                {th('Fecha',       'fecha')}
                <th className="px-4 py-3 text-left text-body-sm font-semibold text-text whitespace-nowrap">Hora</th>
                {th('Tratamiento', 'tratamiento')}
                {th('Estado',      'estado')}
                <th className="px-4 py-3 text-right text-body-sm font-semibold text-text">Contacto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {loading && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center">
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                  </td>
                </tr>
              )}
              {!loading && paginated.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-16 text-center text-muted text-body-sm">
                    No hay citas que coincidan con los filtros.
                  </td>
                </tr>
              )}
              {!loading && paginated.map(cita => (
                <tr key={cita.id} className="hover:bg-surface/40 transition-colors">
                  {/* Paciente — clickable */}
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelected(cita)}
                      className="flex items-center gap-3 group"
                    >
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-opacity group-hover:opacity-75 ${avatarColor(cita.patient_name ?? '')}`}>
                        {getInitials(cita.patient_name ?? '?')}
                      </div>
                      <span className="text-body-sm font-medium text-text whitespace-nowrap group-hover:text-primary transition-colors">
                        {cita.patient_name ?? '—'}
                      </span>
                    </button>
                  </td>
                  <td className="px-4 py-3 text-body-sm text-muted whitespace-nowrap">
                    {formatFecha(cita.fecha)}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-muted whitespace-nowrap">
                    {hm(cita.hora)}
                  </td>
                  <td className="px-4 py-3 text-body-sm text-text">
                    {cita.tratamiento ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge estado={cita.estado} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 justify-end">
                      <CallButton  phone={cita.patient_phone} />
                      <EmailButton email={cita.patient_email} />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60">
          <p className="text-body-sm text-muted">
            {filtered.length === 0
              ? 'Sin resultados'
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} citas`
            }
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-xl text-body-sm font-medium bg-surface text-muted
                hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Anterior
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(n => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`w-8 h-8 rounded-xl text-body-sm font-medium transition-colors ${
                  n === page ? 'bg-primary text-white' : 'bg-surface text-muted hover:text-text'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-xl text-body-sm font-medium bg-surface text-muted
                hover:text-text transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>

      {/* Patient modal */}
      {selectedCita && dentist && (
        <PatientModal
          cita={selectedCita}
          dentistName={dentist.name}
          dentistId={dentist.id}
          onClose={() => setSelected(null)}
        />
      )}
    </div>
  )
}
