import { useState, useEffect, useMemo, useRef } from 'react'
import { Search, UserPlus, Pencil, Trash2, Check, X, Eye, EyeOff, ChevronDown, Copy, Wand2 } from 'lucide-react'
import { Toast, type ToastData } from '../../admin/Toast'
import { getInitials, avatarColor } from '../../utils/adminUtils'
import { CallButton, EmailButton, EditButton, DeleteButton, RefreshButton } from '../../components/admin/ActionIconButtons'
import { supabase } from '../../lib/supabase'
import { getAllPatients, adminUpdatePatient, adminDeletePatient, adminCreatePatient } from '../../services/adminService'
import type { PatientRow } from '../../types/admin'

// ─── Constants ────────────────────────────────────────────────────────────────

const PAGE_SIZE = 10

const SORT_OPTIONS = [
  { value: 'created_desc', label: 'Más recientes primero' },
  { value: 'created_asc',  label: 'Más antiguos primero' },
  { value: 'name_asc',     label: 'Nombre A → Z' },
  { value: 'name_desc',    label: 'Nombre Z → A' },
] as const

type SortValue = (typeof SORT_OPTIONS)[number]['value']

const PWD_CRITERIA = [
  { id: 'len',   label: 'Mínimo 8 caracteres',   test: (p: string) => p.length >= 8 },
  { id: 'upper', label: 'Al menos una mayúscula', test: (p: string) => /[A-Z]/.test(p) },
  { id: 'digit', label: 'Al menos un número',     test: (p: string) => /[0-9]/.test(p) },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────


function formatFecha(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('es-ES', {
    day: 'numeric', month: 'short', year: 'numeric',
  })
}

function validateDni(dni: string): boolean {
  const letters = 'TRWAGMYFPDXBNJZSQVHLCKE'
  const clean = dni.trim().toUpperCase()
  if (!/^[0-9]{8}[A-Z]$/.test(clean)) return false
  return clean[8] === letters[parseInt(clean.slice(0, 8)) % 23]
}

function isFakeEmail(email: string): boolean {
  return !!email?.endsWith('@patients.dentalviva.es')
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

// ─── Password generator ───────────────────────────────────────────────────────

function generatePassword(): string {
  const upper   = 'ABCDEFGHJKLMNPQRSTUVWXYZ'
  const lower   = 'abcdefghjkmnpqrstuvwxyz'
  const digits  = '23456789'
  const symbols = '!@#$%&*?'
  const all     = upper + lower + digits + symbols
  const pick    = (s: string) => s[Math.floor(Math.random() * s.length)]
  const chars   = [pick(upper), pick(digits), pick(symbols), ...Array.from({ length: 5 }, () => pick(all))]
  for (let i = chars.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[chars[i], chars[j]] = [chars[j], chars[i]]
  }
  return chars.join('')
}

// ─── CopyButton ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = () => {
    navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      onClick={handleCopy}
      title="Copiar"
      className="p-1 rounded-md text-muted/40 hover:text-muted transition-colors shrink-0"
    >
      {copied
        ? <Check size={12} strokeWidth={2.5} className="text-emerald-500" />
        : <Copy size={12} strokeWidth={1.75} />
      }
    </button>
  )
}

// ─── DeleteModal ──────────────────────────────────────────────────────────────

interface DeleteModalProps {
  patient: PatientRow
  deleting: boolean
  onConfirm: (deleteNewsletter: boolean) => void
  onCancel: () => void
}

function DeleteModal({ patient, deleting, onConfirm, onCancel }: DeleteModalProps) {
  const [deleteNewsletter, setDeleteNewsletter] = useState(false)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCancel() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onCancel])

  const fullName = [patient.full_name, patient.last_name].filter(Boolean).join(' ')

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={e => e.stopPropagation()}>
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mb-4">
          <Trash2 size={20} className="text-red-600" strokeWidth={1.75} />
        </div>
        <h2 className="text-h5 font-bold text-text mb-2">Eliminar paciente</h2>
        <p className="text-body-sm text-muted mb-5">
          ¿Estás seguro de que quieres eliminar a{' '}
          <strong className="text-text">{fullName}</strong>?
          Esta acción no se puede deshacer.
        </p>

        {/* Newsletter checkbox */}
        <label className="flex items-center gap-3 cursor-pointer select-none mb-6 p-3 rounded-xl bg-surface hover:bg-border/40 transition-colors">
          <button
            type="button"
            onClick={() => setDeleteNewsletter(v => !v)}
            className={`w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
              deleteNewsletter ? 'bg-red-500 border-red-500' : 'border-border bg-white'
            }`}
          >
            {deleteNewsletter && <Check size={12} strokeWidth={3} className="text-white" />}
          </button>
          <span className="text-body-sm text-muted leading-snug">
            Eliminar también de la newsletter
          </span>
        </label>

        <div className="flex gap-3">
          <button
            onClick={onCancel}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-body-sm font-medium text-text
              hover:bg-surface transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onConfirm(deleteNewsletter)}
            disabled={deleting}
            className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-body-sm font-semibold
              hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {deleting ? (
              <>
                <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                Eliminando...
              </>
            ) : 'Eliminar'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── CreatePatientModal ───────────────────────────────────────────────────────

interface CreatePatientModalProps {
  onClose: () => void
  onCreated: (patient: PatientRow) => void
  onToast: (t: ToastData) => void
}

function CreatePatientModal({ onClose, onCreated, onToast }: CreatePatientModalProps) {
  const [fields, setFields] = useState({
    full_name: '', last_name: '', dni: '', email: '', phone: '',
    password: '', confirm_password: '',
  })
  const [newsletter, setNewsletter]     = useState(false)
  const [errors, setErrors]             = useState<Record<string, string>>({})
  const [touched, setTouched]           = useState<Record<string, boolean>>({})
  const [submitting, setSubmitting]     = useState(false)
  const [showPwd, setShowPwd]           = useState(false)
  const [showConfirm, setShowConfirm]   = useState(false)
  const [isGenerated, setIsGenerated]   = useState(false)
  const [copiedPwd, setCopiedPwd]       = useState(false)
  const [isSubscribed, setIsSubscribed] = useState<boolean | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasValidEmail = isValidEmail(fields.email) && !isFakeEmail(fields.email)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    if (!hasValidEmail) { setIsSubscribed(null); return }
    debounceRef.current = setTimeout(async () => {
      try {
        const { data } = await supabase.rpc('is_email_subscribed', {
          p_email: fields.email.trim().toLowerCase(),
        })
        setIsSubscribed(data === true)
      } catch { setIsSubscribed(null) }
    }, 500)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [fields.email, hasValidEmail])

  const pwdMet   = PWD_CRITERIA.map(c => c.test(fields.password))
  const pwdReady = pwdMet.every(Boolean)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!fields.full_name.trim()) e.full_name = 'El nombre es obligatorio.'
    if (!fields.dni.trim())       e.dni       = 'El DNI es obligatorio.'
    if (!fields.password) e.password = 'La contraseña es obligatoria.'
    else if (!pwdReady)   e.password = 'La contraseña no cumple los requisitos.'
    if (fields.password !== fields.confirm_password) e.confirm_password = 'Las contraseñas no coinciden.'
    return e
  }

  const set = (field: string, value: string) => {
    setFields(prev => ({ ...prev, [field]: value }))
    setTouched(prev => ({ ...prev, [field]: true }))
    setErrors(prev => ({ ...prev, [field]: '' }))
    if (field === 'password') setIsGenerated(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }
    setSubmitting(true)
    try {
      const patient = await adminCreatePatient({
        ...fields,
        newsletter: hasValidEmail && isSubscribed === false && newsletter,
      })
      onCreated(patient)
      onClose()
      onToast({ message: 'Paciente creado correctamente.', type: 'success' })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Error al crear el paciente.'
      onToast({ message: msg, type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  const f = (name: keyof typeof fields) => ({
    value: fields[name],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => set(name, e.target.value),
  })

  const fieldCls = (name: string) =>
    `w-full px-3 py-2.5 rounded-xl border text-body-sm text-text placeholder:text-muted/60
    focus:outline-none focus:ring-2 transition-all ${
      errors[name] && touched[name]
        ? 'border-red-400 focus:ring-red-200 focus:border-red-400'
        : 'border-border focus:ring-primary/20 focus:border-primary'
    }`

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg my-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-border/60">
          <h2 className="text-h5 font-bold text-text">Nuevo paciente</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors"
          >
            <X size={16} strokeWidth={2} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4">

          {/* Nombre + Apellido */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-body-sm font-medium text-text mb-1.5">Nombre</label>
              <input {...f('full_name')} placeholder="Nombre" className={fieldCls('full_name')} />
              {errors.full_name && touched.full_name && (
                <p className="text-[11px] text-red-500 mt-1">{errors.full_name}</p>
              )}
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text mb-1.5">Apellido</label>
              <input {...f('last_name')} placeholder="Apellido" className={fieldCls('last_name')} />
            </div>
          </div>

          {/* DNI + Teléfono */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-body-sm font-medium text-text mb-1.5">DNI</label>
              <input {...f('dni')} placeholder="12345678A" className={fieldCls('dni')} />
              {errors.dni && touched.dni && (
                <p className="text-[11px] text-red-500 mt-1">{errors.dni}</p>
              )}
            </div>
            <div>
              <label className="block text-body-sm font-medium text-text mb-1.5">Teléfono</label>
              <input {...f('phone')} type="tel" placeholder="123 456 789" className={fieldCls('phone')} />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-body-sm font-medium text-text mb-1.5">
              Correo electrónico <span className="text-muted font-normal">(opcional)</span>
            </label>
            <input {...f('email')} type="email" placeholder="tu@gmail.com" className={fieldCls('email')} />
          </div>

          {/* Password */}
          <div>
            <label className="block text-body-sm font-medium text-text mb-1.5">Contraseña</label>
            <div className="flex gap-2 items-start">
              <div className="relative flex-1">
                <input
                  {...f('password')}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="Introduce una contraseña"
                  className={fieldCls('password') + (isGenerated ? ' pr-16' : ' pr-10')}
                />
                {isGenerated && (
                  <button
                    type="button"
                    title="Copiar contraseña"
                    onClick={() => {
                      navigator.clipboard.writeText(fields.password)
                      setCopiedPwd(true)
                      setTimeout(() => setCopiedPwd(false), 1500)
                    }}
                    className="absolute right-9 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                  >
                    {copiedPwd
                      ? <Check size={14} strokeWidth={2.5} className="text-emerald-500" />
                      : <Copy size={14} strokeWidth={1.75} />
                    }
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowPwd(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
                >
                  {showPwd ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  const pwd = generatePassword()
                  setFields(prev => ({ ...prev, password: pwd, confirm_password: pwd }))
                  setTouched(prev => ({ ...prev, password: true, confirm_password: true }))
                  setErrors(prev => ({ ...prev, password: '', confirm_password: '' }))
                  setIsGenerated(true)
                  setShowPwd(true)
                }}
                className="px-3 py-2.5 rounded-xl border border-border text-body-sm
                  font-medium text-muted hover:text-text hover:bg-surface transition-colors whitespace-nowrap shrink-0"
              >
                Generar contraseña
              </button>
            </div>
            {errors.password && touched.password && (
              <p className="text-[11px] text-red-500 mt-1">{errors.password}</p>
            )}
          </div>

          {/* Confirm password */}
          <div>
            <label className="block text-body-sm font-medium text-text mb-1.5">Confirmar contraseña</label>
            <div className="relative">
              <input
                {...f('confirm_password')}
                type={showConfirm ? 'text' : 'password'}
                placeholder="Repite la contraseña"
                className={fieldCls('confirm_password') + ' pr-10'}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-text transition-colors"
              >
                {showConfirm ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
              </button>
            </div>
            {errors.confirm_password && touched.confirm_password && (
              <p className="text-[11px] text-red-500 mt-1">{errors.confirm_password}</p>
            )}
          </div>

          {/* Newsletter */}
          {hasValidEmail && isSubscribed === false && (
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <button
                type="button"
                onClick={() => setNewsletter(v => !v)}
                className={`mt-0.5 w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all ${
                  newsletter
                    ? 'bg-primary border-primary'
                    : 'border-border bg-white hover:border-primary/50'
                }`}
                aria-checked={newsletter}
              >
                {newsletter && <Check size={12} strokeWidth={3} className="text-white" />}
              </button>
              <span className="text-body-sm text-muted leading-snug">
                Suscribir al paciente a consejos semanales de salud dental
              </span>
            </label>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-body-sm font-medium text-text
                hover:bg-surface transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 px-4 py-2.5 rounded-xl bg-primary text-white text-body-sm font-semibold
                hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  Creando...
                </>
              ) : 'Crear paciente'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

interface EditDraft {
  full_name: string
  last_name: string
  dni: string
  email: string
  phone: string
}

export default function AdminPacientesPage() {
  const [patients, setPatients]           = useState<PatientRow[]>([])
  const [loading, setLoading]             = useState(true)
  const [error, setError]                 = useState<string | null>(null)
  const [search, setSearch]               = useState('')
  const [sort, setSort]                   = useState<SortValue>('created_desc')
  const [page, setPage]                   = useState(1)
  const [editingId, setEditingId]         = useState<string | null>(null)
  const [editDraft, setEditDraft]         = useState<EditDraft>({ full_name: '', last_name: '', dni: '', email: '', phone: '' })
  const [editErrors, setEditErrors]       = useState<Record<string, string>>({})
  const [savingId, setSavingId]           = useState<string | null>(null)
  const [deleteTarget, setDeleteTarget]   = useState<PatientRow | null>(null)
  const [deleting, setDeleting]           = useState(false)
  const [showCreate, setShowCreate]       = useState(false)
  const [toast, setToast]                 = useState<ToastData | null>(null)
  const [refreshing, setRefreshing]       = useState(false)

  const load = () => {
    setLoading(true)
    setError(null)
    getAllPatients()
      .then(setPatients)
      .catch(() => setError('No se pudieron cargar los pacientes.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  // ── Derived ──────────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    let list = patients
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(p =>
        `${p.full_name} ${p.last_name ?? ''}`.toLowerCase().includes(q) ||
        p.dni.toLowerCase().includes(q) ||
        (p.email ?? '').toLowerCase().includes(q) ||
        (p.phone ?? '').toLowerCase().includes(q)
      )
    }
    return [...list].sort((a, b) => {
      switch (sort) {
        case 'created_desc': return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        case 'created_asc':  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case 'name_asc':     return a.full_name.localeCompare(b.full_name, 'es')
        case 'name_desc':    return b.full_name.localeCompare(a.full_name, 'es')
      }
    })
  }, [patients, search, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const paginated  = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Inline edit ──────────────────────────────────────────────────────────────

  const startEdit = (p: PatientRow) => {
    setEditingId(p.id)
    setEditDraft({
      full_name: p.full_name,
      last_name: p.last_name ?? '',
      dni:       p.dni,
      email:     isFakeEmail(p.email) ? '' : p.email,
      phone:     p.phone ?? '',
    })
    setEditErrors({})
  }

  const cancelEdit = () => { setEditingId(null); setEditErrors({}) }

  const saveEdit = async (id: string) => {
    const e: Record<string, string> = {}
    if (!editDraft.full_name.trim()) e.full_name = 'Obligatorio'
    if (!editDraft.dni.trim())       e.dni = 'Obligatorio'
    if (Object.keys(e).length > 0) { setEditErrors(e); return }

    setSavingId(id)
    try {
      await adminUpdatePatient(id, editDraft)
      const savedEmail = editDraft.email.trim()
        ? editDraft.email.trim().toLowerCase()
        : `${editDraft.dni.toLowerCase().replace(/\W/g, '')}@patients.dentalviva.es`
      setPatients(prev => prev.map(p => p.id !== id ? p : {
        ...p,
        full_name: editDraft.full_name.trim(),
        last_name: editDraft.last_name.trim() || null,
        dni:       editDraft.dni.toUpperCase(),
        email:     savedEmail,
        phone:     editDraft.phone.trim() || null,
      }))
      setEditingId(null)
      setToast({ message: 'Paciente actualizado correctamente.', type: 'success' })
    } catch {
      setToast({ message: 'Error al actualizar el paciente.', type: 'error' })
    } finally {
      setSavingId(null)
    }
  }

  // ── Delete ───────────────────────────────────────────────────────────────────

  const confirmDelete = async (deleteNewsletter: boolean) => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await adminDeletePatient(deleteTarget.id, deleteNewsletter)
      setPatients(prev => prev.filter(p => p.id !== deleteTarget.id))
      setDeleteTarget(null)
      setToast({ message: 'Paciente eliminado correctamente.', type: 'success' })
    } catch {
      setToast({ message: 'Error al eliminar el paciente.', type: 'error' })
    } finally {
      setDeleting(false)
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  const inputCls = (name: string) =>
    `w-full px-2 py-1.5 rounded-lg border text-[12px] text-text placeholder:text-muted/50
    focus:outline-none focus:ring-1 transition-all ${
      editErrors[name]
        ? 'border-red-400 focus:ring-red-300'
        : 'border-border focus:ring-primary/30 focus:border-primary'
    }`

  return (
    <div className="p-6 lg:p-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h4 font-bold text-text mb-1">Pacientes</h1>
          <p className="text-muted text-body-sm">Gestiona los pacientes registrados en la clínica</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white text-body-sm font-semibold
            hover:bg-primary/90 transition-colors shrink-0"
        >
          <UserPlus size={15} strokeWidth={2} />
          Nuevo paciente
        </button>
      </div>

      <div className="bg-white border border-border rounded-2xl shadow-card overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-border/60">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted" strokeWidth={2} />
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, email..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1) }}
              className="pl-8 pr-4 py-2 rounded-xl border border-border text-body-sm text-text placeholder:text-muted
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all w-72"
            />
          </div>
          <div className="relative shrink-0">
            <select
              value={sort}
              onChange={e => { setSort(e.target.value as SortValue); setPage(1) }}
              className="appearance-none pl-3 pr-8 py-2 rounded-xl border border-border text-body-sm text-text bg-white
                focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              {SORT_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted pointer-events-none" strokeWidth={2} />
          </div>
          <div className="ml-auto shrink-0">
            <RefreshButton
              onClick={async () => { setRefreshing(true); load(); setRefreshing(false) }}
              disabled={refreshing}
              loading={refreshing}
              label="Actualizar"
            />
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-surface/60 border-b border-border/60">
              <tr>
                <th className="px-4 py-3 text-left text-body-sm font-semibold text-text whitespace-nowrap">ID</th>
                <th className="px-4 py-3 text-left text-body-sm font-semibold text-text whitespace-nowrap">Paciente</th>
                <th className="px-4 py-3 text-left text-body-sm font-semibold text-text whitespace-nowrap">DNI</th>
                <th className="px-4 py-3 text-left text-body-sm font-semibold text-text whitespace-nowrap">Email</th>
                <th className="px-4 py-3 text-left text-body-sm font-semibold text-text whitespace-nowrap">Teléfono</th>
                <th className="px-4 py-3 text-left text-body-sm font-semibold text-text whitespace-nowrap">Alta</th>
                <th className="px-4 py-3 text-right text-body-sm font-semibold text-text">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">

              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin mx-auto" />
                  </td>
                </tr>
              )}

              {!loading && error && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center">
                    <p className="text-muted text-body-sm mb-3">{error}</p>
                    <button
                      onClick={load}
                      className="px-4 py-2 rounded-xl bg-surface text-body-sm font-medium text-text hover:bg-border transition-colors"
                    >
                      Reintentar
                    </button>
                  </td>
                </tr>
              )}

              {!loading && !error && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-16 text-center text-muted text-body-sm">
                    {search.trim()
                      ? 'No hay pacientes que coincidan con la búsqueda.'
                      : 'No hay pacientes registrados todavía.'}
                  </td>
                </tr>
              )}

              {!loading && !error && paginated.map(patient => {
                const isEditing = editingId === patient.id
                const isSaving  = savingId  === patient.id
                const fullName  = [patient.full_name, patient.last_name].filter(Boolean).join(' ')
                const fakeEmail = isFakeEmail(patient.email)

                return (
                  <tr
                    key={patient.id}
                    className={isEditing ? 'bg-primary-light/40' : 'hover:bg-surface/40 transition-colors'}
                  >
                    {/* ID */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-body-sm text-muted font-mono" title={patient.id}>
                          {patient.id.slice(0, 4)}...
                        </span>
                        <CopyButton value={patient.id} />
                      </div>
                    </td>

                    {/* Paciente */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex flex-col gap-1.5 min-w-[180px]">
                          <input
                            value={editDraft.full_name}
                            onChange={e => setEditDraft(d => ({ ...d, full_name: e.target.value }))}
                            placeholder="Nombre"
                            className={inputCls('full_name')}
                          />
                          {editErrors.full_name && (
                            <p className="text-[10px] text-red-500 -mt-0.5">{editErrors.full_name}</p>
                          )}
                          <input
                            value={editDraft.last_name}
                            onChange={e => setEditDraft(d => ({ ...d, last_name: e.target.value }))}
                            placeholder="Apellido"
                            className={inputCls('last_name')}
                          />
                        </div>
                      ) : (
                        <span className="text-body-sm font-medium text-text whitespace-nowrap">{fullName}</span>
                      )}
                    </td>

                    {/* DNI */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <div className="flex flex-col gap-1 min-w-[110px]">
                          <input
                            value={editDraft.dni}
                            onChange={e => setEditDraft(d => ({ ...d, dni: e.target.value }))}
                            placeholder="12345678A"
                            className={inputCls('dni')}
                          />
                          {editErrors.dni && (
                            <p className="text-[10px] text-red-500 -mt-0.5">{editErrors.dni}</p>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-body-sm text-muted font-mono">{patient.dni}</span>
                          <CopyButton value={patient.dni} />
                        </div>
                      )}
                    </td>

                    {/* Email */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editDraft.email}
                          onChange={e => setEditDraft(d => ({ ...d, email: e.target.value }))}
                          placeholder="paciente@email.com"
                          type="email"
                          className={inputCls('email') + ' min-w-[180px]'}
                        />
                      ) : fakeEmail ? (
                        <div className="flex items-center gap-1">
                          <span className="text-body-sm text-muted/40 italic">Sin email</span>
                          <EmailButton email={null} />
                        </div>
                      ) : (
                        <div className="flex items-center gap-1">
                          <span className="text-body-sm text-muted">{patient.email}</span>
                          <EmailButton email={patient.email} />
                        </div>
                      )}
                    </td>

                    {/* Teléfono */}
                    <td className="px-4 py-3">
                      {isEditing ? (
                        <input
                          value={editDraft.phone}
                          onChange={e => setEditDraft(d => ({ ...d, phone: e.target.value }))}
                          placeholder="612 345 678"
                          type="tel"
                          className={inputCls('phone') + ' min-w-[120px]'}
                        />
                      ) : (
                        <div className="flex items-center gap-1">
                          {patient.phone && <span className="text-body-sm text-muted">{patient.phone}</span>}
                          <CallButton phone={patient.phone} />
                        </div>
                      )}
                    </td>

                    {/* Alta */}
                    <td className="px-4 py-3">
                      <span className="text-body-sm text-muted whitespace-nowrap">
                        {formatFecha(patient.created_at)}
                      </span>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 justify-end">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => saveEdit(patient.id)}
                              disabled={isSaving}
                              title="Guardar"
                              className="p-1.5 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                              {isSaving
                                ? <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                                : <Check size={14} strokeWidth={2.5} />
                              }
                            </button>
                            <button
                              onClick={cancelEdit}
                              title="Cancelar edición"
                              className="p-1.5 rounded-lg text-white bg-rose-500 hover:bg-rose-600 transition-colors"
                            >
                              <X size={14} strokeWidth={2} />
                            </button>
                          </>
                        ) : (
                          <>
                            <EditButton onClick={() => startEdit(patient)} />
                            <DeleteButton onClick={() => setDeleteTarget(patient)} />
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border/60">
          <p className="text-body-sm text-muted">
            {filtered.length === 0
              ? 'Sin resultados'
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} de ${filtered.length} pacientes`
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

      {deleteTarget && (
        <DeleteModal
          patient={deleteTarget}
          deleting={deleting}
          onConfirm={confirmDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}

      {showCreate && (
        <CreatePatientModal
          onClose={() => setShowCreate(false)}
          onCreated={patient => setPatients(prev => [patient, ...prev])}
          onToast={setToast}
        />
      )}

      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
