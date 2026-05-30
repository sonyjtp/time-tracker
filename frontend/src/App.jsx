import React from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink } from 'react-router-dom'
import DailyActivity from './pages/DailyActivity'
import Tasks from './pages/Tasks'
import TimeSpent from './pages/TimeSpent'
import Dashboard from './pages/Dashboard'
import Settings from './pages/Settings'
import './App.css'

function App() {
  return (
    <Router>
      <div className="app-container">
        <nav className="navbar">
          <div className="nav-brand">Time Tracker</div>
          <div className="nav-links">
            <NavLink to="/" end>Daily Activity</NavLink>
            <NavLink to="/tasks">Tasks</NavLink>
            <NavLink to="/time-spent">Time Spent</NavLink>
            <NavLink to="/dashboard">Dashboard</NavLink>
            <NavLink to="/settings">Settings</NavLink>
          </div>
        </nav>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<DailyActivity />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/time-spent" element={<TimeSpent />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </main>
      </div>
    </Router>
  )
}

export default App
