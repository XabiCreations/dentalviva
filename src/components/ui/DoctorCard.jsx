import { Linkedin } from 'lucide-react'

export function DoctorCard({ photo, name, specialty, years, linkedinUrl }) {
  return (
    <article className="relative aspect-[3/4] rounded-2xl overflow-hidden">
      {/* Background photo */}
      <img
        src={photo}
        alt={`Foto de ${name}`}
        loading="lazy"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Gradient overlay: transparent top → black/40 bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />

      {/* Info at bottom */}
      <div className="absolute bottom-0 left-0 right-0 p-5 flex items-end justify-between gap-3">
        <div>
          <h3 className="text-h5 font-semibold text-white">{name}</h3>
          <p className="text-white/80 text-body-sm font-medium mt-0.5">
            {specialty}{years != null && <><span className="mx-1.5 opacity-60">•</span>{years} años en el sector</>}
          </p>
        </div>

        {linkedinUrl && (
          <a
            href={linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Perfil de LinkedIn de ${name}`}
            className="
              shrink-0 w-12 h-12 rounded-full
              bg-white/20 backdrop-blur-sm border border-white/30
              flex items-center justify-center text-white
              hover:bg-white/40 transition-colors duration-150
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white
            "
          >
            <Linkedin className="w-6 h-6" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </article>
  )
}
