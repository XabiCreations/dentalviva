import { ChevronLeft, ChevronRight } from 'lucide-react'

export function TestimonialCard({ testimonial, onPrev, onNext }) {
  if (!testimonial) return null

  return (
    <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden w-fit mx-auto">
      <div className="flex flex-col lg:flex-row">
        {/* Left: photo */}
        <div className="shrink-0 bg-surface">
          <div className="h-[520px] aspect-[9/16]">
            <img
              src={testimonial.imageUrl}
              alt={`Foto de ${testimonial.patientName}`}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        </div>

        {/* Right: text content */}
        <div className="w-[540px] p-6 lg:p-8 flex flex-col gap-6">
          {/* Patient info */}
          <div>
            <p className="text-h5 font-semibold text-text">{testimonial.patientName}</p>
            <p className="text-primary text-body-sm font-medium mt-1">{testimonial.treatmentType}</p>
          </div>

          {/* Quote */}
          <p className="text-body-lg text-text leading-relaxed font-medium italic">
            "{testimonial.text}"
          </p>

          {/* Navigation arrows */}
          <div className="flex items-center gap-3 mt-auto">
            <button
              onClick={onPrev}
              aria-label="Testimonio anterior"
              className="
                w-10 h-10 rounded-full border border-border
                flex items-center justify-center
                transition-all duration-150
                hover:border-primary hover:bg-primary-light hover:text-primary
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
              "
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={onNext}
              aria-label="Testimonio siguiente"
              className="
                w-10 h-10 rounded-full border border-border
                flex items-center justify-center
                transition-all duration-150
                hover:border-primary hover:bg-primary-light hover:text-primary
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
              "
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
