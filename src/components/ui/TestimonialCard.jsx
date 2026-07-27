import { ChevronLeft, ChevronRight } from 'lucide-react'

const arrowBtn = `
  w-10 h-10 rounded-full border border-border
  flex items-center justify-center
  transition-all duration-150
  hover:border-primary hover:bg-primary-light hover:text-primary
  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary
`

export function TestimonialCard({ testimonial, onPrev, onNext }) {
  if (!testimonial) return null

  return (
    <>
      {/* ── Mobile: avatar floating above card ── */}
      <div className="lg:hidden relative pt-9 w-full max-w-sm mx-auto">
        {/* Avatar — center aligned on card's top edge */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
          <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-[4px] border-white shadow-md">
            <img
              src={testimonial.imageUrl}
              alt={`Foto de ${testimonial.patientName}`}
              className="w-full h-full object-cover"
              style={{ objectPosition: 'center 5%' }}
              loading="lazy"
            />
          </div>
        </div>

        {/* Card body */}
        <div className="bg-white rounded-2xl border border-border shadow-card overflow-hidden w-full">
          <div className="px-6 pt-10 pb-6 flex flex-col gap-5 text-center">
            <div>
              <p className="text-h5 font-semibold text-text">{testimonial.patientName}</p>
              <p className="text-primary text-sm font-medium mt-1">{testimonial.treatmentType}</p>
            </div>
            <p className="text-base text-text leading-relaxed font-medium italic">
              "{testimonial.text}"
            </p>
            <div className="flex items-center gap-3 justify-center mt-auto">
              <button onClick={onPrev} aria-label="Testimonio anterior" className={arrowBtn}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={onNext} aria-label="Testimonio siguiente" className={arrowBtn}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Desktop: portrait photo on left ── */}
      <div className="hidden lg:block bg-white rounded-2xl border border-border shadow-card overflow-hidden w-fit mx-auto">
        <div className="flex flex-row">
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
          <div className="w-[540px] p-8 flex flex-col gap-6">
            <div>
              <p className="text-h5 font-semibold text-text">{testimonial.patientName}</p>
              <p className="text-primary text-body-sm font-medium mt-1">{testimonial.treatmentType}</p>
            </div>
            <p className="text-body-lg text-text leading-relaxed font-medium italic">
              "{testimonial.text}"
            </p>
            <div className="flex items-center gap-3 mt-auto">
              <button onClick={onPrev} aria-label="Testimonio anterior" className={arrowBtn}>
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button onClick={onNext} aria-label="Testimonio siguiente" className={arrowBtn}>
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
