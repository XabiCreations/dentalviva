import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { CheckCircle, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { AppointmentForm } from '../ui/AppointmentForm'
import { useAuth } from '../../auth/AuthContext'
import { createCita } from '../../services/citasService'

function AuthModal({ onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-text/50 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:bg-surface transition-colors"
          aria-label="Cerrar"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-full bg-primary-light flex items-center justify-center mx-auto mb-5">
          <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
            <circle cx="16" cy="16" r="16" fill="#EBF4FF" />
            <path d="M16 7C12.5 7 10 9.5 10 12C10 13.5 10.5 15 11 16.5C11.7 18.5 12 20.5 12 22C12 23.1 12.9 24 14 24C15.1 24 16 23.1 16 22V20C16 20 16 22 18 22C19.1 22 20 23.1 20 22C20 20.5 20.3 18.5 21 16.5C21.5 15 22 13.5 22 12C22 9.5 19.5 7 16 7Z" fill="#2A7FD4" />
          </svg>
        </div>

        <h3 className="text-h4 font-bold text-text text-center mb-2">Un último paso para confirmar tu cita</h3>
        <p className="text-muted text-body-sm text-center mb-7">
          Inicia sesión o regístrate para confirmar tu cita.
        </p>

        <div className="flex flex-col gap-3">
          <Link
            to="/login"
            className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl text-body-sm font-semibold hover:bg-primary/90 transition-colors"
          >
            Iniciar sesión
          </Link>
          <Link
            to="/registro"
            className="flex items-center justify-center px-6 py-3 border border-border text-text rounded-xl text-body-sm font-medium hover:bg-surface transition-colors"
          >
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}

function SocialProofBadge({ socialRef, counterRef, prefersReducedMotion }) {
  return (
    <div className="flex items-stretch gap-2 sm:gap-3">
      {/* Patients badge */}
      <div
        ref={socialRef}
        className="flex items-center gap-2 sm:gap-4 bg-white rounded-2xl border border-[#ebebeb] shadow-sm px-2 py-2 sm:px-3 sm:py-3"
        aria-label="12.000 pacientes satisfechos"
      >
        <div className="flex items-center shrink-0" aria-hidden="true">
          {AVATAR_IMAGES.slice(0, 3).map((src, i) => (
            <div
              key={i}
              className="w-9 h-9 sm:w-14 sm:h-14 rounded-full border-[3px] border-white overflow-hidden bg-surface"
              style={{ marginLeft: i === 0 ? 0 : '-0.6rem', zIndex: 3 - i }}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-1.5 sm:gap-2">
          <p
            ref={counterRef}
            className="text-xl sm:text-h3 font-bold text-text leading-none"
            aria-live="polite"
          >
            {prefersReducedMotion ? '+750' : '+0'}
          </p>
          <div className="flex flex-col">
            <span className="text-body-sm text-muted font-semibold tracking-normal">Pacientes</span>
            <span className="text-body-sm text-muted font-semibold tracking-normal">mensuales</span>
          </div>
        </div>
      </div>

    </div>
  )
}

const HERO_IMAGE = '/images/backgrounds/background-image.webp'

const AVATAR_IMAGES = [
  '/images/social-proof/social-proof-1.webp',
  '/images/social-proof/social-proof-2.webp',
  '/images/social-proof/social-proof-3.webp',
]

const GALLERY_COL1 = [
  { src: '/images/pacientes/paciente-sofia.webp',  pos: 'center center' },
    { src: '/images/pacientes/paciente-carlos.webp', pos: 'center center' },
  { src: '/images/pacientes/paciente-ana.webp',    pos: 'center center' },
  { src: '/images/pacientes/paciente-pablo.webp',  pos: 'center center' },
]
const GALLERY_COL2 = [
  { src: '/images/pacientes/paciente-maria.webp',  pos: 'center center' },
  { src: '/images/pacientes/paciente-elena.webp',  pos: 'center center' },
  { src: '/images/pacientes/paciente-laura.webp',  pos: 'center center' },
  { src: '/images/pacientes/paciente-david.webp',  pos: 'center center' },
]

// Uniform height for every image tile (px).
const IMAGE_H = 540
// Gap between tiles (px) — applied as marginBottom so the seam gap is uniform.
const IMAGE_GAP = 10
// Total height of one full image set. GSAP shifts each column by exactly this
// amount per cycle so the reset is visually invisible (seamless loop).
const ONE_SET_H = GALLERY_COL1.length * (IMAGE_H + IMAGE_GAP)

const IMAGE_W_M   = 180
const IMAGE_H_M   = 220
const IMAGE_GAP_M = 8
const ONE_SET_W_M = GALLERY_COL1.length * (IMAGE_W_M + IMAGE_GAP_M)

export function Hero() {
  const [submitState, setSubmitState] = useState(null)
  const [submitError, setSubmitError] = useState('')
  const { user, profile } = useAuth()

  const sectionRef    = useRef(null)
  const headlineRef   = useRef(null)
  const subRef        = useRef(null)
  const formRef       = useRef(null)
  const socialRef     = useRef(null)
  const counterRef    = useRef(null)
  const col1Ref        = useRef(null) // desktop col1 scrolls UP
  const col2Ref        = useRef(null) // desktop col2 scrolls DOWN
  const colMobile1Ref  = useRef(null) // mobile col1 scrolls UP
  const colMobile2Ref  = useRef(null) // mobile col2 scrolls DOWN

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  // ── Entrance animations (left column) ──────────────────────────────────────
  useEffect(() => {
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 0.3 })

      if (headlineRef.current) {
        const words = headlineRef.current.querySelectorAll('.hero-word')
        tl.from(words, { y: 40, opacity: 0, duration: 0.6, stagger: 0.08, ease: 'power2.out' })
      }
      if (subRef.current)
        tl.from(subRef.current, { opacity: 0, y: 20, duration: 0.5, ease: 'power2.out', clearProps: 'transform' }, '-=0.3')
      if (socialRef.current)
        tl.from(socialRef.current, { opacity: 0, y: 16, duration: 0.4, ease: 'power2.out', clearProps: 'transform' }, '-=0.25')
      if (formRef.current)
        tl.from(formRef.current, { opacity: 0, y: 24, duration: 0.5, ease: 'power2.out', clearProps: 'transform' }, '-=0.2')

      if (counterRef.current) {
        const obj = { val: 0 }
        tl.to(obj, {
          val: 750,
          duration: 2,
          ease: 'power2.out',
          onUpdate: () => {
            if (counterRef.current)
              counterRef.current.textContent = '+' + Math.round(obj.val)
          },
        }, '-=1.5')
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [prefersReducedMotion])

  // ── Gallery seamless-scroll animations (GSAP) ──────────────────────────────
  //
  // Each animated div contains 2× the image set (original + duplicate).
  // ONE_SET_H is the pixel height of one set.
  //
  // Col 1 (UP):   y  0          →  -ONE_SET_H  → repeat (resets to 0)
  //   — at y=0 and y=-ONE_SET_H the screen shows the same images ⇒ seamless.
  //
  // Col 2 (DOWN): y -ONE_SET_H  →  0           → repeat (resets to -ONE_SET_H)
  //   — at y=-ONE_SET_H the duplicate set is on screen, identical to y=0 ⇒ seamless.
  //
  // The section's own overflow:hidden clips both columns at the 100vh boundary.
  useEffect(() => {
    const col1 = col1Ref.current
    const col2 = col2Ref.current
    if (!col1 || !col2 || prefersReducedMotion) return

    // Place col2 so the duplicate set (visually identical to the first) is on screen.
    gsap.set(col2, { y: -ONE_SET_H })

    const anim1 = gsap.to(col1, {
      y: -ONE_SET_H,
      duration: 45,
      ease: 'none',
      repeat: -1,
    })

    const anim2 = gsap.to(col2, {
      y: 0,
      duration: 45,
      ease: 'none',
      repeat: -1,
    })

    return () => { anim1.kill(); anim2.kill() }
  }, [prefersReducedMotion])

  // ── Mobile horizontal rows (two rows, opposite directions) ─────────────────
  useEffect(() => {
    const row1 = colMobile1Ref.current
    const row2 = colMobile2Ref.current
    if (!row1 || !row2 || prefersReducedMotion) return

    gsap.set(row2, { x: -ONE_SET_W_M })

    const anim1 = gsap.to(row1, { x: -ONE_SET_W_M, duration: 30, ease: 'none', repeat: -1 })
    const anim2 = gsap.to(row2, { x: 0,            duration: 30, ease: 'none', repeat: -1 })

    return () => { anim1.kill(); anim2.kill() }
  }, [prefersReducedMotion])

  const handleFormSubmit = async ({ treatment, date, time, mode }) => {
    if (!user) {
      sessionStorage.setItem('pendingAppointment', JSON.stringify({ treatment, date: date.toISOString(), time, mode }))
      setSubmitState('auth-required')
      return
    }
    setSubmitState('saving')
    setSubmitError('')
    try {
      await createCita({
        userId: user.id, tipo: mode, tratamiento: treatment,
        fecha: date, hora: time, patientName: profile?.full_name ?? null,
      })
      setSubmitState('success')
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Algo salió mal. Inténtalo de nuevo o llámanos si el problema continúa.')
      setSubmitState('error')
    }
  }

  return (
    <>
    {submitState === 'auth-required' && (
      <AuthModal onClose={() => setSubmitState(null)} />
    )}
    {/* h-screen + overflow-hidden → hero is exactly 100vh; gallery images are
        clipped at the top and bottom edges of the section. */}
    <section
      ref={sectionRef}
      className="relative min-h-screen lg:h-screen overflow-hidden flex flex-col lg:flex-row"
      aria-label="Sección principal"
    >
      {/* ── Left column — text + form ────────────────────────────────────── */}
      <div className="flex items-center w-full lg:w-[48%] px-6 sm:px-10 lg:px-16 xl:px-20 pt-24 pb-10 lg:py-28">
        <div className="w-full max-w-xl">

          <SocialProofBadge socialRef={socialRef} counterRef={counterRef} prefersReducedMotion={prefersReducedMotion} />

          <h1 ref={headlineRef} className="text-h1 text-text font-bold mt-6 mb-5">
            <span className="hero-word inline-block">Consigue</span>{' '}
            <span className="hero-word inline-block">la</span>{' '}
            <span className="hero-word font-playfair inline-block text-primary italic">sonrisa</span>{' '}
            <span className="hero-word inline-block">que</span>{' '}
            <span className="hero-word inline-block">siempre</span>{' '}
            <span className="hero-word inline-block">has</span>{' '}
            <span className="hero-word inline-block">querido</span>
          </h1>

          <p ref={subRef} className="text-muted text-body-lg leading-relaxed mb-8">
            Combinamos las nuevas tecnologías y avances en el mundo odontológico con un ambiente cercano. Reserva tu cita en segundos con nuestros tratamientos personalizados.
          </p>

          <div ref={formRef} id="reservar">
            <AppointmentForm onSubmit={handleFormSubmit} />

            {submitState === 'saving' && (
              <div className="mt-3 flex items-center gap-2 text-muted text-body-sm">
                <span className="w-4 h-4 rounded-full border-2 border-primary/50 border-t-transparent animate-spin" />
                Guardando tu cita...
              </div>
            )}
            {submitState === 'success' && (
              <div className="mt-3 flex items-center gap-2 text-body-sm bg-primary-light border border-primary/20 rounded-xl px-4 py-3">
                <CheckCircle size={16} className="text-primary shrink-0" />
                <span className="text-text">Tu cita está reservada. Nos pondremos en contacto contigo para confirmar los detalles.</span>
              </div>
            )}
            {submitState === 'error' && (
              <div className="mt-3 text-body-sm text-red-700 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
                {submitError}
              </div>
            )}
          </div>

        </div>
      </div>

      {/* ── Mobile horizontal rows (2 filas, direcciones opuestas) ─────── */}
      <div className="relative w-full overflow-hidden pb-10 lg:hidden" aria-hidden="true">
        <div className="absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-10 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none" />
        <div className="flex flex-col gap-[8px]">
          {/* Fila 1 — izquierda */}
          <div className="overflow-hidden">
            <div ref={colMobile1Ref} className="flex gap-[8px]">
              {[...GALLERY_COL1, ...GALLERY_COL1].map((img, i) => (
                <div
                  key={i}
                  className="shrink-0 overflow-hidden rounded-2xl bg-surface"
                  style={{ width: IMAGE_W_M, height: IMAGE_H_M }}
                >
                  <img src={img.src} alt="" className="w-full h-full object-cover" style={{ objectPosition: img.pos }} />
                </div>
              ))}
            </div>
          </div>
          {/* Fila 2 — derecha */}
          <div className="overflow-hidden">
            <div ref={colMobile2Ref} className="flex gap-[8px]">
              {[...GALLERY_COL2, ...GALLERY_COL2].map((img, i) => (
                <div
                  key={i}
                  className="shrink-0 overflow-hidden rounded-2xl bg-surface"
                  style={{ width: IMAGE_W_M, height: IMAGE_H_M }}
                >
                  <img src={img.src} alt="" className="w-full h-full object-cover" style={{ objectPosition: img.pos }} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Right column — auto-scrolling gallery ────────────────────────── */}
      {/* No overflow:hidden here — the section's overflow:hidden clips at     */}
      {/* the exact 100vh boundary so images disappear at the section edge.    */}
      <div
        className="hidden lg:relative lg:flex lg:w-[52%] gap-[10px] p-[10px]"
        aria-hidden="true"
      >
        {/* Bottom fade */}
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-white to-transparent z-10 pointer-events-none" />
        {/* Column 1 — scrolls UP: exits top, reappears at bottom */}
        <div className="flex-1">
          <div ref={col1Ref}>
            {[...GALLERY_COL1, ...GALLERY_COL1].map((img, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-surface"
                style={{ height: IMAGE_H, marginBottom: IMAGE_GAP }}
              >
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ objectPosition: img.pos }}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Column 2 — scrolls DOWN: exits bottom, reappears at top */}
        <div className="flex-1">
          <div ref={col2Ref}>
            {[...GALLERY_COL2, ...GALLERY_COL2].map((img, i) => (
              <div
                key={i}
                className="overflow-hidden rounded-2xl bg-surface"
                style={{ height: IMAGE_H, marginBottom: IMAGE_GAP }}
              >
                <img
                  src={img.src}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ objectPosition: img.pos }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
