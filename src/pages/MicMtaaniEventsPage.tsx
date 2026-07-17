import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { mmAPI, MMEvent } from '../lib/api'
import { Loader } from '../components/ui/Loader'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'

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
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>Events</h1>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 24px' }}>What's happening in Nakuru County.</p>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          <button onClick={() => { const p = new URLSearchParams(filter); p.delete('cat'); setFilter(p) }} style={{
            padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            background: !cat ? '#F00000' : '#eee', color: !cat ? '#fff' : '#555',
          }}>All</button>
          {categories.map(c => (
            <button key={c} onClick={() => { const p = new URLSearchParams(filter); p.set('cat', c); setFilter(p) }} style={{
              padding: '6px 16px', borderRadius: 20, border: 'none', fontSize: 13, fontWeight: 500, cursor: 'pointer',
              background: cat === c ? '#2563EB' : '#eee', color: cat === c ? '#fff' : '#555',
              textTransform: 'capitalize',
            }}>{c}</button>
          ))}
        </div>

        {error && <p style={{ color: '#DC2626' }}>{error}</p>}
        {!events.length && !error ? <Loader /> : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(ev => (
              <div key={ev.id} style={{ background: '#fff', borderRadius: 8, padding: 24, border: '1px solid #eee' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', color: '#fff', background: '#9333EA', padding: '2px 8px', borderRadius: 3 }}>{ev.category}</span>
                  {ev.is_featured && <span style={{ fontSize: 10, fontWeight: 700, color: '#F59E0B', textTransform: 'uppercase' }}>FEATURED</span>}
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>{ev.title}</h3>
                <p style={{ fontSize: 14, color: '#555', margin: '0 0 12px', lineHeight: 1.5 }}>{ev.description}</p>
                <div style={{ fontSize: 13, color: '#777', display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span>{new Date(ev.starts_at).toLocaleDateString('en-KE', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}{ev.ends_at ? ` - ${new Date(ev.ends_at).toLocaleDateString('en-KE', { month: 'short', day: 'numeric' })}` : ''}</span>
                  <span>{ev.location}</span>
                  {ev.organizer && <span>Organized by {ev.organizer}</span>}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <p style={{ textAlign: 'center', color: '#999', padding: 60, gridColumn: '1/-1' }}>No events found.</p>}
          </div>
        )}
      </div>
      <MMFooter />
    </div>
  )
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: '#f8f9fa', color: '#111' }
