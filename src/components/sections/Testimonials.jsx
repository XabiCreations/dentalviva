import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { TestimonialCard } from '../ui/TestimonialCard'

const testimonials = [
  {
    id: 1,
    imageUrl: '/images/testimonios/testimonial-1.webp',
    patientName: 'María González',
    treatmentType: 'Estética dental',
    text: 'Llevaba años sintiéndome insegura con mi sonrisa. En DentalViva no solo encontré el tratamiento que necesitaba, sino un equipo que me hizo sentir en buenas manos. El resultado fue exactamente lo que buscaba.',
  },
  {
    id: 2,
    imageUrl: '/images/testimonios/testimonial-2.webp',
    patientName: 'Javier Martínez',
    treatmentType: 'Implantes dentales',
    text: 'Después de perder dos dientes en un accidente, pensé que nunca volvería a comer con normalidad. Los implantes de DentalViva me devolvieron la funcionalidad completa. El proceso fue mucho más sencillo de lo que imaginaba.',
  },
  {
    id: 3,
    imageUrl: '/images/testimonios/testimonial-3.webp',
    patientName: 'Laura Sánchez',
    treatmentType: 'Ortodoncia Invisalign',
    text: 'Empecé el tratamiento de Invisalign sin creer del todo que funcionaría. Dieciocho meses después, tengo la sonrisa que siempre quise. La Dra. García me guió en cada paso con mucha profesionalidad y cercanía.',
  },
]

export function Testimonials() {
  const sectionRef = useRef(null)
  const cardRef = useRef(null)
  const [currentIndex, setCurrentIndex] = useState(0)

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
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

  const animateTransition = (callback, direction) => {
    if (prefersReducedMotion || !cardRef.current) {
      callback()
      return
    }
    const exitX = direction === 'next' ? -30 : 30
    const enterX = direction === 'next' ? 30 : -30
    gsap.to(cardRef.current, {
      opacity: 0,
      x: exitX,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        callback()
        gsap.fromTo(
          cardRef.current,
          { opacity: 0, x: enterX },
          { opacity: 1, x: 0, duration: 0.35, ease: 'power2.out' }
        )
      },
    })
  }

  const handlePrev = () => {
    animateTransition(
      () => setCurrentIndex((i) => (i - 1 + testimonials.length) % testimonials.length),
      'prev'
    )
  }

  const handleNext = () => {
    animateTransition(
      () => setCurrentIndex((i) => (i + 1) % testimonials.length),
      'next'
    )
  }

  return (
    <section
      ref={sectionRef}
      id="testimonios"
      className="relative overflow-hidden section-padding bg-surface"
      aria-labelledby="testimonials-heading"
    >
      {/* Semicircle bg */}
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[130vw] aspect-square rounded-full bg-[#EDF2F7] pointer-events-none"
        aria-hidden="true"
      />
      <div className="container-xl relative">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="eyebrow mb-3">Testimonios de clientes</p>
          <h2 id="testimonials-heading" className="text-h2 text-text">
            Cada tratamiento tiene una{' '}
            <span className="font-playfair italic text-primary">historia</span> detrás
          </h2>
        </div>

        {/* Single card */}
        <div ref={cardRef}>
          <TestimonialCard
            testimonial={testimonials[currentIndex]}
            onPrev={handlePrev}
            onNext={handleNext}
          />
        </div>
      </div>
    </section>

  )
}
