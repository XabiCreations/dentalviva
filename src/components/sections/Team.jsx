/**
 * Team — Section showcasing the dental team.
 * Notes:
 * - 3-col desktop, 2-col tablet, 1-col mobile
 * - GSAP stagger reveal from below on viewport enter
 * - Respects prefers-reduced-motion
 */

import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { DoctorCard } from '../ui/DoctorCard'

const doctors = [
  {
    id: 'mendoza',
    name: 'Dr. Carlos Mendoza',
    specialty: 'Implantología',
    years: 23,
    photo: '/images/equipo-1.webp',
    linkedinUrl: 'https://linkedin.com',
  },
  {
    id: 'garcia',
    name: 'Dra. Ana García',
    specialty: 'Ortodoncia',
    years: 15,
    photo: '/images/equipo-2.webp',
    linkedinUrl: 'https://linkedin.com',
  },
  {
    id: 'torres',
    name: 'Dr. Luis Torres',
    specialty: 'Estética Dental',
    years: 18,
    photo: '/images/equipo-3.webp',
    linkedinUrl: 'https://linkedin.com',
  },
]

export function Team() {
  const sectionRef = useRef(null)
  const cardsRef = useRef([])

  const prefersReducedMotion =
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false

  useEffect(() => {
    if (prefersReducedMotion) return

    const ctx = gsap.context(() => {
      gsap.from(cardsRef.current.filter(Boolean), {
        opacity: 0,
        y: 50,
        duration: 0.7,
        stagger: 0.15,
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

  return (
    <section
      ref={sectionRef}
      id="equipo"
      className="section-padding bg-background"
      aria-labelledby="team-heading"
    >
      <div className="container-xl">
        {/* Header */}
        <div className="text-center mb-12 lg:mb-16">
          <p className="eyebrow mb-3">Nuestros especialistas</p>
          <h2 id="team-heading" className="text-h2 text-text mb-4">
            El equipo detrás de tu{' '}
            <span className="font-playfair italic text-primary">sonrisa</span>
          </h2>
          <p className="text-muted text-body-lg max-w-2xl mx-auto">
            Contamos con un equipo de dentistas altamente cualificados, apasionados por
            su trabajo y comprometidos con la excelencia clínica y la atención al paciente.
          </p>
        </div>

        {/* Doctors grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {doctors.map((doctor, i) => (
            <div
              key={doctor.id}
              ref={(el) => (cardsRef.current[i] = el)}
            >
              <DoctorCard
                photo={doctor.photo}
                name={doctor.name}
                specialty={doctor.specialty}
                years={doctor.years}
                linkedinUrl={doctor.linkedinUrl}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
