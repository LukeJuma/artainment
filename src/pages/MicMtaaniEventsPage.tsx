import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { mmAPI, MMEvent } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'
import { IconClock, IconMapPin, IconStar } from '../components/ui/Icons'

export function MicMtaaniEventsPage() {
  const [events, setEvents] = useState<MMEvent[]>([])
  const [error, setError] = useState('')
  const [filter, setFilter] = useSearchParams()
  const cat = filter.get('cat') || ''

  useEffect(() => {
    mmAPI.events().then(setEvents).catch(e => setError(e.message))
  }, [])

  const categories = [...new Set(events.map(e => e.category))]
  const filtered = cat ? events.filter(e => e.category === cat) : events

  return (
    <div style={wrap}>
      <MMNavbar />
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: 16 }}>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>Events</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 24px' }}>{'What\'s happening in Nakuru County.'}</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => { const p = new URLSearchParams(filter); p.delete('cat'); setFilter(p) }} style={{
            padding: '8px 16px', minHeight: 44, borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: !cat ? 'var(--red)' : 'var(--border)', color: !cat ? '#fff' : 'var(--text-secondary)',
            display: 'inline-flex', alignItems: 'center',
          }}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => { const p = new URLSearchParams(filter); p.set('cat', c); setFilter(p) }} style={{
              padding: '8px 16px', minHeight: 44, borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: cat === c ? '#2563EB' : 'var(--border)', color: cat === c ? '#fff' : 'var(--text-secondary)',
              textTransform: 'capitalize', display: 'inline-flex', alignItems: 'center',
            }}>{c}</button>
          ))}
        </div>

        {error && <p style={{ color: 'var(--red)' }}>{error}</p>}
        {!events.length && !error ? <Loader /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(300px, 100%), 1fr))', gap: 16 }}>
            {filtered.map(ev => (
              <div key={ev.id} style={{ background: 'var(--bg)', borderRadius: 8, padding: 24, border: '1px solid var(--border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: '#9333EA', padding: '2px 8px', borderRadius: 3, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>{ev.category}</span>
                  {ev.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase', display: 'inline-flex', alignItems: 'center', gap: 4 }}><IconStar size={12} color="#F59E0B" filled /> FEATURED</span>}
                </div>
                <h3 style={{ fontSize: 'clamp(16px, 3vw, 18px)', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>{ev.title}</h3>
                <p style={{ fontSize: 'clamp(14px, 2.5vw, 14px)', color: 'var(--text-secondary)', margin: '0 0 12px', lineHeight: 1.5 }}>{ev.description}</p>
                <div style={{ fontSize: 13, color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconClock size={14} /> {new Date(ev.starts_at).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}{ev.ends_at ? ` - ${new Date(ev.ends_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}` : ''}</span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><IconMapPin size={14} /> {ev.location}</span>
                  {ev.organizer && <span>Organized by {ev.organizer}</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: 60, gridColumn: '1/-1' }}>No events found.</p>}
          </div>
        )}
      </div>
      <MMFooter />
    </div>
  )
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }
