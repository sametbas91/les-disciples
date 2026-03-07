import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}min`
  if (m === 0) return `${h}h`
  return `${h}h ${m.toString().padStart(2, '0')}min`
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function formatDateShort(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function getNextSunday(): Date {
  const now = new Date()
  const day = now.getDay()
  const diff = day === 0 ? 7 : 7 - day
  const next = new Date(now)
  next.setDate(now.getDate() + diff)
  return next
}

export function daysUntilBirthday(birthday: string): number {
  const now = new Date()
  const bday = new Date(birthday)
  const thisYear = new Date(now.getFullYear(), bday.getMonth(), bday.getDate())
  if (thisYear < now) {
    thisYear.setFullYear(now.getFullYear() + 1)
  }
  return Math.ceil((thisYear.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}
