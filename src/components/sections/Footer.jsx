/**
 * Footer — Site footer with logo, navigation, contact info, hours, and social links.
 * Notes:
 * - Background: color-text (near black), white/muted text
 * - Social icons from lucide-react
 */

import { Phone, Mail, MapPin, Clock, Instagram, Facebook, Twitter, Youtube } from 'lucide-react'

const navLinks = [
  { label: 'Servicios', href: '#servicios' },
  { label: 'Por qué elegirnos', href: '#porque-elegirnos' },
  { label: 'Antes y después', href: '#antes-despues' },
  { label: 'Testimonios', href: '#testimonios' },
  { label: 'Equipo', href: '#equipo' },
]

const contactInfo = [
  {
    icon: MapPin,
    label: 'Dirección',
    text: 'Calle Gran Vía 24, 2ª planta, 28013 Madrid',
  },
  {
    icon: Phone,
    label: 'Teléfono',
    text: '900 000 000',
    href: 'tel:+34900000000',
  },
  {
    icon: Mail,
    label: 'Email',
    text: 'info@dentalviva.es',
    href: 'mailto:info@dentalviva.es',
  },
]

const businessHours = [
  { days: 'Lunes – Viernes', hours: '9:00 – 20:00' },
  { days: 'Sábados', hours: '9:00 – 14:00' },
  { days: 'Domingos', hours: 'Cerrado' },
]

const socialLinks = [
  { icon: Instagram, label: 'Instagram', href: 'https://instagram.com' },
  { icon: Facebook, label: 'Facebook', href: 'https://facebook.com' },
  { icon: Twitter, label: 'X / Twitter', href: 'https://twitter.com' },
  { icon: Youtube, label: 'YouTube', href: 'https://youtube.com' },
]

function FooterLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <svg width="32" height="32" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
        <circle cx="16" cy="16" r="16" fill="#1d6abf" />
        <path
          d="M16 7C12.5 7 10 9.5 10 12C10 13.5 10.5 15 11 16.5C11.7 18.5 12 20.5 12 22C12 23.1 12.9 24 14 24C15.1 24 16 23.1 16 22V20C16 20 16 22 18 22C19.1 22 20 23.1 20 22C20 20.5 20.3 18.5 21 16.5C21.5 15 22 13.5 22 12C22 9.5 19.5 7 16 7Z"
          fill="white"
        />
      </svg>
      <span className="text-xl font-bold text-white tracking-tight">DentalViva</span>
    </div>
  )
}

export function Footer() {
  return (
    <footer
      className="bg-text text-white"
      role="contentinfo"
      aria-label="Pie de página"
    >
      <div className="container-xl pt-16 pb-8">
        {/* Main grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8 mb-12">
          {/* Col 1: Brand */}
          <div className="lg:col-span-1">
            <a href="#" aria-label="DentalViva — ir al inicio" className="inline-block mb-4">
              <FooterLogo />
            </a>
            <p className="text-muted text-sm leading-relaxed mb-6">
              Clínica dental en Madrid. Equipo especializado, tecnología de precisión
              y 15 años de trayectoria.
            </p>
            {/* Social icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="
                    w-9 h-9 rounded-lg bg-white/8 border border-white/10
                    flex items-center justify-center
                    text-muted hover:text-white hover:bg-primary hover:border-primary
                    transition-all duration-150
                    focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
                  "
                >
                  <Icon className="w-4 h-4" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">
              Navegación
            </h3>
            <ul className="flex flex-col gap-2.5" role="list">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="
                      text-muted text-sm hover:text-white
                      transition-colors duration-150
                      focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded
                    "
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contact */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">
              Contacto
            </h3>
            <ul className="flex flex-col gap-4" role="list">
              {contactInfo.map(({ icon: Icon, label, text, href }) => (
                <li key={label} className="flex items-start gap-3">
                  <Icon
                    className="w-4 h-4 text-primary mt-0.5 shrink-0"
                    strokeWidth={1.5}
                    aria-hidden="true"
                  />
                  {href ? (
                    <a
                      href={href}
                      className="text-muted text-sm hover:text-white transition-colors"
                      aria-label={`${label}: ${text}`}
                    >
                      {text}
                    </a>
                  ) : (
                    <span className="text-muted text-sm">{text}</span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4: Hours */}
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-white/60 mb-4">
              Horario
            </h3>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-4 h-4 text-primary shrink-0" strokeWidth={1.5} aria-hidden="true" />
              <span className="text-muted text-sm">Urgencias: atención 24 h</span>
            </div>
            <ul className="flex flex-col gap-2.5" role="list">
              {businessHours.map(({ days, hours }) => (
                <li key={days} className="flex items-center justify-between gap-4">
                  <span className="text-muted text-sm">{days}</span>
                  <span
                    className={`text-sm font-medium ${
                      hours === 'Cerrado' ? 'text-white/30' : 'text-white'
                    }`}
                  >
                    {hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-muted text-sm">
            © 2026 DentalViva. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-6">
            <a
              href="#"
              className="text-muted text-sm hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Política de privacidad
            </a>
            <a
              href="#"
              className="text-muted text-sm hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Aviso legal
            </a>
            <a
              href="#"
              className="text-muted text-sm hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded"
            >
              Cookies
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
