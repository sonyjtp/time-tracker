import React, { useState, useEffect } from 'react'
import { reports, tasks as tasksApi } from '../api'
import { formatHoursToHHMM, getDateInCT, parseDateStringToLocal } from '../utils'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js'
import { Bar, Line, Pie } from 'react-chartjs-2'
import '../styles/Dashboard.css'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
)

function Dashboard() {
  const [allData, setAllData] = useState([])
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeView, setActiveView] = useState('weeklyTotal')

  // Filters
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedTask, setSelectedTask] = useState('all')
  const [selectedType, setSelectedType] = useState('all')
  const [selectedSubtype, setSelectedSubtype] = useState('all')

  useEffect(() => {
    loadInitialData()
  }, [])

  const loadInitialData = async () => {
    try {
      setLoading(true)
      const today = getDateInCT()

      // Set default date range to last 90 days
      const startD = parseDateStringToLocal(today)
      startD.setDate(startD.getDate() - 90)
      const startDateStr = `${startD.getFullYear()}-${String(startD.getMonth() + 1).padStart(2, '0')}-${String(startD.getDate()).padStart(2, '0')}`

      setStartDate(startDateStr)
      setEndDate(today)

      const [dailyRes, tasksRes] = await Promise.all([
        reports.getTimeSpentDaily(parseDateStringToLocal(startDateStr), parseDateStringToLocal(today)),
        tasksApi.getAll()
      ])

      setAllData(dailyRes.data)
      setAllTasks(tasksRes.data)
    } catch (err) {
      setError('Failed to load data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const loadData = async (start, end) => {
    try {
      setLoading(true)
      const [dailyRes, tasksRes] = await Promise.all([
        reports.getTimeSpentDaily(parseDateStringToLocal(start), parseDateStringToLocal(end)),
        tasksApi.getAll()
      ])

      setAllData(dailyRes.data)
      setAllTasks(tasksRes.data)
    } catch (err) {
      setError('Failed to load data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = () => {
    if (startDate && endDate) {
      loadData(startDate, endDate)
    }
  }

  const getTaskInfo = (taskId) => {
    return allTasks.find(t => t.id === taskId)
  }

  const getFilteredData = () => {
    return allData.filter(item => {
      const taskInfo = getTaskInfo(item.task_id)
      if (!taskInfo) return false

      if (selectedTask !== 'all' && item.task_id !== parseInt(selectedTask)) return false
      if (selectedType !== 'all' && taskInfo.type !== selectedType) return false
      if (selectedSubtype !== 'all' && taskInfo.sub_type !== selectedSubtype) return false

      return true
    })
  }

  const getAvailableTasks = () => {
    const tasksWithActivities = new Set()
    allData.forEach(item => tasksWithActivities.add(item.task_id))

    return allTasks
      .filter(t => tasksWithActivities.has(t.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const getAvailableTypes = () => {
    const types = new Set()
    allData.forEach(item => {
      const taskInfo = getTaskInfo(item.task_id)
      if (taskInfo && taskInfo.type) types.add(taskInfo.type)
    })
    return Array.from(types).sort()
  }

  const getAvailableSubtypes = () => {
    const subtypes = new Set()
    const filteredTasks = selectedType === 'all'
      ? new Set(allTasks.map(t => t.id))
      : new Set(allTasks.filter(t => t.type === selectedType).map(t => t.id))

    allData.forEach(item => {
      if (filteredTasks.has(item.task_id)) {
        const taskInfo = getTaskInfo(item.task_id)
        if (taskInfo && taskInfo.sub_type) subtypes.add(taskInfo.sub_type)
      }
    })
    return Array.from(subtypes).sort()
  }

  const getWeeklyTotals = () => {
    const filtered = getFilteredData()
    const weeklyMap = {}

    filtered.forEach(item => {
      const date = new Date(item.date + 'T00:00:00')
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = { week_start: weekKey, total_hours: 0 }
      }
      weeklyMap[weekKey].total_hours += item.hours
    })

    return Object.values(weeklyMap).sort((a, b) => a.week_start.localeCompare(b.week_start))
  }

  const getMonthlyTotals = () => {
    const filtered = getFilteredData()
    const monthlyMap = {}

    filtered.forEach(item => {
      const [year, month] = item.date.split('-')
      const monthKey = `${year}-${month}`

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = { month: monthKey, total_hours: 0 }
      }
      monthlyMap[monthKey].total_hours += item.hours
    })

    return Object.values(monthlyMap).sort((a, b) => a.month.localeCompare(b.month))
  }

  const getWeeklyCumulativeAverage = () => {
    const filtered = getFilteredData()
    const weeklyMap = {}
    const result = []

    filtered.forEach(item => {
      const date = new Date(item.date + 'T00:00:00')
      const weekStart = new Date(date)
      weekStart.setDate(date.getDate() - date.getDay())
      const weekKey = weekStart.toISOString().split('T')[0]

      if (!weeklyMap[weekKey]) {
        weeklyMap[weekKey] = 0
      }
      weeklyMap[weekKey] += item.hours
    })

    const sortedWeeks = Object.keys(weeklyMap).sort()
    let cumulativeHours = 0

    sortedWeeks.forEach((week, index) => {
      cumulativeHours += weeklyMap[week]
      const avgPerWeek = cumulativeHours / (index + 1)
      result.push({
        week_start: week,
        total_hours: weeklyMap[week],
        cumulative_average: avgPerWeek
      })
    })

    return result
  }

  const getMonthlyCumulativeAverage = () => {
    const filtered = getFilteredData()
    const monthlyMap = {}
    const result = []

    filtered.forEach(item => {
      const [year, month] = item.date.split('-')
      const monthKey = `${year}-${month}`

      if (!monthlyMap[monthKey]) {
        monthlyMap[monthKey] = 0
      }
      monthlyMap[monthKey] += item.hours
    })

    const sortedMonths = Object.keys(monthlyMap).sort()
    let cumulativeHours = 0

    sortedMonths.forEach((month, index) => {
      cumulativeHours += monthlyMap[month]
      const avgPerMonth = cumulativeHours / (index + 1)
      result.push({
        month,
        total_hours: monthlyMap[month],
        cumulative_average: avgPerMonth
      })
    })

    return result
  }

  const formatDateRange = (dateStr) => {
    const [year, month, day] = dateStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
  }

  const formatWeek = (dateStr) => {
    const weekEnd = new Date(dateStr + 'T00:00:00')
    weekEnd.setDate(weekEnd.getDate() + 6)
    return `${formatDateRange(dateStr)} - ${formatDateRange(weekEnd.toISOString().split('T')[0])}`
  }

  const formatMonth = (monthStr) => {
    const [year, month] = monthStr.split('-')
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    return `${monthNames[parseInt(month) - 1]} ${year}`
  }

  const getWeeklyChart = () => {
    const data = getWeeklyTotals()
    return {
      labels: data.map(item => formatWeek(item.week_start)),
      datasets: [
        {
          label: 'Hours Worked',
          data: data.map(item => item.total_hours),
          backgroundColor: '#3498db',
          borderColor: '#2980b9',
          borderWidth: 1,
        }
      ]
    }
  }

  const getMonthlyChart = () => {
    const data = getMonthlyTotals()
    return {
      labels: data.map(item => formatMonth(item.month)),
      datasets: [
        {
          label: 'Hours Worked',
          data: data.map(item => item.total_hours),
          backgroundColor: '#2ecc71',
          borderColor: '#27ae60',
          borderWidth: 1,
        }
      ]
    }
  }

  const getWeeklyAverageChart = () => {
    const data = getWeeklyCumulativeAverage()
    return {
      labels: data.map(item => formatWeek(item.week_start)),
      datasets: [
        {
          label: 'Cumulative Average',
          data: data.map(item => item.cumulative_average),
          borderColor: '#e74c3c',
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        }
      ]
    }
  }

  const getMonthlyAverageChart = () => {
    const data = getMonthlyCumulativeAverage()
    return {
      labels: data.map(item => formatMonth(item.month)),
      datasets: [
        {
          label: 'Cumulative Average',
          data: data.map(item => item.cumulative_average),
          borderColor: '#f39c12',
          backgroundColor: 'rgba(243, 156, 18, 0.1)',
          borderWidth: 2,
          tension: 0.4,
          fill: true,
        }
      ]
    }
  }

  const getTaskBreakdownChart = () => {
    const filtered = getFilteredData()
    const taskMap = {}

    filtered.forEach(item => {
      if (!taskMap[item.task_id]) {
        taskMap[item.task_id] = { name: item.task_name, hours: 0 }
      }
      taskMap[item.task_id].hours += item.hours
    })

    const tasks = Object.values(taskMap).sort((a, b) => b.hours - a.hours)
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22']

    return {
      labels: tasks.map(t => t.name),
      datasets: [
        {
          label: 'Hours by Task',
          data: tasks.map(t => t.hours),
          backgroundColor: colors.slice(0, tasks.length),
        }
      ]
    }
  }

  const getTypeBreakdownChart = () => {
    const filtered = getFilteredData()
    const typeMap = {}

    filtered.forEach(item => {
      const taskInfo = getTaskInfo(item.task_id)
      const type = taskInfo?.type || 'Unknown'
      if (!typeMap[type]) {
        typeMap[type] = 0
      }
      typeMap[type] += item.hours
    })

    const types = Object.entries(typeMap).sort((a, b) => b[1] - a[1])
    const colors = ['#3498db', '#2ecc71', '#e74c3c', '#f39c12', '#9b59b6', '#1abc9c', '#34495e', '#e67e22']

    return {
      labels: types.map(t => t[0]),
      datasets: [
        {
          label: 'Hours by Type',
          data: types.map(t => t[1]),
          backgroundColor: colors.slice(0, types.length),
        }
      ]
    }
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        position: 'bottom',
      }
    }
  }

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'h'
          }
        }
      }
    }
  }

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          callback: function(value) {
            return value + 'h'
          }
        }
      }
    }
  }


  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="dashboard-page">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="dashboard-controls">
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

        <div className="filters-section">
          <div className="filter-group">
            <label>Task</label>
            <select value={selectedTask} onChange={(e) => setSelectedTask(e.target.value)}>
              <option value="all">All</option>
              {getAvailableTasks().map(task => (
                <option key={task.id} value={task.id}>{task.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>
            <select value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
              <option value="all">All</option>
              {getAvailableTypes().map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sub-Type</label>
            <select value={selectedSubtype} onChange={(e) => setSelectedSubtype(e.target.value)}>
              <option value="all">All</option>
              {getAvailableSubtypes().map(subtype => (
                <option key={subtype} value={subtype}>{subtype}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="view-tabs">
        <button
          className={`tab ${activeView === 'weeklyTotal' ? 'active' : ''}`}
          onClick={() => setActiveView('weeklyTotal')}
        >
          Weekly Totals
        </button>
        <button
          className={`tab ${activeView === 'monthlyTotal' ? 'active' : ''}`}
          onClick={() => setActiveView('monthlyTotal')}
        >
          Monthly Totals
        </button>
        <button
          className={`tab ${activeView === 'weeklyAverage' ? 'active' : ''}`}
          onClick={() => setActiveView('weeklyAverage')}
        >
          Weekly Cumulative Avg
        </button>
        <button
          className={`tab ${activeView === 'monthlyAverage' ? 'active' : ''}`}
          onClick={() => setActiveView('monthlyAverage')}
        >
          Monthly Cumulative Avg
        </button>
      </div>

      {activeView === 'weeklyTotal' && (
        <div className="dashboard-view">
          {getWeeklyTotals().length === 0 ? (
            <div className="empty-state">No data available</div>
          ) : (
            <div className="view-container">
              <div className="chart-container">
                <h3>Weekly Hours</h3>
                <Bar data={getWeeklyChart()} options={barChartOptions} />
              </div>
              <div className="chart-container">
                <h3>Breakdown by Task</h3>
                <Pie data={getTaskBreakdownChart()} options={chartOptions} />
              </div>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {getWeeklyTotals().map((item, idx) => (
                    <tr key={idx}>
                      <td>{formatWeek(item.week_start)}</td>
                      <td>{formatHoursToHHMM(item.total_hours)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeView === 'monthlyTotal' && (
        <div className="dashboard-view">
          {getMonthlyTotals().length === 0 ? (
            <div className="empty-state">No data available</div>
          ) : (
            <div className="view-container">
              <div className="chart-container">
                <h3>Monthly Hours</h3>
                <Bar data={getMonthlyChart()} options={barChartOptions} />
              </div>
              <div className="chart-container">
                <h3>Breakdown by Type</h3>
                <Pie data={getTypeBreakdownChart()} options={chartOptions} />
              </div>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Total Hours</th>
                  </tr>
                </thead>
                <tbody>
                  {getMonthlyTotals().map((item, idx) => (
                    <tr key={idx}>
                      <td>{formatMonth(item.month)}</td>
                      <td>{formatHoursToHHMM(item.total_hours)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeView === 'weeklyAverage' && (
        <div className="dashboard-view">
          {getWeeklyCumulativeAverage().length === 0 ? (
            <div className="empty-state">No data available</div>
          ) : (
            <div>
              <div className="info-box">
                <p>Cumulative Average = Sum of hours from start ÷ Number of weeks</p>
              </div>
              <div className="chart-container">
                <h3>Weekly Cumulative Average</h3>
                <Line data={getWeeklyAverageChart()} options={lineChartOptions} />
              </div>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Week</th>
                    <th>Hours Worked</th>
                    <th>Cumulative Average</th>
                  </tr>
                </thead>
                <tbody>
                  {getWeeklyCumulativeAverage().map((item, idx) => (
                    <tr key={idx}>
                      <td>{formatWeek(item.week_start)}</td>
                      <td>{formatHoursToHHMM(item.total_hours)}</td>
                      <td>{formatHoursToHHMM(item.cumulative_average)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeView === 'monthlyAverage' && (
        <div className="dashboard-view">
          {getMonthlyCumulativeAverage().length === 0 ? (
            <div className="empty-state">No data available</div>
          ) : (
            <div>
              <div className="info-box">
                <p>Cumulative Average = Sum of hours from start ÷ Number of months</p>
              </div>
              <div className="chart-container">
                <h3>Monthly Cumulative Average</h3>
                <Line data={getMonthlyAverageChart()} options={lineChartOptions} />
              </div>
              <table className="dashboard-table">
                <thead>
                  <tr>
                    <th>Month</th>
                    <th>Hours Worked</th>
                    <th>Cumulative Average</th>
                  </tr>
                </thead>
                <tbody>
                  {getMonthlyCumulativeAverage().map((item, idx) => (
                    <tr key={idx}>
                      <td>{formatMonth(item.month)}</td>
                      <td>{formatHoursToHHMM(item.total_hours)}</td>
                      <td>{formatHoursToHHMM(item.cumulative_average)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
