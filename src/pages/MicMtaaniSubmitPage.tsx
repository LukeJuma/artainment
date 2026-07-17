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
    width: '100%', padding: '10px 12px', borderRadius: 6, border: '1px solid #ddd',
    fontSize: 14, outline: 'none', fontFamily: 'DM Sans, sans-serif',
  }

  return (
    <div style={wrap}>
      <MMNavbar />
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '32px 24px' }}>
        <nav style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>
          <Link to="/micmtaani" style={{ color: '#F00000', textDecoration: 'none' }}>Mic Mtaani</Link>
          <span style={{ margin: '0 8px' }}>/</span>
          <span style={{ color: '#333' }}>Submit a Story</span>
        </nav>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: '0 0 8px', color: '#111' }}>Submit a Story</h1>
        <p style={{ fontSize: 14, color: '#888', margin: '0 0 28px' }}>Share news, events, announcements, or tips with the Nakuru community.</p>

        {msg ? (
          <div style={{ padding: 24, background: '#f0fdf4', borderRadius: 8, border: '1px solid #bbf7d0' }}>
            <p style={{ fontSize: 15, color: '#166534', margin: 0 }}>{msg}</p>
            <Link to="/micmtaani" style={{ display: 'inline-block', marginTop: 16, color: '#F00000', fontWeight: 600, textDecoration: 'none' }}>Back to Mic Mtaani</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={labelStyle}>Submission Type *</label>
              <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={inputStyle}>
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
              <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={5} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Tell us more about this story..." />
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
              padding: '14px 0', background: '#F00000', color: '#fff', border: 'none',
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

const wrap: React.CSSProperties = { minHeight: '100vh', background: '#f8f9fa', color: '#111' }
const labelStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, fontWeight: 600, color: '#333', marginBottom: 4,
}
