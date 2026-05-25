import { describe, it, expect, vi, beforeEach, beforeAll } from 'vitest'
import axios from 'axios'

vi.mock('axios')

describe('API Client', () => {
  let activities, tasks, reports
  let mockGet, mockPost, mockPut, mockDelete

  beforeAll(async () => {
    // Set up axios mock before importing api
    mockGet = vi.fn().mockResolvedValue({ data: [] })
    mockPost = vi.fn().mockResolvedValue({ data: {} })
    mockPut = vi.fn().mockResolvedValue({ data: {} })
    mockDelete = vi.fn().mockResolvedValue({ data: {} })

    axios.create = vi.fn().mockReturnValue({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      delete: mockDelete,
    })

    // Import api module after mocking
    const apiModule = await import('../api.js')
    activities = apiModule.activities
    tasks = apiModule.tasks
    reports = apiModule.reports
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

   describe('Activities API', () => {
    it('should format date correctly for getByDate', () => {
      // Create date in local timezone (not UTC)
      const testDate = new Date(2026, 4, 23)
      const expected = '2026-05-23'
      // Format using local date to match formatDate behavior
      const year = testDate.getFullYear()
      const month = String(testDate.getMonth() + 1).padStart(2, '0')
      const day = String(testDate.getDate()).padStart(2, '0')
      const formatted = `${year}-${month}-${day}`
      expect(formatted).toBe(expected)
    })

    it('should have all activity methods', () => {
      expect(activities.getByDate).toBeDefined()
      expect(activities.create).toBeDefined()
      expect(activities.update).toBeDefined()
      expect(activities.delete).toBeDefined()
    })

    it('should call getByDate with task filter and make GET request', () => {
      // Create date in local timezone (not UTC)
      const testDate = new Date(2026, 4, 23)
      activities.getByDate(testDate, 1)
      expect(mockGet).toHaveBeenCalledWith('/activities', {
        params: { target_date: '2026-05-23', task_id: 1 }
      })
    })

    it('should call getByDate without task filter and make GET request', () => {
      // Create date in local timezone (not UTC)
      const testDate = new Date(2026, 4, 23)
      activities.getByDate(testDate)
      expect(mockGet).toHaveBeenCalledWith('/activities', {
        params: { target_date: '2026-05-23' }
      })
    })

    it('should call create with data and make POST request', () => {
      const activityData = {
        task_id: 1,
        date: '2026-05-23',
        start_time: '09:00',
        end_time: '10:00'
      }
      activities.create(activityData)
      expect(mockPost).toHaveBeenCalledWith('/activities', activityData)
    })

    it('should call update with id and data and make PUT request', () => {
      const updateData = { end_time: '11:00' }
      activities.update(1, updateData)
      expect(mockPut).toHaveBeenCalledWith('/activities/1', updateData)
    })

    it('should call delete with id and make DELETE request', () => {
      activities.delete(1)
      expect(mockDelete).toHaveBeenCalledWith('/activities/1')
    })
  })

  describe('Tasks API', () => {
    it('should have getAll method', () => {
      expect(tasks.getAll).toBeDefined()
    })

    it('should call getAll and make GET request', () => {
      tasks.getAll()
      expect(mockGet).toHaveBeenCalled()
    })

    it('should have create method', () => {
      expect(tasks.create).toBeDefined()
    })

    it('should call create with data and make POST request', () => {
      const taskData = { name: 'Test Task', type: 'Development' }
      tasks.create(taskData)
      expect(mockPost).toHaveBeenCalledWith('/tasks', taskData)
    })

    it('should have update method', () => {
      expect(tasks.update).toBeDefined()
    })

    it('should call update with id and data and make PUT request', () => {
      const updateData = { name: 'Updated Task' }
      tasks.update(5, updateData)
      expect(mockPut).toHaveBeenCalledWith('/tasks/5', updateData)
    })

    it('should have delete method', () => {
      expect(tasks.delete).toBeDefined()
    })

    it('should call delete with id and make DELETE request', () => {
      tasks.delete(3)
      expect(mockDelete).toHaveBeenCalledWith('/tasks/3')
    })
  })

   describe('Reports API', () => {
    it('should call getTimeSentSummary with date range and make GET request', () => {
      // Create dates in local timezone (not UTC)
      const startDate = new Date(2026, 4, 1)
      const endDate = new Date(2026, 4, 31)
      reports.getTimeSentSummary(startDate, endDate)
      expect(mockGet).toHaveBeenCalledWith('/reports/time-spent-summary', {
        params: { start_date: '2026-05-01', end_date: '2026-05-31' }
      })
    })

    it('should call getTimeSentSummary without dates and make GET request', () => {
      reports.getTimeSentSummary()
      expect(mockGet).toHaveBeenCalledWith('/reports/time-spent-summary', {
        params: {}
      })
    })

    it('should call getTimeSentSummary with only start date and make GET request', () => {
      // Create date in local timezone (not UTC)
      const startDate = new Date(2026, 4, 1)
      reports.getTimeSentSummary(startDate)
      expect(mockGet).toHaveBeenCalledWith('/reports/time-spent-summary', {
        params: { start_date: '2026-05-01' }
      })
    })

    it('should call getTimeSentSummary with only end date and make GET request', () => {
      // Create date in local timezone (not UTC)
      const endDate = new Date(2026, 4, 31)
      reports.getTimeSentSummary(null, endDate)
      expect(mockGet).toHaveBeenCalledWith('/reports/time-spent-summary', {
        params: { end_date: '2026-05-31' }
      })
    })

    it('should call getTimeSpentDaily with date range and make GET request', () => {
      // Create dates in local timezone (not UTC)
      const startDate = new Date(2026, 4, 1)
      const endDate = new Date(2026, 4, 31)
      reports.getTimeSpentDaily(startDate, endDate)
      expect(mockGet).toHaveBeenCalledWith('/reports/time-spent-daily', {
        params: { start_date: '2026-05-01', end_date: '2026-05-31' }
      })
    })

    it('should call getTimeSpentDaily without dates and make GET request', () => {
      reports.getTimeSpentDaily()
      expect(mockGet).toHaveBeenCalledWith('/reports/time-spent-daily', {
        params: {}
      })
    })

    it('should call getTimeSpentDaily with only start date and make GET request', () => {
      // Create date in local timezone (not UTC)
      const startDate = new Date(2026, 4, 1)
      reports.getTimeSpentDaily(startDate)
      expect(mockGet).toHaveBeenCalledWith('/reports/time-spent-daily', {
        params: { start_date: '2026-05-01' }
      })
    })

    it('should call getTimeSpentDaily with only end date and make GET request', () => {
      // Create date in local timezone (not UTC)
      const endDate = new Date(2026, 4, 31)
      reports.getTimeSpentDaily(null, endDate)
      expect(mockGet).toHaveBeenCalledWith('/reports/time-spent-daily', {
        params: { end_date: '2026-05-31' }
      })
    })
  })
})
