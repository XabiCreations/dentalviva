import { useEffect, useRef, useState } from 'react'
import { Routes, Route } from 'react-router-dom'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import './styles/globals.css'

import { Nav } from './components/sections/Nav'
import { Hero } from './components/sections/Hero'
import { Services } from './components/sections/Services'
import { WhyChooseUs } from './components/sections/WhyChooseUs'
import { BeforeAfter } from './components/sections/BeforeAfter'
import { Testimonials } from './components/sections/Testimonials'
import { Team } from './components/sections/Team'
import { CTASection } from './components/sections/CTASection'
import { Footer } from './components/sections/Footer'
import { AppointmentModal } from './components/ui/AppointmentModal'
import { useAuth } from './auth/AuthContext'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import HistorialPage from './pages/HistorialPage'
import { TypographyShowcase } from './components/sections/TypographyShowcase'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

gsap.registerPlugin(ScrollTrigger)

function LandingPage() {
  const [pendingBooking, setPendingBooking] = useState(null)
  const bookingChecked = useRef(false)

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      gsap.globalTimeline.pause()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  const { user } = useAuth()

  // When user becomes authenticated, check for a pending appointment saved before login
  useEffect(() => {
    if (!user || bookingChecked.current) return
    bookingChecked.current = true
    const raw = sessionStorage.getItem('pendingAppointment')
    if (!raw) return
    sessionStorage.removeItem('pendingAppointment')
    try {
      const data = JSON.parse(raw)
      setPendingBooking({ ...data, date: new Date(data.date) })
    } catch {}
  }, [user])

  return (
    <div className="min-h-screen bg-background font-sans">
      {pendingBooking && (
        <AppointmentModal
          mode="cita"
          initialData={pendingBooking}
          onClose={() => setPendingBooking(null)}
        />
      )}
      <Nav />
      <main id="main-content">
        <Hero />
        <Services />
        <TypographyShowcase />
        <WhyChooseUs />
        <BeforeAfter />
        <Testimonials />
        <Team />
        <CTASection />
      </main>
      <Footer />
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route
        path="/historial"
        element={
          <ProtectedRoute>
            <HistorialPage />
          </ProtectedRoute>
        }
      />
    </Routes>
  )
}
