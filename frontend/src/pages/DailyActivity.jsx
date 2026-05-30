import React, { useState, useEffect } from 'react'
import { activities, tasks } from '../api'
import ActivityForm from '../components/ActivityForm'
import { formatHoursToHHMM, getTodayLocalDate, formatDate, getDateInCT, parseDateStringToLocal } from '../utils'
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
  const [inlineEditingId, setInlineEditingId] = useState(null)
  const [inlineEditField, setInlineEditField] = useState(null)
  const [inlineEditValue, setInlineEditValue] = useState('')
  const [taskSuggestions, setTaskSuggestions] = useState([])

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
    setCurrentDate(parseDateStringToLocal(getDateInCT()))
  }

  const handleAddActivity = () => {
    setEditingActivity(null)
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

  const handleStartInlineEdit = (activity, field) => {
    setInlineEditingId(activity.id)
    setInlineEditField(field)
    setInlineEditValue(activity[field] || '')
  }

  const handleSaveInlineEdit = async (activityId, overrideTaskId = null) => {
    if (!inlineEditField) return

    const updatedData = {
      [inlineEditField]: inlineEditField === 'task_id' ? (overrideTaskId || parseInt(inlineEditValue)) : inlineEditValue
    }

    try {
      await activities.update(activityId, updatedData)
      setInlineEditingId(null)
      setInlineEditField(null)
      loadData()
    } catch (err) {
      setError('Failed to update activity: ' + err.message)
    }
  }

  const handleCancelInlineEdit = () => {
    setInlineEditingId(null)
    setInlineEditField(null)
    setInlineEditValue('')
  }

  const handleKeyDown = (e, activityId) => {
    if (e.key === 'Enter') {
      handleSaveInlineEdit(activityId)
    } else if (e.key === 'Escape') {
      handleCancelInlineEdit()
    }
  }

  const renderEditableCell = (activity, field, displayValue) => {
    const isEditing = inlineEditingId === activity.id && inlineEditField === field
    const inputType = field === 'comments' ? 'text' : 'time'

    return isEditing ? (
      <input
        autoFocus
        type={inputType}
        value={inlineEditValue}
        onChange={(e) => setInlineEditValue(e.target.value)}
        onBlur={() => handleSaveInlineEdit(activity.id)}
        onKeyDown={(e) => handleKeyDown(e, activity.id)}
        className="inline-edit-input"
      />
    ) : (
      <span
        onClick={() => handleStartInlineEdit(activity, field)}
        className="editable-cell"
        title="Click to edit"
      >
        {displayValue || '-'}
      </span>
    )
  }

  const renderTaskDropdown = (activity) => {
    const isEditing = inlineEditingId === activity.id && inlineEditField === 'task_id'

    if (isEditing) {
      const filteredTasks = tasks_list.filter(task =>
        task.name.toLowerCase().includes(inlineEditValue.toLowerCase())
      )

      const handleTaskSelect = (taskId, taskName) => {
        setInlineEditValue(taskName)
        setTaskSuggestions([])
        handleSaveInlineEdit(activity.id, taskId)
      }

      return (
        <div className="autocomplete-wrapper">
          <input
            autoFocus
            type="text"
            value={inlineEditValue}
            onChange={(e) => {
              setInlineEditValue(e.target.value)
              setTaskSuggestions(
                e.target.value.length > 0
                  ? tasks_list.filter(task =>
                      task.name.toLowerCase().includes(e.target.value.toLowerCase())
                    )
                  : []
              )
            }}
            onBlur={() => {
              setTimeout(() => {
                setInlineEditingId(null)
                setInlineEditField(null)
                setTaskSuggestions([])
              }, 200)
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && filteredTasks.length > 0) {
                handleTaskSelect(filteredTasks[0].id, filteredTasks[0].name)
              } else if (e.key === 'Escape') {
                setInlineEditingId(null)
                setInlineEditField(null)
                setTaskSuggestions([])
              }
            }}
            className="inline-edit-input"
            placeholder="Type task name..."
          />
          {inlineEditValue && filteredTasks.length > 0 && (
            <div className="autocomplete-suggestions">
              {filteredTasks.map(task => (
                <div
                  key={task.id}
                  className="autocomplete-suggestion"
                  onClick={() => handleTaskSelect(task.id, task.name)}
                >
                  {task.name}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    return (
      <span
        onClick={() => {
          setInlineEditingId(activity.id)
          setInlineEditField('task_id')
          setInlineEditValue(activity.task.name)
          setTaskSuggestions([])
        }}
        className="editable-cell"
        title="Click to change task"
      >
        {activity.task.name || '-'}
      </span>
    )
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
    const tasksOnDay = tasks_list
      .filter(task => taskIds.has(task.id))
      .sort((a, b) => a.name.localeCompare(b.name))

    // Filter out tasks with end_date before current date
    const currentDateStr = formatDate(currentDate)
    return tasksOnDay.filter(task => {
      if (!task.end_date) return true
      // If task has an end_date, only show it on dates <= end_date
      return task.end_date >= currentDateStr
    })
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
      {error && <div className="error">{error}</div>}

       <div className="date-nav">
         <button onClick={handlePreviousDay}>← Previous</button>
         <input
           type="date"
           value={formatDate(currentDate)}
           onChange={(e) => setCurrentDate(new Date(e.target.value))}
           className="date-picker"
         />
        <button onClick={handleNextDay}>Next →</button>
        <button onClick={handleToday} className="btn-today">Today</button>
        <button onClick={handleAddActivity} className="btn-primary">+ Add</button>
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
           Total Time: {formatHoursToHHMM(totalTime)}
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
               <th>Delete</th>
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
                   <td>{renderTaskDropdown(activity)}</td>
                   <td>{activity.task.type}</td>
                   <td>{renderEditableCell(activity, 'start_time', activity.start_time ? activity.start_time.slice(0, 5) : '-')}</td>
                   <td>{renderEditableCell(activity, 'end_time', activity.end_time ? activity.end_time.slice(0, 5) : '-')}</td>
                   <td>{duration}</td>
                   <td>{renderEditableCell(activity, 'comments', activity.comments)}</td>
                    <td className="action-buttons">
                      <button
                        onClick={() => handleDeleteActivity(activity.id)}
                        className="btn-icon btn-delete"
                        title="Delete activity"
                      >
                        🗑️
                      </button>
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
