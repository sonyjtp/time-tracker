/**
 * Utility functions for time and date formatting
 */

export const formatTimeHHMM = (time) => {
  if (!time) return '-'
  return time.slice(0, 5)
}

export const calculateDurationHours = (startTime, endTime) => {
  if (!startTime || !endTime) return 0
  const start = new Date(`2000-01-01T${startTime}`)
  const end = new Date(`2000-01-01T${endTime}`)
  return (end - start) / (1000 * 60 * 60)
}

export const formatDate = (dateObj) => {
  // Use local date to avoid timezone issues
  const year = dateObj.getFullYear()
  const month = String(dateObj.getMonth() + 1).padStart(2, '0')
  const day = String(dateObj.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Get today's date in local timezone as YYYY-MM-DD
 * @returns {string} - Today's date in YYYY-MM-DD format
 */
export const getTodayLocalDate = () => {
  return formatDate(new Date())
}

/**
 * Convert decimal hours to HH:MM format
 * @param {number} decimalHours - Hours in decimal format (e.g., 1.92)
 * @returns {string} - Time in HH:MM format (e.g., "1:55")
 */
export const formatHoursToHHMM = (decimalHours) => {
  if (typeof decimalHours !== 'number' || decimalHours < 0) {
    return '-'
  }

  const hours = Math.floor(decimalHours)
  const minutes = Math.round((decimalHours - hours) * 60)

  // Handle edge case where rounding minutes gives 60
  if (minutes === 60) {
    return `${hours + 1}:00`
  }

  return `${hours}:${minutes.toString().padStart(2, '0')}`
}

export const getDateInCT = () => {
  const now = new Date()
  // Get CT time as a formatted string
  const ctTimeString = now.toLocaleString('en-US', {
    timeZone: 'America/Chicago',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  // Parse the string MM/DD/YYYY and convert to YYYY-MM-DD
  const [month, day, year] = ctTimeString.split('/')
  return `${year}-${month}-${day}`
}

/**
 * Parse a YYYY-MM-DD date string and create a Date object in local timezone
 * @param {string} dateStr - Date string in YYYY-MM-DD format
 * @returns {Date} - Date object representing that date in local timezone
 */
export const parseDateStringToLocal = (dateStr) => {
  const [year, month, day] = dateStr.split('-')
  // Create a date in the local timezone by using the parsed components directly
  return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
}

export const formatDateToCT = (dateString) => {
  if (!dateString) return '-'
  // Backend already returns dates in CT (YYYY-MM-DD format)
  // Just parse and reformat without timezone conversion
  const [year, month, day] = dateString.split('-')
  return `${year}/${month}/${day}`
}
