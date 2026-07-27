import { useEffect } from 'react'
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
import { ProtectedRoute } from './components/auth/ProtectedRoute'

import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import UserPortalPage from './pages/UserPortalPage'
import HistorialPage from './pages/HistorialPage'

gsap.registerPlugin(ScrollTrigger)

function LandingPage() {
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReducedMotion) {
      gsap.globalTimeline.pause()
      ScrollTrigger.getAll().forEach((st) => st.kill())
    }
  }, [])

  return (
    <div className="min-h-screen bg-background font-sans">
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

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/registro" element={<RegisterPage />} />
      <Route
        path="/portal"
        element={
          <ProtectedRoute>
            <UserPortalPage />
          </ProtectedRoute>
        }
      />
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
