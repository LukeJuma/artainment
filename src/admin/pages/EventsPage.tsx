import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, Plus, Calendar, MapPin, Users, Clock, Ticket, Eye,
  MoreHorizontal, X, DollarSign, QrCode, Star,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { mmAPI, adminAPI, type MMEvent } from '../../lib/api'

interface Event {
  id: number
  title: string
  venue: string
  date: string
  time: string
  capacity: number
  sold: number
  ticketTypes: string[]
  revenue: string
  status: 'Live' | 'Upcoming' | 'Sold Out' | 'Cancelled'
  featured: boolean
}

function mapMMEvent(e: MMEvent): Event {
  const startsAt = new Date(e.starts_at)
  const now = new Date()
  return {
    id: e.id,
    title: e.title,
    venue: e.location,
    date: e.starts_at,
    time: startsAt.toLocaleTimeString(),
    capacity: 1000,
    sold: 0,
    ticketTypes: ['Regular'],
    revenue: '-',
    status: startsAt > now ? 'Upcoming' : 'Live',
    featured: e.is_featured,
  }
}

const statusConfig: Record<string, { bg: string; color: string }> = {
  Live: { bg: 'var(--admin-danger)', color: '#fff' },
  Upcoming: { bg: 'var(--admin-info-glow)', color: 'var(--admin-info)' },
  'Sold Out': { bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  Cancelled: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)' },
}

export function EventsPage() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)

  const [formTitle, setFormTitle] = useState('')
  const [formVenue, setFormVenue] = useState('')
  const [formCapacity, setFormCapacity] = useState('')
  const [formDate, setFormDate] = useState('')
  const [formTime, setFormTime] = useState('')
  const [formBasePrice, setFormBasePrice] = useState('')
  const [formVipPrice, setFormVipPrice] = useState('')
  const [formTickets, setFormTickets] = useState<string[]>([])
  const [creating, setCreating] = useState(false)

  const { data: rawEvents, loading, refetch } = useApi<MMEvent[]>(() => mmAPI.events(), [])
  const events: Event[] = (rawEvents || []).map(mapMMEvent)

  const filtered = events.filter(e => e.title.toLowerCase().includes(search.toLowerCase()))

  const totalEvents = events.length
  const totalSold = events.reduce((sum, e) => sum + e.sold, 0)
  const liveCount = events.filter(e => e.status === 'Live').length
  const avgCapacity = events.length > 0
    ? Math.round(events.reduce((sum, e) => sum + (e.capacity > 0 ? (e.sold / e.capacity) * 100 : 0), 0) / events.length)
    : 0

  const handleCreate = async () => {
    if (!token || !formTitle || !formVenue) return
    setCreating(true)
    try {
      await adminAPI.mmCreateEvent(token, {
        title: formTitle,
        location: formVenue,
        category: 'Event',
        starts_at: formDate && formTime ? `${formDate}T${formTime}:00` : new Date().toISOString(),
        is_featured: false,
        status: 'upcoming',
      })
      setShowModal(false)
      setFormTitle('')
      setFormVenue('')
      setFormCapacity('')
      setFormDate('')
      setFormTime('')
      setFormBasePrice('')
      setFormVipPrice('')
      setFormTickets([])
      refetch()
    } catch {
    } finally {
      setCreating(false)
    }
  }

  const toggleTicket = (t: string) => {
    setFormTickets(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--admin-text-muted)' }}>
        Loading events...
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Events"
        description={`${events.length} events · ${liveCount} live now`}
        actions={
          <button className="admin-btn admin-btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={15} />
            Create Event
          </button>
        }
      />

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Events', value: String(totalEvents), icon: Calendar, color: '#FF4D2D', change: '+2' },
          { label: 'Tickets Sold', value: totalSold.toLocaleString(), icon: Ticket, color: '#3B82F6', change: '+12%' },
          { label: 'Revenue', value: 'KES 17.8M', icon: DollarSign, color: '#2DD36F', change: '+28%' },
          { label: 'Avg. Capacity', value: `${avgCapacity}%`, icon: Users, color: '#FFB800', change: '+5%' },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06 }}
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-lg)',
                padding: '18px 20px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--admin-radius-md)',
                  background: `${item.color}14`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: item.color,
                }}>
                  <Icon size={17} strokeWidth={2} />
                </div>
                <span style={{ fontSize: 12, color: 'var(--admin-text-muted)', fontWeight: 500 }}>{item.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                <span style={{ fontSize: 24, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.value}
                </span>
                <span style={{ fontSize: 12, color: 'var(--admin-success)', fontWeight: 600 }}>{item.change}</span>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Search */}
      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search events..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {/* Events List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((event, idx) => {
          const sc = statusConfig[event.status]
          const capacityPct = (event.sold / event.capacity) * 100
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 + idx * 0.05 }}
              whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(0,0,0,.2)' }}
              style={{
                background: 'var(--admin-card)',
                border: '1px solid var(--admin-border)',
                borderRadius: 'var(--admin-radius-lg)',
                padding: '22px 24px',
                display: 'grid',
                gridTemplateColumns: 'auto 1fr auto auto',
                gap: 20,
                alignItems: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              {event.featured && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 2,
                  background: 'linear-gradient(90deg, var(--admin-primary), var(--admin-accent))',
                }} />
              )}

              {/* Date Block */}
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 'var(--admin-radius-md)',
                background: event.status === 'Live' ? 'var(--admin-danger-glow)' : 'rgba(255,255,255,.04)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>
                  {new Date(event.date).getDate()}
                </span>
                <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--admin-text-muted)', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {new Date(event.date).toLocaleDateString('en', { month: 'short' })}
                </span>
              </div>

              {/* Event Info */}
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {event.title}
                  </h3>
                  <span className="badge" style={{
                    background: event.status === 'Live' ? 'var(--admin-danger)' : sc.bg,
                    color: event.status === 'Live' ? '#fff' : sc.color,
                    animation: event.status === 'Live' ? 'livePulse 2s ease-in-out infinite' : undefined,
                  }}>
                    {event.status === 'Live' && <span className="badge-dot" style={{ background: '#fff' }} />}
                    {event.status}
                  </span>
                  {event.featured && (
                    <span className="badge badge-warning">
                      <Star size={9} style={{ fill: 'currentColor' }} />
                      Featured
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 12, color: 'var(--admin-text-muted)' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <MapPin size={12} /> {event.venue}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={12} /> {event.time}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <Ticket size={12} /> {event.ticketTypes.join(', ')}
                  </span>
                </div>
              </div>

              {/* Capacity Bar */}
              <div style={{ width: 160, flexShrink: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
                  <span style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{event.sold.toLocaleString()} / {event.capacity.toLocaleString()}</span>
                  <span style={{ fontWeight: 600, color: capacityPct >= 90 ? 'var(--admin-success)' : capacityPct >= 70 ? 'var(--admin-accent)' : 'var(--admin-text-muted)' }}>
                    {Math.round(capacityPct)}%
                  </span>
                </div>
                <div className="admin-progress">
                  <div
                    className="admin-progress-bar"
                    style={{
                      width: `${capacityPct}%`,
                      background: capacityPct >= 90 ? 'var(--admin-success)' : capacityPct >= 70 ? 'var(--admin-accent)' : 'var(--admin-primary)',
                    }}
                  />
                </div>
              </div>

              {/* Revenue + Actions */}
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--admin-success)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {event.revenue}
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 6, justifyContent: 'flex-end' }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }}>
                    <QrCode size={13} />
                  </button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }}>
                    <Eye size={13} />
                  </button>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }}>
                    <MoreHorizontal size={13} />
                  </button>
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Create Event Modal */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className="admin-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowModal(false)}
          >
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 640 }}
            >
              <div className="admin-modal-header">
                <h3>Create New Event</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowModal(false)} style={{ padding: 6 }}>
                  <X size={16} />
                </button>
              </div>
              <div className="admin-modal-body">
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="admin-label">Event Name</label>
                    <input className="admin-input" placeholder="Enter event name" value={formTitle} onChange={e => setFormTitle(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">Venue</label>
                    <input className="admin-input" placeholder="Venue name" value={formVenue} onChange={e => setFormVenue(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">Capacity</label>
                    <input className="admin-input" type="number" placeholder="Max attendees" value={formCapacity} onChange={e => setFormCapacity(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">Date</label>
                    <input className="admin-input" type="date" value={formDate} onChange={e => setFormDate(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">Time</label>
                    <input className="admin-input" type="time" value={formTime} onChange={e => setFormTime(e.target.value)} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label className="admin-label">Ticket Types</label>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {['VIP', 'Regular', 'Early Bird', 'Student'].map(t => (
                        <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border)', cursor: 'pointer', fontSize: 13, color: 'var(--admin-text-secondary)' }}>
                          <input type="checkbox" className="admin-checkbox" checked={formTickets.includes(t)} onChange={() => toggleTicket(t)} />
                          {t}
                        </label>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Base Price (KES)</label>
                    <input className="admin-input" type="number" placeholder="0" value={formBasePrice} onChange={e => setFormBasePrice(e.target.value)} />
                  </div>
                  <div>
                    <label className="admin-label">VIP Price (KES)</label>
                    <input className="admin-input" type="number" placeholder="0" value={formVipPrice} onChange={e => setFormVipPrice(e.target.value)} />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create Event'}</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
