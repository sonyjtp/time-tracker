import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { reports, tasks as tasksApi } from '../api'
import { formatHoursToHHMM, getDateInCT, parseDateStringToLocal } from '../utils'
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
        setEndDate(getDateInCT())
        loadData(refDate, getDateInCT())
     } catch (err) {
       setError('Failed to load settings: ' + err.message)
       setLoading(false)
     }
   }

   const loadData = async (start, end) => {
     setLoading(true)
     setError(null)
     try {
       const startDateObj = parseDateStringToLocal(start)
       const endDateObj = parseDateStringToLocal(end)

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

   const getDailyAverage = () => {
     // Parse dates as local dates (not UTC)
     const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
     const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
     const startDateObj = new Date(startYear, startMonth - 1, startDay)
     const endDateObj = new Date(endYear, endMonth - 1, endDay)

     // Filter daily data to only include dates within the selected range
     const filteredDailyData = dailyData.filter(item => {
       // Parse the item date as a local date
       const [itemYear, itemMonth, itemDay] = item.date.split('-').map(Number)
       const itemDate = new Date(itemYear, itemMonth - 1, itemDay)
       const inRange = itemDate >= startDateObj && itemDate <= endDateObj
       return inRange
     })

     // Group daily data by date
     const dailyTotals = {}
     filteredDailyData.forEach(item => {
       if (!dailyTotals[item.date]) {
         dailyTotals[item.date] = 0
       }
       dailyTotals[item.date] += item.hours
     })

     // Sort dates chronologically
     const sortedDates = Object.keys(dailyTotals).sort()

     // Calculate cumulative average for each day
     const result = []
     let cumulativeHours = 0

     sortedDates.forEach((date, index) => {
       cumulativeHours += dailyTotals[date]
       // Parse as local date
       const [dateYear, dateMonth, dateDay] = date.split('-').map(Number)
       const currentDate = new Date(dateYear, dateMonth - 1, dateDay)
       const daysDiff = Math.floor((currentDate - startDateObj) / (1000 * 60 * 60 * 24)) + 1
       const cumulativeAverage = cumulativeHours / daysDiff

       result.push({
         date,
         total_hours: dailyTotals[date],
         average_hours: cumulativeAverage
       })
     })

     return result
   }

   const getDaysInRange = () => {
     const [startYear, startMonth, startDay] = startDate.split('-').map(Number)
     const [endYear, endMonth, endDay] = endDate.split('-').map(Number)
     const startDateObj = new Date(startYear, startMonth - 1, startDay)
     const endDateObj = new Date(endYear, endMonth - 1, endDay)
     const timeDiff = Math.abs(endDateObj - startDateObj)
     return Math.ceil(timeDiff / (1000 * 60 * 60 * 24)) + 1
   }

   const getDailyTotals = () => {
     // Group all daily data by date and sum the hours
     const dailyTotals = {}
     dailyData.forEach(item => {
       if (!dailyTotals[item.date]) {
         dailyTotals[item.date] = 0
       }
       dailyTotals[item.date] += item.hours
     })

     // Convert to array and sort chronologically
     const result = Object.entries(dailyTotals)
       .map(([date, totalHours]) => ({
         date,
         total_hours: totalHours
       }))
       .sort((a, b) => new Date(a.date + 'T00:00:00') - new Date(b.date + 'T00:00:00'))

     return result
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
         <button
           className={`tab ${activeView === 'dailyAverage' ? 'active' : ''}`}
           onClick={() => setActiveView('dailyAverage')}
         >
           Daily Average
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
                     Total Time (hours) {sortColumn === 'total_hours' && (sortAscending ? '↑' : '↓')}
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {getSortedSummaryData().map(item => (
                   <tr key={item.task_id}>
                     <td>{item.task_name}</td>
                     <td>{formatHoursToHHMM(item.total_hours)}</td>
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
                     Total Time (hours) {sortColumn === 'total_hours' && (sortAscending ? '↑' : '↓')}
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {getSummaryByType().map(item => (
                   <tr key={item.type}>
                     <td>{item.type}</td>
                     <td>{formatHoursToHHMM(item.total_hours)}</td>
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
                     Total Time (hours) {sortColumn === 'total_hours' && (sortAscending ? '↑' : '↓')}
                   </th>
                 </tr>
               </thead>
               <tbody>
                 {getSummaryBySubtype().map(item => (
                   <tr key={item.subtype}>
                     <td>{item.subtype}</td>
                     <td>{formatHoursToHHMM(item.total_hours)}</td>
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
               <table className="daily-table-summary">
                 <thead>
                   <tr>
                     <th>Date</th>
                     <th>Hours</th>
                   </tr>
                 </thead>
                  <tbody>
                    {getDailyTotals().map((item, idx) => {
                      // Format date directly from YYYY-MM-DD string without timezone conversion
                      const [year, month, day] = item.date.split('-')
                      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                      const dateStr = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
                      return (
                        <tr key={idx}>
                          <td>{dateStr}</td>
                          <td>{formatHoursToHHMM(item.total_hours)}</td>
                        </tr>
                      )
                    })}
                  </tbody>
               </table>
             </>
           )}
         </div>
       )}

       {activeView === 'dailyAverage' && (
         <div className="daily-average-view">
           {dailyData.length === 0 ? (
             <div className="empty-state">No time spent data</div>
           ) : (
             <>
               <div className="range-info">
                 <p>Date range: <strong>{startDate}</strong> to <strong>{endDate}</strong> ({getDaysInRange()} days)</p>
                 <p>Cumulative Average = Sum of hours from start date to that day ÷ Number of calendar days from start</p>
               </div>
               <div className="daily-average-scroll-container">
                 <table className="daily-average-table">
                   <thead>
                     <tr>
                       <th>Date</th>
                       <th>Hours Worked</th>
                       <th>Cumulative Average</th>
                     </tr>
                   </thead>
                    <tbody>
                      {getDailyAverage().map((item, idx) => {
                        // Format date directly from YYYY-MM-DD string without timezone conversion
                        const [year, month, day] = item.date.split('-')
                        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
                        const dateStr = `${monthNames[parseInt(month) - 1]} ${parseInt(day)}, ${year}`
                        return (
                          <tr key={idx}>
                            <td>{dateStr}</td>
                            <td>{formatHoursToHHMM(item.total_hours)}</td>
                            <td>{formatHoursToHHMM(item.average_hours)}</td>
                          </tr>
                        )
                      })}
                    </tbody>
                 </table>
               </div>
             </>
           )}
         </div>
       )}
    </div>
  )
}

export default TimeSpent
