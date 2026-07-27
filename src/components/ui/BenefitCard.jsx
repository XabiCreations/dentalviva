/**
 * BenefitCard — Card displaying a clinic benefit with an icon, title, and description.
 * Props:
 * - Icon: React component from lucide-react
 * - title: string
 * - description: string
 * Notes:
 * - Uses surface background and soft border
 * - Icon rendered in primary color
 */

export function BenefitCard({ Icon, title, description }) {
  return (
    <article
      className="
        bg-white border border-border rounded-2xl p-6
        flex flex-col gap-4
        transition-all duration-300
        hover:border-primary/30 hover:shadow-card
      "
    >
      {/* Icon */}
      <div
        className="w-12 h-12 rounded-xl bg-primary-light flex items-center justify-center shrink-0"
        aria-hidden="true"
      >
        {Icon && <Icon className="w-6 h-6 text-primary" strokeWidth={1.5} />}
      </div>

      {/* Text */}
      <div>
        <h3 className="text-h5 font-semibold text-text mb-2">{title}</h3>
        <p className="text-muted text-body-sm leading-relaxed">{description}</p>
      </div>
    </article>
  )
}
