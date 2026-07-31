import { useState, useEffect } from 'react'
import { X, CheckCircle } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { AppointmentForm } from './AppointmentForm'
import { useAuth } from '../../auth/AuthContext'
import { createCita } from '../../services/citasService'

function DentalLogoSmall() {
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

/**
 * AppointmentModal — modal wrapper around AppointmentForm.
 * Props:
 *  - mode: 'cita'
 *  - onClose: () => void
 *  - initialData: optional { treatment, date, time } — pre-fills form (not used by form yet, reserved)
 */
export function AppointmentModal({ mode, onClose, initialData }) {
  const { user, profile } = useAuth()
  const navigate = useNavigate()
  const [step, setStep] = useState('form') // 'form' | 'auth-required' | 'success'
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const title = 'Reservar cita'
  const subtitle = 'Selecciona el tratamiento y la fecha que mejor te venga.'

  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const handleFormSubmit = async ({ treatment, date, time, mode: m }) => {
    if (!user) {
      setStep('auth-required')
      return
    }
    setSaving(true)
    setError('')
    try {
      await createCita({
        userId: user.id,
        tipo: m,
        tratamiento: treatment,
        fecha: date,
        hora: time,
        patientName: profile?.full_name ?? null,
      })
      setStep('success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar la cita.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-text/50 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative">
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-0">
          <div>
            <h2 className="text-h4 font-bold text-text">{title}</h2>
            {step === 'form' && <p className="text-body-sm text-muted mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-muted hover:bg-surface transition-colors shrink-0 ml-4"
            aria-label="Cerrar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          {step === 'form' && (
            <>
              <AppointmentForm mode={mode} onSubmit={handleFormSubmit} initialData={initialData} />
              {error && (
                <p className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                  {error}
                </p>
              )}
              {saving && (
                <p className="mt-3 text-sm text-muted flex items-center gap-2">
                  <span className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  Guardando...
                </p>
              )}
            </>
          )}

          {step === 'auth-required' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
                <DentalLogoSmall />
              </div>
              <h3 className="text-h5 font-semibold text-text mb-2">Necesitas una cuenta</h3>
              <p className="text-muted text-body-sm mb-6">
                Inicia sesión o regístrate para confirmar tu cita.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Iniciar sesión
                </button>
                <button
                  onClick={() => navigate('/registro')}
                  className="px-6 py-3 border border-border text-text rounded-xl text-sm font-medium hover:bg-surface transition-colors"
                >
                  Crear cuenta
                </button>
              </div>
              <button
                onClick={() => setStep('form')}
                className="mt-4 text-xs text-muted hover:text-text transition-colors"
              >
                ← Volver al formulario
              </button>
            </div>
          )}

          {step === 'success' && (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-primary" strokeWidth={1.5} />
              </div>
              <h3 className="text-h5 font-semibold text-text mb-2">¡Cita reservada!</h3>
              <p className="text-muted text-body-sm mb-6">
                {profile?.full_name
                  ? `Hola ${profile.full_name.split(' ')[0]}, nos pondremos`
                  : 'Nos pondremos'}{' '}
                en contacto contigo para confirmar los detalles.
              </p>
              <button
                onClick={onClose}
                className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
              >
                Cerrar
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
