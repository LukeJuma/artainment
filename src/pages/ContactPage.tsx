import { useState } from 'react'
import { motion } from 'framer-motion'
import { contactAPI } from '../lib/api'
import { useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { IconMail, IconMapPin, IconCheck, IconSend } from '../components/ui/Icons'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--ds-surface-2)',
  border: '1px solid var(--ds-card-line)',
  borderRadius: 'var(--ds-radius-md)',
  padding: '14px 20px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 16,
  lineHeight: 1.5,
  color: 'var(--ds-text)',
  outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  minHeight: 48,
  boxSizing: 'border-box',
  WebkitAppearance: 'none',
  appearance: 'none',
}

const labelStyle: React.CSSProperties = {
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 2,
  color: 'var(--ds-text-3)',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 8,
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
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <span style={{ width: 28, height: 2, background: 'var(--ds-gold-cta)' }} />
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold-cta)', textTransform: 'uppercase', fontWeight: 700 }}>
                Get In Touch
              </span>
            </div>
            <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(48px, 7vw, 92px)', fontWeight: 400, color: 'var(--ds-text)', lineHeight: 0.95, margin: '0 0 24px' }}>Let's Create<br />Something<br /><em style={{ fontFamily: "'Domine', serif", color: 'var(--ds-brand-500)', fontStyle: 'italic', fontWeight: 300 }}>Together.</em></h1>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 'clamp(15px, 1.5vw, 16px)', lineHeight: 1.8, color: 'var(--ds-text-2)', margin: '0 0 48px', maxWidth: 440 }}>Whether you're booking a service, pitching a project, or looking to join our team - we'd love to hear from you. We reply within 24 hours.</p>
            {[
              { label: 'Email', value: 'hello@theartainment.co.ke', icon: <IconMail size={16} color="var(--ds-gold-cta)" /> },
              { label: 'Studio', value: 'Nairobi, Kenya', icon: <IconMapPin size={16} color="var(--ds-gold-cta)" /> },
            ].map(item => (
              <div key={item.label} style={{ marginBottom: 20, display: 'flex', gap: 16, alignItems: 'center', background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)', borderRadius: 'var(--ds-radius-md)', padding: '14px 18px', boxShadow: 'var(--ds-card-shadow)' }}>
                <div style={{ width: 42, height: 42, borderRadius: '50%', background: 'var(--ds-brand-wash)', border: '1px solid var(--ds-card-line)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {item.icon}
                </div>
                <div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: 2, color: 'var(--ds-text-3)', textTransform: 'uppercase', marginBottom: 2 }}>{item.label}</div>
                  <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, fontWeight: 600, color: 'var(--ds-text)' }}>{item.value}</div>
                </div>
              </div>
            ))}
          </motion.div>
          <motion.div ref={formRef} initial={{ opacity: 0, x: 30 }} animate={formInView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6, delay: 0.15 }}>
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                style={{ background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)', borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-card-shadow)', padding: 'clamp(48px, 6vw, 80px) clamp(24px, 4vw, 48px)', textAlign: 'center' }}>
                <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'var(--ds-brand-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                  <IconCheck size={32} color="var(--ds-brand-500)" />
                </div>
                <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(30px, 4vw, 40px)', color: 'var(--ds-text)', margin: '0 0 12px' }}>Message Received</h3>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: 'var(--ds-text-2)', lineHeight: 1.7 }}>We'll be in touch within 24 hours. Thank you for reaching out to The Artainment.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} style={{ background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)', borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-card-shadow)', padding: 'clamp(24px, 4vw, 40px)', display: 'flex', flexDirection: 'column', gap: 20 }}>
                {error && <div style={{ background: 'color-mix(in srgb, var(--red) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', borderRadius: 'var(--ds-radius-md)', padding: '12px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--red)' }}>{error}</div>}
                <div>
                  <label style={labelStyle}>Full Name</label>
                  <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                </div>
                <div>
                  <label style={labelStyle}>Email Address</label>
                  <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="your@email.com" required />
                </div>
                <div>
                  <label style={labelStyle}>Service</label>
                  <select style={{ ...inputStyle, cursor: 'pointer', minHeight: 48 }} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
                    <option value="">Select a service</option>
                    <option value="Photography">Photography</option>
                    <option value="Videography">Videography</option>
                    <option value="Streaming">Streaming</option>
                    <option value="Film Production">Film Production</option>
                    <option value="Scriptwriting">Scriptwriting</option>
                    <option value="Casting">Casting</option>
                    <option value="Post-Production">Post-Production</option>
                    <option value="General Enquiry">General Enquiry</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Message</label>
                  <textarea style={{ ...inputStyle, minHeight: 140, resize: 'vertical' }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." required />
                </div>
                <button type="submit" disabled={loading}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, background: 'var(--ds-brand)', border: 'none', cursor: loading ? 'wait' : 'pointer', fontFamily: "'DM Sans', sans-serif", fontSize: 13, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#fff', padding: '0 36px', borderRadius: 'var(--ds-radius-pill)', marginTop: 8, opacity: loading ? 0.7 : 1, minHeight: 52, boxShadow: 'var(--ds-shadow-glow-brand)', WebkitAppearance: 'none' }}>
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
