/**
 * Button — Reusable button component for DentalViva.
 * Props:
 * - variant: 'primary' | 'secondary' | 'ghost' | 'secondary-dark' (dark background version)
 * - size: 'sm' | 'md' | 'lg'
 * - children: button label
 * - onClick, disabled, type, className: standard HTML button props
 * Notes: Always use descriptive aria-label when icon-only.
 */

const variantClasses = {
  primary:
    'bg-primary text-white border border-primary hover:bg-[#1d6fbe] hover:border-[#1d6fbe] focus-visible:ring-primary',
  secondary:
    'bg-transparent text-primary border border-primary hover:bg-primary-light focus-visible:ring-primary',
  ghost:
    'bg-transparent text-muted border border-transparent hover:bg-surface focus-visible:ring-primary',
  'secondary-dark':
    'bg-transparent text-white border border-white hover:bg-white/10 focus-visible:ring-white',
}

const sizeClasses = {
  sm: 'px-4 py-2 text-body-sm',
  md: 'px-6 py-3 text-body-sm',
  lg: 'px-8 py-4 text-body',
}

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  className = '',
  disabled = false,
  type = 'button',
  onClick,
  ...rest
}) {
  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={[
        'inline-flex items-center justify-center gap-2 rounded-xl font-semibold',
        'transition-all duration-150 ease-in-out',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        variantClasses[variant] || variantClasses.primary,
        sizeClasses[size] || sizeClasses.md,
        className,
      ].join(' ')}
      {...rest}
    >
      {children}
    </button>
  )
}
