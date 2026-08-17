import type { Profile } from '../types/user'

export function getDisplayName(profile: Profile | null | undefined): string | null {
  if (!profile?.full_name) return null
  if (
    profile.last_name &&
    !profile.full_name.trim().endsWith(profile.last_name.trim())
  ) {
    return `${profile.full_name} ${profile.last_name}`
  }
  return profile.full_name
}
