import React, { useState } from 'react'
import '../styles/Modal.css'

function TaskForm({ task, onSave, onClose }) {
  const [name, setName] = useState(task?.name || '')
  const [type, setType] = useState(task?.type || '')
  const [subType, setSubType] = useState(task?.sub_type || '')
  const [source, setSource] = useState(task?.source || '')
  const [links, setLinks] = useState(task?.links || '')
  const [error, setError] = useState(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setError(null)

    if (!name) {
      setError('Task name is required')
      return
    }

    const taskData = {
      name,
      type: type || '',
      sub_type: subType || '',
      source: source || '',
      links: links || null,
    }

    onSave(taskData)
  }

  return (
    <div className="modal active">
      <div className="modal-content">
        <h2>{task ? 'Edit Task' : 'Add Task'}</h2>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Task Name</label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="type">Type</label>
            <input
              id="type"
              type="text"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="subType">Sub-type</label>
            <input
              id="subType"
              type="text"
              value={subType}
              onChange={(e) => setSubType(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label htmlFor="source">Source</label>
            <input
              id="source"
              type="text"
              value={source}
              onChange={(e) => setSource(e.target.value)}
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

export default TaskForm
