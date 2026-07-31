import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { X } from 'lucide-react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-xl text-muted hover:bg-surface transition-colors" aria-label="Cerrar">
          <X size={18} />
        </button>
        <h3 className="text-h4 font-bold text-text text-center mb-2">Un último paso para confirmar tu cita</h3>
        <p className="text-muted text-body-sm text-center mb-7">Inicia sesión o regístrate para confirmar tu cita.</p>
        <div className="flex flex-col gap-3">
          <Link to="/login" className="flex items-center justify-center px-6 py-3 bg-primary text-white rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors">
            Iniciar sesión
          </Link>
          <Link to="/registro" className="flex items-center justify-center px-6 py-3 border border-border text-text rounded-xl text-sm font-medium hover:bg-surface transition-colors">
            Crear cuenta
          </Link>
        </div>
      </div>
    </div>
  )
}

gsap.registerPlugin(ScrollTrigger)

// Positions form an irregular circle/ring around the central content zone.
// No image is flush against the edge — all sit 8–32% inward from each side.
// Traced from reference: 3 top + 4 bottom.
// Bottom far-left and far-right use `top` positioning so they rise from below and bleed out.
const FLOATING_IMAGES = [
  // TOP-LEFT — medium portrait
  {
    src: '/images/testimonios/testimonial-1.webp',
    alt: 'Paciente satisfecha con su nueva sonrisa',
    className: 'w-48 h-64',
    style: { top: '8%', left: '17%' },
    rotation: -4,
    animY: -25,
  },
  // TOP-CENTER — small portrait, slightly higher
  {
    src: '/images/antes-despues/sonrisa-antes.webp',
    alt: 'Paciente antes del tratamiento',
    className: 'w-32 h-44',
    style: { top: '18%', left: 'calc(50% - 4rem)' },
    rotation: 3,
    animY: -20,
  },
  // TOP-RIGHT — large, bleeds off right edge
  {
    src: '/images/antes-despues/blanqueamiento-despues.webp',
    alt: 'Resultado de blanqueamiento dental',
    className: 'w-56 h-72',
    style: { top: '6%', right: '10%' },
    rotation: -4,
    animY: -25,
  },
  // BOTTOM-FAR-LEFT — very large, top at 57%, bleeds bottom
  {
    src: '/images/testimonios/testimonial-3.webp',
    alt: 'Paciente feliz tras visitar la clínica',
    className: 'w-60 h-72',
    style: { top: '57%', left: '4%' },
    rotation: 5,
    animY: 30,
  },
  // BOTTOM-CENTER-LEFT — small, anchored near bottom
  {
    src: '/images/antes-despues/implantes-antes.webp',
    alt: 'Tratamiento de implantes dentales',
    className: 'w-32 h-44',
    style: { top: '74%', left: '34%' },
    rotation: -3,
    animY: 25,
  },
  // BOTTOM-CENTER-RIGHT — medium, slightly higher than center-left
  {
    src: '/images/antes-despues/sonrisa-despues.webp',
    alt: 'Sonrisa perfecta tras el tratamiento',
    className: 'w-44 h-56',
    style: { top: '67%', right: '29%' },
    rotation: 4,
    animY: 25,
  },
  // BOTTOM-FAR-RIGHT — large, top at 57%, bleeds bottom-right
  {
    src: '/images/testimonios/testimonial-2.webp',
    alt: 'Paciente sonriendo tras su tratamiento',
    className: 'w-56 h-72',
    style: { top: '57%', right: '8%' },
    rotation: -5,
    animY: 30,
  },
]

export function CTASection() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const { user, profile } = useAuth()
  const [submitState, setSubmitState] = useState(null)

  const handleFormSubmit = async ({ treatment, date, time, mode }) => {
    if (!user) {
      sessionStorage.setItem('pendingAppointment', JSON.stringify({ treatment, date: date.toISOString(), time, mode }))
      setSubmitState('auth-required')
      return
    }
    setSubmitState('saving')
    try {
      await createCita({
        userId: user.id, tipo: mode, tratamiento: treatment,
        fecha: date, hora: time, patientName: profile?.full_name ?? null,
      })
      setSubmitState('success')
    } catch {
      setSubmitState('error')
    }
  }

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const ctx = gsap.context(() => {
      const images = gsap.utils.toArray('.floating-img-cta')

      images.forEach((img, i) => {
        gsap.set(img, { rotation: FLOATING_IMAGES[i]?.rotation ?? 0 })
      })

      if (prefersReducedMotion) return

      if (images.length > 0) {
        gsap.from(images, {
          opacity: 0,
          y: (i) => FLOATING_IMAGES[i]?.animY ?? 30,
          duration: 0.9,
          ease: 'power2.out',
          stagger: 0.06,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 80%',
            once: true,
          },
        })
      }

      if (contentRef.current) {
        gsap.from(contentRef.current, {
          opacity: 0,
          y: 20,
          duration: 0.7,
          ease: 'power2.out',
          delay: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: 'top 75%',
            once: true,
          },
        })
      }
    }, sectionRef)

    return () => ctx.revert()
  }, [])

  return (
    <>
    {submitState === 'auth-required' && (
      <AuthModal onClose={() => setSubmitState(null)} />
    )}
    <section
      ref={sectionRef}
      aria-labelledby="cta-heading"
      className="relative py-20 lg:py-0 lg:h-screen flex items-center bg-primary/10 overflow-visible"
    >
      {/* Floating images — visible on xl (≥1280px) only */}
      {FLOATING_IMAGES.map((img) => (
        <div
          key={img.src}
          className={`floating-img-cta absolute rounded-2xl overflow-hidden shadow-lg hidden xl:block ${img.className}`}
          style={img.style}
          aria-hidden="true"
        >
          <img
            src={img.src}
            alt={img.alt}
            className="w-full h-full object-cover"
            loading="lazy"
            draggable="false"
          />
        </div>
      ))}

      {/* Central content */}
      <div className="container-xl relative z-10 w-full">
        <div ref={contentRef} className="text-center max-w-4xl mx-auto">
          <h2 id="cta-heading" className="text-h2 text-text font-bold mb-4">
            Únete a quienes ya confían en{' '}
            <span className="font-playfair italic text-primary">nosotros</span>
          </h2>
          <p className="text-muted text-body-lg mb-6">
            Reserva tu primera visita y déjanos conocer tu caso. Sin compromiso.
          </p>
          <div className="max-w-xl mx-auto">
            <AppointmentForm darkMode={false} onSubmit={handleFormSubmit} />
          </div>
        </div>
      </div>
    </section>
    </>
  )
}
