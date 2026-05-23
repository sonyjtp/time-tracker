import React, { useState, useEffect } from 'react'
import { activities, tasks } from '../api'
import ActivityForm from '../components/ActivityForm'
import '../styles/DailyActivity.css'

function DailyActivity() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activities_list, setActivities] = useState([])
  const [tasks_list, setTasks] = useState([])
  const [selectedTaskFilter, setSelectedTaskFilter] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingActivity, setEditingActivity] = useState(null)

  useEffect(() => {
    loadData()
  }, [currentDate])

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const [activitiesRes, tasksRes] = await Promise.all([
        activities.getByDate(currentDate),
        tasks.getAll(),
      ])
      setActivities(activitiesRes.data)
      setTasks(tasksRes.data)
    } catch (err) {
      setError('Failed to load data: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handlePreviousDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() - 1)
    setCurrentDate(newDate)
  }

  const handleNextDay = () => {
    const newDate = new Date(currentDate)
    newDate.setDate(newDate.getDate() + 1)
    setCurrentDate(newDate)
  }

  const handleToday = () => {
    setCurrentDate(new Date())
  }

  const handleAddActivity = () => {
    setEditingActivity(null)
    setShowModal(true)
  }

  const handleEditActivity = (activity) => {
    setEditingActivity(activity)
    setShowModal(true)
  }

  const handleDeleteActivity = async (id) => {
    if (window.confirm('Delete this activity?')) {
      try {
        await activities.delete(id)
        loadData()
      } catch (err) {
        setError('Failed to delete activity: ' + err.message)
      }
    }
  }

  const handleSaveActivity = async (activityData) => {
    try {
      if (editingActivity) {
        await activities.update(editingActivity.id, activityData)
      } else {
        await activities.create(activityData)
      }
      setShowModal(false)
      loadData()
    } catch (err) {
      setError('Failed to save activity: ' + err.message)
    }
  }

  const getTasksForDay = () => {
    const taskIds = new Set(activities_list.map(a => a.task_id))
    return tasks_list
      .filter(task => taskIds.has(task.id))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const filteredActivities = selectedTaskFilter
    ? activities_list.filter(a => a.task_id === selectedTaskFilter)
    : activities_list

  const totalTime = filteredActivities.reduce((sum, activity) => {
    if (!activity.start_time || !activity.end_time) return sum
    const start = new Date(`2000-01-01T${activity.start_time}`)
    const end = new Date(`2000-01-01T${activity.end_time}`)
    return sum + (end - start) / (1000 * 60 * 60)
  }, 0)

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="daily-activity">
      <div className="page-header">
        <h1>Daily Activity</h1>
        <button onClick={handleAddActivity} className="btn-primary">+ Add</button>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="date-nav">
        <button onClick={handlePreviousDay}>← Previous</button>
        <input
          type="date"
          value={currentDate.toISOString().split('T')[0]}
          onChange={(e) => setCurrentDate(new Date(e.target.value))}
          className="date-picker"
        />
        <button onClick={handleNextDay}>Next →</button>
        <button onClick={handleToday} className="btn-today">Today</button>
      </div>

      <div className="filter-section">
        <label htmlFor="task-filter">Filter by Task: </label>
        <select
          id="task-filter"
          value={selectedTaskFilter || ''}
          onChange={(e) => setSelectedTaskFilter(e.target.value ? parseInt(e.target.value) : null)}
        >
          <option value="">All Tasks</option>
          {getTasksForDay().map(task => (
            <option key={task.id} value={task.id}>{task.name}</option>
          ))}
        </select>
      </div>

      {filteredActivities.length > 0 && (
        <div className="time-total">
          Total Time: {totalTime.toFixed(2)} hours
        </div>
      )}

      {filteredActivities.length === 0 ? (
        <div className="empty-state">No activities for this day</div>
      ) : (
        <table className="activities-table">
          <thead>
            <tr>
              <th>Task</th>
              <th>Type</th>
              <th>Start Time</th>
              <th>End Time</th>
              <th>Duration</th>
              <th>Comments</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities.map(activity => {
              const duration = activity.start_time && activity.end_time
                ? (() => {
                    const start = new Date(`2000-01-01T${activity.start_time}`)
                    const end = new Date(`2000-01-01T${activity.end_time}`)
                    const hours = Math.floor((end - start) / (1000 * 60 * 60))
                    const minutes = Math.floor(((end - start) % (1000 * 60 * 60)) / (1000 * 60))
                    return `${hours}h ${minutes}m`
                  })()
                : '-'
              return (
                <tr key={activity.id}>
                  <td>{activity.task.name}</td>
                  <td>{activity.task.type}</td>
                  <td>{activity.start_time ? activity.start_time.slice(0, 5) : '-'}</td>
                  <td>{activity.end_time ? activity.end_time.slice(0, 5) : '-'}</td>
                  <td>{duration}</td>
                  <td>{activity.comments || '-'}</td>
                  <td className="action-buttons">
                    <button onClick={() => handleEditActivity(activity)} className="btn-small">Edit</button>
                    <button onClick={() => handleDeleteActivity(activity.id)} className="btn-small btn-danger">Delete</button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}

      {showModal && (
        <ActivityForm
          activity={editingActivity}
          tasks={tasks_list}
          date={currentDate}
          onSave={handleSaveActivity}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default DailyActivity
