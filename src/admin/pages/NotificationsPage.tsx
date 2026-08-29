import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, Mail, MessageSquare, Send, X, Loader2, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI } from '../../lib/api'

interface NotifForm {
  title: string
  message: string
  channel: string
  sent_count: string
  sent_at: string
}

const emptyForm: NotifForm = { title: '', message: '', channel: 'email', sent_count: '', sent_at: '' }

const channelBadge: Record<string, string> = { email: 'badge-neutral', push: 'badge-info', sms: 'badge-warning' }

export function NotificationsPage() {
  const { token } = useAuth()
  const [tab, setTab] = useState<'templates' | 'history'>('templates')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState<NotifForm>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: notifications, loading, refetch } = useApi(() => adminAPI.notifications(token!), [token])

  const pushSent = (notifications ?? []).filter(n => n.channel === 'push').reduce((s, n) => s + n.sent_count, 0)
  const emailsSent = (notifications ?? []).filter(n => n.channel === 'email').reduce((s, n) => s + n.sent_count, 0)
  const smsSent = (notifications ?? []).filter(n => n.channel === 'sms').reduce((s, n) => s + n.sent_count, 0)

  const openCreate = () => {
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!token) return
    if (!form.title.trim()) { setFormError('Title is required.'); return }
    setFormLoading(true)
    setFormError('')
    try {
      await adminAPI.createNotification(token, {
        title: form.title.trim(),
        message: form.message.trim() || null,
        channel: form.channel,
        sent_count: Number(form.sent_count) || 0,
        sent_at: form.sent_at || null,
      })
      setShowModal(false)
      refetch()
    } catch (e: any) {
      setFormError(e.message || 'Failed to create notification.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!token) return
    if (!confirm('Delete this notification?')) return
    try { await adminAPI.deleteNotification(token, id); refetch() } catch {}
  }

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Manage push, email, and SMS notifications"
        actions={<button className="admin-btn admin-btn-primary" onClick={openCreate}><Send size={15} /> New Notification</button>}
      />
      {/* Preview banner */}
      <div style={{
        padding: '10px 16px',
        borderRadius: 8,
        background: 'var(--admin-accent-glow, rgba(251,191,36,0.1))',
        border: '1px solid var(--admin-accent, #f59e0b)',
        color: 'var(--admin-accent, #f59e0b)',
        fontSize: 12,
        fontWeight: 600,
        fontFamily: "'DM Sans', sans-serif",
        letterSpacing: 0.5,
        marginBottom: 20,
      }}>
        PREVIEW — This section is not yet connected to live data.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Push Sent', value: pushSent.toLocaleString(), icon: Bell, color: '#3B82F6' },
          { label: 'Emails Delivered', value: emailsSent.toLocaleString(), icon: Mail, color: '#8B5CF6' },
          { label: 'SMS Sent', value: smsSent.toLocaleString(), icon: MessageSquare, color: '#2DD36F' },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '16px 18px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}><Icon size={18} strokeWidth={2} /></div>
              <div><div style={{ fontSize: 20, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.value}</div><div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{item.label}</div></div>
            </motion.div>
          )
        })}
      </div>
      <div className="admin-tabs">
        <button className={`admin-tab${tab === 'templates' ? ' active' : ''}`} onClick={() => setTab('templates')}>All Notifications</button>
        <button className={`admin-tab${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
          <Loader2 size={28} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
        </div>
      ) : (notifications ?? []).length === 0 ? (
        <div className="admin-empty">
          <Bell size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
          <h3>No notifications yet</h3>
          <p>Create your first notification to get started.</p>
        </div>
      ) : tab === 'templates' ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Title</th><th>Channel</th><th>Sent</th><th>Sent At</th><th></th></tr></thead>
            <tbody>
              {(notifications ?? []).map((n, idx) => (
                <motion.tr key={n.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + idx * 0.03 }}>
                  <td className="cell-primary">{n.title}</td>
                  <td><span className={`badge ${channelBadge[n.channel] || 'badge-neutral'}`}>{n.channel}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{n.sent_count.toLocaleString()}</td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>{n.sent_at ? new Date(n.sent_at).toLocaleString() : 'Not sent'}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button className="admin-btn admin-btn-danger admin-btn-sm" style={{ padding: 5 }} onClick={() => handleDelete(n.id)}><Trash2 size={14} /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {(notifications ?? []).map((n, idx) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.04 }} className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-secondary)' }}><Bell size={15} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)' }}>{n.title}</div><div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{n.message || ''}</div></div>
              <span className={`badge ${channelBadge[n.channel] || 'badge-neutral'}`}>{n.channel}</span>
              <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{n.sent_at ? new Date(n.sent_at).toLocaleString() : 'Not sent'}</span>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {showModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 520 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>New Notification</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>
                    {formError}
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Title *</label>
                  <input className="admin-input" placeholder="e.g. Payment Confirmation" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Message</label>
                  <textarea className="admin-textarea" rows={3} placeholder="Notification message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Channel</label>
                    <select className="admin-select" style={{ width: '100%' }} value={form.channel} onChange={e => setForm({ ...form, channel: e.target.value })}>
                      <option value="email">Email</option>
                      <option value="push">Push</option>
                      <option value="sms">SMS</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Recipients Sent</label>
                    <input className="admin-input" type="number" min="0" placeholder="0" value={form.sent_count} onChange={e => setForm({ ...form, sent_count: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label className="admin-label">Sent At</label>
                  <input className="admin-input" type="datetime-local" value={form.sent_at} onChange={e => setForm({ ...form, sent_at: e.target.value })} />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSubmit} disabled={formLoading}>
                  {formLoading ? 'Saving...' : 'Create Notification'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
