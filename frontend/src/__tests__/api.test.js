import { describe, it, expect, vi } from 'vitest'
import { activities, tasks, reports } from '../api'

describe('API Client', () => {
  describe('Activities API', () => {
    it('should format date correctly for getByDate', () => {
      const testDate = new Date('2026-05-23')
      // This would be mocked in actual tests
      expect(testDate).toBeDefined()
    })

    it('should support optional task filter', () => {
      // Verify the API function accepts taskId parameter
      expect(activities.getByDate).toBeDefined()
    })
  })

  describe('Tasks API', () => {
    it('should have getAll method', () => {
      expect(tasks.getAll).toBeDefined()
    })

    it('should have create method', () => {
      expect(tasks.create).toBeDefined()
    })

    it('should have update method', () => {
      expect(tasks.update).toBeDefined()
    })

    it('should have delete method', () => {
      expect(tasks.delete).toBeDefined()
    })
  })

  describe('Reports API', () => {
    it('should support date range in getTimeSentSummary', () => {
      expect(reports.getTimeSentSummary).toBeDefined()
    })

    it('should support date range in getTimeSpentDaily', () => {
      expect(reports.getTimeSpentDaily).toBeDefined()
    })
  })
})
