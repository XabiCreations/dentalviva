import { NavLink } from 'react-router-dom'
import { LayoutDashboard, ClipboardList, CalendarDays, LogOut, X } from 'lucide-react'
import { useAdminAuth } from './AdminAuthContext'

interface AdminSidebarProps {
  open: boolean
  onClose: () => void
}

function getInitials(name: string): string {
  const clean = name.replace(/^(Dr\.|Dra\.)\s+/i, '')
  return clean.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

const NAV_ITEMS = [
  { to: '/admin',          label: 'Inicio',     icon: LayoutDashboard, end: true },
  { to: '/admin/citas',    label: 'Citas',      icon: ClipboardList,   end: false },
  { to: '/admin/calendario', label: 'Calendario', icon: CalendarDays,  end: false },
]

function DentalLogo() {
  return (
    <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
      <circle cx="16" cy="16" r="16" fill="#EBF4FF" />
      <path
        d="M16 7C12.5 7 10 9.5 10 12C10 13.5 10.5 15 11 16.5C11.7 18.5 12 20.5 12 22C12 23.1 12.9 24 14 24C15.1 24 16 23.1 16 22V20C16 20 16 22 18 22C19.1 22 20 23.1 20 22C20 20.5 20.3 18.5 21 16.5C21.5 15 22 13.5 22 12C22 9.5 19.5 7 16 7Z"
        fill="#2A7FD4"
      />
    </svg>
  )
}

export function AdminSidebar({ open, onClose }: AdminSidebarProps) {
  const { dentist, signOut } = useAdminAuth()

  const initials = dentist ? getInitials(dentist.name) : '?'

  return (
    <>
      {/* Sidebar */}
      <aside
        className={[
          'fixed inset-y-0 left-0 z-30 flex flex-col w-64 bg-white border-r border-border',
          'transition-transform duration-200 ease-in-out',
          'lg:static lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
        aria-label="Navegación del panel"
      >
        {/* Header */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-border shrink-0">
          <div className="flex items-center gap-2.5">
            <DentalLogo />
            <span className="text-body-sm font-bold text-text">DentalViva</span>
            <span className="px-1.5 py-0.5 text-[10px] font-semibold bg-primary-light text-primary rounded uppercase tracking-wide">
              Admin
            </span>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface transition-colors"
            aria-label="Cerrar menú"
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 overflow-y-auto">
          <ul className="flex flex-col gap-0.5" role="list">
            {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  onClick={onClose}
                  className={({ isActive }) => [
                    'flex items-center gap-3 px-3 py-2.5 rounded-xl text-body-sm font-medium transition-all duration-150',
                    isActive
                      ? 'bg-primary-light text-primary'
                      : 'text-muted hover:bg-surface hover:text-text',
                  ].join(' ')}
                >
                  <Icon size={18} strokeWidth={1.75} />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer — dentist info + logout */}
        <div className="px-3 py-4 border-t border-border shrink-0">
          <div className="flex items-center gap-3 px-2 py-2 mb-1">
            <div
              className="w-9 h-9 rounded-full bg-primary-light text-primary flex items-center justify-center text-body-sm font-bold shrink-0"
              aria-hidden="true"
            >
              {initials}
            </div>
            <div className="min-w-0">
              <p className="text-body-sm font-semibold text-text truncate">{dentist?.name ?? '—'}</p>
              <p className="text-[12px] text-muted truncate">{dentist?.specialty ?? ''}</p>
            </div>
          </div>
          <button
            onClick={signOut}
            className="flex items-center gap-2.5 w-full px-3 py-2 rounded-xl text-body-sm text-muted
              hover:bg-red-50 hover:text-red-600 transition-all duration-150"
          >
            <LogOut size={16} strokeWidth={1.75} />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
