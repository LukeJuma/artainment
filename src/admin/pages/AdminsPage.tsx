import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, ShieldOff, ShieldCheck, UserCog, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type AdminUser } from '../../lib/api'

const avatarGradients = [
  'linear-gradient(135deg, #FF4D2D, #FFB800)',
  'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  'linear-gradient(135deg, #2DD36F, #06B6D4)',
  'linear-gradient(135deg, #8B5CF6, #EC4899)',
  'linear-gradient(135deg, #FFB800, #FF4D2D)',
  'linear-gradient(135deg, #06B6D4, #3B82F6)',
]

interface AdminCard {
  id: number
  name: string
  email: string
  role: string
  status: 'Active' | 'Inactive'
  joined: string
  isSelf: boolean
}

function toAdminCard(u: AdminUser, selfId?: number): AdminCard {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.id === selfId ? 'Super Admin' : 'Admin',
    status: 'Active',
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    isSelf: u.id === selfId,
  }
}

export function AdminsPage() {
  const { token, user: currentUser } = useAuth()
  const { data: rawUsers, loading, refetch } = useApi<AdminUser[]>(
    () => adminAPI.users(token!),
    [token]
  )

  const [showAddModal, setShowAddModal] = useState(false)
  const [busy, setBusy] = useState<number | null>(null)

  const admins: AdminCard[] = (rawUsers ?? []).filter(u => u.is_admin).map(u => toAdminCard(u, currentUser?.id))
  const candidates = (rawUsers ?? []).filter(u => !u.is_admin)

  const demote = async (id: number) => {
    if (!token) return
    setBusy(id)
    try {
      await adminAPI.updateUserRole(token, id, false)
      refetch()
    } catch {
    } finally {
      setBusy(null)
    }
  }

  const promote = async (id: number) => {
    if (!token) return
    setBusy(id)
    try {
      await adminAPI.updateUserRole(token, id, true)
      refetch()
      setShowAddModal(false)
    } catch {
    } finally {
      setBusy(null)
    }
  }

  if (loading) {
    return (
      <div>
        <PageHeader title="Admins" description="Loading admins..." />
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-muted)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader title="Admins" description="Manage admin users and permissions" actions={<button className="admin-btn admin-btn-primary" onClick={() => setShowAddModal(true)}><Plus size={15} /> Add Admin</button>} />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {admins.map((admin, idx) => (
          <motion.div key={admin.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }} whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(0,0,0,.2)' }} className="admin-card" style={{ padding: '22px 24px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: avatarGradients[admin.id % avatarGradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 }}>{admin.name.split(' ').map(n => n[0]).join('')}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{admin.name}{admin.isSelf ? ' (you)' : ''}</div>
                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{admin.email}</div>
              </div>
              {!admin.isSelf && (
                <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5, color: 'var(--admin-danger)' }} title="Revoke admin" disabled={busy === admin.id} onClick={() => demote(admin.id)}>
                  <ShieldOff size={14} />
                </button>
              )}
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--admin-border)' }}>
              <span className="badge badge-primary"><UserCog size={10} /> {admin.role}</span>
              <span style={{ fontSize: 11, color: admin.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>
                {admin.status} &middot; Joined {admin.joined}
              </span>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {showAddModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)}>
            <motion.div
              className="admin-modal"
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              onClick={e => e.stopPropagation()}
              style={{ maxWidth: 520 }}
            >
              <div className="admin-modal-header">
                <h3>Grant Admin Access</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowAddModal(false)} style={{ padding: 6 }}>
                  <X size={16} />
                </button>
              </div>
              <div className="admin-modal-body">
                {candidates.length === 0 ? (
                  <div style={{ padding: '24px 0', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 13 }}>
                    No non-admin users available to promote.
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
                    {candidates.map((c) => (
                      <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', borderRadius: 'var(--admin-radius-md)', border: '1px solid var(--admin-border)', background: 'var(--admin-bg)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: '50%', background: avatarGradients[c.id % avatarGradients.length], display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                          {c.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis' }}>{c.email}</div>
                        </div>
                        <button className="admin-btn admin-btn-success admin-btn-sm" disabled={busy === c.id} onClick={() => promote(c.id)}>
                          <ShieldCheck size={13} /> {busy === c.id ? 'Granting...' : 'Promote'}
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`@media (max-width: 640px) { div[style*="repeat(auto-fill, minmax(300px"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
