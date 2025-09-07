import { describe, it, expect } from 'vitest'
import { formatDate, formatDateForDisplay, formatDateKey, getTodayKey, getDateRanges } from '../date'

describe('Date Utils', () => {
  const testDate = new Date('2023-12-15T10:30:00Z')
  const testDateString = '2023-12-15'

  describe('formatDate', () => {
    it('should format Date object to YYYY-MM-DD', () => {
      expect(formatDate(testDate)).toBe('2023-12-15')
    })

    it('should format date string to YYYY-MM-DD', () => {
      expect(formatDate(testDateString)).toBe('2023-12-15')
    })
  })

  describe('formatDateForDisplay', () => {
    it('should format Date object for display', () => {
      expect(formatDateForDisplay(testDate)).toBe('Dec 15, 2023')
    })

    it('should format date string for display', () => {
      expect(formatDateForDisplay(testDateString)).toBe('Dec 15, 2023')
    })
  })

  describe('formatDateKey', () => {
    it('should format Date object to YYYYMMDD', () => {
      expect(formatDateKey(testDate)).toBe('20231215')
    })

    it('should format date string to YYYYMMDD', () => {
      expect(formatDateKey(testDateString)).toBe('20231215')
    })
  })

  describe('getTodayKey', () => {
    it('should return today in YYYYMMDD format', () => {
      const result = getTodayKey()
      expect(result).toMatch(/^\d{8}$/) // Should be 8 digits
    })
  })

  describe('getDateRanges', () => {
    it('should return correct date ranges for given date', () => {
      const ranges = getDateRanges(testDate)
      
      expect(ranges.day.start).toBeInstanceOf(Date)
      expect(ranges.day.end).toBeInstanceOf(Date)
      expect(ranges.week.start).toBeInstanceOf(Date)
      expect(ranges.week.end).toBeInstanceOf(Date)
      expect(ranges.month.start).toBeInstanceOf(Date)
      expect(ranges.month.end).toBeInstanceOf(Date)
      expect(ranges.year.start).toBeInstanceOf(Date)
      expect(ranges.year.end).toBeInstanceOf(Date)
    })

    it('should return ranges with start before end', () => {
      const ranges = getDateRanges(testDate)
      
      expect(ranges.day.start.getTime()).toBeLessThan(ranges.day.end.getTime())
      expect(ranges.week.start.getTime()).toBeLessThan(ranges.week.end.getTime())
      expect(ranges.month.start.getTime()).toBeLessThan(ranges.month.end.getTime())
      expect(ranges.year.start.getTime()).toBeLessThan(ranges.year.end.getTime())
    })

    it('should use current date when no date provided', () => {
      const ranges = getDateRanges()
      expect(ranges.day.start).toBeInstanceOf(Date)
    })
  })
})