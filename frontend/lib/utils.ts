import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

export function formatDate(dateString: string): string {
  // Ensure the string is treated as UTC — the backend returns naive ISO strings
  // without a "Z" suffix, which some browsers parse as local time and some as UTC.
  // Appending "Z" (if absent) forces consistent UTC parsing everywhere.
  const normalized = dateString.endsWith('Z') ? dateString : dateString + 'Z'
  const date = new Date(normalized)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  // Clamp to 0 so tiny clock skew between server and client never shows "-1 days ago"
  const days = Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)))

  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`

  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getPersonaEmoji(persona: string): string {
  const emojiMap: Record<string, string> = {
    analyst:    '📊',
    journalist: '📰',
    streetwise: '🛣️',
    informant:  '🕵️',
    colleague:  '☕',
  }
  return emojiMap[persona] || '🎙️'
}

export function getPersonaColor(persona: string): string {
  const colorMap: Record<string, string> = {
    analyst:    '#6366F1', // indigo
    journalist: '#F59E0B', // amber
    streetwise: '#EF4444', // red
    informant:  '#8B5CF6', // purple
    colleague:  '#10B981', // emerald
  }
  return colorMap[persona] || '#9CA3AF'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}