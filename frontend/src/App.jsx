import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'
import DailyActivity from './pages/DailyActivity'
import Tasks from './pages/Tasks'
import TimeSpent from './pages/TimeSpent'
import Settings from './pages/Settings'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">Time Tracker</div>
          <div className="nav-links">
            <Link to="/">Daily Activity</Link>
            <Link to="/tasks">Tasks</Link>
            <Link to="/time-spent">Time Spent</Link>
            <Link to="/settings">Settings</Link>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DailyActivity />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/time-spent" element={<TimeSpent />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
