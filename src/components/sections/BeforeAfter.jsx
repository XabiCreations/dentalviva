import { useEffect, useRef, useState } from 'react'
import gsap from 'gsap'
import { BeforeAfterSlider } from '../ui/BeforeAfterSlider'

const cases = [
  {
    id: 'implantes',
    label: 'Implantes dentales',
    before: { url: '/images/implantes-antes.webp', alt: 'Sonrisa antes de los implantes dentales' },
    after:  { url: '/images/implantes-despues.webp', alt: 'Sonrisa después de los implantes dentales' },
  },
  {
    id: 'blanqueamiento',
    label: 'Blanqueamiento dental',
    before: { url: '/images/blanqueamiento-antes.webp', alt: 'Sonrisa antes del blanqueamiento dental' },
    after:  { url: '/images/blanqueamiento-despues.webp', alt: 'Sonrisa después del blanqueamiento dental' },
    objectPosition: '25% center',
  },
  {
    id: 'sonrisa',
    label: 'Estética dental',
    before: { url: '/images/sonrisa-antes.webp', alt: 'Sonrisa antes del tratamiento estético' },
    after:  { url: '/images/sonrisa-despues.webp', alt: 'Sonrisa después del tratamiento estético' },
  },
  {
    id: 'ortodoncia',
    label: 'Ortodoncia',
    before: { url: '/images/ortodoncia-antes.webp', alt: 'Sonrisa antes del tratamiento de ortodoncia' },
    after:  { url: '/images/ortodoncia-despues.webp', alt: 'Sonrisa después del tratamiento de ortodoncia' },
  },
]

export function BeforeAfter() {
  const [activeTab, setActiveTab] = useState(0)
  const [sliderKey, setSliderKey] = useState(0)
  const sliderContainerRef = useRef(null)
  const sectionRef = useRef(null)

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  const handleTabChange = (index) => {
    if (index === activeTab) return
    if (prefersReducedMotion || !sliderContainerRef.current) {
      setActiveTab(index)
      setSliderKey((k) => k + 1)
      return
    }
    gsap.to(sliderContainerRef.current, {
      opacity: 0,
      duration: 0.2,
      ease: 'power2.in',
      onComplete: () => {
        setActiveTab(index)
        setSliderKey((k) => k + 1)
        gsap.to(sliderContainerRef.current, { opacity: 1, duration: 0.3, ease: 'power2.out' })
      },
    })
  }

  useEffect(() => {
    if (prefersReducedMotion || !sectionRef.current) return
    const ctx = gsap.context(() => {
      gsap.from('.before-after-container', {
        opacity: 0, y: 30, duration: 0.7, ease: 'power2.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 80%', once: true },
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [prefersReducedMotion])

  const current = cases[activeTab]

  return (
    <section
      ref={sectionRef}
      id="antes-despues"
      className="section-padding bg-background"
      aria-labelledby="before-after-heading"
    >
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="eyebrow mb-3">Transformaciones reales</p>
          <h2 id="before-after-heading" className="text-h2 text-text mb-4">
            Resultados que{' '}
            <span className="font-playfair italic text-primary">sonríen</span> por sí solos
          </h2>
          <p className="text-muted text-body-lg max-w-2xl mx-auto">
            Casos reales de nuestros pacientes. Desliza para ver el antes y el después de cada tratamiento.
          </p>
        </div>

        {/* Slider — standalone container */}
        <div className="before-after-container border border-border rounded-2xl overflow-hidden shadow-card mb-4">
          <div ref={sliderContainerRef} className="p-4 bg-surface">
            <BeforeAfterSlider
              key={sliderKey}
              beforeImage={current.before.url}
              afterImage={current.after.url}
              beforeAlt={current.before.alt}
              afterAlt={current.after.alt}
              objectPosition={current.objectPosition}
            />
          </div>
        </div>

        {/* Pill navigation — separate from slider */}
        <div className="flex justify-center">
          <nav
            aria-label="Casos por tratamiento"
            className="inline-flex items-center gap-2 bg-white border border-border rounded-full p-4 shadow-card"
          >
            {/* Tab items */}
            {cases.map((c, i) => (
              <button
                key={c.id}
                role="tab"
                aria-selected={activeTab === i}
                onClick={() => handleTabChange(i)}
                className={[
                  'flex items-center gap-2 px-6 py-4 rounded-full text-sm font-medium transition-all duration-200',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',
                  activeTab === i
                    ? 'bg-primary text-white'
                    : 'text-muted hover:bg-primary-light hover:text-primary',
                ].join(' ')}
              >
                <span className="hidden sm:inline">{c.label}</span>
                <span className="sm:hidden">{c.label.split(' ')[0]}</span>
              </button>
            ))}

          </nav>
        </div>
      </div>
    </section>
  )
}
