import React, { useState, useEffect } from 'react'
import axios from 'axios'
import '../styles/Settings.css'

function Settings() {
  const [referenceDate, setReferenceDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    loadReferenceDate()
  }, [])

  const loadReferenceDate = async () => {
    setLoading(true)
    setError(null)
    try {
      const response = await axios.get('http://localhost:8000/api/settings/reference_date')
      let dateValue = response.data.value

      // If it's today's date (default), set to Jan 1st of current year
      const today = new Date().toISOString().split('T')[0]
      if (dateValue === today) {
        const year = new Date().getFullYear()
        dateValue = `${year}-01-01`
        // Auto-save the corrected default
        await axios.put('http://localhost:8000/api/settings/reference_date', {
          value: dateValue
        })
      }

      setReferenceDate(dateValue)
    } catch (err) {
      setError('Failed to load settings: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!referenceDate) {
      setError('Reference date is required')
      return
    }

    try {
      await axios.put('http://localhost:8000/api/settings/reference_date', {
        value: referenceDate
      })
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      setError('Failed to save settings: ' + err.message)
    }
  }

  if (loading) return <div className="loading">Loading...</div>

  return (
    <div className="settings-page">
      <div className="page-header">
        <h1>Settings</h1>
      </div>

      {error && <div className="error">{error}</div>}
      {success && <div className="success">Settings saved successfully!</div>}

      <div className="settings-container">
        <div className="settings-card">
          <h2>Time Spent Report Settings</h2>
          <p className="setting-description">
            Set the default start date for the Time Spent report. The end date will always be today.
          </p>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label htmlFor="reference-date">Reference Start Date</label>
              <input
                id="reference-date"
                type="date"
                value={referenceDate}
                onChange={(e) => setReferenceDate(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn-save">Save Settings</button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default Settings
