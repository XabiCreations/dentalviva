import { useEffect, useRef, useState, useCallback } from 'react'
import { Menu, X, LogOut, ClipboardList, User, Phone, Mail, ChevronDown } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { AppointmentModal } from '../ui/AppointmentModal'
import { useAuth } from '../../auth/AuthContext'
import { signOut } from '../../auth/authService'
import { getDisplayName } from '../../utils/profile'

const CLINIC_PHONE = 'tel:+34900000000'
const CLINIC_EMAIL = 'mailto:info@dentalviva.es'

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Por qué elegirnos', href: '#porque-elegirnos' },
  { label: 'Antes y después', href: '#antes-despues' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Equipo', href: '#equipo' },
]

function DentalLogo() {
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
      <circle cx="16" cy="16" r="16" fill="#EBF4FF" />
      <path
        d="M16 7C12.5 7 10 9.5 10 12C10 13.5 10.5 15 11 16.5C11.7 18.5 12 20.5 12 22C12 23.1 12.9 24 14 24C15.1 24 16 23.1 16 22V20C16 20 16 22 18 22C19.1 22 20 23.1 20 22C20 20.5 20.3 18.5 21 16.5C21.5 15 22 13.5 22 12C22 9.5 19.5 7 16 7Z"
        fill="#2A7FD4"
      />
    </svg>
  )
}

export function Nav() {
  const navRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [modalMode, setModalMode] = useState(null)
  const [contactOpen, setContactOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const { user, profile } = useAuth()
  const displayName = getDisplayName(profile)
  const nameParts = displayName?.trim().split(/\s+/) ?? []
  const initials = nameParts.length >= 2
    ? (nameParts[0][0] + nameParts[nameParts.length - 1][0]).toUpperCase()
    : nameParts[0]?.[0]?.toUpperCase() ?? '?'

  // Close user menu on outside click (desktop)
  const handleClickOutsideUserMenu = useCallback((e) => {
    if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
      setUserMenuOpen(false)
    }
  }, [])

  useEffect(() => {
    if (userMenuOpen) document.addEventListener('mousedown', handleClickOutsideUserMenu)
    else document.removeEventListener('mousedown', handleClickOutsideUserMenu)
    return () => document.removeEventListener('mousedown', handleClickOutsideUserMenu)
  }, [userMenuOpen, handleClickOutsideUserMenu])

  // Close drawer on resize to desktop
  useEffect(() => {
    const handleResize = () => { if (window.innerWidth >= 1024) setIsOpen(false) }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Lock body scroll when mobile menu or modal is open
  useEffect(() => {
    document.body.style.overflow = (isOpen || modalMode || contactOpen) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen, modalMode])

  const handleLinkClick = () => setIsOpen(false)
  const handleSignOut = async () => { setUserMenuOpen(false); await signOut() }
  const openCita = () => { setIsOpen(false); setModalMode('cita') }
  const openContact = () => { setIsOpen(false); setUserMenuOpen(false); setContactOpen(true) }

  return (
    <>
      {/* ── Main nav bar ─────────────────────────────────────────────────── */}
      <header
        ref={navRef}
        className="fixed top-0 left-0 right-0 z-50 bg-white shadow-nav"
        role="banner"
      >
        <div className="container-xl">
          <nav className="flex items-center justify-between h-16 lg:h-20" aria-label="Navegación principal">

            {/* Logo */}
            <a
              href="#"
              className="flex items-center gap-2.5 shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg"
              aria-label="DentalViva — volver al inicio"
            >
              <DentalLogo />
              <span className="text-body-lg font-bold tracking-tight text-text">DentalViva</span>
            </a>

            {/* Desktop links */}
            <ul className="hidden lg:flex items-center gap-1" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="px-4 py-2 rounded-lg text-body-sm font-medium text-muted transition-colors duration-150 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>

            {/* Desktop CTA */}
            <div className="hidden lg:flex items-center gap-3">
              <Button variant="primary" size="sm" onClick={openCita}>
                Reservar cita
              </Button>

              {user ? (
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setUserMenuOpen(o => !o)}
                    className="flex items-center gap-2 text-body-sm font-medium px-4 py-2 rounded-xl transition-all duration-150 text-text bg-surface"
                  >
                    <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-body-sm font-bold shrink-0">
                      {initials}
                    </div>
                    {displayName}
                    <ChevronDown
                      size={14}
                      strokeWidth={2}
                      className="text-muted transition-transform duration-150"
                      style={{ transform: userMenuOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                    />
                  </button>
                  {userMenuOpen && (
                    <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-border rounded-xl shadow-card overflow-hidden w-48 z-50">
                      <Link
                        to="/mis-citas"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-body-sm text-text hover:bg-surface transition-colors"
                      >
                        <ClipboardList size={16} strokeWidth={1.5} className="text-muted" />
                        Mis citas
                      </Link>
                      <Link
                        to="/mi-cuenta"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-body-sm text-text hover:bg-surface transition-colors"
                      >
                        <User size={18} strokeWidth={1.5} className="text-muted" />
                        Mi cuenta
                      </Link>
                      <button
                        onClick={openContact}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-body-sm text-text hover:bg-surface transition-colors"
                      >
                        <Phone size={16} strokeWidth={1.5} className="text-muted" />
                        Contacto
                      </button>
                      <hr className="border-border" />
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2.5 w-full px-4 py-2.5 text-body-sm text-muted hover:bg-surface transition-colors"
                      >
                        <LogOut size={16} strokeWidth={1.5} />
                        Cerrar sesión
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-body-sm font-semibold text-primary bg-primary/10 border border-transparent"
                >
                  Acceso
                </Link>
              )}
            </div>

            {/* Mobile: CTA + hamburger */}
            <div className="flex items-center gap-2 lg:hidden">
              <Button variant="primary" size="sm" onClick={openCita}>
                Reservar cita
              </Button>
              <button
                className="p-2 rounded-xl text-text hover:bg-surface transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary border border-[#f5f5f5]"
                onClick={() => setIsOpen(o => !o)}
                aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú de navegación'}
                aria-expanded={isOpen}
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

          </nav>
        </div>
      </header>

      {/* ── Mobile full-screen overlay ───────────────────────────────────── */}
      <div
        className={[
          'fixed top-16 inset-x-0 bottom-0 z-40 bg-white flex flex-col lg:hidden',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Nav links — centered */}
        <nav className="flex-1 flex flex-col items-center justify-center gap-2 px-6">
          {navLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={handleLinkClick}
              className="text-h4 font-medium text-text hover:text-primary transition-colors duration-150 py-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-lg px-4"
            >
              {link.label}
            </a>
          ))}
          {!user && (
            <>
              <hr className="w-16 border-border my-2" />
              <Link
                to="/login"
                onClick={handleLinkClick}
                className="inline-flex items-center justify-center px-4 py-2 rounded-xl text-body-sm font-semibold text-primary bg-primary/10 border border-transparent"
              >
                Acceso
              </Link>
            </>
          )}
        </nav>

        {/* Auth section — bottom */}
        <div className="shrink-0 px-4 pb-8 pt-4 border-t border-border">
          {user && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3 px-2 py-1">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-body-sm font-bold shrink-0">
                  {initials}
                </div>
                <p className="text-body-sm font-semibold text-text truncate">{displayName}</p>
              </div>

              <div className="bg-surface rounded-2xl overflow-hidden">
                <Link
                  to="/mis-citas"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-3.5 text-body-sm font-medium text-text hover:bg-border/40 transition-colors border-b border-border/60"
                >
                  <ClipboardList size={16} strokeWidth={1.5} className="text-muted shrink-0" />
                  Mis citas
                </Link>
                <Link
                  to="/mi-cuenta"
                  onClick={handleLinkClick}
                  className="flex items-center gap-3 px-4 py-3.5 text-body-sm font-medium text-text hover:bg-border/40 transition-colors border-b border-border/60"
                >
                  <User size={16} strokeWidth={1.5} className="text-muted shrink-0" />
                  Mi cuenta
                </Link>
                <button
                  onClick={openContact}
                  className="flex items-center gap-3 px-4 py-3.5 w-full text-body-sm font-medium text-text hover:bg-border/40 transition-colors"
                >
                  <Phone size={16} strokeWidth={1.5} className="text-muted shrink-0" />
                  Contacto
                </button>
              </div>

              <button
                onClick={async () => { handleLinkClick(); await signOut() }}
                className="flex items-center gap-3 px-4 py-3.5 w-full text-body-sm font-medium text-muted hover:bg-surface rounded-2xl transition-colors"
              >
                <LogOut size={16} strokeWidth={1.5} />
                Cerrar sesión
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Appointment modal */}
      {modalMode && (
        <AppointmentModal mode={modalMode} onClose={() => setModalMode(null)} />
      )}

      {/* Contact modal */}
      {contactOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Contacto"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setContactOpen(false)}
          />

          {/* Card */}
          <div className="relative bg-white rounded-2xl shadow-card w-full max-w-sm p-6 flex flex-col gap-5">
            <button
              onClick={() => setContactOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-muted hover:bg-surface transition-colors outline-none"
              aria-label="Cerrar"
            >
              <X size={18} strokeWidth={2} />
            </button>

            <div>
              <h2 className="text-h5 font-bold text-text mb-1">¿Cómo quieres contactarnos?</h2>
              <p className="text-body-sm text-muted">Estamos disponibles para ayudarte.</p>
            </div>

            <div className="flex flex-col gap-3">
              <a
                href={CLINIC_PHONE}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Phone size={17} strokeWidth={1.75} className="text-primary" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-text">Llamar</p>
                  <p className="text-[12px] text-muted">+34 900 000 000</p>
                </div>
              </a>

              <a
                href={CLINIC_EMAIL}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 transition-colors group"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <Mail size={17} strokeWidth={1.75} className="text-primary" />
                </div>
                <div>
                  <p className="text-body-sm font-semibold text-text">Escribir un mensaje</p>
                  <p className="text-[12px] text-muted">info@dentalviva.es</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
