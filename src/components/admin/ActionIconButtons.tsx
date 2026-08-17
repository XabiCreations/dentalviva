import { CheckCircle, XCircle, Phone, Mail, RefreshCw } from 'lucide-react'

const iconOnly  = 'p-2 rounded-lg transition-colors'
const withLabel = 'flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors text-body-sm font-medium'

// ─── ApproveButton ────────────────────────────────────────────────────────────

interface ApproveButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export function ApproveButton({ onClick, disabled, loading }: ApproveButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Aprobar"
      className={`${iconOnly} bg-emerald-50 text-emerald-600 hover:bg-emerald-100 disabled:opacity-50`}
    >
      {loading
        ? <span className="w-4 h-4 block rounded-full border-2 border-emerald-300 border-t-emerald-600 animate-spin" />
        : <CheckCircle size={16} strokeWidth={2} />
      }
    </button>
  )
}

// ─── RejectButton ─────────────────────────────────────────────────────────────

interface RejectButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
}

export function RejectButton({ onClick, disabled, loading }: RejectButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Rechazar"
      className={`${iconOnly} bg-red-50 text-red-500 hover:bg-red-100 disabled:opacity-50`}
    >
      {loading
        ? <span className="w-4 h-4 block rounded-full border-2 border-red-300 border-t-red-500 animate-spin" />
        : <XCircle size={16} strokeWidth={2} />
      }
    </button>
  )
}

// ─── RefreshButton ────────────────────────────────────────────────────────────

interface RefreshButtonProps {
  onClick: () => void
  disabled?: boolean
  loading?: boolean
  label?: string
}

export function RefreshButton({ onClick, disabled, loading, label }: RefreshButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title="Actualizar"
      className={`${label ? withLabel : iconOnly} bg-surface text-muted hover:bg-border hover:text-text disabled:opacity-40`}
    >
      <RefreshCw size={14} strokeWidth={1.75} className={loading ? 'animate-spin' : ''} />
      {label && <span>{label}</span>}
    </button>
  )
}

// ─── CallButton ───────────────────────────────────────────────────────────────

interface CallButtonProps {
  phone: string | null
}

export function CallButton({ phone }: CallButtonProps) {
  if (phone) {
    return (
      <a
        href={`tel:${phone.replace(/\s/g, '')}`}
        title={`Llamar: ${phone}`}
        className={`${iconOnly} bg-primary/10 text-primary hover:bg-primary/20`}
      >
        <Phone size={16} strokeWidth={1.75} />
      </a>
    )
  }
  return (
    <span title="Sin teléfono" className={`${iconOnly} bg-primary/10 text-primary/30 cursor-not-allowed`}>
      <Phone size={16} strokeWidth={1.75} />
    </span>
  )
}

// ─── EmailButton ──────────────────────────────────────────────────────────────

interface EmailButtonProps {
  email: string | null
}

export function EmailButton({ email }: EmailButtonProps) {
  if (email) {
    return (
      <a
        href={`mailto:${email}`}
        title={`Email: ${email}`}
        className={`${iconOnly} bg-primary/10 text-primary hover:bg-primary/20`}
      >
        <Mail size={16} strokeWidth={1.75} />
      </a>
    )
  }
  return (
    <span title="Sin email" className={`${iconOnly} bg-primary/10 text-primary/30 cursor-not-allowed`}>
      <Mail size={16} strokeWidth={1.75} />
    </span>
  )
}
