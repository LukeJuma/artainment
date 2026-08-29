import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, LayoutDashboard, BarChart3, Film, Tv, Music, Podcast,
  Calendar, Trophy, Users, CreditCard, DollarSign, Star, Shield,
  Settings, Terminal,
  Ticket, ArrowRight,
} from 'lucide-react'

interface CommandPaletteProps {
  open: boolean
  onClose: () => void
  onNavigate: (page: string) => void
}

const commandItems = [
  { group: 'Navigation', items: [
    { id: 'dashboard', label: 'Dashboard', desc: 'Overview & stats', icon: LayoutDashboard, shortcut: ['G', 'D'] },
    { id: 'analytics', label: 'Analytics', desc: 'Charts & insights', icon: BarChart3 },
    { id: 'movies', label: 'Movies', desc: 'Manage films', icon: Film },
    { id: 'series', label: 'TV Series', desc: 'Manage shows', icon: Tv },
    { id: 'music', label: 'Music', desc: 'Manage music', icon: Music },
    { id: 'podcasts', label: 'Podcasts', desc: 'Manage podcasts', icon: Podcast },
    { id: 'events', label: 'Events', desc: 'Manage events', icon: Calendar },
    { id: 'micmtaani', label: 'Mic Mtaani', desc: 'Competition management', icon: Trophy },
  ]},
  { group: 'People & Commerce', items: [
    { id: 'actors', label: 'Actors', desc: 'Actor profiles', icon: Star },
    { id: 'users', label: 'Users', desc: 'User management', icon: Users },
    { id: 'subscriptions', label: 'Subscriptions', desc: 'Plans & billing', icon: CreditCard },
    { id: 'payments', label: 'Payments', desc: 'Transactions', icon: DollarSign },
    { id: 'ticketing', label: 'Ticketing', desc: 'Ticket sales', icon: Ticket },
  ]},
  { group: 'System', items: [
    { id: 'moderation', label: 'Moderation', desc: 'Content safety', icon: Shield },
    { id: 'settings', label: 'Settings', desc: 'System config', icon: Settings },
    { id: 'logs', label: 'System Logs', desc: 'Activity logs', icon: Terminal },
  ]},
]

export function CommandPalette({ open, onClose, onNavigate }: CommandPaletteProps) {
  const [query, setQuery] = useState('')
  const [activeIndex, setActiveIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  const allItems = commandItems.flatMap(g => g.items)
  const filtered = query
    ? allItems.filter(item =>
        item.label.toLowerCase().includes(query.toLowerCase()) ||
        item.desc.toLowerCase().includes(query.toLowerCase())
      )
    : allItems

  useEffect(() => {
    if (open) {
      setQuery('')
      setActiveIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [open])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex(i => Math.min(i + 1, filtered.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex(i => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && filtered[activeIndex]) {
      onNavigate(filtered[activeIndex].id)
      onClose()
    } else if (e.key === 'Escape') {
      onClose()
    }
  }, [filtered, activeIndex, onNavigate, onClose])

  useEffect(() => {
    setActiveIndex(0)
  }, [query])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="command-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={onClose}
        >
          <motion.div
            className="command-palette"
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            onClick={e => e.stopPropagation()}
          >
            <div className="command-palette-input">
              <Search size={18} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search pages, actions, settings..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <span
                style={{
                  fontSize: 11,
                  color: 'var(--admin-text-muted)',
                  border: '1px solid var(--admin-border)',
                  borderRadius: 4,
                  padding: '2px 6px',
                  background: 'var(--admin-bg)',
                  cursor: 'pointer',
                  flexShrink: 0,
                }}
                onClick={onClose}
              >
                ESC
              </span>
            </div>
            <div className="command-palette-results">
              {query ? (
                filtered.length === 0 ? (
                  <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 13 }}>
                    No results found for "{query}"
                  </div>
                ) : (
                  <div>
                    <div className="command-group-title">Results</div>
                    {filtered.map((item, idx) => {
                      const Icon = item.icon
                      return (
                        <div
                          key={item.id}
                          className={`command-item${idx === activeIndex ? ' active' : ''}`}
                          onClick={() => { onNavigate(item.id); onClose() }}
                          onMouseEnter={() => setActiveIndex(idx)}
                        >
                          <div className="command-item-icon">
                            <Icon size={16} />
                          </div>
                          <div className="command-item-text">
                            <div className="command-item-title">{item.label}</div>
                            <div className="command-item-desc">{item.desc}</div>
                          </div>
                          <ArrowRight size={14} style={{ color: 'var(--admin-text-faint)' }} />
                        </div>
                      )
                    })}
                  </div>
                )
              ) : (
                commandItems.map(group => (
                  <div key={group.group}>
                    <div className="command-group-title">{group.group}</div>
                    {group.items.map(item => {
                      const globalIdx = allItems.indexOf(item)
                      const Icon = item.icon
                      return (
                        <div
                          key={item.id}
                          className={`command-item${globalIdx === activeIndex ? ' active' : ''}`}
                          onClick={() => { onNavigate(item.id); onClose() }}
                          onMouseEnter={() => setActiveIndex(globalIdx)}
                        >
                          <div className="command-item-icon">
                            <Icon size={16} />
                          </div>
                          <div className="command-item-text">
                            <div className="command-item-title">{item.label}</div>
                            <div className="command-item-desc">{item.desc}</div>
                          </div>
                          {item.shortcut && (
                            <div className="command-item-shortcut">
                              {item.shortcut.map(k => <kbd key={k}>{k}</kbd>)}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
