import { useState, useRef, useEffect, useLayoutEffect, useCallback } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Calendar, Clock, Stethoscope } from 'lucide-react'

const TREATMENTS = [
  'Blanqueamiento dental',
  'Implantes dentales',
  'Ortodoncia',
  'Estética dental',
]

const DAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D']

const MONTHS = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]

const TIME_SLOTS = (() => {
  const slots = []
  for (let h = 9; h <= 20; h++) {
    for (let m = 0; m < 60; m += 15) {
      if (h === 20 && m > 0) break
      slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`)
    }
  }
  return slots
})()

function isSameDay(a, b) {
  return a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
}

function getDaysInMonth(year, month) {
  return new Date(year, month + 1, 0).getDate()
}

function firstDayOffset(year, month) {
  const day = new Date(year, month, 1).getDay()
  return (day + 6) % 7
}

function isWeekend(date) {
  const d = date.getDay()
  return d === 0 || d === 6
}

// Renders children via portal at document.body using absolute positioning
// offset by scroll position — bypasses ancestor overflow:hidden and scrolls with the page
function DropdownPortal({ anchorRef, align = 'left', panelRef, children }) {
  const [style, setStyle] = useState(null)

  useLayoutEffect(() => {
    if (!anchorRef.current) return
    const rect = anchorRef.current.getBoundingClientRect()
    setStyle({
      position: 'absolute',
      top: rect.bottom + window.scrollY + 8,
      zIndex: 9999,
      ...(align === 'left'
        ? { left: rect.left + window.scrollX }
        : { right: document.documentElement.clientWidth - rect.right - window.scrollX }),
    })
  }, [anchorRef, align])

  if (!style) return null

  return createPortal(
    <div ref={panelRef} style={style}>
      {children}
    </div>,
    document.body
  )
}

function CalendarMonth({ year, month, today, selected, onSelect }) {
  const daysInMonth = getDaysInMonth(year, month)
  const offset = firstDayOffset(year, month)
  const cells = []

  for (let i = 0; i < offset; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d))

  return (
    <div className="flex-1 min-w-0">
      <div className="grid grid-cols-7 gap-y-1">
        {DAYS.map((d) => (
          <div key={d} className="text-center text-xs text-muted font-medium py-1">
            {d}
          </div>
        ))}
        {cells.map((date, i) => {
          if (!date) return <div key={`e-${i}`} />
          const isPast = date < today && !isSameDay(date, today)
          const isWknd = isWeekend(date)
          const disabled = isPast || isWknd
          const isToday = isSameDay(date, today)
          const isSelected = selected && isSameDay(date, selected)
          return (
            <button
              key={date.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(date)}
              className={[
                'mx-auto w-9 h-9 flex items-center justify-center rounded-full text-sm transition-colors duration-150',
                disabled ? 'text-muted/30 cursor-not-allowed' : 'hover:bg-primary-light hover:text-primary cursor-pointer',
                isToday && !isSelected && !disabled ? 'border-2 border-primary text-primary font-semibold' : '',
                isSelected ? 'bg-primary text-white font-semibold' : '',
                !disabled && !isToday && !isSelected ? 'text-text font-medium' : '',
              ].join(' ')}
            >
              {date.getDate()}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function DatePicker({ selected, onApply, darkMode }) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const [viewYear, setViewYear] = useState(today.getFullYear())
  const [viewMonth, setViewMonth] = useState(today.getMonth())

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  return (
    <div className={[
      'w-96 rounded-2xl border border-border p-6',
      'shadow-[0_8px_40px_rgba(0,0,0,0.12)]',
      darkMode ? 'bg-[#1e2a3a]' : 'bg-white',
    ].join(' ')}>
      <div className="flex items-center gap-1 mb-4">
        <button type="button" onClick={prevMonth} className="p-1.5 rounded-full hover:bg-surface transition-colors shrink-0" aria-label="Mes anterior">
          <ChevronLeft size={16} className="text-text" />
        </button>
        <p className="flex-1 text-center font-semibold text-text text-sm capitalize">
          {MONTHS[viewMonth]} {viewYear}
        </p>
        <button type="button" onClick={nextMonth} className="p-1.5 rounded-full hover:bg-surface transition-colors shrink-0" aria-label="Mes siguiente">
          <ChevronRight size={16} className="text-text" />
        </button>
      </div>
      <CalendarMonth year={viewYear} month={viewMonth} today={today} selected={selected} onSelect={onApply} />
    </div>
  )
}

function TimePicker({ selected, onSelect, darkMode }) {
  const listRef = useRef(null)

  useEffect(() => {
    if (selected && listRef.current) {
      const btn = listRef.current.querySelector(`[data-slot="${selected}"]`)
      btn?.scrollIntoView({ block: 'center' })
    }
  }, [selected])

  return (
    <div className={[
      'w-36 rounded-2xl border border-border py-2',
      'shadow-[0_8px_40px_rgba(0,0,0,0.12)]',
      darkMode ? 'bg-[#1e2a3a]' : 'bg-white',
    ].join(' ')}>
      <div ref={listRef} className="max-h-52 overflow-y-auto">
        {TIME_SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            data-slot={slot}
            onClick={() => onSelect(slot)}
            className={[
              'w-full text-left px-4 py-2 text-sm transition-colors duration-100',
              selected === slot
                ? 'bg-primary-light text-primary font-semibold'
                : darkMode ? 'text-white hover:bg-white/10' : 'text-text hover:bg-surface',
            ].join(' ')}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
  )
}

export function AppointmentForm({ darkMode = false, submitLabel, mode = 'cita', onSubmit }) {
  const [openPanel, setOpenPanel] = useState(null)
  const [treatment, setTreatment] = useState(null)
  const [date, setDate] = useState(null)
  const [time, setTime] = useState(null)

  const containerRef      = useRef(null)
  const dateBtnRef        = useRef(null)
  const timeBtnRef        = useRef(null)
  const treatmentBtnRef   = useRef(null)
  const datePanelRef      = useRef(null)
  const timePanelRef      = useRef(null)
  const treatmentPanelRef = useRef(null)

  const toggle = (panel) => setOpenPanel(p => p === panel ? null : panel)

  const handleClickOutside = useCallback((e) => {
    const insideForm = containerRef.current?.contains(e.target)
    const insidePanel =
      datePanelRef.current?.contains(e.target) ||
      timePanelRef.current?.contains(e.target) ||
      treatmentPanelRef.current?.contains(e.target)
    if (!insideForm && !insidePanel) setOpenPanel(null)
  }, [])

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [handleClickOutside])

  const resolvedLabel = submitLabel ?? 'Reservar cita'

  const formattedDate = date
    ? `${date.getDate()} ${MONTHS[date.getMonth()]} ${date.getFullYear()}`
    : null

  const border           = darkMode ? 'border-white/20' : 'border-border'
  const bg               = darkMode ? 'bg-white/10' : 'bg-white'
  const labelColor       = darkMode ? 'text-white/60' : 'text-muted'
  const valueColor       = darkMode ? 'text-white' : 'text-text'
  const placeholderColor = darkMode ? 'text-white/40' : 'text-muted/60'
  const dividerColor     = darkMode ? 'bg-white/20' : 'bg-border'
  const hoverBg          = darkMode ? 'hover:bg-white/10' : 'hover:bg-surface'

  return (
    <form
      ref={containerRef}
      onSubmit={(e) => { e.preventDefault(); if (onSubmit && treatment && date && time) onSubmit({ treatment, date, time, mode }) }}
      aria-label="Formulario de reserva de cita"
      className="w-full"
    >
      <div className={`flex flex-col lg:flex-row lg:items-stretch rounded-2xl border ${border} ${bg} shadow-card`}>

        {/* Date field */}
        <div className="lg:flex-1">
          <button
            ref={dateBtnRef}
            type="button"
            onClick={() => toggle('date')}
            className={[
              'flex items-center gap-3 px-5 py-4 w-full rounded-t-2xl lg:rounded-t-none lg:rounded-l-2xl transition-colors duration-150 h-full text-left',
              hoverBg,
              openPanel === 'date' ? (darkMode ? 'bg-white/10' : 'bg-surface') : '',
            ].join(' ')}
            aria-expanded={openPanel === 'date'}
          >
            <Calendar size={18} className="shrink-0 text-muted lg:hidden" aria-hidden="true" />
            <div className="whitespace-nowrap relative">
              <p className="text-xs font-medium mb-0.5 opacity-0 pointer-events-none select-none" aria-hidden="true">Fecha de la cita</p>
              <p className="text-sm font-semibold opacity-0 pointer-events-none select-none" aria-hidden="true">28 septiembre 2026</p>
              <div className="absolute inset-0 flex flex-col justify-center">
                <p className={`text-xs font-medium mb-0.5 ${labelColor}`}>Fecha de la cita</p>
                <p className={`text-sm font-semibold ${formattedDate ? valueColor : placeholderColor}`}>
                  {formattedDate ?? 'Añadir fecha'}
                </p>
              </div>
            </div>
          </button>
          {openPanel === 'date' && (
            <DropdownPortal anchorRef={dateBtnRef} align="left" panelRef={datePanelRef}>
              <DatePicker selected={date} darkMode={darkMode} onApply={(d) => { setDate(d); setOpenPanel(null) }} />
            </DropdownPortal>
          )}
        </div>

        {/* Divider */}
        <div className={`h-px w-full lg:h-auto lg:w-px lg:self-stretch lg:my-3 ${dividerColor}`} />

        {/* Time field */}
        <div>
          <button
            ref={timeBtnRef}
            type="button"
            onClick={() => toggle('time')}
            className={[
              'flex items-center gap-3 px-5 py-4 w-full transition-colors duration-150 h-full text-left',
              hoverBg,
              openPanel === 'time' ? (darkMode ? 'bg-white/10' : 'bg-surface') : '',
            ].join(' ')}
            aria-expanded={openPanel === 'time'}
          >
            <Clock size={18} className="shrink-0 text-muted lg:hidden" aria-hidden="true" />
            <div className="whitespace-nowrap relative">
              <p className="text-xs font-medium mb-0.5 opacity-0 pointer-events-none select-none" aria-hidden="true">Hora</p>
              <p className="text-sm font-semibold opacity-0 pointer-events-none select-none" aria-hidden="true">Añadir hora</p>
              <div className="absolute inset-0 flex flex-col justify-center">
                <p className={`text-xs font-medium mb-0.5 ${labelColor}`}>Hora</p>
                <p className={`text-sm font-semibold ${time ? valueColor : placeholderColor}`}>
                  {time ?? 'Añadir hora'}
                </p>
              </div>
            </div>
          </button>
          {openPanel === 'time' && (
            <DropdownPortal anchorRef={timeBtnRef} align="left" panelRef={timePanelRef}>
              <TimePicker selected={time} darkMode={darkMode} onSelect={(t) => { setTime(t); setOpenPanel(null) }} />
            </DropdownPortal>
          )}
        </div>

        {/* Divider */}
        <div className={`h-px w-full lg:h-auto lg:w-px lg:self-stretch lg:my-3 ${dividerColor}`} />

        {/* Treatment field */}
        <div>
          <button
            ref={treatmentBtnRef}
            type="button"
            onClick={() => toggle('treatment')}
            className={[
              'flex items-center gap-3 px-5 py-4 w-full transition-colors duration-150 h-full text-left',
              hoverBg,
              openPanel === 'treatment' ? (darkMode ? 'bg-white/10' : 'bg-surface') : '',
            ].join(' ')}
            aria-expanded={openPanel === 'treatment'}
          >
            <Stethoscope size={18} className="shrink-0 text-muted lg:hidden" aria-hidden="true" />
            <div className="whitespace-nowrap relative">
              <p className="text-xs font-medium mb-0.5 opacity-0 pointer-events-none select-none" aria-hidden="true">Tipo de tratamiento</p>
              <p className="text-sm font-semibold opacity-0 pointer-events-none select-none" aria-hidden="true">Blanqueamiento dental</p>
              <div className="absolute inset-0 flex flex-col justify-center">
                <p className={`text-xs font-medium mb-0.5 ${labelColor}`}>Tipo de tratamiento</p>
                <p className={`text-sm font-semibold ${treatment ? valueColor : placeholderColor}`}>
                  {treatment ?? 'Tratamiento'}
                </p>
              </div>
            </div>
          </button>
          {openPanel === 'treatment' && (
            <DropdownPortal anchorRef={treatmentBtnRef} align="right" panelRef={treatmentPanelRef}>
              <div className={[
                'w-56 rounded-2xl border border-border py-2',
                'shadow-[0_8px_40px_rgba(0,0,0,0.12)]',
                darkMode ? 'bg-[#1e2a3a]' : 'bg-white',
              ].join(' ')}>
                {TREATMENTS.map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => { setTreatment(t); setOpenPanel(null) }}
                    className={[
                      'w-full text-left px-4 py-2.5 text-sm transition-colors duration-100',
                      treatment === t
                        ? 'bg-primary-light text-primary font-semibold'
                        : darkMode ? 'text-white hover:bg-white/10' : 'text-text hover:bg-surface',
                    ].join(' ')}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </DropdownPortal>
          )}
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full lg:w-auto shrink-0 bg-primary hover:bg-primary/90 text-white font-semibold text-sm px-7 py-4 rounded-b-2xl lg:rounded-b-none lg:rounded-r-2xl transition-colors duration-150 whitespace-nowrap focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
        >
          {resolvedLabel}
        </button>
      </div>
    </form>
  )
}
