/**
 * BeforeAfterSlider — Interactive before/after image comparison slider.
 * Props:
 * - beforeImage: string — URL of the "before" image
 * - afterImage: string — URL of the "after" image
 * - beforeAlt: string — alt text for before image
 * - afterAlt: string — alt text for after image
 * Notes:
 * - Both images overlaid, draggable divider at 50%
 * - Supports mouse and touch drag
 * - Resets to 50% when images change (via key prop from parent)
 * - GSAP fade when images transition (handled by parent with key)
 * - Handle pulse animation on load (respects prefers-reduced-motion)
 */

import { useRef, useState, useEffect, useCallback } from 'react'
import gsap from 'gsap'

let dragHintShown = false

export function BeforeAfterSlider({ beforeImage, afterImage, beforeAlt, afterAlt, objectPosition = 'center center' }) {
  const [sliderPos, setSliderPos] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const [isHintActive, setIsHintActive] = useState(false)
  const containerRef = useRef(null)
  const handleRef = useRef(null)
  const hintIconRef = useRef(null)
  const prefersReducedMotion = useRef(
    typeof window !== 'undefined'
      ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
      : false
  )

  // Drag-hint animation: slider nudges left→right→center once when section enters viewport
  useEffect(() => {
    if (prefersReducedMotion.current || !containerRef.current) return
    const obj = { pos: 50 }
    let tl

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return
        observer.disconnect()
        if (dragHintShown) return
        dragHintShown = true
        tl = gsap.timeline({ delay: 0.2 })

        gsap.set(hintIconRef.current, { opacity: 0, left: '68%', xPercent: -50, y: 0 })

        // Fade in
        tl.to(hintIconRef.current, { opacity: 1, duration: 0.5, ease: 'sine.inOut' })
        tl.call(() => setIsHintActive(true))

        // Move left
        tl.to(obj, { pos: 30, duration: 0.84, ease: 'sine.inOut', onUpdate: () => setSliderPos(obj.pos) })
        tl.to(hintIconRef.current, { left: '30%', y: -6, duration: 0.89, ease: 'sine.inOut' }, '<0.05')

        // Brief pause at left
        tl.to({}, { duration: 0.1 })

        // Move right
        tl.to(obj, { pos: 70, duration: 0.84, ease: 'sine.inOut', onUpdate: () => setSliderPos(obj.pos) })
        tl.to(hintIconRef.current, { left: '70%', y: 4, duration: 0.89, ease: 'sine.inOut' }, '<0.05')

        // Brief pause at right
        tl.to({}, { duration: 0.1 })

        // Return to center
        tl.to(obj, { pos: 50, duration: 0.84, ease: 'sine.inOut', onUpdate: () => setSliderPos(obj.pos) })
        tl.to(hintIconRef.current, { left: '50%', y: 0, duration: 0.89, ease: 'sine.inOut' }, '<0.05')

        // Fade out
        tl.to(hintIconRef.current, { opacity: 0, duration: 0.5, ease: 'sine.inOut' })
        tl.call(() => setIsHintActive(false))
      },
      { threshold: 0.4 }
    )
    observer.observe(containerRef.current)

    return () => { observer.disconnect(); tl?.kill() }
  }, [])

  // Reset to 50% when images change
  useEffect(() => {
    setSliderPos(50)
  }, [beforeImage, afterImage])

  const getPositionFromEvent = useCallback((e) => {
    const container = containerRef.current
    if (!container) return 50
    const rect = container.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const x = clientX - rect.left
    const pct = Math.max(0, Math.min(100, (x / rect.width) * 100))
    return pct
  }, [])

  const handleMouseDown = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleMouseMove = useCallback(
    (e) => {
      if (!isDragging) return
      setSliderPos(getPositionFromEvent(e))
    },
    [isDragging, getPositionFromEvent]
  )

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleTouchStart = useCallback((e) => {
    setIsDragging(true)
  }, [])

  const handleTouchMove = useCallback(
    (e) => {
      if (!isDragging) return
      e.preventDefault()
      setSliderPos(getPositionFromEvent(e))
    },
    [isDragging, getPositionFromEvent]
  )

  const handleTouchEnd = useCallback(() => {
    setIsDragging(false)
  }, [])

  // Attach/detach global listeners
  useEffect(() => {
    if (isDragging) {
      window.addEventListener('mousemove', handleMouseMove)
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('touchmove', handleTouchMove, { passive: false })
      window.addEventListener('touchend', handleTouchEnd)
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseup', handleMouseUp)
      window.removeEventListener('touchmove', handleTouchMove)
      window.removeEventListener('touchend', handleTouchEnd)
    }
  }, [isDragging, handleMouseMove, handleMouseUp, handleTouchMove, handleTouchEnd])

  return (
    <div
      ref={containerRef}
      className="relative w-full overflow-hidden rounded-xl select-none h-[70vh] lg:h-auto lg:aspect-video"
      style={{ cursor: isDragging ? 'ew-resize' : 'col-resize' }}
      onMouseDown={handleMouseDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={handleTouchStart}
      aria-label="Comparador antes y después. Arrastra para comparar"
      role="img"
    >
      {/* After image — full width, always visible */}
      <img
        src={afterImage}
        alt={afterAlt || 'Después del tratamiento'}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{ objectPosition }}
        draggable={false}
      />

      {/* Before image — same size, clipped from the right with clipPath */}
      <img
        src={beforeImage}
        alt={beforeAlt || 'Antes del tratamiento'}
        className="absolute inset-0 w-full h-full object-cover pointer-events-none"
        style={{
          objectPosition,
          clipPath: `inset(0 ${100 - sliderPos}% 0 0)`,
        }}
        draggable={false}
      />

      {/* Labels */}
      <div className="absolute top-3 left-3 bg-text/70 text-white text-xs font-semibold px-2 py-1 rounded pointer-events-none">
        Antes
      </div>
      <div className="absolute top-3 right-3 bg-primary/90 text-white text-xs font-semibold px-2 py-1 rounded pointer-events-none">
        Después
      </div>

      {/* Drag hint icon — GSAP controls left/x/y/rotation for human-like motion */}
      <div
        ref={hintIconRef}
        className="absolute pointer-events-none"
        style={{ bottom: 'calc(50% + 3rem)', opacity: 0 }}
        aria-hidden="true"
      >
        <img src="/images/resizewesteast.svg" alt="" width="96" height="96" draggable="false" />
      </div>

      {/* Divider line */}
      <div
        className="absolute inset-y-0 w-0.5 bg-white shadow-lg pointer-events-none"
        style={{ left: `${sliderPos}%`, transform: 'translateX(-50%)' }}
      />

      {/* Handle */}
      <div
        ref={handleRef}
        className="absolute w-14 h-14 rounded-full shadow-lg flex items-center justify-center pointer-events-none border-2"
        style={{
          left: `${sliderPos}%`,
          top: '50%',
          backgroundColor: '#ffffff',
          borderColor: 'rgba(235, 242, 251, 1)',
          transform: `translateX(-50%) translateY(-50%) scale(${isDragging || isHovered || isHintActive ? 1.1 : 1})`,
          transition: 'transform 0.15s ease',
        }}
        aria-hidden="true"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path
            d="M7 6L2 12L7 18M17 6L22 12L17 18"
            stroke="#2A7FD4"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  )
}
