import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Calendar, Clock, User, Stethoscope } from 'lucide-react'
import { useAdminAuth } from '../../admin/AdminAuthContext'
import { getCitasByMonth } from '../../services/adminService'
import type { AdminAppointment, AppointmentStatus } from '../../types/admin'

// ─── Constants ────────────────────────────────────────────────────────────────

const DAYS_ES   = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom']
const MONTHS_ES = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

const STATUS: Record<AppointmentStatus, { chip: string; label: string }> = {
  pendiente:  { chip: 'bg-amber-100 text-amber-700',     label: 'Pendiente'  },
  confirmada: { chip: 'bg-blue-100 text-blue-700',       label: 'Confirmada' },
  completada: { chip: 'bg-emerald-100 text-emerald-700', label: 'Completada' },
  cancelada:  { chip: 'bg-gray-100 text-gray-500',       label: 'Cancelada'  },
  no_asistio: { chip: 'bg-gray-100 text-gray-500',       label: 'No asistió' },
}

// ─── Spanish holidays ─────────────────────────────────────────────────────────

function getEasterDate(year: number): Date {
  const a = year % 19
  const b = Math.floor(year / 100)
  const c = year % 100
  const d = Math.floor(b / 4)
  const e = b % 4
  const f = Math.floor((b + 8) / 25)
  const g = Math.floor((b - f + 1) / 3)
  const h = (19 * a + b - d - g + 15) % 30
  const i = Math.floor(c / 4)
  const k = c % 4
  const l = (32 + 2 * e + 2 * i - h - k) % 7
  const m = Math.floor((a + 11 * h + 22 * l) / 451)
  const month = Math.floor((h + l - 7 * m + 114) / 31)
  const day   = ((h + l - 7 * m + 114) % 31) + 1
  return new Date(year, month - 1, day)
}

function getSpanishHolidays(year: number): Map<string, string> {
  const map = new Map<string, string>()
  const add = (mo: number, d: number, name: string) =>
    map.set(`${year}-${String(mo).padStart(2,'0')}-${String(d).padStart(2,'0')}`, name)

  add(1,  1,  'Año Nuevo')
  add(1,  6,  'Reyes Magos')
  add(5,  1,  'Día del Trabajador')
  add(8,  15, 'Asunción de la Virgen')
  add(10, 12, 'Fiesta Nacional')
  add(11, 1,  'Todos los Santos')
  add(12, 6,  'Constitución Española')
  add(12, 8,  'Inmaculada Concepción')
  add(12, 25, 'Navidad')

  const easter    = getEasterDate(year)
  const viernes   = new Date(easter); viernes.setDate(easter.getDate() - 2)
  map.set(viernes.toLocaleDateString('sv-SE'), 'Viernes Santo')

  return map
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pad(n: number) { return String(n).padStart(2, '0') }
function hm(hora: string) { return hora.slice(0, 5) }

function monFirstIndex(date: Date) { return (date.getDay() + 6) % 7 }

function buildGrid(year: number, month: number): (number | null)[] {
  const leading = monFirstIndex(new Date(year, month - 1, 1))
  const total   = new Date(year, month, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < leading; i++) cells.push(null)
  for (let d = 1; d <= total; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function CitaDetailCard({ cita }: { cita: AdminAppointment }) {
  return (
    <li className="border border-border/70 rounded-xl p-3">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-1.5 text-primary">
          <Clock size={13} strokeWidth={2} />
          <span className="text-body-sm font-bold">{hm(cita.hora)}</span>
          <span className="text-[11px] text-muted">· {cita.duration_min} min</span>
        </div>
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${STATUS[cita.estado].chip}`}>
          {STATUS[cita.estado].label}
        </span>
      </div>

      <div className="flex items-start gap-1.5 mb-1.5">
        <User size={13} className="text-muted mt-0.5 shrink-0" strokeWidth={1.5} />
        <span className="text-body-sm font-semibold text-text leading-tight">
          {cita.patient_name ?? '—'}
        </span>
      </div>

      <div className="flex items-start gap-1.5">
        <Stethoscope size={13} className="text-muted mt-0.5 shrink-0" strokeWidth={1.5} />
        <span className="text-body-sm text-muted leading-tight">
          {cita.tratamiento ?? 'Sin especificar'}
        </span>
      </div>

      {cita.notes && (
        <p className="mt-2 text-[11px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-1.5 leading-snug">
          {cita.notes}
        </p>
      )}
    </li>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminCalendarioPage() {
  const { dentist } = useAdminAuth()
  const todayDate   = new Date()

  const [year, setYear]       = useState(todayDate.getFullYear())
  const [month, setMonth]     = useState(todayDate.getMonth() + 1)
  const [citas, setCitas]     = useState<AdminAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<number | null>(todayDate.getDate())

  useEffect(() => {
    if (!dentist) return
    setLoading(true)
    getCitasByMonth(dentist.id, year, month)
      .then(setCitas)
      .catch(() => setCitas([]))
      .finally(() => setLoading(false))
  }, [dentist, year, month])

  const citasByDay = useMemo(() => {
    const map = new Map<string, AdminAppointment[]>()
    citas.forEach(c => {
      const list = map.get(c.fecha) ?? []
      map.set(c.fecha, [...list, c])
    })
    return map
  }, [citas])

  const grid     = useMemo(() => buildGrid(year, month), [year, month])
  const holidays = useMemo(() => getSpanishHolidays(year), [year])

  const prevMonth = () => {
    if (month === 1) { setYear(y => y - 1); setMonth(12) } else setMonth(m => m - 1)
    setSelected(null)
  }
  const nextMonth = () => {
    if (month === 12) { setYear(y => y + 1); setMonth(1) } else setMonth(m => m + 1)
    setSelected(null)
  }
  const goToToday = () => {
    setYear(todayDate.getFullYear())
    setMonth(todayDate.getMonth() + 1)
    setSelected(todayDate.getDate())
  }

  const todayStr    = todayDate.toLocaleDateString('sv-SE')
  const selectedStr = selected ? `${year}-${pad(month)}-${pad(selected)}` : null
  const selectedCitas = useMemo(
    () => (selectedStr ? (citasByDay.get(selectedStr) ?? []) : []).slice().sort((a, b) => a.hora.localeCompare(b.hora)),
    [selectedStr, citasByDay]
  )

  const isCurrentMonth = year === todayDate.getFullYear() && month === todayDate.getMonth() + 1

  const formatSelectedDate = () => {
    if (!selected) return ''
    return new Date(year, month - 1, selected).toLocaleDateString('es-ES', {
      weekday: 'long', day: 'numeric', month: 'long',
    })
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6">
        <h1 className="text-h4 font-bold text-text mb-1">Calendario</h1>
        <p className="text-muted text-body-sm">Vista mensual de tu agenda</p>
      </div>

      <div className="flex flex-col xl:flex-row gap-6 items-start">

        {/* ── Calendar grid ── */}
        <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden flex-1 min-w-0">

          {/* Month nav */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-border/60">
            <button
              onClick={prevMonth}
              className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface transition-colors"
              aria-label="Mes anterior"
            >
              <ChevronLeft size={18} strokeWidth={2} />
            </button>

            <div className="flex items-center gap-3">
              <h2 className="text-body-lg font-semibold text-text capitalize">
                {MONTHS_ES[month - 1]} {year}
              </h2>
              {!isCurrentMonth && (
                <button
                  onClick={goToToday}
                  className="px-2.5 py-1 rounded-lg text-body-sm font-medium text-primary bg-primary-light hover:bg-primary/20 transition-colors"
                >
                  Hoy
                </button>
              )}
            </div>

            <button
              onClick={nextMonth}
              className="p-2 rounded-xl text-muted hover:text-text hover:bg-surface transition-colors"
              aria-label="Mes siguiente"
            >
              <ChevronRight size={18} strokeWidth={2} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 border-b border-border/60">
            {DAYS_ES.map(d => (
              <div key={d} className="py-2.5 text-center text-[11px] font-semibold text-muted uppercase tracking-wide">
                {d}
              </div>
            ))}
          </div>

          {/* Grid cells */}
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-7 divide-x divide-y divide-border/40">
              {grid.map((day, i) => {
                if (!day) return (
                  <div key={`e-${i}`} className="h-24 bg-surface/20" />
                )

                const dateStr   = `${year}-${pad(month)}-${pad(day)}`
                const dayCitas  = citasByDay.get(dateStr) ?? []
                const holiday   = holidays.get(dateStr) ?? null
                const isToday   = dateStr === todayStr
                const isSel     = day === selected
                const maxChips  = holiday ? 1 : 2
                const visible   = dayCitas.slice(0, maxChips)
                const extra     = dayCitas.length - visible.length

                return (
                  <button
                    key={day}
                    onClick={() => setSelected(day === selected ? null : day)}
                    className={[
                      'h-24 p-1.5 flex flex-col items-start text-left w-full transition-colors duration-100',
                      isSel    ? 'bg-primary-light' :
                      holiday  ? 'bg-rose-50/60 hover:bg-rose-50' :
                                 'hover:bg-surface/50',
                    ].join(' ')}
                  >
                    <span className={[
                      'w-6 h-6 flex items-center justify-center rounded-full text-[12px] font-semibold mb-0.5 shrink-0',
                      isToday  ? 'bg-primary text-white' :
                      isSel    ? 'text-primary font-bold' :
                      holiday  ? 'text-rose-600' :
                                 'text-text',
                    ].join(' ')}>
                      {day}
                    </span>

                    {holiday && (
                      <span className="text-[9px] font-semibold text-rose-500 leading-tight px-0.5 mb-0.5 truncate w-full">
                        {holiday}
                      </span>
                    )}

                    <div className="flex flex-col gap-0.5 w-full overflow-hidden">
                      {visible.map(c => (
                        <div
                          key={c.id}
                          className={`flex items-center gap-1 px-1 py-0.5 rounded text-[10px] font-medium w-full overflow-hidden ${STATUS[c.estado].chip}`}
                        >
                          <span className="shrink-0 tabular-nums">{hm(c.hora)}</span>
                          <span className="truncate">{c.patient_name ?? '—'}</span>
                        </div>
                      ))}
                      {extra > 0 && (
                        <span className="text-[10px] text-muted font-medium px-1">+{extra} más</span>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Day detail panel ── */}
        <div className="w-full xl:w-72 shrink-0">
          <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-border/60">
              <p className="text-body-sm font-semibold text-text capitalize">
                {selected ? formatSelectedDate() : 'Selecciona un día'}
              </p>
              {selected && (
                <p className="text-[11px] text-muted mt-0.5">
                  {selectedCitas.length === 0
                    ? 'Sin citas'
                    : `${selectedCitas.length} cita${selectedCitas.length > 1 ? 's' : ''}`}
                </p>
              )}
            </div>

            <div className="p-4">
              {selected && selectedStr && holidays.get(selectedStr) && (
                <div className="flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-xl px-3 py-2 mb-3">
                  <span className="text-rose-500 text-body-sm">🎌</span>
                  <span className="text-rose-700 text-body-sm font-medium">{holidays.get(selectedStr)}</span>
                </div>
              )}

              {!selected && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Calendar size={36} strokeWidth={1} className="text-border mb-3" />
                  <p className="text-muted text-body-sm">Haz click en un día para ver sus citas.</p>
                </div>
              )}

              {selected && selectedCitas.length === 0 && (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <Calendar size={36} strokeWidth={1} className="text-border mb-3" />
                  <p className="text-text font-medium text-body-sm mb-1">Sin citas</p>
                  <p className="text-muted text-body-sm">No hay citas programadas.</p>
                </div>
              )}

              {selected && selectedCitas.length > 0 && (
                <ol className="flex flex-col gap-3">
                  {selectedCitas.map(cita => (
                    <CitaDetailCard key={cita.id} cita={cita} />
                  ))}
                </ol>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  )
}
