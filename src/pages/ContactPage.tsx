import { useState } from 'react'
import { motion } from 'framer-motion'
import { contactAPI } from '../lib/api'
import { useInView } from '../lib/animations'
import { Section } from '../components/ui/Section'
import { Breadcrumbs } from '../components/ui/Breadcrumbs'
import { IconMail, IconMapPin, IconCheck, IconSend, IconArrowRight } from '../components/ui/Icons'

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--ds-chip-bg)',
  border: '1px solid transparent',
  borderRadius: 'var(--ds-radius-md)',
  padding: '16px 20px',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: 15,
  lineHeight: 1.5,
  color: 'var(--ds-text)',
  outline: 'none',
  transition: 'border-color 0.2s, background 0.2s',
  minHeight: 52,
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
  const { ref, inView } = useInView(0.1)

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

  const methods = [
    { label: 'Email us', value: 'hello@theartainment.co.ke', href: 'mailto:hello@theartainment.co.ke', icon: <IconMail size={18} /> },
    { label: 'Our studio', value: 'Nairobi, Kenya', href: undefined as string | undefined, icon: <IconMapPin size={18} /> },
    { label: 'Response time', value: 'Within 24 hours', href: undefined as string | undefined, icon: <IconCheck size={18} /> },
  ]

  return (
    <div style={{ paddingTop: 80 }}>
      <Section style={{ position: 'relative', overflow: 'hidden' }}>
        {/* Ghost backdrop word */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute', top: 24, left: 0, right: 0, textAlign: 'center',
            fontFamily: "'Bebas Neue', sans-serif", fontSize: 'clamp(90px, 18vw, 240px)',
            lineHeight: 1, color: 'var(--ds-text)', opacity: 0.05,
            letterSpacing: '0.04em', pointerEvents: 'none', userSelect: 'none', whiteSpace: 'nowrap',
          }}
        >
          CONTACT
        </div>
        <div ref={ref} style={{ maxWidth: 1100, margin: '0 auto', position: 'relative' }}>
          <div style={{ marginBottom: 28 }}>
            <Breadcrumbs items={[{ label: 'Home', to: '/' }, { label: 'Contact' }]} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 400px) 1fr', gap: 'clamp(28px, 5vw, 64px)', alignItems: 'start' }} className="contact-split">
            {/* Left: pitch + method cards */}
            <motion.div initial={{ opacity: 0, x: -24 }} animate={inView ? { opacity: 1, x: 0 } : {}} transition={{ duration: 0.6 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <span style={{ width: 28, height: 2, background: 'var(--ds-gold-cta)' }} />
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 11, letterSpacing: 3, color: 'var(--ds-gold-cta)', textTransform: 'uppercase', fontWeight: 700 }}>
                  Contact
                </span>
              </div>
              <h1 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 'clamp(44px, 6vw, 72px)', lineHeight: 0.95, color: 'var(--ds-text)', margin: '0 0 14px' }}>
                Get in touch
              </h1>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: 'var(--ds-text-2)', margin: '0 0 28px', maxWidth: 360 }}>
                Booking a shoot, pitching a project, or saying hello - we reply within 24 hours.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {methods.map(m => {
                  const inner = (
                    <>
                      <span style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--ds-chip-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ds-gold-cta)', flexShrink: 0 }}>
                        {m.icon}
                      </span>
                      <span style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, color: 'var(--ds-text)' }}>
                          {m.label}
                        </span>
                        <span style={{ display: 'block', fontFamily: "'DM Sans', sans-serif", fontSize: 13, color: 'var(--ds-text-2)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {m.value}
                        </span>
                      </span>
                      {m.href && <IconArrowRight size={16} color="var(--ds-text-3)" />}
                    </>
                  )
                  const cardStyle: React.CSSProperties = {
                    display: 'flex', alignItems: 'center', gap: 14,
                    background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)',
                    borderRadius: 'var(--ds-radius-md)', padding: 16, boxShadow: 'var(--ds-card-shadow)',
                    textDecoration: 'none',
                  }
                  return m.href ? (
                    <a key={m.label} href={m.href} style={cardStyle}>{inner}</a>
                  ) : (
                    <div key={m.label} style={cardStyle}>{inner}</div>
                  )
                })}
              </div>
            </motion.div>

            {/* Right: glass form */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              animate={inView ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.6, delay: 0.12 }}
              style={{
                background: 'var(--ds-surface-2)', border: '1px solid var(--ds-card-line)',
                borderRadius: 'var(--ds-radius-lg)', boxShadow: 'var(--ds-card-shadow)',
                padding: 'clamp(24px, 4vw, 36px)',
              }}
            >
              {sent ? (
                <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} style={{ textAlign: 'center', padding: '40px 16px' }}>
                  <div style={{ width: 68, height: 68, borderRadius: '50%', background: 'var(--ds-brand-wash)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                    <IconCheck size={30} color="var(--ds-brand-500)" />
                  </div>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontWeight: 400, fontSize: 36, color: 'var(--ds-text)', margin: '0 0 10px' }}>
                    Message Received
                  </h3>
                  <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--ds-text-2)', lineHeight: 1.7 }}>
                    We'll be in touch within 24 hours.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {error && <div style={{ background: 'color-mix(in srgb, var(--red) 10%, transparent)', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', borderRadius: 'var(--ds-radius-md)', padding: '12px 16px', fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: 'var(--red)' }}>{error}</div>}
                  <div>
                    <label style={labelStyle}>Name</label>
                    <input style={inputStyle} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Your name" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Email</label>
                    <input style={inputStyle} type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" required />
                  </div>
                  <div>
                    <label style={labelStyle}>Service</label>
                    <select style={{ ...inputStyle, cursor: 'pointer' }} value={form.service} onChange={e => setForm({ ...form, service: e.target.value })}>
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
                    <textarea style={{ ...inputStyle, minHeight: 130, resize: 'vertical' }} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} placeholder="Tell us about your project..." required />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                      background: '#fff', color: '#141414', border: 'none',
                      cursor: loading ? 'wait' : 'pointer',
                      fontFamily: "'DM Sans', sans-serif", fontSize: 14, fontWeight: 700, letterSpacing: 0.5,
                      padding: 16, borderRadius: 'var(--ds-radius-md)', marginTop: 4,
                      opacity: loading ? 0.7 : 1, minHeight: 52,
                    }}
                  >
                    {loading ? 'Sending...' : <><IconSend size={15} color="#141414" /> Submit</>}
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        </div>
      </Section>

      <style>{`
        @media (max-width: 860px) {
          .contact-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  )
}
