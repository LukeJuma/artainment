import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Menu, Search, Plus, Bell, Clock, Sun, Moon } from 'lucide-react'
import { CommandPalette } from './CommandPalette'
import { NotificationPanel } from './NotificationPanel'
import { useTheme } from '../../contexts/ThemeContext'

interface TopNavProps {
  pageTitle: string
  onToggleSidebar: () => void
  onNavigate: (page: string) => void
}

export function TopNav({ pageTitle, onToggleSidebar, onNavigate }: TopNavProps) {
  const [time, setTime] = useState(() => new Date())
  const [cmdOpen, setCmdOpen] = useState(false)
  const [notifOpen, setNotifOpen] = useState(false)
  const { theme, toggleTheme } = useTheme()

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      setCmdOpen(prev => !prev)
    }
  }, [])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  })

  const formattedDate = time.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return (
    <>
      <CommandPalette open={cmdOpen} onClose={() => setCmdOpen(false)} onNavigate={onNavigate} />

      <header className="admin-topnav">
        <div className="admin-topnav-left">
          <button onClick={onToggleSidebar} className="topnav-btn" aria-label="Toggle sidebar">
            <Menu size={17} />
          </button>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13 }}>
            <span style={{ color: 'var(--admin-text-muted)' }}>Admin</span>
            <span style={{ color: 'var(--admin-text-faint)' }}>/</span>
            <span style={{ color: 'var(--admin-text)', fontWeight: 600 }}>{pageTitle}</span>
          </div>
        </div>

        <div className="admin-topnav-center">
          <div className="admin-search" onClick={() => setCmdOpen(true)}>
            <Search size={15} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
            <input type="text" placeholder="Search anything..." readOnly />
            <span className="search-shortcut">⌘K</span>
          </div>
        </div>

        <div className="admin-topnav-right">
          <button
            className="topnav-btn"
            aria-label="Toggle theme"
            onClick={toggleTheme}
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </button>

          <button className="topnav-btn" aria-label="Quick create">
            <Plus size={17} />
          </button>

          <div style={{ position: 'relative' }}>
            <button
              className="topnav-btn"
              aria-label="Notifications"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell size={17} />
              <span className="notif-dot" />
            </button>
            <NotificationPanel open={notifOpen} onClose={() => setNotifOpen(false)} />
          </div>

          <div
            className="topnav-btn time-display"
            style={{
              width: 'auto',
              padding: '0 12px',
              gap: 6,
              fontSize: 12,
              fontWeight: 500,
              fontFamily: "'Inter', sans-serif",
              color: 'var(--admin-text-secondary)',
              cursor: 'default',
            }}
          >
            <Clock size={13} />
            <span>{formattedTime}</span>
            <span style={{ color: 'var(--admin-text-faint)', margin: '0 2px' }}>·</span>
            <span style={{ color: 'var(--admin-text-muted)' }}>{formattedDate}</span>
          </div>

          <div className="admin-topnav-profile" tabIndex={0} role="button" aria-label="Admin profile">
            <div className="avatar">A</div>
            <div className="profile-info">
              <span className="profile-name">Admin</span>
              <span className="profile-role">Super Admin</span>
            </div>
          </div>
        </div>
      </header>
    </>
  )
}
