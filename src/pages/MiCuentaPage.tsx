import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Check, X } from 'lucide-react'
import { Nav } from '../components/sections/Nav'
import { Footer } from '../components/sections/Footer'
import { useAuth } from '../auth/AuthContext'
import { Toast, type ToastData } from '../admin/Toast'
import { EditButton } from '../components/admin/ActionIconButtons'
import { supabase } from '../lib/supabase'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function isFakeEmail(email: string) {
  return !email || email.endsWith('@patients.dentaviva.es')
}

// ─── EditableField ────────────────────────────────────────────────────────────

interface EditableFieldProps {
  label: string
  value: string
  readOnly?: boolean
  type?: string
  maxLength?: number
  validate?: (val: string) => string | undefined
  onSave: (val: string) => Promise<void>
}

function EditableField({ label, value, readOnly, type = 'text', maxLength, validate, onSave }: EditableFieldProps) {
  const [editing, setEditing]   = useState(false)
  const [draft, setDraft]       = useState(value)
  const [fieldError, setFieldError] = useState('')
  const [saving, setSaving]     = useState(false)

  const handleEdit   = () => { setDraft(value); setFieldError(''); setEditing(true) }
  const handleCancel = () => { setDraft(value); setFieldError(''); setEditing(false) }

  const handleSave = async () => {
    if (draft.trim() === value) { setEditing(false); return }
    if (validate) {
      const err = validate(draft.trim())
      if (err) { setFieldError(err); return }
    }
    setSaving(true)
    try { await onSave(draft.trim()); setEditing(false); setFieldError('') }
    finally { setSaving(false) }
  }

  return (
    <div>
      <label className="block text-body-sm font-semibold text-text mb-2">{label}</label>
      <div className="flex items-center gap-2">
        <input
          type={type}
          maxLength={maxLength}
          value={editing ? draft : value}
          readOnly={!editing || readOnly}
          onChange={e => { setDraft(e.target.value); if (fieldError) setFieldError('') }}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
          className={[
            'flex-1 px-4 py-2.5 rounded-xl border text-body-sm transition-all',
            editing && !readOnly
              ? fieldError
                ? 'border-red-400 bg-white text-text focus:outline-none focus:ring-2 focus:ring-red-200'
                : 'border-primary bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/20'
              : 'border-border bg-surface text-muted cursor-not-allowed select-none',
          ].join(' ')}
        />
        {!readOnly && !editing && <EditButton onClick={handleEdit} />}
        {!readOnly && editing && <SaveCancelButtons saving={saving} onSave={handleSave} onCancel={handleCancel} />}
      </div>
      {fieldError && <p className="mt-1 text-body-sm text-red-600">{fieldError}</p>}
    </div>
  )
}

// ─── EmailField ───────────────────────────────────────────────────────────────

interface EmailFieldProps {
  value: string
  onSave: (val: string) => Promise<void>
}

function EmailField({ value, onSave }: EmailFieldProps) {
  const noEmail = isFakeEmail(value)

  const [editing, setEditing] = useState(false)
  const [draft, setDraft]     = useState('')
  const [fieldError, setFieldError] = useState('')
  const [saving, setSaving]   = useState(false)

  const handleEdit = () => { setDraft(noEmail ? '' : value); setFieldError(''); setEditing(true) }
  const handleCancel = () => { setDraft(''); setFieldError(''); setEditing(false) }

  const handleSave = async () => {
    const trimmed = draft.trim()
    if (!EMAIL_RE.test(trimmed)) { setFieldError('Introduce un email válido.'); return }
    if (trimmed === value) { setEditing(false); return }
    setSaving(true)
    try { await onSave(trimmed); setEditing(false); setFieldError('') }
    catch { /* toast shown by parent */ }
    finally { setSaving(false) }
  }

  const isActive = noEmail || editing

  return (
    <div>
      <label className="block text-body-sm font-semibold text-text mb-2">Email</label>
      <div className="flex items-center gap-2">
        <input
          type="email"
          value={isActive ? draft : value}
          readOnly={!isActive}
          placeholder={noEmail ? 'Añade tu email' : undefined}
          onChange={e => { setDraft(e.target.value); if (fieldError) setFieldError('') }}
          onKeyDown={e => { if (e.key === 'Enter') handleSave(); if (e.key === 'Escape') handleCancel() }}
          className={[
            'flex-1 px-4 py-2.5 rounded-xl border text-body-sm transition-all',
            isActive
              ? fieldError
                ? 'border-red-400 bg-white text-text focus:outline-none focus:ring-2 focus:ring-red-200'
                : 'border-primary bg-white text-text focus:outline-none focus:ring-2 focus:ring-primary/20'
              : 'border-border bg-surface text-muted cursor-not-allowed select-none',
          ].join(' ')}
        />
        {!noEmail && !editing && <EditButton onClick={handleEdit} />}
        {(noEmail || editing) && <SaveCancelButtons saving={saving} onSave={handleSave} onCancel={noEmail ? undefined : handleCancel} />}
      </div>
      {fieldError && <p className="mt-1 text-body-sm text-red-600">{fieldError}</p>}
    </div>
  )
}

// ─── SaveCancelButtons ────────────────────────────────────────────────────────

function SaveCancelButtons({ saving, onSave, onCancel }: { saving: boolean; onSave: () => void; onCancel?: () => void }) {
  return (
    <div className="flex items-center gap-1 shrink-0">
      <button
        onClick={onSave}
        disabled={saving}
        title="Guardar"
        className="p-2 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50"
      >
        {saving
          ? <span className="w-4 h-4 block rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          : <Check size={16} strokeWidth={2} />
        }
      </button>
      {onCancel && (
        <button
          onClick={onCancel}
          disabled={saving}
          title="Cancelar"
          className="p-2 rounded-lg bg-surface text-muted hover:bg-border transition-colors disabled:opacity-50"
        >
          <X size={16} strokeWidth={2} />
        </button>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const passInputClass = (hasError: boolean) =>
  `w-full px-4 py-3 rounded-xl border text-text text-body-sm placeholder:text-muted focus:outline-none focus:ring-2 transition-all ${
    hasError
      ? 'border-red-400 focus:border-red-400 focus:ring-red-200'
      : 'border-border focus:border-primary focus:ring-primary/20'
  }`

const PASS_RULES = [
  { label: 'Mínimo 8 caracteres',         test: (p: string) => p.length >= 8 },
  { label: 'Al menos 1 símbolo (!, ?, &, ...)', test: (p: string) => /[!?&@#$%^*()_\-+={}[\];:'",.<>/\\|~`]/.test(p) },
  { label: 'Al menos una mayúscula',       test: (p: string) => /[A-Z]/.test(p) },
]

function PasswordRequirements({ value }: { value: string }) {
  if (!value) return null
  return (
    <ul className="mt-2 space-y-1">
      {PASS_RULES.map(({ label, test }) => (
        <li key={label} className={`text-body-sm transition-colors ${test(value) ? 'text-green-600' : 'text-muted'}`}>
          {label}
        </li>
      ))}
    </ul>
  )
}

export default function MiCuentaPage() {
  const { user, profile } = useAuth()
  const [localProfile, setLocalProfile] = useState(profile)
  const [toast, setToast] = useState<ToastData | null>(null)
  const [currentPass, setCurrentPass]   = useState('')
  const [newPass, setNewPass]           = useState('')
  const [confirm, setConfirm]           = useState('')
  const [passError, setPassError]       = useState('')
  const [passSaving, setPassSaving]     = useState(false)
  const [passCheck, setPassCheck]       = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle')

  useEffect(() => {
    if (!currentPass) { setPassCheck('idle'); return }
    setPassCheck('checking')
    const t = setTimeout(async () => {
      const { error } = await supabase.auth.signInWithPassword({
        email: user!.email!,
        password: currentPass,
      })
      setPassCheck(error ? 'invalid' : 'valid')
    }, 600)
    return () => clearTimeout(t)
  }, [currentPass])

  const handlePasswordSave = async () => {
    if (passCheck !== 'valid') { setPassError('La contraseña actual es incorrecta.'); return }
    if (!PASS_RULES.every(r => r.test(newPass))) { setPassError('La nueva contraseña no cumple los requisitos.'); return }
    if (newPass !== confirm) { setPassError('Las contraseñas no coinciden.'); return }
    setPassSaving(true)
    const { error: updateErr } = await supabase.auth.updateUser({ password: newPass })
    setPassSaving(false)
    if (updateErr) { setToast({ message: 'No se pudo cambiar la contraseña. Inténtalo de nuevo.', type: 'error' }); return }
    setToast({ message: 'Contraseña actualizada correctamente.', type: 'success' })
    setCurrentPass(''); setNewPass(''); setConfirm(''); setPassError(''); setPassCheck('idle')
  }

  if (!user || !localProfile) {
    return (
      <div className="min-h-screen bg-surface flex flex-col">
        <Nav />
        <main className="flex-1 flex items-center justify-center pt-24">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
        </main>
        <Footer />
      </div>
    )
  }

  const makeUpdater = (field: string) => async (val: string) => {
    if (field === 'email') {
      const { error } = await supabase.rpc('update_user_email', { p_new_email: val })
      if (error) {
        setToast({ message: 'No se pudo actualizar el email. Inténtalo de nuevo.', type: 'error' })
        throw error
      }
    } else {
      const { error } = await supabase
        .from('profiles')
        .update({ [field]: val } as any)
        .eq('id', user.id)
      if (error) {
        setToast({ message: 'No se pudo guardar el cambio. Inténtalo de nuevo.', type: 'error' })
        throw error
      }
    }

    const updatedProfile = localProfile ? { ...localProfile, [field]: val } : localProfile
    setLocalProfile(updatedProfile)

    if ((field === 'full_name' || field === 'last_name') && updatedProfile) {
      const newName = updatedProfile.last_name
        ? `${updatedProfile.full_name} ${updatedProfile.last_name}`
        : updatedProfile.full_name ?? ''
      await supabase
        .from('newsletter_subscribers')
        .update({ name: newName })
        .eq('user_id', user.id)
    }

    setToast({ message: 'Datos actualizados correctamente.', type: 'success' })
  }

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Nav />

      <main className="flex-1 px-4 pt-24 pb-16 sm:px-6 lg:px-8 lg:pt-28">
        <div className="max-w-3xl mx-auto">
          <Link to="/" className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-primary transition-colors mb-6">
            ← Volver a la web
          </Link>

          <h1 className="text-h5 font-bold text-text mb-1">Mi cuenta</h1>
          <p className="text-muted text-body-sm mb-8">Gestiona tu información personal.</p>

          <div className="bg-white border border-border rounded-2xl shadow-card p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <EditableField
                label="Nombre"
                value={localProfile.full_name ?? ''}
                onSave={makeUpdater('full_name')}
              />
              <EditableField
                label="Apellido"
                value={localProfile.last_name ?? ''}
                onSave={makeUpdater('last_name')}
              />
              <EmailField
                value={localProfile.email ?? ''}
                onSave={makeUpdater('email')}
              />
              <EditableField
                label="Teléfono"
                value={localProfile.phone ?? ''}
                type="tel"
                maxLength={9}
                validate={v => {
                  if (!v) return 'El teléfono es obligatorio.'
                  if (v.length !== 9) return 'El teléfono debe tener 9 dígitos.'
                }}
                onSave={makeUpdater('phone')}
              />
              <EditableField
                label="DNI"
                value={localProfile.dni ?? ''}
                readOnly
                onSave={async () => {}}
              />
              <div className="sm:col-span-2 border-t border-border pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-body-sm font-medium text-text mb-1.5">Contraseña actual</label>
                  <input
                    type="password"
                    value={currentPass}
                    onChange={e => { setCurrentPass(e.target.value); setPassError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') handlePasswordSave() }}
                    placeholder="Tu contraseña actual"
                    className={`w-full px-4 py-3 rounded-xl border text-text text-body-sm placeholder:text-muted focus:outline-none focus:ring-2 transition-all ${
                      passCheck === 'valid'    ? 'border-green-500 focus:border-green-500 focus:ring-green-200' :
                      passCheck === 'invalid'  ? 'border-red-400 focus:border-red-400 focus:ring-red-200' :
                                                 'border-border focus:border-primary focus:ring-primary/20'
                    }`}
                  />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-text mb-1.5">Nueva contraseña</label>
                  <input
                    type="password"
                    value={newPass}
                    onChange={e => { setNewPass(e.target.value); setPassError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') handlePasswordSave() }}
                    placeholder="Mínimo 8 caracteres"
                    className={passInputClass(!!passError && !PASS_RULES.every(r => r.test(newPass)))}
                  />
                  <PasswordRequirements value={newPass} />
                </div>
                <div>
                  <label className="block text-body-sm font-medium text-text mb-1.5">Confirmar contraseña</label>
                  <input
                    type="password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setPassError('') }}
                    onKeyDown={e => { if (e.key === 'Enter') handlePasswordSave() }}
                    placeholder="Repite la contraseña"
                    className={passInputClass(!!passError && newPass !== confirm)}
                  />
                </div>
                {passError && <p className="sm:col-span-2 -mt-2 text-body-sm text-red-600">{passError}</p>}
                <div className="sm:col-span-2 flex items-center gap-2">
                  <SaveCancelButtons saving={passSaving} onSave={handlePasswordSave} />
                  <span className="text-body-sm text-muted">Guardar contraseña</span>
                </div>
              </div>
            </div>
          </div>

          <Link to="/" className="inline-flex items-center gap-1.5 text-body-sm text-muted hover:text-primary transition-colors mt-8">
            ← Volver a la web
          </Link>
        </div>
      </main>

      <Footer />
      {toast && <Toast {...toast} onDismiss={() => setToast(null)} />}
    </div>
  )
}
