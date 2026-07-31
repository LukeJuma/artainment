import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Plus, MoreHorizontal, Shield, Mail, Phone,
  Ban, Eye, UserCheck, UserX, Download, Filter, X,
  ChevronDown, Activity, Clock,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type Contact } from '../../lib/api'

interface User {
  id: number
  name: string
  email: string
  phone: string
  role: 'Subscriber' | 'Creator' | 'Moderator' | 'Admin'
  status: 'Active' | 'Suspended' | 'Pending'
  verified: boolean
  joined: string
  lastActive: string
  avatar: string
}

function contactToUser(c: Contact): User {
  return {
    id: c.id,
    name: c.name,
    email: c.email,
    phone: '-',
    role: 'Subscriber',
    status: c.status === 'replied' ? 'Active' : c.status === 'read' ? 'Active' : 'Pending',
    verified: true,
    joined: c.created_at,
    lastActive: c.created_at,
    avatar: '',
  }
}

const roleColors: Record<string, { bg: string; color: string }> = {
  Subscriber: { bg: 'rgba(255,255,255,.06)', color: 'var(--admin-text-secondary)' },
  Creator: { bg: 'var(--admin-purple-glow)', color: 'var(--admin-purple)' },
  Moderator: { bg: 'var(--admin-info-glow)', color: 'var(--admin-info)' },
  Admin: { bg: 'var(--admin-primary-glow)', color: 'var(--admin-primary)' },
}

const statusColors: Record<string, { bg: string; color: string }> = {
  Active: { bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  Suspended: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)' },
  Pending: { bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
}

const avatarGradients = [
  'linear-gradient(135deg, #FF4D2D, #FFB800)',
  'linear-gradient(135deg, #3B82F6, #8B5CF6)',
  'linear-gradient(135deg, #2DD36F, #06B6D4)',
  'linear-gradient(135deg, #8B5CF6, #EC4899)',
  'linear-gradient(135deg, #FFB800, #FF4D2D)',
  'linear-gradient(135deg, #EF4444, #F59E0B)',
  'linear-gradient(135deg, #06B6D4, #3B82F6)',
  'linear-gradient(135deg, #EC4899, #8B5CF6)',
]

export function UsersPage() {
  const { token } = useAuth()
  const { data: contacts, loading } = useApi<Contact[]>(
    () => adminAPI.contacts(token!),
    [token]
  )

  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const users: User[] = (contacts ?? []).map(contactToUser)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = selectedRole === 'All' || u.role === selectedRole
    const matchStatus = selectedStatus === 'All' || u.status === selectedStatus
    return matchSearch && matchRole && matchStatus
  })

  if (loading) {
    return (
      <div>
        <PageHeader title="Users" description="Loading users..." />
        <div style={{ padding: 40, textAlign: 'center', color: 'var(--admin-text-muted)' }}>Loading...</div>
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Users"
        description={`${users.length} registered users across your platform`}
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="admin-btn admin-btn-secondary">
              <Download size={15} />
              Export
            </button>
            <button className="admin-btn admin-btn-primary">
              <Plus size={15} />
              Add User
            </button>
          </div>
        }
      />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: '24,891', color: '#3B82F6' },
          { label: 'Active Today', value: '3,421', color: '#2DD36F' },
          { label: 'Creators', value: '1,247', color: '#8B5CF6' },
          { label: 'Pending Verification', value: '89', color: '#FFB800' },
        ].map((item, idx) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            style={{
              background: 'var(--admin-card)',
              border: '1px solid var(--admin-border)',
              borderRadius: 'var(--admin-radius-lg)',
              padding: '16px 18px',
            }}
          >
            <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 6 }}>{item.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.value}</div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
        <select className="admin-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ padding: '8px 32px 8px 12px', fontSize: 12 }}>
          <option value="All">All Roles</option>
          <option value="Subscriber">Subscribers</option>
          <option value="Creator">Creators</option>
          <option value="Moderator">Moderators</option>
          <option value="Admin">Admins</option>
        </select>
        <select className="admin-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{ padding: '8px 32px 8px 12px', fontSize: 12 }}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <motion.div
        className="admin-table-wrap"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}><input type="checkbox" className="admin-checkbox" /></th>
              <th>User</th>
              <th>Role</th>
              <th>Status</th>
              <th>Verified</th>
              <th>Joined</th>
              <th>Last Active</th>
              <th style={{ width: 100 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => {
              const rc = roleColors[user.role]
              const sc = statusColors[user.status]
              return (
                <motion.tr
                  key={user.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + idx * 0.03 }}
                >
                  <td><input type="checkbox" className="admin-checkbox" /></td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: avatarGradients[user.id % avatarGradients.length],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontSize: 13,
                        color: '#fff',
                        flexShrink: 0,
                      }}>
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <div className="cell-primary" style={{ fontSize: 13 }}>{user.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className="badge" style={{ background: rc.bg, color: rc.color }}>{user.role}</span>
                  </td>
                  <td>
                    <span className="badge" style={{ background: sc.bg, color: sc.color }}>
                      <span className="badge-dot" />
                      {user.status}
                    </span>
                  </td>
                  <td>
                    {user.verified ? (
                      <UserCheck size={16} style={{ color: 'var(--admin-success)' }} />
                    ) : (
                      <UserX size={16} style={{ color: 'var(--admin-text-faint)' }} />
                    )}
                  </td>
                  <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{user.joined}</td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--admin-text-muted)' }}>
                      <Clock size={11} />
                      {user.lastActive}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }} title="View">
                        <Eye size={13} />
                      </button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }} title="Email">
                        <Mail size={13} />
                      </button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }} title="More">
                        <MoreHorizontal size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '14px 0' }}>
        <span style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Showing {filtered.length} of {users.length} users</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1, 2, 3, 4].map(p => (
            <button key={p} className={`admin-btn ${p === 1 ? 'admin-btn-primary' : 'admin-btn-ghost'} admin-btn-sm`} style={{ minWidth: 34, padding: '6px 10px' }}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
