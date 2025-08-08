import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Format currency for NZD
export function formatCurrency(amount: number, currency: string = 'NZD'): string {
  return new Intl.NumberFormat('en-NZ', {
    style: 'currency',
    currency: currency,
  }).format(amount)
}

// Format date for NZ locale
export function formatDate(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('en-NZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(dateObj)
}

// Generate quote number
export function generateQuoteNumber(prefix: string = 'QT', sequence: number): string {
  const year = new Date().getFullYear()
  return `${prefix}-${year}-${sequence.toString().padStart(4, '0')}`
}

// Calculate GST amount
export function calculateGST(subtotal: number, gstRate: number = 0.15): number {
  return subtotal * gstRate
}

// Calculate total with GST
export function calculateTotal(subtotal: number, gstRate: number = 0.15, discount: number = 0): number {
  const gstAmount = calculateGST(subtotal, gstRate)
  return subtotal + gstAmount - discount
}

// Validate NZ phone number
export function validateNZPhone(phone: string): boolean {
  const phoneRegex = /^(\+64|64|0)[2-478](?:[0-9]{7}|[0-9]{8}|[0-9]{9})$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Validate NZ postal code
export function validateNZPostalCode(postalCode: string): boolean {
  const postalRegex = /^\d{4}$/
  return postalRegex.test(postalCode)
}

// Validate NZ business number
export function validateNZBusinessNumber(businessNumber: string): boolean {
  const businessRegex = /^\d{9}$/
  return businessRegex.test(businessNumber.replace(/\D/g, ''))
}

// Debounce function
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Throttle function
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}
