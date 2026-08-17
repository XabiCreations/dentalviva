import { useState } from 'react'
import { subscribeNewsletter } from '../../services/newsletterService'

const inputBase =
  'flex-1 min-w-0 px-5 py-4 border border-border bg-white text-body text-text placeholder:text-muted/50 focus:outline-none focus:z-10 focus:border-primary transition-all'

const SUCCESS_MESSAGE = (
  <div className="py-8">
    <p className="text-h4 font-bold text-text mb-2">¡Ya estás dentro!</p>
    <p className="text-muted text-body">Recibirás nuestros consejos dentales cada semana en tu correo.</p>
  </div>
)

const TERMS = (
  <p className="text-body-sm text-muted text-center">
    Al suscribirte confirmas que aceptas nuestros{' '}
    <a href="#" className="underline text-text hover:text-primary transition-colors">
      Términos y Condiciones
    </a>
    .
  </p>
)

// Guest variant — name + email
function GuestForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [state, setState] = useState('idle') // idle | loading | success | error

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim() || !email.trim()) return
    setState('loading')
    try {
      await subscribeNewsletter(name, email)
      setState('success')
      setName('')
      setEmail('')
    } catch (err) {
      console.error('[Newsletter] GuestForm error:', err)
      setState('error')
    }
  }

  if (state === 'success') return SUCCESS_MESSAGE

  return (
    <div className="flex flex-col gap-3">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Escribe tu nombre"
          required
          className={`${inputBase} rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none border-b-0 sm:border-b sm:border-r-0`}
        />
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Escribe tu email"
          required
          className={`${inputBase} sm:rounded-none border-b-0 sm:border-b sm:border-r-0`}
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="flex-1 min-w-0 px-8 py-4 bg-primary text-white font-semibold text-body whitespace-nowrap hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-b-xl sm:rounded-l-none sm:rounded-r-xl border border-primary"
        >
          {state === 'loading' ? 'Enviando…' : 'Suscribirme'}
        </button>
      </form>
      {state === 'error' && (
        <p className="text-body-sm text-red-500">Algo ha ido mal. Por favor, inténtalo de nuevo.</p>
      )}
      {TERMS}
    </div>
  )
}

// Auth variant — email only, pre-filled
function AuthForm({ userEmail, userName }) {
  const isFakeEmail = userEmail?.endsWith('@patients.dentaviva.es')
  const [email, setEmail] = useState(isFakeEmail ? '' : (userEmail ?? ''))
  const [state, setState] = useState('idle')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    try {
      await subscribeNewsletter(userName || email, email)
      setState('success')
    } catch (err) {
      console.error('[Newsletter] AuthForm error:', err)
      setState('error')
    }
  }

  if (state === 'success') return SUCCESS_MESSAGE

  return (
    <div className="flex flex-col gap-3 max-w-md mx-auto">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-stretch">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Escribe tu email"
          required
          className={`${inputBase} rounded-t-xl sm:rounded-l-xl sm:rounded-tr-none border-b-0 sm:border-b sm:border-r-0`}
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className="px-8 py-4 bg-primary text-white font-semibold text-body whitespace-nowrap hover:bg-primary/90 transition-colors disabled:opacity-60 disabled:cursor-not-allowed rounded-b-xl sm:rounded-l-none sm:rounded-r-xl border border-primary"
        >
          {state === 'loading' ? 'Enviando…' : 'Suscribirme'}
        </button>
      </form>
      {state === 'error' && (
        <p className="text-body-sm text-red-500">Algo ha ido mal. Por favor, inténtalo de nuevo.</p>
      )}
      {TERMS}
    </div>
  )
}

export function NewsletterForm({ user, profile }) {
  if (user) {
    return <AuthForm userEmail={user.email} userName={profile?.full_name ?? ''} />
  }
  return <GuestForm />
}
