import { ChevronLeft, ChevronRight } from 'lucide-react'

const base = 'w-10 h-10 rounded-full border flex items-center justify-center transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary'

export function NavArrowsLimited({ onPrev, onNext, canPrev, canNext, className = '' }) {
  return (
    <div className={`flex items-center gap-2 border border-[#ebebeb] rounded-2xl p-2 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        disabled={!canPrev}
        aria-label="Anterior"
        className={[base, canPrev ? 'bg-primary border-primary text-white hover:bg-primary/90' : 'border-border/40 text-muted/30 cursor-not-allowed'].join(' ')}
      >
        <ChevronLeft size={18} />
      </button>
      <button
        type="button"
        onClick={onNext}
        disabled={!canNext}
        aria-label="Siguiente"
        className={[base, canNext ? 'bg-primary border-primary text-white hover:bg-primary/90' : 'border-border/40 text-muted/30 cursor-not-allowed'].join(' ')}
      >
        <ChevronRight size={18} />
      </button>
    </div>
  )
}

export function NavArrowsInfinite({ onPrev, onNext, className = '' }) {
  return (
    <div className={`w-fit flex items-center gap-3 border border-[#ebebeb] rounded-2xl p-2 ${className}`}>
      <button
        type="button"
        onClick={onPrev}
        aria-label="Anterior"
        className={`${base} border-border hover:border-primary hover:bg-primary-light hover:text-primary`}
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        type="button"
        onClick={onNext}
        aria-label="Siguiente"
        className={`${base} border-border hover:border-primary hover:bg-primary-light hover:text-primary`}
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  )
}
