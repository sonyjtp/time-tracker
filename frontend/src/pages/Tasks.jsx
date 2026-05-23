import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { tasks } from '../api'
import TaskForm from '../components/TaskForm'
import '../styles/Tasks.css'

function Tasks() {
  const [tasks_list, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [sortColumn, setSortColumn] = useState('name')
  const [sortAscending, setSortAscending] = useState(true)

  useEffect(() => {
    loadReferenceDate()
  }, [])

  const loadReferenceDate = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/settings/reference_date')
      const refDate = response.data.value
      setStartDate(refDate)
      setEndDate(new Date().toISOString().split('T')[0])
      loadTasks(refDate, new Date().toISOString().split('T')[0])
    } catch (err) {
      setError('Failed to load settings: ' + err.message)
      setLoading(false)
    }
  }

  const loadTasks = async (start = startDate, end = endDate) => {
    setLoading(true)
    setError(null)
    try {
      const res = await tasks.getAll()
      // Filter tasks by date range based on start_date and end_date
      const filtered = res.data.filter(task => {
        if (!task.start_date || !task.end_date) return true
        const taskStart = new Date(task.start_date)
        const taskEnd = new Date(task.end_date)
        const filterStart = new Date(start)
        const filterEnd = new Date(end)

        // Show if task overlaps with the selected date range
        return taskStart <= filterEnd && taskEnd >= filterStart
      })
      setTasks(filtered)
    } catch (err) {
      setError('Failed to load tasks: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDateChange = () => {
    if (startDate && endDate) {
      loadTasks(startDate, endDate)
    }
  }

  const handleSort = (column) => {
    if (sortColumn === column) {
      setSortAscending(!sortAscending)
    } else {
      setSortColumn(column)
      setSortAscending(true)
    }
  }

  const getSortedTasks = () => {
    const sorted = [...tasks_list]
    sorted.sort((a, b) => {
      let aVal, bVal

      if (sortColumn === 'name') {
        aVal = a.name.toLowerCase()
        bVal = b.name.toLowerCase()
      } else if (sortColumn === 'type') {
        aVal = (a.type || '').toLowerCase()
        bVal = (b.type || '').toLowerCase()
      } else if (sortColumn === 'subtype') {
        aVal = (a.sub_type || '').toLowerCase()
        bVal = (b.sub_type || '').toLowerCase()
      } else if (sortColumn === 'source') {
        aVal = (a.source || '').toLowerCase()
        bVal = (b.source || '').toLowerCase()
      } else if (sortColumn === 'start_date') {
        aVal = a.start_date || ''
        bVal = b.start_date || ''
      } else if (sortColumn === 'end_date') {
        aVal = a.end_date || ''
        bVal = b.end_date || ''
      }

      if (aVal < bVal) return sortAscending ? -1 : 1
      if (aVal > bVal) return sortAscending ? 1 : -1
      return 0
    })
    return sorted
  }

  const handleAddTask = () => {
    setEditingTask(null)
    setShowModal(true)
  }

  const handleEditTask = (task) => {
    setEditingTask(task)
    setShowModal(true)
  }

  const handleDeleteTask = async (id) => {
    if (window.confirm('Delete this task?')) {
      try {
        await tasks.delete(id)
        loadTasks()
      } catch (err) {
        setError('Failed to delete task: ' + err.message)
      }
    }
  }

  const handleSaveTask = async (taskData) => {
    try {
      if (editingTask) {
        await tasks.update(editingTask.id, taskData)
      } else {
        await tasks.create(taskData)
      }
      setShowModal(false)
      loadTasks()
    } catch (err) {
      setError('Failed to save task: ' + err.message)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="tasks-page">
      <div className="page-header">
        <h1>Tasks</h1>
        <button onClick={handleAddTask} className="btn-primary">+ Add Task</button>
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

      {tasks_list.length === 0 ? (
        <div className="empty-state">No tasks yet</div>
      ) : (
        <div className="tasks-scroll-container">
          <div className="tasks-table-container">
            <table className="tasks-table">
          <thead>
            <tr>
              <th className={`sortable ${sortColumn === 'name' ? 'sorted' : ''}`} onClick={() => handleSort('name')}>
                Task Name {sortColumn === 'name' && (sortAscending ? '↑' : '↓')}
              </th>
              <th className={`sortable ${sortColumn === 'type' ? 'sorted' : ''}`} onClick={() => handleSort('type')}>
                Type {sortColumn === 'type' && (sortAscending ? '↑' : '↓')}
              </th>
              <th className={`sortable ${sortColumn === 'subtype' ? 'sorted' : ''}`} onClick={() => handleSort('subtype')}>
                Sub-type {sortColumn === 'subtype' && (sortAscending ? '↑' : '↓')}
              </th>
              <th className={`sortable ${sortColumn === 'source' ? 'sorted' : ''}`} onClick={() => handleSort('source')}>
                Source {sortColumn === 'source' && (sortAscending ? '↑' : '↓')}
              </th>
              <th className={`sortable ${sortColumn === 'start_date' ? 'sorted' : ''}`} onClick={() => handleSort('start_date')}>
                Start Date {sortColumn === 'start_date' && (sortAscending ? '↑' : '↓')}
              </th>
              <th className={`sortable ${sortColumn === 'end_date' ? 'sorted' : ''}`} onClick={() => handleSort('end_date')}>
                Last Worked {sortColumn === 'end_date' && (sortAscending ? '↑' : '↓')}
              </th>
              <th>Links</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {getSortedTasks().map(task => (
              <tr key={task.id}>
                <td>{task.name}</td>
                <td>{task.type}</td>
                <td>{task.sub_type}</td>
                <td>{task.source}</td>
                <td>{task.start_date ? (() => {
                  const d = new Date(task.start_date);
                  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
                })() : '-'}</td>
                <td>{task.end_date ? (() => {
                  const d = new Date(task.end_date);
                  return `${d.getFullYear()}/${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
                })() : '-'}</td>
                <td>
                  {task.links ? (
                    <a href={task.links} target="_blank" rel="noopener noreferrer">Link</a>
                  ) : (
                    '-'
                  )}
                </td>
                <td className="action-buttons">
                  <button onClick={() => handleEditTask(task)} className="btn-small">Edit</button>
                  <button onClick={() => handleDeleteTask(task.id)} className="btn-small btn-danger">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <TaskForm
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => setShowModal(false)}
        />
      )}
    </div>
  )
}

export default Tasks
