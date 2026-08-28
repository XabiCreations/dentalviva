const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-emerald-100 text-emerald-700',
  'bg-violet-100 text-violet-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
]

export function getInitials(name: string): string {
  return (name ?? '').split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase()
}

export function avatarColor(name: string): string {
  return AVATAR_COLORS[(name ?? ' ').charCodeAt(0) % AVATAR_COLORS.length]
}
