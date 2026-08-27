import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, ChevronUp, ChevronDown, ChevronsUpDown, X, Phone, Mail, Copy, Check, Calendar, Clock, Stethoscope, ChevronLeft, ChevronRight, UserPlus } from 'lucide-react'
import { useAdminAuth } from '../../admin/AdminAuthContext'
import { getAllCitas, getPatientDetails, getAllPatients, adminCreateCita } from '../../services/adminService'
import type { PatientDetails } from '../../services/adminService'
import { CallButton, EmailButton, RefreshButton } from '../../components/admin/ActionIconButtons'
import type { AdminAppointment, AppointmentStatus, PatientRow, CreateAppointmentPayload } from '../../types/admin'

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

// ─── Create cita helpers ──────────────────────────────────────────────────────

const MONTHS_ES = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre']
const DAYS_ES   = ['L','M','X','J','V','S','D']

const TREATMENTS = [
  'Blanqueamiento dental',
  'Implantes dentales',
  'Diseño de sonrisa',
  'Ortodoncia',
  'Odontología general',
]

const TIME_SLOTS = (() => {
  const slots: string[] = []
  for (let h = 9; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 20 && m > 0) break
      slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    }
  }
  return slots
})()

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
}

function calCells(year: number, month: number): (Date | null)[] {
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const offset = (new Date(year, month, 1).getDay() + 6) % 7
  const cells: (Date | null)[] = Array(offset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))
  return cells
}

function toYMD(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`
}

function isFakeEmail(email: string): boolean {
  return !!email?.endsWith('@patients.dentaviva.es')
}

// ─── Sort helpers ─────────────────────────────────────────────────────────────

type ColSort = 'patient_name' | 'fecha' | 'tratamiento' | 'estado'
type Dir = 'asc' | 'desc'

const SORT_OPTIONS: { value: string; label: string; field: ColSort; dir: Dir }[] = [
  { value: 'fecha_desc', label: 'Más recientes primero', field: 'fecha',        dir: 'desc' },
  { value: 'fecha_asc',  label: 'Más antiguos primero',  field: 'fecha',        dir: 'asc'  },
  { value: 'name_asc',   label: 'Nombre A → Z',          field: 'patient_name', dir: 'asc'  },
  { value: 'name_desc',  label: 'Nombre Z → A',          field: 'patient_name', dir: 'desc' },
]

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

// ─── CalendarInline ───────────────────────────────────────────────────────────

interface CalendarInlineProps {
  selected: Date | null
  today: Date
  onSelect: (d: Date) => void
}

function CalendarInline({ selected, today, onSelect }: CalendarInlineProps) {
  const [year, setYear]   = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth())

  const cells = calCells(year, month)

  const prevMonth = () => { if (month === 0) { setYear(y => y-1); setMonth(11) } else setMonth(m => m-1) }
  const nextMonth = () => { if (month === 11) { setYear(y => y+1); setMonth(0)  } else setMonth(m => m+1) }

  return (
    <div className="rounded-2xl border border-border bg-white shadow-lg p-4 mx-auto" style={{ width: 320 }}>
      <div className="flex items-center gap-1 mb-3">
        <button type="button" onClick={prevMonth} className="p-1.5 rounded-full hover:bg-surface transition-colors">
          <ChevronLeft size={15} className="text-text" strokeWidth={2} />
        </button>
        <p className="flex-1 text-center text-body-sm font-semibold text-text capitalize">
          {MONTHS_ES[month].charAt(0).toUpperCase() + MONTHS_ES[month].slice(1)} {year}
        </p>
        <button type="button" onClick={nextMonth} className="p-1.5 rounded-full hover:bg-surface transition-colors">
          <ChevronRight size={15} className="text-text" strokeWidth={2} />
        </button>
      </div>
      <div className="grid grid-cols-7 gap-y-0.5">
        {DAYS_ES.map(d => (
          <div key={d} className="text-center text-[11px] text-muted font-medium py-1">{d}</div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />
          const isPast    = date < today && !isSameDay(date, today)
          const isWknd    = [0, 6].includes(date.getDay())
          const disabled  = isPast || isWknd
          const isToday   = isSameDay(date, today)
          const isSel     = selected ? isSameDay(date, selected) : false
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={[
                'mx-auto w-8 h-8 flex items-center justify-center rounded-full text-body-sm transition-colors',
                disabled ? 'text-muted/30 cursor-not-allowed' : 'cursor-pointer hover:bg-primary-light hover:text-primary',
                isToday && !isSel && !disabled ? 'border-2 border-primary text-primary font-semibold' : '',
                isSel ? 'bg-primary text-white font-semibold' : '',
                !disabled && !isToday && !isSel ? 'text-text font-medium' : '',
              ].filter(Boolean).join(' ')}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── TimeList ─────────────────────────────────────────────────────────────────

function TimeList({ selected, onSelect }: { selected: string | null; onSelect: (t: string) => void }) {
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selected && listRef.current) {
      const btn = listRef.current.querySelector(`[data-slot="${selected}"]`) as HTMLElement | null
      btn?.scrollIntoView({ block: 'center' })
    }
  }, [selected])

  return (
    <div className="rounded-2xl border border-border bg-white shadow-lg py-2 mx-auto" style={{ width: 160 }}>
      <div ref={listRef} className="max-h-52 overflow-y-auto">
        {TIME_SLOTS.map(slot => (
          <button
            key={slot}
            type="button"
            data-slot={slot}
            onClick={() => onSelect(slot)}
            className={[
              'w-full text-left px-4 py-2 text-body-sm transition-colors',
              selected === slot ? 'bg-primary-light text-primary font-semibold' : 'text-text hover:bg-surface',
            ].join(' ')}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  )
}

// ─── CreateCitaModal ──────────────────────────────────────────────────────────

interface CreateCitaModalProps {
  dentistId: string
  patients: PatientRow[]
  onClose: () => void
  onCreated: (cita: AdminAppointment) => void
  onToast: (t: { message: string; type: 'success' | 'error' }) => void
}

type CPanel = 'cal' | 'time' | 'treatment' | null

function CreateCitaModal({ dentistId, patients, onClose, onCreated, onToast }: CreateCitaModalProps) {
  const today = useMemo(() => { const d = new Date(); d.setHours(0,0,0,0); return d }, [])

  // Patient
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPat, setSelectedPat]     = useState<PatientRow | null>(null)
  const [showPatList, setShowPatList]     = useState(false)

  // Fields
  const [fecha, setFecha]               = useState<Date | null>(null)
  const [hora, setHora]                 = useState<string | null>(null)
  const [tratamiento, setTratamiento]   = useState<string | null>(null)
  const [estado, setEstado]             = useState<AppointmentStatus>('confirmada')
  const [panel, setPanel]           = useState<CPanel>(null)
  const [errors, setErrors]         = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', h)
    return () => window.removeEventListener('keydown', h)
  }, [onClose])

  const filteredPats = useMemo(() => {
    const q = patientSearch.toLowerCase()
    const list = q
      ? patients.filter(p =>
          `${p.full_name} ${p.last_name ?? ''}`.toLowerCase().includes(q) ||
          (!isFakeEmail(p.email) && p.email.toLowerCase().includes(q))
        )
      : patients
    return list.slice(0, 8)
  }, [patients, patientSearch])

  const formattedDate = fecha
    ? `${fecha.getDate()} de ${MONTHS_ES[fecha.getMonth()]} de ${fecha.getFullYear()}`
    : null

  const validate = () => {
    const e: Record<string, string> = {}
    if (!tratamiento)  e.tratamiento = 'Selecciona un tratamiento'
    if (!selectedPat)  e.patient     = 'Selecciona un paciente'
    if (!fecha)        e.fecha       = 'Selecciona una fecha'
    if (!hora)         e.hora        = 'Selecciona una hora'
    return e
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    const payload: CreateAppointmentPayload = {
      dentist_id:   dentistId,
      user_id:      selectedPat!.id,
      tratamiento:  tratamiento!,
      fecha:        toYMD(fecha!),
      hora:         hora!,
      duration_min: 30,
      estado,
    }

    setSubmitting(true)
    try {
      const cita = await adminCreateCita(payload)
      onCreated(cita)
      onClose()
      onToast({ message: 'Cita creada correctamente.', type: 'success' })
    } catch (err) {
      onToast({ message: err instanceof Error ? err.message : 'Error al crear la cita.', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const togglePanel = (p: CPanel) => setPanel(prev => prev === p ? null : p)

  const fieldBtn = (active: boolean, hasValue: boolean, hasErr?: boolean) =>
    `w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-body-sm text-left transition-all cursor-pointer focus:outline-none ${
      hasErr   ? 'border-red-400 ring-2 ring-red-100' :
      active   ? 'border-primary ring-2 ring-primary/20 bg-surface/50' :
      'border-border hover:border-primary/40 bg-white'
    } ${hasValue ? 'text-text' : 'text-muted/60'}`

  const selectCls = 'w-full appearance-none pl-3 pr-8 py-2.5 rounded-xl border border-border text-body-sm text-text bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all'

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg mt-12 mb-8"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/60">
          <h2 className="text-h5 font-bold text-text">Nueva cita</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors">
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

          {/* ── Paciente ── */}
          <div>
            <label className="block text-body-sm font-medium text-text mb-1.5">Paciente</label>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted z-10" strokeWidth={2} />
              <input
                type="text"
                placeholder="Buscar por nombre o email..."
                value={selectedPat
                  ? [selectedPat.full_name, selectedPat.last_name].filter(Boolean).join(' ')
                  : patientSearch
                }
                onFocus={() => {
                  setShowPatList(true)
                  if (selectedPat) { setPatientSearch(''); setSelectedPat(null) }
                }}
                onBlur={() => setTimeout(() => setShowPatList(false), 150)}
                onChange={e => { setPatientSearch(e.target.value); setShowPatList(true) }}
                className={`w-full pl-8 pr-3 py-2.5 rounded-xl border text-body-sm text-text placeholder:text-muted/60
                  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all ${
                    errors.patient ? 'border-red-400' : 'border-border'
                  }`}
              />
              {showPatList && (
                <div className="absolute top-full left-0 right-0 mt-1 rounded-xl border border-border bg-white shadow-lg z-20 py-1 max-h-48 overflow-y-auto">
                  {filteredPats.length === 0 ? (
                    <p className="px-4 py-3 text-body-sm text-muted text-center">Sin resultados</p>
                  ) : filteredPats.map(p => {
                    const name      = [p.full_name, p.last_name].filter(Boolean).join(' ')
                    const showEmail = !isFakeEmail(p.email)
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onMouseDown={e => e.preventDefault()}
                        onClick={() => {
                          setSelectedPat(p); setShowPatList(false)
                          setErrors(prev => ({ ...prev, patient: '' }))
                        }}
                        className="w-full text-left px-4 py-2.5 hover:bg-surface transition-colors"
                      >
                        <p className="text-body-sm font-medium text-text">{name}</p>
                        {showEmail && <p className="text-[11px] text-muted">{p.email}</p>}
                      </button>
                    )
                  })}
                </div>
              )}
              {errors.patient && <p className="text-[11px] text-red-500 mt-1">{errors.patient}</p>}
            </div>
          </div>

          {/* ── Tratamiento ── */}
          <div>
            <label className="block text-body-sm font-medium text-text mb-1.5">Tratamiento</label>
            <button
              type="button"
              onClick={() => togglePanel('treatment')}
              className={fieldBtn(panel === 'treatment', !!tratamiento, !!errors.tratamiento)}
            >
              <Stethoscope size={15} className="shrink-0 text-muted" strokeWidth={1.75} />
              <span>{tratamiento ?? 'Seleccionar tratamiento'}</span>
            </button>
            {errors.tratamiento && <p className="text-[11px] text-red-500 mt-1">{errors.tratamiento}</p>}
          </div>

          {panel === 'treatment' && (
            <div className="rounded-2xl border border-border bg-white shadow-lg py-2">
              {TREATMENTS.map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTratamiento(t); setPanel(null); setErrors(p => ({ ...p, tratamiento: '' })) }}
                  className={[
                    'w-full text-left px-4 py-2.5 text-body-sm transition-colors',
                    tratamiento === t ? 'bg-primary-light text-primary font-semibold' : 'text-text hover:bg-surface',
                  ].join(' ')}
                >
                  {t}
                </button>
              ))}
            </div>
          )}

          {/* ── Fecha + Hora ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-body-sm font-medium text-text mb-1.5">Fecha</label>
              <button
                type="button"
                onClick={() => togglePanel('cal')}
                className={fieldBtn(panel === 'cal', !!fecha, !!errors.fecha)}
              >
                <Calendar size={15} className="shrink-0 text-muted" strokeWidth={1.75} />
                <span>{formattedDate ?? 'Seleccionar fecha'}</span>
              </button>
              {errors.fecha && <p className="text-[11px] text-red-500 mt-1">{errors.fecha}</p>}
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text mb-1.5">Hora</label>
              <button
                type="button"
                onClick={() => togglePanel('time')}
                className={fieldBtn(panel === 'time', !!hora, !!errors.hora)}
              >
                <Clock size={15} className="shrink-0 text-muted" strokeWidth={1.75} />
                <span>{hora ?? 'Seleccionar hora'}</span>
              </button>
              {errors.hora && <p className="text-[11px] text-red-500 mt-1">{errors.hora}</p>}
            </div>
          </div>

          {panel === 'cal' && (
            <CalendarInline
              selected={fecha}
              today={today}
              onSelect={d => { setFecha(d); setPanel(null); setErrors(p => ({ ...p, fecha: '' })) }}
            />
          )}
          {panel === 'time' && (
            <TimeList
              selected={hora}
              onSelect={t => { setHora(t); setPanel(null); setErrors(p => ({ ...p, hora: '' })) }}
            />
          )}

          {/* ── Estado ── */}
          <div>
            <label className="block text-body-sm font-medium text-text mb-1.5">Estado</label>
            <div className="relative">
              <select value={estado} onChange={e => setEstado(e.target.value as AppointmentStatus)} className={selectCls}>
                <option value="confirmada">Confirmada</option>
                <option value="pendiente">Pendiente</option>
              </select>
              <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" strokeWidth={2} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-body-sm font-medium text-text hover:bg-surface transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-body-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creando...
                </>
              ) : 'Crear cita'}
            </button>
          </div>
        </form>
      </div>
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
    getPatientDetails(cita.user_id, dentistId)
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

// ─── Toast ────────────────────────────────────────────────────────────────────

interface ToastData { message: string; type: 'success' | 'error' }

function Toast({ toast, onDismiss }: { toast: ToastData; onDismiss: () => void }) {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3500)
    return () => clearTimeout(t)
  }, [toast, onDismiss])

  const cls = toast.type === 'success'
    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
    : 'bg-red-50 border-red-200 text-red-800'

  return (
    <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-2xl border shadow-xl text-body-sm font-medium max-w-sm ${cls}`}>
      <span>{toast.message}</span>
      <button onClick={onDismiss} className="ml-1 shrink-0 opacity-60 hover:opacity-100 transition-opacity">
        <X size={14} strokeWidth={2} />
      </button>
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
  const [showCreate, setShowCreate] = useState(false)
  const [patients, setPatients]     = useState<PatientRow[]>([])
  const [toast, setToast]           = useState<ToastData | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const loadCitas = async () => {
    if (!dentist) return
    setLoading(true)
    try {
      const data = await getAllCitas(dentist.id)
      setCitas(data)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadCitas() }, [dentist])

  const handleRefresh = async () => {
    setRefreshing(true)
    try { await loadCitas() } finally { setRefreshing(false) }
  }

  useEffect(() => {
    getAllPatients().then(setPatients).catch(() => {})
  }, [])

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
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h4 font-bold text-text mb-1">Citas</h1>
          <p className="text-muted text-body-sm">Historial completo de citas asignadas</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-body-sm font-semibold hover:bg-primary/90 transition-colors shrink-0"
        >
          <UserPlus size={15} strokeWidth={2} />
          Nueva cita
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4 border-b border-border/60 relative">
          {/* Search */}
          <div className="relative shrink-0">
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

          {/* Sort dropdown */}
          <div className="relative shrink-0">
            <select
              value={SORT_OPTIONS.find(o => o.field === sortField && o.dir === sortDir)?.value ?? 'fecha_desc'}
              onChange={e => {
                const opt = SORT_OPTIONS.find(o => o.value === e.target.value)
                if (opt) { setSortField(opt.field); setSortDir(opt.dir); setPage(1) }
              }}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border text-body-sm text-text bg-white
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" strokeWidth={2} />
          </div>

          {/* Status filter */}
          <div className="relative shrink-0">
            <select
              value={statusFilter}
              onChange={e => { setStatus(e.target.value as AppointmentStatus | 'all'); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border text-body-sm text-text bg-white
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              {STATUS_FILTERS.map(f => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" strokeWidth={2} />
          </div>

          <div className="sm:ml-auto shrink-0">
            <RefreshButton onClick={handleRefresh} disabled={refreshing} loading={refreshing} label="Actualizar" />
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

      {/* Create cita modal */}
      {showCreate && dentist && (
        <CreateCitaModal
          dentistId={dentist.id}
          patients={patients}
          onClose={() => setShowCreate(false)}
          onCreated={cita => setCitas(prev => [cita, ...prev])}
          onToast={setToast}
        />
      )}

      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
