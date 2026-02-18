/**
 * EAN-13 barcode generation and validation utilities
 */

const INTERNAL_PREFIX = '200'

export function calculateEAN13CheckDigit(digits12: string): number {
  let sum = 0
  for (let i = 0; i < 12; i++) {
    const digit = parseInt(digits12[i], 10)
    sum += i % 2 === 0 ? digit : digit * 3
  }
  const remainder = sum % 10
  return remainder === 0 ? 0 : 10 - remainder
}

export function generateEAN13(sequence: number): string {
  const seqStr = String(sequence).padStart(9, '0')
  const digits12 = `${INTERNAL_PREFIX}${seqStr}`
  const checkDigit = calculateEAN13CheckDigit(digits12)
  return `${digits12}${checkDigit}`
}

export function isValidBarcode(code: string): boolean {
  if (!/^\d+$/.test(code)) return false
  if (code.length === 8) {
    let sum = 0
    for (let i = 0; i < 7; i++) {
      const digit = parseInt(code[i], 10)
      sum += i % 2 === 0 ? digit * 3 : digit
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === parseInt(code[7], 10)
  }
  if (code.length === 12) {
    let sum = 0
    for (let i = 0; i < 11; i++) {
      const digit = parseInt(code[i], 10)
      sum += i % 2 === 0 ? digit * 3 : digit
    }
    const checkDigit = (10 - (sum % 10)) % 10
    return checkDigit === parseInt(code[11], 10)
  }
  if (code.length === 13) {
    const checkDigit = calculateEAN13CheckDigit(code.slice(0, 12))
    return checkDigit === parseInt(code[12], 10)
  }
  return false
}

export function isInternalBarcode(code: string): boolean {
  return code.startsWith(INTERNAL_PREFIX) && code.length === 13
}
