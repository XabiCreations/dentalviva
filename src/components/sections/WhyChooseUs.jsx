/**
 * WhyChooseUs — Sección "Por qué elegirnos" con imagen principal, imagen
 * decorativa secundaria superpuesta en la esquina superior izquierda, título
 * y cuadrícula de 4 estadísticas clave.
 *
 * Props: ninguna (datos estáticos).
 *
 * Notas:
 * - La imagen decorativa secundaria (decorImgRef) se posiciona con offset
 *   negativo respecto al contenedor de la imagen principal. Cambiar su src
 *   cuando el cliente provea la foto definitiva.
 * - Respeta prefers-reduced-motion: sin animaciones si el usuario lo prefiere.
 * - border-radius de la imagen decorativa sigue la teoría outer = inner + padding:
 *   inner 16px (rounded-2xl) + 8px de padding visual = 24px (rounded-3xl) en el wrapper.
 */
import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger)

const STATS = [
  { main: '15',  suffix: '+',  label: 'Años de experiencia' },
  { main: '24',  suffix: '/', extra: '7', label: 'Atención de urgencias' },
  { main: '12K', suffix: '+',  label: 'Sonrisas transformadas' },
  { main: '98',  suffix: '%',  label: 'Pacientes satisfechos' },
]

export function WhyChooseUs() {
  const sectionRef   = useRef(null)
  const headRef      = useRef(null)
  const imgRef       = useRef(null)
  const decorImgRef  = useRef(null)
  const statsRef     = useRef(null)

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (prefersReducedMotion) return
    const ctx = gsap.context(() => {
      const trigger = { trigger: sectionRef.current, start: 'top 78%', once: true }

      gsap.from(headRef.current, {
        opacity: 0,
        y: 24,
        duration: 0.7,
        stagger: 0,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: trigger,
      })
      gsap.from(imgRef.current, {
        opacity: 0,
        x: -32,
        duration: 0.8,
        delay: 0.2,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: trigger,
      })
      gsap.from(decorImgRef.current, {
        opacity: 0,
        scale: 0.88,
        y: 12,
        duration: 0.7,
        delay: 0.45,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: trigger,
      })
      gsap.from(statsRef.current?.querySelectorAll('.stat-item'), {
        opacity: 0,
        y: 28,
        duration: 0.6,
        stagger: 0.1,
        delay: 0.3,
        ease: 'power2.out',
        clearProps: 'transform',
        scrollTrigger: trigger,
      })
    }, sectionRef)
    return () => ctx.revert()
  }, [prefersReducedMotion])

  return (
    <section
      ref={sectionRef}
      id="porque-elegirnos"
      className="section-padding bg-background"
      aria-labelledby="why-heading"
    >
      <div className="container-xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-20 gap-y-10">

          {/* Image — spans both rows on desktop */}
          {/* pt-6 pl-6 compensa el offset negativo -top-6 -left-6 de la imagen decorativa */}
          <div ref={imgRef} className="hidden lg:block lg:row-span-2 relative pt-6 pl-6">
            {/* Imagen principal de la sección */}
            <div className="rounded-3xl overflow-hidden w-full h-full bg-surface">
              <img
                src="/images/backgrounds/bg-porque-elerguirnos.webp"
                alt="Instalaciones profesionales de DentalViva"
                className="w-full h-full object-cover"
              />
            </div>

            {/*
              Imagen decorativa secundaria — esquina superior izquierda.
              Posición: offset negativo en top e izquierda para que solape
              ligeramente la imagen principal y el espacio exterior.
              border-radius: outer (rounded-3xl = 24px) = inner (rounded-2xl = 16px) + ~8px de ring/padding visual.
              Reemplazar src con la imagen definitiva cuando el cliente la provea.
            */}
            <div
              ref={decorImgRef}
              className="absolute -top-6 -left-6 w-[200px] h-[200px] rounded-3xl overflow-hidden shadow-lg ring-4 ring-[#f5f5f5]"
            >
              <img
                src="/images/certificados/certificado.webp"
                alt="Certificado de calidad DentalViva"
                className="w-full h-full object-contain"
              />
            </div>
          </div>

          {/* Title — top right */}
          <div ref={headRef} className="self-end pb-4 text-center lg:text-left">
            <p className="eyebrow mb-4" id="why-heading">Por qué elegirnos</p>
            <h2 className="text-h2 text-text">
              Los <span className="font-playfair italic text-primary">números</span> responden por nosotros
            </h2>
          </div>

          {/* Stats 2×2 — bottom right */}
          <div ref={statsRef} className="grid grid-cols-2 self-start">
            {STATS.map((stat, i) => (
              <div
                key={stat.label}
                className={[
                  'stat-item py-8',
                  i % 2 === 0 ? 'border-r border-border pr-10' : 'pl-10',
                  i < 2 ? 'border-b border-border' : '',
                ].join(' ')}
              >
                <p className="text-[62px] sm:text-[70px] font-bold text-text leading-none tracking-tight mb-3">
                  {stat.main}<span className="font-playfair italic text-primary">{stat.suffix}</span>{stat.extra ?? ''}
                </p>
                <p className="text-body text-muted font-medium">{stat.label}</p>
              </div>
            ))}
          </div>

        </div>
      </div>
    </section>
  )
}
