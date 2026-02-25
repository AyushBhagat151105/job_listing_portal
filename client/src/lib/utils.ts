import type { ClassValue } from 'clsx'
import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime()
  const days = Math.floor(diff / 86400000)
  if (days === 0) return 'Today'
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return `${Math.floor(days / 30)}mo ago`
}

export function formatSalary(amount?: number) {
  if (!amount) return null
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`
  return `₹${amount}`
}

export function formatSalaryRange(salaryMin?: number, salaryMax?: number) {
  if (salaryMin && salaryMax) {
    return `${formatSalary(salaryMin)} – ${formatSalary(salaryMax)}`
  }
  if (salaryMin) return `From ${formatSalary(salaryMin)}`
  if (salaryMax) return `Up to ${formatSalary(salaryMax)}`
  return 'Not specified'
}
