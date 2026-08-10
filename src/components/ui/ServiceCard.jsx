import { ArrowRight } from 'lucide-react'

export function ServiceCard({ image, title, description, imageAlt, onLearnMore }) {
  return (
    <article
      className="
        flex flex-col bg-white rounded-3xl
        border border-border shadow-card
        transition-all duration-300 ease-out
        hover:-translate-y-1 hover:shadow-card-hover
        w-full max-w-sm mx-auto lg:w-[432px] lg:max-w-none lg:mx-0 shrink-0
      "
    >
      {/* Text block — fixed height so all cards align */}
      <div className="flex flex-col px-6 pt-6 pb-3">
          <h3 className="text-h5 text-text line-clamp-2 mb-2">{title}</h3>
        <p className="text-muted text-body-sm lg:text-body leading-relaxed line-clamp-2 flex-1">{description}</p>
        <button
          type="button"
          onClick={onLearnMore}
          className="
            flex items-center gap-3 w-fit mt-4
            bg-white border border-border
            pr-5 pl-1.5 py-1.5 rounded-full
            hover:border-primary/40 hover:shadow-sm transition-all duration-150
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2
          "
        >
          <span className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
            <ArrowRight size={14} className="text-white" />
          </span>
          <span className="text-body-sm font-semibold text-text">Saber más</span>
        </button>
      </div>

      {/* Image — fixed height so all cards are identical regardless of text */}
      <div className="h-[360px] shrink-0 p-4 pt-0">
        <div className="w-full h-full rounded-lg overflow-hidden">
          <img
            src={image}
            alt={imageAlt || title}
            loading="lazy"
            className="w-full h-full object-cover saturate-[0.85]"
          />
        </div>
      </div>
    </article>
  )
}
