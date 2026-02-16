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
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function getPersonaEmoji(persona: string): string {
  const emojiMap: Record<string, string> = {
    streetwise: '🛣️',
    optimist: '☀️',
    skeptic: '🤔',
  }
  return emojiMap[persona] || '🎙️'
}

export function getPersonaColor(persona: string): string {
  const colorMap: Record<string, string> = {
    streetwise: '#FF6B6B',
    optimist: '#4ECDC4',
    skeptic: '#45B7D1',
  }
  return colorMap[persona] || '#9CA3AF'
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length) + '...'
}