import { useEffect } from 'react'
import { X } from 'lucide-react'

export function ServiceModal({ service, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    const onKey = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = ''
      document.removeEventListener('keydown', onKey)
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-text/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className="relative bg-white rounded-3xl shadow-2xl w-full max-w-2xl">

        {/* Close button */}
        <button
          onClick={onClose}
          aria-label="Cerrar"
          className="absolute -top-4 -right-4 w-10 h-10 rounded-full bg-text text-white flex items-center justify-center shadow-lg z-10"
        >
          <X size={18} />
        </button>

        <div className="max-h-[85vh] overflow-y-auto rounded-3xl">
          <div className="p-8 sm:p-10">
            <h2 className="text-h2 font-bold text-text mb-6 sm:mb-8">
              {service.title}
            </h2>

            <div className="space-y-6 sm:space-y-8">
              {service.details.map((section, i) => (
                <div key={i}>
                  <p className="font-semibold text-text mb-1">{section.heading}</p>
                  <p className="text-text/70 leading-relaxed">{section.body}</p>
                </div>
              ))}
            </div>

            {/* Safe area bottom para móvil */}
            <div className="h-4 sm:h-0" />
          </div>
        </div>
      </div>
    </div>
  )
}
