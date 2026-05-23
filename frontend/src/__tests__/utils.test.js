import { describe, it, expect } from 'vitest'

// Time formatting utilities (would be extracted to a utils file)
const formatTimeHHMM = (time) => {
  if (!time) return '-'
  return time.slice(0, 5)
}

const calculateDurationHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  return (end - start) / (1000 * 60 * 60)
}

const formatDate = (dateObj) => {
  return dateObj.toISOString().split('T')[0]
}

describe('Utility Functions', () => {
  describe('formatTimeHHMM', () => {
    it('should format time correctly', () => {
      expect(formatTimeHHMM('09:30:00')).toBe('09:30')
    })

    it('should handle null time', () => {
      expect(formatTimeHHMM(null)).toBe('-')
    })

    it('should handle undefined time', () => {
      expect(formatTimeHHMM(undefined)).toBe('-')
    })
  })

  describe('calculateDurationHours', () => {
    it('should calculate duration correctly', () => {
      const duration = calculateDurationHours('09:00:00', '10:30:00')
      expect(duration).toBe(1.5)
    })

    it('should handle 2-hour duration', () => {
      const duration = calculateDurationHours('09:00:00', '11:00:00')
      expect(duration).toBe(2)
    })

    it('should handle half-hour duration', () => {
      const duration = calculateDurationHours('09:00:00', '09:30:00')
      expect(duration).toBe(0.5)
    })

    it('should return 0 for missing times', () => {
      expect(calculateDurationHours(null, '10:00:00')).toBe(0)
      expect(calculateDurationHours('09:00:00', null)).toBe(0)
    })
  })

  describe('formatDate', () => {
    it('should format date as YYYY-MM-DD', () => {
      const date = new Date('2026-05-23')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/\d{4}-\d{2}-\d{2}/)
    })

    it('should handle different dates', () => {
      const date1 = new Date('2026-01-01')
      const date2 = new Date('2026-12-31')
      expect(formatDate(date1)).toBe('2026-01-01')
      expect(formatDate(date2)).toBe('2026-12-31')
    })
  })
})
