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
import { ProtectedRoute } from './components/auth/ProtectedRoute'

import { AdminAuthProvider } from './admin/AdminAuthContext'
import { AdminProtectedRoute } from './admin/AdminProtectedRoute'
import { AdminLayout } from './admin/AdminLayout'
import AdminLoginPage from './pages/admin/AdminLoginPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import AdminCitasPage from './pages/admin/AdminCitasPage'
import AdminCalendarioPage from './pages/admin/AdminCalendarioPage'

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

function AdminRoot() {
  return (
    <AdminAuthProvider>
      <Routes>
        <Route path="login" element={<AdminLoginPage />} />
        <Route element={<AdminProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="citas" element={<AdminCitasPage />} />
            <Route path="calendario" element={<AdminCalendarioPage />} />
          </Route>
        </Route>
      </Routes>
    </AdminAuthProvider>
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
      <Route path="/admin/*" element={<AdminRoot />} />
    </Routes>
  )
}
