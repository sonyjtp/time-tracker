import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { reports, tasks as tasksApi } from '../api'
import '../styles/TimeSpent.css'

function TimeSpent() {
  const [summaryData, setSummaryData] = useState([])
  const [dailyData, setDailyData] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('summary')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortColumn, setSortColumn] = useState('task_name')
  const [sortAscending, setSortAscending] = useState(true)
  const [selectedTask, setSelectedTask] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedSubtype, setSelectedSubtype] = useState('')

  useEffect(() => {
    loadReferenceDate()
  }, [])

  const loadReferenceDate = async () => {
    try {
      const [settingsRes, tasksRes] = await Promise.all([
        axios.get('http://localhost:8000/api/settings/reference_date'),
        tasksApi.getAll()
      ])
      setAllTasks(tasksRes.data)
      const refDate = settingsRes.data.value
      setStartDate(refDate)
      setEndDate(new Date().toISOString().split('T')[0])
      loadData(refDate, new Date().toISOString().split('T')[0])
    } catch (err) {
      setError('Failed to load settings: ' + err.message)
      setLoading(false)
    }
  }

  const loadData = async (start, end) => {
    setLoading(true)
    setError(null)
    try {
      const startDateObj = new Date(start)
      const endDateObj = new Date(end)

      const [summaryRes, dailyRes] = await Promise.all([
        reports.getTimeSentSummary(startDateObj, endDateObj),
        reports.getTimeSpentDaily(startDateObj, endDateObj),
      ])
      setSummaryData(summaryRes.data)
      setDailyData(dailyRes.data)
    } catch (err) {
      setError('Failed to load time spent data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = () => {
    if (startDate && endDate) {
      loadData(startDate, endDate)
    }
  }

  const getDailyDataForTask = (taskId) => {
    return dailyData.filter(d => d.task_id === taskId)
  }

  const getTaskInfo = (taskId) => {
    return allTasks.find(t => t.id === taskId)
  }

  const getFilteredSummaryData = () => {
    return summaryData.filter(item => {
      const taskInfo = getTaskInfo(item.task_id)
      if (!taskInfo) return false
      if (selectedTask && item.task_id !== parseInt(selectedTask)) return false
      if (selectedType && taskInfo.type !== selectedType) return false
      if (selectedSubtype && taskInfo.sub_type !== selectedSubtype) return false
      return true
    })
  }

  const getTasksWithActivities = () => {
    const tasksWithActivities = new Set()
    dailyData.forEach(item => {
      tasksWithActivities.add(item.task_id)
    })
    return tasksWithActivities
  }

  const getAvailableTypes = () => {
    const types = new Set()
    const tasksWithActivities = getTasksWithActivities()
    summaryData.forEach(item => {
      if (tasksWithActivities.has(item.task_id)) {
        const taskInfo = getTaskInfo(item.task_id)
        if (taskInfo && taskInfo.type) types.add(taskInfo.type)
      }
    })
    return Array.from(types).sort()
  }

  const getAvailableSubtypes = () => {
    const subtypes = new Set()
    const tasksWithActivities = getTasksWithActivities()
    summaryData.forEach(item => {
      if (tasksWithActivities.has(item.task_id)) {
        const taskInfo = getTaskInfo(item.task_id)
        if (taskInfo) {
          if (selectedType && taskInfo.type !== selectedType) return
          if (taskInfo.sub_type) subtypes.add(taskInfo.sub_type)
        }
      }
    })
    return Array.from(subtypes).sort()
  }

  const getAvailableTasks = () => {
    const tasksWithActivities = getTasksWithActivities()
    return summaryData
      .filter(item => tasksWithActivities.has(item.task_id))
      .map(item => {
        const taskInfo = getTaskInfo(item.task_id)
        return { id: item.task_id, name: item.task_name, type: taskInfo?.type, sub_type: taskInfo?.sub_type }
      })
      .filter(task => {
        if (selectedType && task.type !== selectedType) return false
        if (selectedSubtype && task.sub_type !== selectedSubtype) return false
        return true
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortAscending(!sortAscending)
    } else {
      setSortColumn(column)
      setSortAscending(true)
    }
  }

  const getSortedSummaryData = () => {
    const filtered = getFilteredSummaryData()
    const sorted = [...filtered]
    sorted.sort((a, b) => {
      let aVal, bVal
      if (sortColumn === 'task_name') {
        aVal = a.task_name.toLowerCase()
        bVal = b.task_name.toLowerCase()
      } else if (sortColumn === 'total_hours') {
        aVal = a.total_hours
        bVal = b.total_hours
      }
      return sortAscending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })
    return sorted
  }

  const getSummaryByType = () => {
    const typeMap = {}
    const tasksWithActivities = getTasksWithActivities()

    getFilteredSummaryData().forEach(item => {
      if (tasksWithActivities.has(item.task_id)) {
        const taskInfo = getTaskInfo(item.task_id)
        const typeKey = taskInfo?.type || 'Unknown'

        if (!typeMap[typeKey]) {
          typeMap[typeKey] = 0
        }
        typeMap[typeKey] += item.total_hours
      }
    })

    const result = Object.entries(typeMap).map(([type, hours]) => ({
      type,
      total_hours: hours
    }))

    result.sort((a, b) => {
      let aVal, bVal
      if (sortColumn === 'type') {
        aVal = a.type.toLowerCase()
        bVal = b.type.toLowerCase()
      } else if (sortColumn === 'total_hours') {
        aVal = a.total_hours
        bVal = b.total_hours
      }
      return sortAscending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })

    return result
  }

  const getSummaryBySubtype = () => {
    const subtypeMap = {}
    const tasksWithActivities = getTasksWithActivities()

    getFilteredSummaryData().forEach(item => {
      if (tasksWithActivities.has(item.task_id)) {
        const taskInfo = getTaskInfo(item.task_id)
        const subtypeKey = taskInfo?.sub_type || 'Unknown'

        if (!subtypeMap[subtypeKey]) {
          subtypeMap[subtypeKey] = 0
        }
        subtypeMap[subtypeKey] += item.total_hours
      }
    })

    const result = Object.entries(subtypeMap).map(([subtype, hours]) => ({
      subtype,
      total_hours: hours
    }))

    result.sort((a, b) => {
      let aVal, bVal
      if (sortColumn === 'subtype') {
        aVal = a.subtype.toLowerCase()
        bVal = b.subtype.toLowerCase()
      } else if (sortColumn === 'total_hours') {
        aVal = a.total_hours
        bVal = b.total_hours
      }
      return sortAscending ? (aVal > bVal ? 1 : -1) : (aVal < bVal ? 1 : -1)
    })

    return result
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="time-spent-page">
      <div className="page-header">
        <h1>Time Spent</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="date-range-selector">
        <div className="date-field">
          <label htmlFor="start-date">Start Date</label>
          <input
            id="start-date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="date-field">
          <label htmlFor="end-date">End Date</label>
          <input
            id="end-date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <button onClick={handleDateChange} className="btn-apply">Apply</button>
      </div>

      <div className="view-tabs">
        <button
          className={`tab ${activeView === 'summary' ? 'active' : ''}`}
          onClick={() => setActiveView('summary')}
        >
          Summary by Task
        </button>
        <button
          className={`tab ${activeView === 'type' ? 'active' : ''}`}
          onClick={() => setActiveView('type')}
        >
          Summary by Type
        </button>
        <button
          className={`tab ${activeView === 'subtype' ? 'active' : ''}`}
          onClick={() => setActiveView('subtype')}
        >
          Summary by Sub-Type
        </button>
        <button
          className={`tab ${activeView === 'daily' ? 'active' : ''}`}
          onClick={() => setActiveView('daily')}
        >
          Daily Breakdown
        </button>
      </div>

      {activeView === 'summary' && (
        <div className="summary-view">
          {summaryData.length === 0 ? (
            <div className="empty-state">No time spent data</div>
          ) : (
            <table className="summary-table">
              <thead>
                <tr>
                  <th
                    className={`sortable ${sortColumn === 'task_name' ? 'sorted' : ''}`}
                    onClick={() => handleSort('task_name')}
                  >
                    Task {sortColumn === 'task_name' && (sortAscending ? '↑' : '↓')}
                  </th>
                  <th
                    className={`sortable ${sortColumn === 'total_hours' ? 'sorted' : ''}`}
                    onClick={() => handleSort('total_hours')}
                  >
                    Total Time {sortColumn === 'total_hours' && (sortAscending ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSortedSummaryData().map(item => (
                  <tr key={item.task_id}>
                    <td>{item.task_name}</td>
                    <td>{item.total_hours.toFixed(2)} hours</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeView === 'type' && (
        <div className="summary-view">
          {summaryData.length === 0 ? (
            <div className="empty-state">No time spent data</div>
          ) : (
            <table className="summary-table">
              <thead>
                <tr>
                  <th
                    className={`sortable ${sortColumn === 'type' ? 'sorted' : ''}`}
                    onClick={() => handleSort('type')}
                  >
                    Type {sortColumn === 'type' && (sortAscending ? '↑' : '↓')}
                  </th>
                  <th
                    className={`sortable ${sortColumn === 'total_hours' ? 'sorted' : ''}`}
                    onClick={() => handleSort('total_hours')}
                  >
                    Total Time {sortColumn === 'total_hours' && (sortAscending ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSummaryByType().map(item => (
                  <tr key={item.type}>
                    <td>{item.type}</td>
                    <td>{item.total_hours.toFixed(2)} hours</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeView === 'subtype' && (
        <div className="summary-view">
          {summaryData.length === 0 ? (
            <div className="empty-state">No time spent data</div>
          ) : (
            <table className="summary-table">
              <thead>
                <tr>
                  <th
                    className={`sortable ${sortColumn === 'subtype' ? 'sorted' : ''}`}
                    onClick={() => handleSort('subtype')}
                  >
                    Sub-Type {sortColumn === 'subtype' && (sortAscending ? '↑' : '↓')}
                  </th>
                  <th
                    className={`sortable ${sortColumn === 'total_hours' ? 'sorted' : ''}`}
                    onClick={() => handleSort('total_hours')}
                  >
                    Total Time {sortColumn === 'total_hours' && (sortAscending ? '↑' : '↓')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {getSummaryBySubtype().map(item => (
                  <tr key={item.subtype}>
                    <td>{item.subtype}</td>
                    <td>{item.total_hours.toFixed(2)} hours</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {activeView === 'daily' && (
        <div className="daily-view">
          {summaryData.length === 0 ? (
            <div className="empty-state">No time spent data</div>
          ) : (
            <>
              <div className="filter-container">
                <div className="filter-field">
                  <label htmlFor="filter-type">Type</label>
                  <select
                    id="filter-type"
                    value={selectedType}
                    onChange={(e) => {
                      setSelectedType(e.target.value)
                      setSelectedSubtype('')
                    }}
                  >
                    <option value="">All Types</option>
                    {getAvailableTypes().map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="filter-subtype">Sub-type</label>
                  <select
                    id="filter-subtype"
                    value={selectedSubtype}
                    onChange={(e) => setSelectedSubtype(e.target.value)}
                  >
                    <option value="">All Sub-types</option>
                    {getAvailableSubtypes().map(subtype => (
                      <option key={subtype} value={subtype}>{subtype}</option>
                    ))}
                  </select>
                </div>

                <div className="filter-field">
                  <label htmlFor="filter-task">Task</label>
                  <select
                    id="filter-task"
                    value={selectedTask}
                    onChange={(e) => setSelectedTask(e.target.value)}
                  >
                    <option value="">All Tasks</option>
                    {getAvailableTasks().map(task => (
                      <option key={task.id} value={task.id}>{task.name}</option>
                    ))}
                  </select>
                </div>

                <button onClick={() => {
                  setSelectedTask('')
                  setSelectedType('')
                  setSelectedSubtype('')
                }} className="btn-clear">Clear Filters</button>
              </div>

              <div className="daily-breakdown">
                {getFilteredSummaryData().length === 0 ? (
                  <div className="empty-state">No matching tasks</div>
                ) : (
                  getFilteredSummaryData().map(task => {
                    const taskDailyData = getDailyDataForTask(task.task_id)
                    return (
                      <div key={task.task_id} className="task-daily-section">
                        <h3>{task.task_name}</h3>
                        {taskDailyData.length === 0 ? (
                          <p className="no-data">No activities recorded</p>
                        ) : (
                          <table className="daily-table">
                            <thead>
                              <tr>
                                <th>Date</th>
                                <th>Hours</th>
                              </tr>
                            </thead>
                            <tbody>
                              {taskDailyData.map((item, idx) => (
                                <tr key={idx}>
                                  <td>{new Date(item.date).toDateString()}</td>
                                  <td>{item.hours.toFixed(2)} hours</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </div>
                    )
                  })
                )}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export default TimeSpent
