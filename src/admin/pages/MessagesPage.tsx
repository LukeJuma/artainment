import { useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Search, Paperclip } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI } from '../../lib/api'

export function MessagesPage() {
  const { token } = useAuth()
  const { data: contacts, loading } = useApi(() => adminAPI.contacts(token!), [token])

  const conversations = (contacts || []).map(c => ({
    id: c.id,
    name: c.name,
    lastMessage: c.message,
    time: c.created_at,
    unread: c.status === 'pending' ? 1 : 0,
    online: false,
  }))

  const [selected, setSelected] = useState(conversations[0] || { id: 0, name: '', lastMessage: '', time: '', unread: 0, online: false })

  if (loading) {
    return (
      <div>
        <PageHeader title="Messages" description="Direct messages and support conversations" />
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 60, color: 'var(--admin-text-muted)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Messages" description="Direct messages and support conversations" />
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 0, borderRadius: 'var(--admin-radius-lg)', border: '1px solid var(--admin-border)', overflow: 'hidden', height: 500 }}>
        {/* Conversations List */}
        <div style={{ background: 'var(--admin-card)', borderRight: '1px solid var(--admin-border)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 14, borderBottom: '1px solid var(--admin-border)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--admin-bg)', borderRadius: 'var(--admin-radius-md)', padding: '8px 12px', border: '1px solid var(--admin-border)' }}>
              <Search size={14} style={{ color: 'var(--admin-text-muted)' }} />
              <input type="text" placeholder="Search..." style={{ flex: 1, background: 'none', border: 'none', outline: 'none', color: 'var(--admin-text)', fontSize: 13, fontFamily: 'Inter, sans-serif' }} />
            </div>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {conversations.map((c, idx) => (
              <motion.div key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: idx * 0.04 }}
                onClick={() => setSelected(c)}
                style={{ padding: '14px 16px', cursor: 'pointer', background: selected.id === c.id ? 'var(--admin-primary-glow)' : 'transparent', borderLeft: selected.id === c.id ? '3px solid var(--admin-primary)' : '3px solid transparent', transition: 'all 0.15s' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ position: 'relative' }}>
                    <div style={{ width: 36, height: 36, borderRadius: '50%', background: `linear-gradient(135deg, ${idx % 2 === 0 ? '#3B82F6, #8B5CF6' : '#FF4D2D, #FFB800'})`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 12, color: '#fff' }}>
                      {c.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    {c.online && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 10, height: 10, borderRadius: '50%', background: 'var(--admin-success)', border: '2px solid var(--admin-card)' }} />}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{c.name}</span>
                      <span style={{ fontSize: 10, color: 'var(--admin-text-muted)' }}>{c.time}</span>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.lastMessage}</div>
                  </div>
                  {c.unread > 0 && <div style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--admin-primary)', color: '#fff', fontSize: 10, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{c.unread}</div>}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div style={{ background: 'var(--admin-bg)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--admin-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{selected.name}</span>
              <span style={{ fontSize: 11, color: selected.online ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>{selected.online ? 'Online' : 'Offline'}</span>
            </div>
          </div>
          <div style={{ flex: 1, padding: 20, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: 12 }}>
            <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: '14px 14px 14px 4px', background: 'var(--admin-card)', border: '1px solid var(--admin-border)', fontSize: 13, color: 'var(--admin-text-secondary)', lineHeight: 1.5 }}>
              Hi! How can I help you today?
            </div>
            <div style={{ maxWidth: '70%', padding: '12px 16px', borderRadius: '14px 14px 4px 14px', background: 'var(--admin-primary)', color: '#fff', fontSize: 13, lineHeight: 1.5, alignSelf: 'flex-end' }}>
              {selected.lastMessage}
            </div>
          </div>
          <div style={{ padding: '14px 20px', borderTop: '1px solid var(--admin-border)', display: 'flex', gap: 8, alignItems: 'center' }}>
            <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 6 }}><Paperclip size={15} /></button>
            <input type="text" placeholder="Type a message..." style={{ flex: 1, background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-md)', padding: '9px 14px', color: 'var(--admin-text)', fontSize: 13, fontFamily: 'Inter, sans-serif', outline: 'none' }} />
            <button className="admin-btn admin-btn-primary admin-btn-sm"><Send size={14} /></button>
          </div>
        </div>
      </div>
      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 320px 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
