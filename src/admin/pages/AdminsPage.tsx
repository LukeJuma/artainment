import { useState } from 'react'
import { motion } from 'framer-motion'
import { UserCog, Plus, Shield, Eye, Edit3, MoreHorizontal, Mail, Search, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useAuth } from '../../contexts/AuthContext'

const fallbackAdmins = [
  { id: 2, name: 'David Mwangi', email: 'david@artainment.co.ke', role: 'Content Manager', status: 'Active', lastLogin: '30 min ago', avatar: 'linear-gradient(135deg, #3B82F6, #8B5CF6)' },
  { id: 3, name: 'Sarah Akinyi', email: 'sarah@artainment.co.ke', role: 'Moderator', status: 'Active', lastLogin: '1 hr ago', avatar: 'linear-gradient(135deg, #2DD36F, #06B6D4)' },
  { id: 4, name: 'Brian Kiprop', email: 'brian@artainment.co.ke', role: 'Finance Admin', status: 'Active', lastLogin: '3 hr ago', avatar: 'linear-gradient(135deg, #8B5CF6, #EC4899)' },
  { id: 5, name: 'Lucy Wambui', email: 'lucy@artainment.co.ke', role: 'Support Agent', status: 'Inactive', lastLogin: '2 days ago', avatar: 'linear-gradient(135deg, #FFB800, #FF4D2D)' },
]

export function AdminsPage() {
  const { user } = useAuth()
  const [search, setSearch] = useState('')

  const currentAdmin = user ? {
    id: 1,
    name: user.name,
    email: user.email,
    role: 'Super Admin',
    status: 'Active' as const,
    lastLogin: '2 min ago',
    avatar: 'linear-gradient(135deg, #FF4D2D, #FFB800)',
  } : null

  const admins = currentAdmin ? [currentAdmin, ...fallbackAdmins] : fallbackAdmins

  const filtered = admins.filter(a => a.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader title="Admins" description="Manage admin users and permissions" actions={<button className="admin-btn admin-btn-primary"><Plus size={15} /> Add Admin</button>} />
      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search admins..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map((admin, idx) => (
          <motion.div key={admin.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + idx * 0.05 }} whileHover={{ y: -2, boxShadow: '0 6px 24px rgba(0,0,0,.2)' }} className="admin-card" style={{ padding: '22px 24px', cursor: 'pointer' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 46, height: 46, borderRadius: '50%', background: admin.avatar, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15, color: '#fff', flexShrink: 0 }}>{admin.name.split(' ').map(n => n[0]).join('')}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{admin.name}</div>
                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{admin.email}</div>
              </div>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }}><MoreHorizontal size={14} /></button>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--admin-border)' }}>
              <span className="badge badge-primary">{admin.role}</span>
              <span style={{ fontSize: 11, color: admin.status === 'Active' ? 'var(--admin-success)' : 'var(--admin-text-muted)' }}>
                {admin.status} &middot; {admin.lastLogin}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
