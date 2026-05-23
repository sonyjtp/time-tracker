import React, { useState } from 'react'
import '../styles/Modal.css'

function ActivityForm({ activity, tasks, date, onSave, onClose }) {
  const getCurrentTime = () => {
    const now = new Date()
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    return `${hours}:${minutes}`
  }

  const [taskId, setTaskId] = useState(activity?.task_id || '')
  const [taskSearch, setTaskSearch] = useState(
    activity ? tasks.find(t => t.id === activity.task_id)?.name || '' : ''
  )
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [startTime, setStartTime] = useState(activity?.start_time || getCurrentTime())
  const [endTime, setEndTime] = useState(activity?.end_time || '')
  const [comments, setComments] = useState(activity?.comments || '')
  const [links, setLinks] = useState(activity?.links || '')
  const [error, setError] = useState(null)

  const getFilteredTasks = () => {
    if (!taskSearch) return tasks.sort((a, b) => a.name.localeCompare(b.name))
    return tasks
      .filter(task => task.name.toLowerCase().includes(taskSearch.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const handleTaskSearch = (value) => {
    setTaskSearch(value)
    setTaskId('')
    setShowSuggestions(true)
  }

  const handleTaskSelect = (task) => {
    setTaskId(task.id)
    setTaskSearch(task.name)
    setShowSuggestions(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!taskId || !startTime) {
      setError('Task and start time are required')
      return
    }

    const finalEndTime = endTime || getCurrentTime()

    const activityData = {
      task_id: parseInt(taskId),
      date: date.toISOString().split('T')[0],
      start_time: startTime,
      end_time: finalEndTime,
      comments: comments || null,
      links: links || null,
    }

    onSave(activityData)
  }

  return (
    <div className="modal active">
      <div className="modal-content">
        <h2>{activity ? 'Edit Activity' : 'Add Activity'}</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="task">Task</label>
            <div className="autocomplete-container">
              <input
                id="task"
                type="text"
                value={taskSearch}
                onChange={(e) => handleTaskSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search tasks..."
                required={!taskId}
              />
              {showSuggestions && taskSearch && (
                <div className="autocomplete-suggestions">
                  {getFilteredTasks().length > 0 ? (
                    getFilteredTasks().map(task => (
                      <div
                        key={task.id}
                        className="autocomplete-option"
                        onClick={() => handleTaskSelect(task)}
                      >
                        {task.name}
                      </div>
                    ))
                  ) : (
                    <div className="autocomplete-option disabled">No tasks found</div>
                  )}
                </div>
              )}
            </div>
            {taskId && <div className="task-selected">✓ Task selected</div>}
          </div>

          <div className="form-group">
            <label htmlFor="startTime">Start Time</label>
            <input
              id="startTime"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="endTime">End Time</label>
            <input
              id="endTime"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="comments">Comments</label>
            <textarea
              id="comments"
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="links">Links</label>
            <input
              id="links"
              type="url"
              value={links}
              onChange={(e) => setLinks(e.target.value)}
            />
          </div>

          <div className="form-actions">
            <button type="button" onClick={onClose} className="btn-cancel">Cancel</button>
            <button type="submit" className="btn-primary">Save</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ActivityForm
