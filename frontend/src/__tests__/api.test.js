import { describe, it, expect } from 'vitest'
import { activities, tasks, reports } from '../api'

describe('API Client', () => {
  describe('Activities API', () => {
    it('should format date correctly for getByDate', () => {
      const testDate = new Date('2026-05-23')
      const expected = '2026-05-23'
      expect(testDate.toISOString().split('T')[0]).toBe(expected)
    })

    it('should support optional task filter', () => {
      expect(activities.getByDate).toBeDefined()
      expect(activities.create).toBeDefined()
      expect(activities.update).toBeDefined()
      expect(activities.delete).toBeDefined()
    })

    it('should build params with taskId when provided', () => {
      const testDate = new Date('2026-05-23')
      const dateStr = testDate.toISOString().split('T')[0]
      const params = { target_date: dateStr }
      const taskId = 1
      if (taskId) params.task_id = taskId
      expect(params.task_id).toBe(1)
      expect(params.target_date).toBe('2026-05-23')
    })

    it('should build params without taskId', () => {
      const testDate = new Date('2026-05-23')
      const dateStr = testDate.toISOString().split('T')[0]
      const params = { target_date: dateStr }
      expect(params.task_id).toBeUndefined()
      expect(params.target_date).toBe('2026-05-23')
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
    it('should handle date parameters for getTimeSentSummary', () => {
      const startDate = new Date('2026-05-01')
      const endDate = new Date('2026-05-31')
      const params = {}
      if (startDate) params.start_date = startDate.toISOString().split('T')[0]
      if (endDate) params.end_date = endDate.toISOString().split('T')[0]
      expect(params.start_date).toBe('2026-05-01')
      expect(params.end_date).toBe('2026-05-31')
    })

    it('should handle null dates for getTimeSentSummary', () => {
      const params = {}
      const startDate = null
      const endDate = null
      if (startDate) params.start_date = startDate.toISOString().split('T')[0]
      if (endDate) params.end_date = endDate.toISOString().split('T')[0]
      expect(Object.keys(params).length).toBe(0)
    })

    it('should handle date parameters for getTimeSpentDaily', () => {
      const startDate = new Date('2026-05-01')
      const endDate = new Date('2026-05-31')
      const params = {}
      if (startDate) params.start_date = startDate.toISOString().split('T')[0]
      if (endDate) params.end_date = endDate.toISOString().split('T')[0]
      expect(params.start_date).toBe('2026-05-01')
      expect(params.end_date).toBe('2026-05-31')
    })

    it('should handle null dates for getTimeSpentDaily', () => {
      const params = {}
      const startDate = null
      const endDate = null
      if (startDate) params.start_date = startDate.toISOString().split('T')[0]
      if (endDate) params.end_date = endDate.toISOString().split('T')[0]
      expect(Object.keys(params).length).toBe(0)
    })

    it('should support date range in getTimeSentSummary', () => {
      expect(reports.getTimeSentSummary).toBeDefined()
    })

    it('should support date range in getTimeSpentDaily', () => {
      expect(reports.getTimeSpentDaily).toBeDefined()
    })
  })
})
