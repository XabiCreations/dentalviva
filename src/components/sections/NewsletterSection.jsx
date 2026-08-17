import { useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { useAuth } from '../../auth/AuthContext'
import { NewsletterForm } from '../ui/NewsletterForm'

gsap.registerPlugin(ScrollTrigger)

const FLOATING_IMAGES = [
  // TOP-LEFT — medium portrait
  {
    src: '/images/social-proof/newsletter/newsletter-1.webp',
    alt: 'Consejo dental semanal de DentalViva',
    className: 'w-48 h-64',
    style: { top: '8%', left: '17%' },
    rotation: -4,
    animY: -25,
  },
  // TOP-CENTER — small portrait, slightly higher
  {
    src: '/images/social-proof/newsletter/newsletter-2.webp',
    alt: 'Newsletter de consejos dentales',
    className: 'w-40 h-56',
    style: { top: '5%', left: 'calc(50% - 5rem)' },
    rotation: 1,
    animY: -20,
  },
  // TOP-RIGHT — large, bleeds off right edge
  {
    src: '/images/social-proof/newsletter/newsletter-3.webp',
    alt: 'Consejos para cuidar tu sonrisa',
    className: 'w-56 h-72',
    style: { top: '6%', right: '10%' },
    rotation: -3,
    animY: -25,
  },
  // BOTTOM-FAR-LEFT — very large, top at 57%, bleeds bottom
  {
    src: '/images/social-proof/newsletter/newsletter-4.webp',
    alt: 'Consejos de higiene dental',
    className: 'w-60 h-72',
    style: { top: '57%', left: '8%' },
    rotation: 3,
    animY: 30,
  },
  // BOTTOM-CENTER-RIGHT — medium, slightly higher than center-left
  {
    src: '/images/social-proof/newsletter/newsletter-5.webp',
    alt: 'Novedades dentales de DentalViva',
    className: 'w-52 h-64',
    style: { top: '69%', right: '44%' },
    rotation: -2,
    animY: 25,
  },
  // BOTTOM-FAR-RIGHT — large, top at 57%, bleeds bottom-right
  {
    src: '/images/social-proof/newsletter/newsletter-7.webp',
    alt: 'Información dental semanal',
    className: 'w-56 h-72',
    style: { top: '57%', right: '8%' },
    rotation: 4,
    animY: 30,
  },
]

export function NewsletterSection() {
  const sectionRef = useRef(null)
  const contentRef = useRef(null)
  const { user, profile } = useAuth()

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
    <section
      ref={sectionRef}
      aria-labelledby="cta-heading"
      className="relative py-20 lg:py-0 lg:h-screen flex items-center bg-[#f5f5f5] overflow-visible"
    >
      {/* Ripple waves — clipped to section, first in DOM so floating images paint above */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0" aria-hidden="true">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="absolute w-40 h-40 rounded-full border border-primary/25" />
          <div className="absolute w-[500px] h-[500px] rounded-full border border-primary/18" />
          <div className="absolute w-[900px] h-[900px] rounded-full border border-primary/12" />
          <div className="absolute w-[1300px] h-[1300px] rounded-full border border-primary/7" />
        </div>
      </div>

      {/* Floating images — visible on xl (≥1280px) only */}
      {FLOATING_IMAGES.map((img) => (
        <div
          key={img.src}
          className={`floating-img-cta absolute rounded-2xl overflow-hidden shadow-lg hidden xl:block z-20 ${img.className}`}
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
        <div ref={contentRef} className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl px-8 py-12 text-center">
          <h2 id="cta-heading" className="text-h2 text-text font-bold mb-4">
            Únete a quienes cuidan su boca con nuestros{' '}
            <span className="font-playfair italic text-primary">consejos semanales</span>
          </h2>
          <p className="text-muted text-body-lg mb-8">
            Con consejos semanales podrás saber cómo cuidar de tu dentadura.
          </p>

          <NewsletterForm user={user} profile={profile} />
        </div>
      </div>
    </section>
  )
}
