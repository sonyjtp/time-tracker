import axios from 'axios'

const API_BASE = 'http://localhost:8000/api'

const api = axios.create({
  baseURL: API_BASE,
})

export const activities = {
  getByDate: (date, taskId = null) => {
    const params = { target_date: date.toISOString().split('T')[0] }
    if (taskId) params.task_id = taskId
    return api.get('/activities', { params })
  },
  create: (data) => api.post('/activities', data),
  update: (id, data) => api.put(`/activities/${id}`, data),
  delete: (id) => api.delete(`/activities/${id}`),
}

export const tasks = {
  getAll: () => api.get('/tasks'),
  create: (data) => api.post('/tasks', data),
  update: (id, data) => api.put(`/tasks/${id}`, data),
  delete: (id) => api.delete(`/tasks/${id}`),
}

export const reports = {
  getTimeSentSummary: (startDate = null, endDate = null) => {
    const params = {}
    if (startDate) params.start_date = startDate.toISOString().split('T')[0]
    if (endDate) params.end_date = endDate.toISOString().split('T')[0]
    return api.get('/reports/time-spent-summary', { params })
  },
  getTimeSpentDaily: (startDate = null, endDate = null) => {
    const params = {}
    if (startDate) params.start_date = startDate.toISOString().split('T')[0]
    if (endDate) params.end_date = endDate.toISOString().split('T')[0]
    return api.get('/reports/time-spent-daily', { params })
  },
}

export default api
