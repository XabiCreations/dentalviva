import { useEffect, useRef, useState, useCallback } from 'react'
import { Menu, X, LogOut, ClipboardList } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { AppointmentModal } from '../ui/AppointmentModal'
import { useAuth } from '../../auth/AuthContext'
import { signOut } from '../../auth/authService'

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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const userMenuRef = useRef(null)

  const { user, profile } = useAuth()
  const firstName = profile?.full_name?.split(' ')[0] ?? null
  const nameParts = profile?.full_name?.trim().split(/\s+/) ?? []
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
    document.body.style.overflow = (isOpen || modalMode) ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [isOpen, modalMode])

  const handleLinkClick = () => setIsOpen(false)
  const handleSignOut = async () => { setUserMenuOpen(false); await signOut() }
  const openCita = () => { setIsOpen(false); setModalMode('cita') }

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
                <>
                  <Link
                    to="/historial"
                    className="flex items-center gap-1.5 text-body-sm font-medium px-3 py-1.5 rounded-xl transition-all duration-150 text-muted hover:text-primary hover:bg-primary/10"
                    aria-label="Ver historial de citas"
                  >
                    <ClipboardList size={16} strokeWidth={1.5} />
                    Mis citas
                  </Link>

                  <div ref={userMenuRef} className="relative">
                    <button
                      onClick={() => setUserMenuOpen(o => !o)}
                      className="flex items-center gap-2 text-body-sm font-medium px-3 py-1.5 rounded-xl transition-all duration-150 text-text hover:bg-surface"
                    >
                      <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center text-white text-body-sm font-bold shrink-0">
                        {initials}
                      </div>
                      {firstName}
                    </button>
                    {userMenuOpen && (
                      <div className="absolute top-[calc(100%+8px)] right-0 bg-white border border-border rounded-xl shadow-card py-1 w-44 z-50">
                        <button
                          onClick={handleSignOut}
                          className="flex items-center gap-2 w-full px-4 py-2.5 text-body-sm text-muted hover:bg-surface transition-colors"
                        >
                          <LogOut size={14} strokeWidth={1.5} />
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </div>
                </>
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
                onClick={() => setIsOpen(true)}
                aria-label="Abrir menú de navegación"
                aria-expanded={isOpen}
              >
                <Menu className="w-6 h-6" />
              </button>
            </div>

          </nav>
        </div>
      </header>

      {/* ── Mobile full-screen overlay ───────────────────────────────────── */}
      <div
        className={[
          'fixed inset-0 z-50 bg-white flex flex-col lg:hidden',
          'transition-opacity duration-300',
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
        role="dialog"
        aria-modal="true"
        aria-label="Menú de navegación"
      >
        {/* Overlay header: mirrors nav bar */}
        <div className="flex items-center justify-between px-5 h-16 border-b border-border shrink-0">
          <a
            href="#"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 shrink-0"
            aria-label="DentalViva — volver al inicio"
          >
            <DentalLogo />
            <span className="text-body-lg font-bold tracking-tight text-text">DentalViva</span>
          </a>

          <div className="flex items-center gap-2">
            <Button variant="primary" size="sm" onClick={openCita}>
              Reservar cita
            </Button>
            <button
              onClick={() => setIsOpen(false)}
              aria-label="Cerrar menú"
              className="p-2 rounded-lg text-text hover:bg-surface transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

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
        <div className="shrink-0 px-6 pb-10 pt-6 border-t border-border">
          {user && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white text-body-sm font-bold shrink-0">
                  {initials}
                </div>
                <p className="text-body-sm font-semibold text-text">{firstName}</p>
              </div>
              <div className="flex items-center gap-3">
                <Link
                  to="/historial"
                  onClick={handleLinkClick}
                  className="flex items-center gap-1.5 text-body-sm font-medium text-muted hover:text-primary transition-colors"
                  aria-label="Ver historial de citas"
                >
                  <ClipboardList size={16} strokeWidth={1.5} />
                  Mis citas
                </Link>
                <button
                  onClick={async () => { handleLinkClick(); await signOut() }}
                  className="flex items-center gap-1.5 text-body-sm font-medium text-muted hover:text-text transition-colors"
                >
                  <LogOut size={16} strokeWidth={1.5} />
                  Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Appointment modal */}
      {modalMode && (
        <AppointmentModal mode={modalMode} onClose={() => setModalMode(null)} />
      )}
    </>
  )
}
