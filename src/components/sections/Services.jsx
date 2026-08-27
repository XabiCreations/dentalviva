import { useEffect, useRef, useState, useCallback } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ServiceCard } from '../ui/ServiceCard'
import { ServiceModal } from '../ui/ServiceModal'
import { NavArrowsLimited } from '../ui/NavArrows'

const CARD_WIDTH = 360
const CARD_GAP = 20
const SCROLL_STEP = CARD_WIDTH + CARD_GAP

const services = [
  {
    id: 'blanqueamiento',
    title: 'Blanqueamiento dental',
    description:
      'Recupera el blanco natural de tus dientes. Resultados visibles desde la primera sesión.',
    image: '/images/servicios/blanqueamiento.webp',
    imageAlt: 'Tratamiento de blanqueamiento dental profesional',
    details: [
      {
        heading: '¿En qué consiste?',
        body: 'El blanqueamiento profesional utiliza agentes blanqueadores de alta concentración para eliminar manchas profundas y recuperar el blanco natural de tus dientes. El tratamiento se realiza bajo supervisión clínica en un entorno controlado, para proteger tu seguridad y maximizar el efecto.',
      },
      {
        heading: '¿Cuánto duran los resultados?',
        body: 'Los resultados son visibles desde la primera sesión y pueden durar entre 1 y 3 años según tus hábitos. Recomendamos evitar alimentos muy pigmentados las primeras 48 horas tras el tratamiento para maximizar el efecto.',
      },
    ],
  },
  {
    id: 'implantes',
    title: 'Implantes dentales',
    description:
      'Recupera un diente perdido. Titanio que se integra con tu mandíbula, duradero y natural.',
    image: '/images/servicios/implante.webp',
    imageAlt: 'Implante dental de titanio',
    details: [
      {
        heading: '¿En qué consiste?',
        body: 'Los implantes de titanio se integran con el hueso de la mandíbula mediante un proceso llamado osteointegración. Son una solución duradera y de aspecto natural para reemplazar dientes perdidos, sin afectar a los dientes adyacentes.',
      },
      {
        heading: '¿Cuánto dura el proceso?',
        body: 'El proceso completo dura entre 3 y 6 meses, incluyendo la fase de integración del implante con el hueso. Con los cuidados adecuados, un implante puede durar toda la vida sin necesidad de sustitución.',
      },
    ],
  },
  {
    id: 'transformacion',
    title: 'Diseño de sonrisa',
    description:
      'Diseña la sonrisa que siempre has querido. Carillas, coronas y tratamientos personalizados.',
    image: '/images/servicios/sonrisa.webp',
    imageAlt: 'Paciente con sonrisa transformada',
    details: [
      {
        heading: '¿Qué incluye?',
        body: 'Combinamos carillas de porcelana, coronas y otros tratamientos estéticos para diseñar la sonrisa que siempre has querido. Cada caso se estudia de forma personalizada teniendo en cuenta tu morfología facial y preferencias.',
      },
      {
        heading: '¿Cómo empezar?',
        body: 'El proceso comienza con una consulta de diagnóstico donde analizamos tu caso y diseñamos un plan de tratamiento adaptado a tus objetivos estéticos y presupuesto. Utilizamos tecnología de simulación digital para que veas el resultado antes de comenzar.',
      },
    ],
  },
  {
    id: 'ortodoncia',
    title: 'Ortodoncia',
    description:
      'Corrige la alineación de tus dientes. Brackets o alineadores: evaluamos tu caso.',
    image: '/images/servicios/ortodoncia.webp',
    imageAlt: 'Tratamiento de ortodoncia con brackets',
    details: [
      {
        heading: '¿Qué opciones tenemos para ti?',
        body: 'Ofrecemos ortodoncia tradicional con brackets metálicos, brackets estéticos de cerámica e Invisalign con alineadores transparentes removibles. Estudiamos cada caso para encontrar la opción más adecuada según tu situación y estilo de vida.',
      },
      {
        heading: '¿Cuánto dura el tratamiento?',
        body: 'La duración varía según la complejidad del caso, generalmente entre 12 y 24 meses. Durante el tratamiento realizamos revisiones periódicas para ajustar la progresión y asegurar la correcta evolución de tu caso.',
      },
    ],
  },
  {
    id: 'odontologia',
    title: 'Odontología general',
    description:
      'Tu salud bucal, protegida. Revisiones, limpiezas y diagnóstico temprano en cada visita.',
    image: '/images/servicios/odontologia.webp',
    imageAlt: 'Revisión dental general',
    details: [
      {
        heading: 'Revisiones y prevención',
        body: 'Las revisiones periódicas son la base de una buena salud bucal. Incluyen exploración completa, limpieza profesional y diagnóstico de posibles problemas antes de que se agraven, ahorrándote tiempo y dinero a largo plazo.',
      },
      {
        heading: 'Tratamientos frecuentes',
        body: 'Realizamos empastes, endodoncias, extracciones y tratamientos de encías. Nuestro objetivo es resolver cualquier problema dental con comodidad y precisión, usando materiales de alta calidad.',
      },
    ],
  },
]

export function Services() {
  const sectionRef = useRef(null)
  const trackRef = useRef(null)
  const cardsRef = useRef([])
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0 })

  const [canPrev, setCanPrev] = useState(false)
  const [canNext, setCanNext] = useState(true)
  const [activeService, setActiveService] = useState(null)

  // Update arrow button states based on scroll position
  const updateButtons = useCallback(() => {
    const el = trackRef.current
    if (!el) return
    setCanPrev(el.scrollLeft > 4)
    const lastCard = cardsRef.current.filter(Boolean).at(-1)
    if (lastCard) {
      const containerRight = el.getBoundingClientRect().right
      const cardRight = lastCard.getBoundingClientRect().right
      setCanNext(cardRight > containerRight + 4)
    } else {
      setCanNext(el.scrollLeft < el.scrollWidth - el.clientWidth - 4)
    }
  }, [])

  // Scroll by one card step
  const scrollPrev = () => {
    trackRef.current?.scrollBy({ left: -SCROLL_STEP, behavior: 'smooth' })
  }
  const scrollNext = () => {
    trackRef.current?.scrollBy({ left: SCROLL_STEP, behavior: 'smooth' })
  }

  // Listen to scroll to update button states
  useEffect(() => {
    const el = trackRef.current
    if (!el) return
    el.addEventListener('scroll', updateButtons, { passive: true })
    updateButtons() // initial check
    return () => el.removeEventListener('scroll', updateButtons)
  }, [updateButtons])

  // Global mouseup so drag stops even if cursor leaves the carousel
  useEffect(() => {
    const stopDrag = () => {
      if (!drag.current.active) return
      drag.current.active = false
      if (trackRef.current) {
        trackRef.current.style.cursor = 'grab'
        trackRef.current.style.userSelect = ''
      }
    }
    window.addEventListener('mouseup', stopDrag)
    return () => window.removeEventListener('mouseup', stopDrag)
  }, [])

  const onMouseDown = (e) => {
    const el = trackRef.current
    drag.current = { active: true, startX: e.clientX, scrollLeft: el.scrollLeft }
    el.style.cursor = 'grabbing'
    el.style.userSelect = 'none'
  }

  const onMouseMove = (e) => {
    if (!drag.current.active) return
    const el = trackRef.current
    const walk = (e.clientX - drag.current.startX) * 1.5
    el.scrollLeft = drag.current.scrollLeft - walk
  }

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current.filter(Boolean), {
        opacity: 0,
        y: 40,
        duration: 0.6,
        stagger: 0.12,
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

  const carouselPaddingLeft = 'max(1rem, calc((100vw - 80rem) / 2 + 2rem))'

  return (
    <section
      ref={sectionRef}
      id="servicios"
      className="section-padding bg-background overflow-hidden"
      aria-labelledby="servicios-heading"
    >
      {/* Header */}
      <div className="container-xl mb-6 lg:mb-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <p className="eyebrow mb-3">Nuestros tratamientos</p>
            <h2 id="servicios-heading" className="text-h2 text-text max-w-lg">
              Tratamientos pensados para cada{' '}
              <span className="font-playfair italic text-primary">boca</span>
            </h2>
          </div>

          {/* Arrow buttons — desktop only in header */}
          <NavArrowsLimited onPrev={scrollPrev} onNext={scrollNext} canPrev={canPrev} canNext={canNext} className="hidden lg:flex shrink-0 mt-1" />
        </div>
      </div>

      {/* Mobile: columna */}
      <div className="lg:hidden container-xl flex flex-col gap-5">
        {services.map((service, i) => (
          <div key={service.id} ref={(el) => (cardsRef.current[i] = el)}>
            <ServiceCard
              image={service.image}
              imageAlt={service.imageAlt}
              title={service.title}
              description={service.description}
              onLearnMore={() => setActiveService(service)}
            />
          </div>
        ))}
      </div>

      {/* Desktop: carrusel */}
      <div className="hidden lg:block overflow-x-hidden">
        <div
          ref={trackRef}
          role="region"
          aria-label="Carrusel de servicios dentales"
          className="flex gap-5 overflow-x-scroll cursor-grab select-none py-3"
          style={{
            paddingLeft: carouselPaddingLeft,
            paddingRight: '2rem',
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
        >
          {services.map((service, i) => (
            <div key={service.id} className="shrink-0">
              <ServiceCard
                image={service.image}
                imageAlt={service.imageAlt}
                title={service.title}
                description={service.description}
                onLearnMore={() => setActiveService(service)}
              />
            </div>
          ))}
          <div className="w-2 shrink-0" aria-hidden="true" />
        </div>
      </div>

      <style>{`[role="region"]::-webkit-scrollbar { display: none; }`}</style>

      {activeService && (
        <ServiceModal service={activeService} onClose={() => setActiveService(null)} />
      )}
    </section>
  )
}
