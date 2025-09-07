import { describe, it, expect } from 'vitest'
import { formatCurrency, parseCurrency, formatAmount } from '../currency'

describe('Currency Utils', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly for whole numbers', () => {
      expect(formatCurrency(10000)).toBe('฿100.00') // 100 THB
    })

    it('should format currency correctly for decimal amounts', () => {
      expect(formatCurrency(12345)).toBe('฿123.45') // 123.45 THB
    })

    it('should handle zero amount', () => {
      expect(formatCurrency(0)).toBe('฿0.00')
    })

    it('should handle negative amounts', () => {
      expect(formatCurrency(-5000)).toBe('-฿50.00')
    })

    it('should handle large amounts', () => {
      expect(formatCurrency(123456789)).toBe('฿1,234,567.89')
    })
  })

  describe('parseCurrency', () => {
    it('should parse simple number strings', () => {
      expect(parseCurrency('100')).toBe(10000)
      expect(parseCurrency('123.45')).toBe(12345)
    })

    it('should parse currency strings with symbols', () => {
      expect(parseCurrency('฿100.00')).toBe(10000)
      expect(parseCurrency('$123.45')).toBe(12345)
    })

    it('should parse strings with commas', () => {
      expect(parseCurrency('1,234.56')).toBe(123456)
      expect(parseCurrency('฿1,000.00')).toBe(100000)
    })

    it('should handle empty or invalid strings', () => {
      expect(parseCurrency('')).toBe(0)
      expect(parseCurrency('abc')).toBe(0)
      expect(parseCurrency('invalid123')).toBe(12300) // Extracts 123 from string
    })

    it('should handle negative amounts', () => {
      expect(parseCurrency('-50.00')).toBe(-5000)
    })
  })

  describe('formatAmount', () => {
    it('should format amount with two decimal places', () => {
      expect(formatAmount(10000)).toBe('100.00')
      expect(formatAmount(12345)).toBe('123.45')
    })

    it('should handle zero amount', () => {
      expect(formatAmount(0)).toBe('0.00')
    })

    it('should handle negative amounts', () => {
      expect(formatAmount(-5000)).toBe('-50.00')
    })

    it('should handle single digit cents', () => {
      expect(formatAmount(1005)).toBe('10.05')
    })
  })
})