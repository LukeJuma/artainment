import { useState } from 'react'
import { motion } from 'framer-motion'
import { contactAPI } from '../lib/api'
import { useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'
import { IconMail, IconMapPin, IconCheck, IconSend } from '../components/ui/Icons'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--bg-muted)',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '14px 20px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 16,
  lineHeight: 1.5,
  color: 'var(--text)',
  outline: 'none',
  transition: 'border-color 0.2s',
  minHeight: 48,
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
  appearance: 'none',
}

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', service: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { ref: infoRef, inView: infoInView } = useInView(0.2)
  const { ref: formRef, inView: formInView } = useInView(0.2)

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
    <div style={{ paddingTop: 80 }}>
      <Section>
        <div className="contact-grid" style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 100 }}>
          <motion.div ref={infoRef} initial={{ opacity: 0, x: -30 }} animate={infoInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
            <SectionLabel text="Get In Touch" />
            <h1 style={{ fontFamily: "'Chonburi', cursive", fontSize: 'clamp(36px, 5vw, 72px)', fontWeight: 700, color: 'var(--text)', lineHeight: 1, margin: '0 0 32px' }}>Let's Create<br />Something<br /><em style={{ fontFamily: "'Domine', serif", color: 'var(--red)', fontStyle: 'italic', fontWeight: 300 }}>Together.</em></h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(15px, 1.5vw, 16px)', lineHeight: 1.8, color: 'var(--text-secondary)', margin: '0 0 60px' }}>Whether you're booking a service, pitching a project, or looking to join our team — we'd love to hear from you.</p>
            {[
              { label: 'Email', value: 'hello@theartainment.co.ke', icon: <IconMail size={16} color="var(--red)" /> },
              { label: 'Location', value: 'Nairobi, Kenya', icon: <IconMapPin size={16} color="var(--red)" /> },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 28, display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                <div style={{ width: 40, height: 40, borderRadius: 6, background: 'color-mix(in srgb, var(--red) 12%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 20%, transparent)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: 4 }}>{item.label}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'var(--text)' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
          <motion.div ref={formRef} initial={{ opacity: 0, x: 30 }} animate={formInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'color-mix(in srgb, var(--red) 8%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 20%, transparent)', borderRadius: 12, padding: 'clamp(48px, 6vw, 80px) clamp(24px, 4vw, 48px)', textAlign: 'center' }}>
                <div style={{ marginBottom: 24 }}><IconCheck size={48} color="var(--red)" /></div>
                <h3 style={{ fontFamily: "'Chonburi', cursive", fontSize: 'clamp(22px, 3vw, 28px)', color: 'var(--text)', margin: '0 0 16px' }}>Message Received</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(14px, 1.5vw, 15px)', color: 'var(--text-secondary)', lineHeight: 1.7 }}>We'll be in touch within 24 hours. Thank you for reaching out to The Artainment.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && <div style={{ background: 'color-mix(in srgb, var(--red) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', borderRadius: 6, padding: '12px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--red)' }}>{error}</div>}
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Full Name</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                </div>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Email Address</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
                </div>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Service</label>
                  <select style={{ ...inputStyle, cursor: 'pointer', minHeight: 48 }} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                    <option value="" style={{ background: 'var(--bg-muted)' }}>Select a service</option>
                    <option value="Film Production" style={{ background: 'var(--bg-muted)' }}>Film Production</option>
                    <option value="Photography" style={{ background: 'var(--bg-muted)' }}>Photography</option>
                    <option value="Videography" style={{ background: 'var(--bg-muted)' }}>Videography</option>
                    <option value="Scriptwriting" style={{ background: 'var(--bg-muted)' }}>Scriptwriting</option>
                    <option value="Casting" style={{ background: 'var(--bg-muted)' }}>Casting</option>
                    <option value="Post-Production" style={{ background: 'var(--bg-muted)' }}>Post-Production</option>
                    <option value="General Enquiry" style={{ background: 'var(--bg-muted)' }}>General Enquiry</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 2, color: 'var(--text-muted)', textTransform: 'uppercase', display: 'block', marginBottom: 8 }}>Message</label>
                  <textarea style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." required />
                </div>
                <button type="submit" disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--red)', border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '0 36px', borderRadius: 6, marginTop: 8, opacity: loading ? 0.7 : 1, minHeight: 48, WebkitAppearance: 'none' }}>
                  {loading ? 'Sending...' : <><IconSend size={14} color="#fff" /> Send Message</>}
                </button>
              </form>
            )}
          </motion.div>
        </div>
      </Section>
    </div>
  )
}
