import { motion, AnimatePresence } from 'framer-motion'
import { X, Bell, Check, Clock, AlertTriangle, DollarSign, Users, Trophy, Ticket, Settings } from 'lucide-react'

interface NotificationPanelProps {
  open: boolean
  onClose: () => void
}

const notifications = [
  {
    id: 1,
    icon: DollarSign,
    color: '#2DD36F',
    title: 'Payment received',
    desc: 'KES 45,000 from Premium subscription bundle',
    time: '2 min ago',
    unread: true,
  },
  {
    id: 2,
    icon: Trophy,
    color: '#FFB800',
    title: 'Mic Mtaani voting surge',
    desc: 'Season 4 finale reached 50K votes in 1 hour',
    time: '8 min ago',
    unread: true,
  },
  {
    id: 3,
    icon: Users,
    color: '#3B82F6',
    title: 'New artist verified',
    desc: 'Sauti Sol has been verified on the platform',
    time: '25 min ago',
    unread: true,
  },
  {
    id: 4,
    icon: Ticket,
    color: '#FF4D2D',
    title: 'Event nearly sold out',
    desc: 'Afrobeats Night has 95% ticket sales',
    time: '1 hr ago',
    unread: false,
  },
  {
    id: 5,
    icon: AlertTriangle,
    color: '#FF4B5C',
    title: 'Content flagged for review',
    desc: 'Reported video in Mic Mtaani submissions',
    time: '2 hr ago',
    unread: false,
  },
  {
    id: 6,
    icon: Settings,
    color: '#6B7280',
    title: 'System maintenance complete',
    desc: 'Database optimization finished successfully',
    time: '4 hr ago',
    unread: false,
  },
]

export function NotificationPanel({ open, onClose }: NotificationPanelProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            style={{ position: 'fixed', inset: 0, zIndex: 49 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="notification-panel"
            initial={{ opacity: 0, y: -8, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.97 }}
            transition={{ duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <div className="notification-panel-header">
              <h4>Notifications</h4>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ fontSize: 11 }}>
                  <Check size={13} />
                  Mark all read
                </button>
                <button
                  className="admin-btn admin-btn-ghost admin-btn-sm"
                  onClick={onClose}
                  style={{ padding: 6 }}
                >
                  <X size={14} />
                </button>
              </div>
            </div>
            <div className="notification-list">
              {notifications.map((n, idx) => {
                const Icon = n.icon
                return (
                  <motion.div
                    key={n.id}
                    className={`notification-item${n.unread ? ' unread' : ''}`}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.04 }}
                  >
                    <div
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 10,
                        background: `${n.color}18`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: n.color,
                        flexShrink: 0,
                      }}
                    >
                      <Icon size={16} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)', marginBottom: 2 }}>
                        {n.title}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', lineHeight: 1.4 }}>
                        {n.desc}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--admin-text-faint)', marginTop: 4, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Clock size={10} />
                        {n.time}
                      </div>
                    </div>
                    {n.unread && (
                      <div style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: 'var(--admin-primary)',
                        flexShrink: 0,
                        marginTop: 4,
                      }} />
                    )}
                  </motion.div>
                )
              })}
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--admin-border)', textAlign: 'center' }}>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ width: '100%', fontSize: 12 }}>
                View all notifications
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
