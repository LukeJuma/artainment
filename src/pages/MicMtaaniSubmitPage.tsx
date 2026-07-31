import { useState } from 'react'
import { Link } from 'react-router-dom'
import { mmAPI } from '../lib/api'
import { MMNavbar } from '../components/micmtaani/MMNavbar'
import { MMFooter } from '../components/micmtaani/MMFooter'

export function MicMtaaniSubmitPage() {
  const [form, setForm] = useState({
    type: 'news_tip', title: '', description: '',
    submitter_name: '', submitter_email: '', submitter_phone: '', media_url: '',
  })
  const [msg, setMsg] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await mmAPI.submit(form)
      setMsg('Thank you! Your submission has been received and will be reviewed before publishing.')
      setForm({ type: 'news_tip', title: '', description: '', submitter_name: '', submitter_email: '', submitter_phone: '', media_url: '' })
    } catch {
      setMsg('Something went wrong. Please try again.')
    }
    setLoading(false)
  }

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '12px 12px', borderRadius: 6, border: '1px solid var(--border)',
    fontSize: 16, outline: 'none', fontFamily: 'DM Sans, sans-serif', background: 'var(--bg)', color: 'var(--text)',
    minHeight: 48, boxSizing: 'border-box',
  }

  return (
    <div style={wrap}>
      <MMNavbar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: 16 }}>
        <nav style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          <Link to="/micmtaani" style={{ color: 'var(--red)', textDecoration: 'none', minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>Mic Mtaani</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: 'var(--text)' }}>Submit a Story</span>
        </nav>
        <h1 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 700, margin: '0 0 8px', color: 'var(--text)' }}>Submit a Story</h1>
        <p style={{ fontSize: 14, color: 'var(--text-muted)', margin: '0 0 28px' }}>Share news, events, announcements, or tips with the Nakuru community.</p>

        {msg ? (
          <div style={{ padding: 24, background: 'var(--bg-muted)', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: 'clamp(14px, 2.5vw, 15px)', color: '#166534', margin: 0 }}>{msg}</p>
            <Link to="/micmtaani" style={{ display: 'inline-flex', alignItems: 'center', marginTop: 16, color: 'var(--red)', fontWeight: 600, textDecoration: 'none', minHeight: 44 }}>Back to Mic Mtaani</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Submission Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ ...inputStyle, minHeight: 48 }}>
                <option value="news_tip">News Tip</option>
                <option value="event">Event</option>
                <option value="announcement">Announcement</option>
                <option value="photo">Photo</option>
                <option value="video">Video</option>
                <option value="story">Story</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Title *</label>
              <input type="text" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required style={inputStyle} placeholder="Brief title for your submission" />
            </div>
            <div>
              <label style={labelStyle}>Description</label>
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} style={{ ...inputStyle, resize: 'vertical', minHeight: 120 }} placeholder="Tell us more about this story..." />
            </div>
            <div>
              <label style={labelStyle}>Your Name *</label>
              <input type="text" value={form.submitter_name} onChange={e => setForm({ ...form, submitter_name: e.target.value })} required style={inputStyle} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={labelStyle}>Email</label>
                <input type="email" value={form.submitter_email} onChange={e => setForm({ ...form, submitter_email: e.target.value })} style={inputStyle} />
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input type="tel" value={form.submitter_phone} onChange={e => setForm({ ...form, submitter_phone: e.target.value })} style={inputStyle} placeholder="+254..." />
              </div>
            </div>
            <div>
              <label style={labelStyle}>Media URL (optional)</label>
              <input type="url" value={form.media_url} onChange={e => setForm({ ...form, media_url: e.target.value })} style={inputStyle} placeholder="Link to photo, video, or document" />
            </div>
            <button type="submit" disabled={loading} style={{
              padding: '14px 0', minHeight: 48, background: 'var(--red)', color: '#fff', border: 'none',
              borderRadius: 6, fontSize: 14, fontWeight: 600, cursor: loading ? 'wait' : 'pointer',
              letterSpacing: 0.5, opacity: loading ? 0.7 : 1,
            }}>{loading ? 'Submitting...' : 'Submit Story'}</button>
          </form>
        )}
      </div>
      <MMFooter />
    </div>
  )
}

const wrap: React.CSSProperties = { minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text)', marginBottom: 4,
}
