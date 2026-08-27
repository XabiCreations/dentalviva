import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { NavArrowsInfinite } from '../ui/NavArrows'

gsap.registerPlugin(ScrollTrigger)

const testimonials = [
  {
    id: 1,
    imageUrl: '/images/testimonios/testimonial-1.webp',
    patientName: 'Carlos González',
    treatmentType: 'Diseño de sonrisa',
    text: 'Llevaba años sintiéndome insegura con mi sonrisa. En DentalViva no solo encontré el tratamiento que necesitaba, sino un equipo que me hizo sentir en buenas manos. El resultado fue exactamente lo que buscaba.',
  },
  {
    id: 2,
    imageUrl: '/images/testimonios/testimonial-2.webp',
    patientName: 'Ana Martínez',
    treatmentType: 'Implantes dentales',
    text: 'Después de perder dos dientes en un accidente, pensé que nunca volvería a comer con normalidad. Los implantes de DentalViva me devolvieron la funcionalidad completa. El proceso fue mucho más sencillo de lo que imaginaba.',
  },
  {
    id: 3,
    imageUrl: '/images/testimonios/testimonial-3.webp',
    patientName: 'Alejandro Sánchez',
    treatmentType: 'Ortodoncia',
    text: 'Empecé el tratamiento de Invisalign sin creer del todo que funcionaría. Dieciocho meses después, tengo la sonrisa que siempre quise. La Dra. García me guió en cada paso con mucha profesionalidad y cercanía.',
  },
]

function TestimonialFeaturedCard({ testimonial, isEdge }) {
  return (
    <article className="relative bg-white rounded-2xl border border-border shadow-card overflow-hidden h-full flex">
      <div
        className="absolute inset-0 bg-white z-10 pointer-events-none rounded-2xl"
        style={{ opacity: isEdge ? 0.8 : 0, transition: 'opacity 0.5s ease-in-out' }}
        aria-hidden="true"
      />
      {/* Photo — LEFT */}
      <div className="shrink-0 w-[38%]">
        <img
          src={testimonial.imageUrl}
          alt={`Foto de ${testimonial.patientName}`}
          className="w-full h-full object-cover object-top"
          loading="lazy"
        />
      </div>
      {/* Content — RIGHT */}
      <div className="flex-1 flex flex-col justify-center gap-5 p-8 lg:p-10">
        <div>
          <p className="text-h3 font-bold text-text leading-tight">{testimonial.patientName}</p>
          <p className="text-primary text-body font-medium mt-1.5">{testimonial.treatmentType}</p>
        </div>
        <hr className="border-border" />
        <p className="text-body text-muted leading-relaxed italic">
          "{testimonial.text}"
        </p>
      </div>
    </article>
  )
}

function TestimonialMobileCard({ testimonial, onPrev, onNext }) {
  return (
    <div className="relative pt-10 w-full max-w-sm mx-auto">
      {/* Avatar flotante */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-white shadow-md">
          <img
            src={testimonial.imageUrl}
            alt={`Foto de ${testimonial.patientName}`}
            className="w-full h-full object-cover object-top"
            loading="lazy"
          />
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-border shadow-card px-6 pt-14 pb-6 flex flex-col gap-4 text-center">
        <div>
          <p className="text-h4 font-bold text-text">{testimonial.patientName}</p>
          <p className="text-primary text-body-sm font-medium mt-1">{testimonial.treatmentType}</p>
        </div>
        <p className="text-body text-muted italic leading-relaxed">"{testimonial.text}"</p>
      </div>

      {/* Flechas debajo del card */}
      <div className="mt-4 flex justify-center">
        <NavArrowsInfinite onPrev={onPrev} onNext={onNext} noFrame />
      </div>
    </div>
  )
}

const BTN = 'w-11 h-11 rounded-full border border-border bg-white flex items-center justify-center text-muted transition-all duration-150 hover:border-primary hover:bg-primary-light hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-sm'

const computeOffset = (cardIndex, activeIndex, n) => {
  let offset = ((cardIndex - activeIndex) % n + n) % n
  if (offset > Math.floor(n / 2)) offset -= n
  return offset
}

export function Testimonials() {
  const sectionRef    = useRef(null)
  const carouselRef   = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [jumpingCard, setJumpingCard]   = useState(null)
  const jumpTimerRef = useRef(null)
  const n = testimonials.length

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (prefersReducedMotion || !carouselRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(carouselRef.current, {
        opacity: 0,
        y: 30,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 80%',
          once: true,
        },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [prefersReducedMotion])

  const navigate = (dir) => {
    const newIndex = dir === 'next'
      ? (currentIndex + 1) % n
      : (currentIndex - 1 + n) % n

    // Detectar el card que "salta" de un lado al otro y ocultarlo
    for (let i = 0; i < n; i++) {
      const oldOff = computeOffset(i, currentIndex, n)
      const newOff = computeOffset(i, newIndex, n)
      if ((oldOff === -1 && newOff === 1) || (oldOff === 1 && newOff === -1)) {
        setJumpingCard(i)
        if (jumpTimerRef.current) clearTimeout(jumpTimerRef.current)
        jumpTimerRef.current = setTimeout(() => setJumpingCard(null), 520)
        break
      }
    }
    setCurrentIndex(newIndex)
  }

  const getCardStyle = (cardIndex) => {
    const offset = computeOffset(cardIndex, currentIndex, n)
    const isJumping = cardIndex === jumpingCard

    if (isJumping) return {
      left: offset > 0 ? '93%' : '-49%',
      width: '56%', opacity: 0, transform: 'scale(0.9)', zIndex: 5, transition: 'none',
    }

    const tr = 'left 0.5s ease-in-out, opacity 0.5s ease-in-out, transform 0.5s ease-in-out'
    if (offset === 0)  return { left: '22%',  width: '56%', opacity: 1, transform: 'scale(1)',   zIndex: 10, transition: tr }
    if (offset === -1) return { left: '-49%', width: '56%', opacity: 1, transform: 'scale(0.9)', zIndex: 5,  transition: tr }
    if (offset === 1)  return { left: '93%',  width: '56%', opacity: 1, transform: 'scale(0.9)', zIndex: 5,  transition: tr }
    return { left: offset > 0 ? '200%' : '-200%', width: '56%', opacity: 0, zIndex: 0, transition: 'none' }
  }

  const handlePrev = () => navigate('prev')
  const handleNext = () => navigate('next')

  return (
    <section
      ref={sectionRef}
      id="testimonios"
      className="relative overflow-hidden section-padding bg-surface"
      aria-labelledby="testimonials-heading"
    >
      {/* Background image */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: 'url(/images/backgrounds/bg-testimonios.webp)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.05,
        }}
        aria-hidden="true"
      />

      {/* Semicircle bg */}
      <div
        className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-[130vw] aspect-square rounded-full bg-[#EDF2F7] pointer-events-none"
        aria-hidden="true"
      />

      {/* Header */}
      <div className="container-xl relative">
        <div className="text-center mb-12 lg:mb-20">
          <p className="eyebrow mb-3">Testimonios de clientes</p>
          <h2 id="testimonials-heading" className="text-h2 text-text">
            Cada tratamiento tiene una{' '}
            <span className="font-playfair italic text-primary">historia</span> detrás
          </h2>
        </div>
      </div>

      {/* Mobile: card único con avatar */}
      <div className="lg:hidden container-xl relative">
        <TestimonialMobileCard
          testimonial={testimonials[currentIndex]}
          onPrev={handlePrev}
          onNext={handleNext}
        />
      </div>

      {/* Desktop: peek carousel — ancho completo */}
      <div ref={carouselRef} className="hidden lg:block relative h-[460px]">

        {/* Cards: posicion absoluta, la section hace overflow:hidden */}
        {testimonials.map((t, i) => {
          return (
            <div
              key={t.id}
              className="absolute top-0 bottom-0"
              style={getCardStyle(i)}
            >
              <TestimonialFeaturedCard
                testimonial={t}
                isEdge={computeOffset(i, currentIndex, n) !== 0}
              />
            </div>
          )
        })}

        {/* Flecha izquierda — al borde izquierdo del card central */}
        <button
          type="button"
          onClick={handlePrev}
          aria-label="Testimonio anterior"
          className={`absolute top-1/2 -translate-y-1/2 z-20 ${BTN}`}
          style={{ left: 'calc(22% - 32px - 44px)' }}
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Flecha derecha — al borde derecho del card central */}
        <button
          type="button"
          onClick={handleNext}
          aria-label="Testimonio siguiente"
          className={`absolute top-1/2 -translate-y-1/2 z-20 ${BTN}`}
          style={{ left: 'calc(78% + 32px)' }}
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </section>
  )
}
