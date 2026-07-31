import { useState } from 'react'
import { motion } from 'framer-motion'
import { Bell, Mail, MessageSquare, Send, Clock, Users, Filter, Search, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { newsAPI } from '../../lib/api'

const templates = [
  { id: 1, name: 'Welcome Email', channel: 'Email', lastUsed: '2 hr ago', sent: 1247 },
  { id: 2, name: 'Payment Confirmation', channel: 'Push + Email', lastUsed: '15 min ago', sent: 8920 },
  { id: 3, name: 'Event Reminder', channel: 'Push + SMS', lastUsed: '1 day ago', sent: 3450 },
  { id: 4, name: 'Mic Mtaani Vote', channel: 'Push', lastUsed: '30 min ago', sent: 62000 },
  { id: 5, name: 'Subscription Renewal', channel: 'Email + SMS', lastUsed: '3 hr ago', sent: 2100 },
]

export function NotificationsPage() {
  const [tab, setTab] = useState<'templates' | 'history'>('templates')
  const { data: news } = useApi(() => newsAPI.list(), [])

  const recentNotifications = (news || []).map(n => ({
    id: n.id,
    title: n.title,
    message: n.excerpt || '',
    type: 'Content',
    time: n.published_at || '',
    sent: 1,
  }))

  return (
    <div>
      <PageHeader title="Notifications" description="Manage push, email, and SMS notifications" actions={<button className="admin-btn admin-btn-primary"><Send size={15} /> New Notification</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Push Sent Today', value: '12.4K', icon: Bell, color: '#3B82F6' },
          { label: 'Emails Delivered', value: '4,521', icon: Mail, color: '#8B5CF6' },
          { label: 'SMS Sent', value: '1,200', icon: MessageSquare, color: '#2DD36F' },
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
        <button className={`admin-tab${tab === 'templates' ? ' active' : ''}`} onClick={() => setTab('templates')}>Templates</button>
        <button className={`admin-tab${tab === 'history' ? ' active' : ''}`} onClick={() => setTab('history')}>History</button>
      </div>
      {tab === 'templates' ? (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead><tr><th>Template</th><th>Channel</th><th>Sent</th><th>Last Used</th></tr></thead>
            <tbody>
              {templates.map((t, idx) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + idx * 0.03 }}>
                  <td className="cell-primary">{t.name}</td>
                  <td><span className="badge badge-neutral">{t.channel}</span></td>
                  <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>{t.sent.toLocaleString()}</td>
                  <td style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>{t.lastUsed}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {recentNotifications.map((n, idx) => (
            <motion.div key={n.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.04 }} className="admin-card" style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(255,255,255,.04)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-text-secondary)' }}><Bell size={15} /></div>
              <div style={{ flex: 1 }}><div style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text)' }}>{n.title}</div><div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{n.message}</div></div>
              <span className="badge badge-neutral">{n.type}</span>
              <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{n.time}</span>
            </motion.div>
          ))}
        </div>
      )}
      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: repeat(3"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
