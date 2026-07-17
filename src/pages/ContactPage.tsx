import { useState } from 'react'
import { motion } from 'framer-motion'
import { contactAPI } from '../lib/api'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

const inputStyle: React.CSSProperties = { width: '100%', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 6, padding: '16px 20px', fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#fff', outline: 'none', transition: 'border-color 0.2s' }

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      await contactAPI.submit(form)
      setSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send message')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ paddingTop: 100 }}>
      <Section>
        <div className="contact-grid" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100 }}>
          <div>
            <SectionLabel text="Get In Touch" />
            <h1 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 'clamp(42px, 5vw, 72px)', fontWeight: 700, color: '#fff', lineHeight: 1, margin: '0 0 32px' }}>Let's Create<br />Something<br /><em style={{ fontFamily: 'Cormorant Garamond, serif', color: '#F7BB0E', fontStyle: 'italic', fontWeight: 300 }}>Together.</em></h1>
            <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 16, lineHeight: 1.8, color: 'rgba(255,255,255,0.5)', margin: '0 0 60px' }}>Whether you're booking a service, pitching a project, or looking to join our team — we'd love to hear from you.</p>
            {[
              { label: 'Email', value: 'hello@theartainment.co.ke' },
              { label: 'Location', value: 'Nairobi, Kenya' },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 28, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: 'rgba(240,0,0,0.12)', border: '1px solid rgba(240,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <span style={{ color: '#F00000', fontSize: 14 }}>→</span>
                </div>
                <div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: '#fff' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>
          <div>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'rgba(240,0,0,0.08)', border: '1px solid rgba(240,0,0,0.2)', borderRadius: 12, padding: '80px 48px', textAlign: 'center' }}>
                <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 64, color: '#F00000', marginBottom: 24 }}>✓</div>
                <h3 style={{ fontFamily: 'Clash Display, sans-serif', fontSize: 28, color: '#fff', margin: '0 0 16px' }}>Message Received</h3>
                <p style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 15, color: 'rgba(255,255,255,0.5)', lineHeight: 1.7 }}>We'll be in touch within 24 hours. Thank you for reaching out to The Artainment.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && <div style={{ background: 'rgba(240,0,0,0.1)', border: '1px solid rgba(240,0,0,0.3)', borderRadius: 6, padding: '12px 16px', fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: '#F00000' }}>{error}</div>}
                <div>
                  <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Full Name</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                </div>
                <div>
                  <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email Address</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
                </div>
                <div>
                  <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Service</label>
                  <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                    <option value="" style={{ background: '#29282C' }}>Select a service</option>
                    <option value="Film Production" style={{ background: '#29282C' }}>Film Production</option>
                    <option value="Photography" style={{ background: '#29282C' }}>Photography</option>
                    <option value="Videography" style={{ background: '#29282C' }}>Videography</option>
                    <option value="Scriptwriting" style={{ background: '#29282C' }}>Scriptwriting</option>
                    <option value="Casting" style={{ background: '#29282C' }}>Casting</option>
                    <option value="Post-Production" style={{ background: '#29282C' }}>Post-Production</option>
                    <option value="General Enquiry" style={{ background: '#29282C' }}>General Enquiry</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 2, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Message</label>
                  <textarea style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." required />
                </div>
                <button type="submit" disabled={loading}
                  style={{ background: '#F00000', border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '18px 36px', borderRadius: 6, marginTop: 8, opacity: loading ? 0.7 : 1 }}>
                  {loading ? 'Sending...' : 'Send Message →'}
                </button>
              </form>
            )}
          </div>
        </div>
      </Section>
    </div>
  )
}
