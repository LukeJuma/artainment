import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  Search, Plus, Mail,
  UserCheck, UserX, Download, X,
  Clock, ShieldCheck, ShieldOff, Trash2,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type AdminUser } from '../../lib/api'

interface User {
  id: number
  name: string
  email: string
  role: 'Subscriber' | 'Admin'
  status: 'Active' | 'Suspended' | 'Pending'
  verified: boolean
  joined: string
  lastActive: string
  avatar: string
  isAdmin: boolean
}

function adminUserToUser(u: AdminUser): User {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.is_admin ? 'Admin' : 'Subscriber',
    status: 'Active',
    verified: true,
    joined: u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    lastActive: u.created_at ? new Date(u.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—',
    avatar: '',
    isAdmin: u.is_admin,
  }
}

const roleColors: Record<string, { bg: string; color: string }> = {
  Subscriber: { bg: 'rgba(255,255,255,.06)', color: 'var(--admin-text-secondary)' },
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
  const { token, user: currentUser } = useAuth()
  const { data: rawUsers, loading, refetch } = useApi<AdminUser[]>(
    () => adminAPI.users(token!),
    [token]
  )

  const [search, setSearch] = useState('')
  const [selectedRole, setSelectedRole] = useState('All')
  const [selectedStatus, setSelectedStatus] = useState('All')

  const users: User[] = (rawUsers ?? []).map(adminUserToUser)

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())
    const matchRole = selectedRole === 'All' || u.role === selectedRole
    const matchStatus = selectedStatus === 'All' || u.status === selectedStatus
    return matchSearch && matchRole && matchStatus
  })

  const totalAdmins = users.filter(u => u.isAdmin).length
  const totalSubscribers = users.length - totalAdmins
  const newThisMonth = (rawUsers ?? []).filter(u => {
    if (!u.created_at) return false
    const d = new Date(u.created_at)
    const now = new Date()
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  }).length

  const toggleAdmin = async (user: User) => {
    if (!token || !currentUser || user.id === currentUser.id) return
    try {
      await adminAPI.updateUserRole(token, user.id, !user.isAdmin)
      refetch()
    } catch {
    }
  }

  const handleDelete = async (user: User) => {
    if (!token || !currentUser || user.id === currentUser.id) return
    if (!window.confirm(`Delete user "${user.name}"? This cannot be undone.`)) return
    try {
      await adminAPI.deleteUser(token, user.id)
      refetch()
    } catch {
    }
  }

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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Users', value: users.length.toLocaleString(), color: '#3B82F6' },
          { label: 'Admins', value: totalAdmins.toLocaleString(), color: '#FF4D2D' },
          { label: 'Subscribers', value: totalSubscribers.toLocaleString(), color: '#2DD36F' },
          { label: 'New This Month', value: newThisMonth.toLocaleString(), color: '#FFB800' },
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

      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
        <select className="admin-select" value={selectedRole} onChange={e => setSelectedRole(e.target.value)} style={{ padding: '8px 32px 8px 12px', fontSize: 12 }}>
          <option value="All">All Roles</option>
          <option value="Subscriber">Subscribers</option>
          <option value="Admin">Admins</option>
        </select>
        <select className="admin-select" value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} style={{ padding: '8px 32px 8px 12px', fontSize: 12 }}>
          <option value="All">All Status</option>
          <option value="Active">Active</option>
          <option value="Suspended">Suspended</option>
          <option value="Pending">Pending</option>
        </select>
      </div>

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
              <th style={{ width: 110 }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((user, idx) => {
              const rc = roleColors[user.role]
              const sc = statusColors[user.status]
              const isSelf = currentUser?.id === user.id
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
                        <div className="cell-primary" style={{ fontSize: 13 }}>{user.name}{isSelf ? ' (you)' : ''}</div>
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
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{ padding: 5 }}
                        title={user.isAdmin ? 'Revoke admin' : 'Grant admin'}
                        disabled={isSelf}
                        onClick={() => toggleAdmin(user)}
                      >
                        {user.isAdmin ? <ShieldOff size={13} /> : <ShieldCheck size={13} />}
                      </button>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }} title="Email">
                        <Mail size={13} />
                      </button>
                      <button
                        className="admin-btn admin-btn-ghost admin-btn-sm"
                        style={{ padding: 5, color: isSelf ? 'var(--admin-text-faint)' : 'var(--admin-danger)' }}
                        title="Delete"
                        disabled={isSelf}
                        onClick={() => handleDelete(user)}
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              )
            })}
          </tbody>
        </table>
      </motion.div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, padding: '14px 0' }}>
        <span style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Showing {filtered.length} of {users.length} users</span>
        <div style={{ display: 'flex', gap: 4 }}>
          {[1].map(p => (
            <button key={p} className="admin-btn admin-btn-primary admin-btn-sm" style={{ minWidth: 34, padding: '6px 10px' }}>{p}</button>
          ))}
        </div>
      </div>
    </div>
  )
}
