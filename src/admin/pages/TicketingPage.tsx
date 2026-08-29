import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Ticket as TicketIcon, Search, Plus, Calendar, DollarSign, Users, X, Loader2, Pencil, Trash2 } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, mmAPI, type Ticket, type MMEvent } from '../../lib/api'

const statusColors: Record<string, string> = { sold_out: 'badge-success', active: 'badge-info' }

interface TicketForm {
  event_id: string
  type: string
  price: string
  capacity: string
  sold: string
  status: 'active' | 'sold_out'
}

const emptyForm: TicketForm = { event_id: '', type: 'regular', price: '', capacity: '', sold: '0', status: 'active' }

export function TicketingPage() {
  const { token } = useAuth()
  const [search, setSearch] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState<Ticket | null>(null)
  const [form, setForm] = useState<TicketForm>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const { data: tickets, loading, refetch } = useApi(() => adminAPI.tickets(token!), [token])
  const { data: events } = useApi<MMEvent[]>(() => mmAPI.events(), [])

  const totalSold = (tickets ?? []).reduce((sum, t) => sum + t.sold, 0)
  const totalRevenue = (tickets ?? []).reduce((sum, t) => sum + t.sold * t.price, 0)
  const activeTickets = (tickets ?? []).filter(t => t.status === 'active').length
  const avgCapacity = (tickets ?? []).length > 0
    ? Math.round((tickets ?? []).reduce((sum, t) => sum + (t.capacity > 0 ? (t.sold / t.capacity) * 100 : 0), 0) / (tickets ?? []).length)
    : 0

  const filtered = (tickets ?? []).filter(t =>
    (t.event?.title || '').toLowerCase().includes(search.toLowerCase()) ||
    t.type.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditing(null)
    setForm(emptyForm)
    setFormError('')
    setShowModal(true)
  }

  const openEdit = (t: Ticket) => {
    setEditing(t)
    setForm({
      event_id: t.event_id ? String(t.event_id) : '',
      type: t.type,
      price: String(t.price),
      capacity: String(t.capacity),
      sold: String(t.sold),
      status: t.status,
    })
    setFormError('')
    setShowModal(true)
  }

  const handleSubmit = async () => {
    if (!token) return
    if (!form.type.trim()) { setFormError('Ticket type is required.'); return }
    if (!form.event_id) { setFormError('Please select an event.'); return }
    setFormLoading(true)
    setFormError('')
    try {
      const payload = {
        event_id: Number(form.event_id),
        type: form.type.trim(),
        price: Number(form.price) || 0,
        capacity: Number(form.capacity) || 0,
        sold: Number(form.sold) || 0,
        status: form.status,
      }
      if (editing) {
        await adminAPI.updateTicket(token, editing.id, payload)
      } else {
        await adminAPI.createTicket(token, payload)
      }
      setShowModal(false)
      refetch()
    } catch (e: any) {
      setFormError(e.message || 'Failed to save ticket.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async (id: number) => {
    if (!token) return
    if (!confirm('Delete this ticket?')) return
    try { await adminAPI.deleteTicket(token, id); refetch() } catch {}
  }

  return (
    <div>
      <PageHeader
        title="Ticketing"
        description="Manage tickets across all events"
        actions={<button className="admin-btn admin-btn-primary" onClick={openCreate}><Plus size={15} /> Create Ticket Type</button>}
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Sold', value: totalSold.toLocaleString(), icon: TicketIcon, color: '#FF4D2D' },
          { label: 'Revenue', value: `KES ${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#2DD36F' },
          { label: 'Active Types', value: String(activeTickets), icon: Calendar, color: '#3B82F6' },
          { label: 'Avg. Capacity', value: `${avgCapacity}%`, icon: Users, color: '#FFB800' },
        ].map((item, idx) => {
          const Icon = item.icon
          return (
            <motion.div key={item.label} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.05 }} style={{ background: 'var(--admin-card)', border: '1px solid var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${item.color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: item.color }}><Icon size={16} strokeWidth={2} /></div>
              <div><div style={{ fontSize: 18, fontWeight: 800, color: 'var(--admin-text)', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{item.value}</div><div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{item.label}</div></div>
            </motion.div>
          )
        })}
      </div>

      <div style={{ marginTop: 20 }}>
        <div className="admin-filter-bar"><div className="search-input"><Search size={15} style={{ color: 'var(--admin-text-muted)' }} /><input type="text" placeholder="Search tickets..." value={search} onChange={e => setSearch(e.target.value)} />{search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}</div></div>
        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Loader2 size={28} style={{ color: 'var(--admin-text-muted)', animation: 'spin 1s linear infinite' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="admin-empty">
            <TicketIcon size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
            <h3>No ticket types yet</h3>
            <p>Create ticket types (VIP, Regular, etc.) for your events.</p>
          </div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead><tr><th>Event</th><th>Type</th><th>Price</th><th>Sold</th><th>Revenue</th><th>Status</th><th></th></tr></thead>
              <tbody>
                {filtered.map((t, idx) => (
                  <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.1 + idx * 0.03 }}>
                    <td className="cell-primary">{t.event?.title || 'General'}</td>
                    <td><span className={`badge ${t.type === 'vip' || t.type === 'VIP' ? 'badge-warning' : 'badge-neutral'}`}>{t.type}</span></td>
                    <td style={{ fontWeight: 600, color: 'var(--admin-text)' }}>KES {t.price.toLocaleString()}</td>
                    <td>{t.sold.toLocaleString()} / {t.capacity.toLocaleString()}</td>
                    <td style={{ fontWeight: 600, color: 'var(--admin-success)' }}>KES {(t.sold * t.price).toLocaleString()}</td>
                    <td><span className={`badge ${statusColors[t.status]}`}><span className="badge-dot" />{t.status === 'sold_out' ? 'Sold Out' : 'Active'}</span></td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }} onClick={() => openEdit(t)}><Pencil size={14} /></button>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" style={{ padding: 5 }} onClick={() => handleDelete(t.id)}><Trash2 size={14} /></button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 520 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editing ? 'Edit Ticket' : 'Create Ticket Type'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16 }}>
                    {formError}
                  </div>
                )}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Event *</label>
                  <select className="admin-select" style={{ width: '100%' }} value={form.event_id} onChange={e => setForm({ ...form, event_id: e.target.value })}>
                    <option value="">Select event...</option>
                    {(events ?? []).map(ev => <option key={ev.id} value={ev.id}>{ev.title}</option>)}
                  </select>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Type</label>
                    <select className="admin-select" style={{ width: '100%' }} value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                      <option value="regular">Regular</option>
                      <option value="vip">VIP</option>
                      <option value="vvip">VVIP</option>
                      <option value="student">Student</option>
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Price (KES)</label>
                    <input className="admin-input" type="number" min="0" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Capacity</label>
                    <input className="admin-input" type="number" min="0" value={form.capacity} onChange={e => setForm({ ...form, capacity: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Sold</label>
                    <input className="admin-input" type="number" min="0" value={form.sold} onChange={e => setForm({ ...form, sold: e.target.value })} />
                  </div>
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label className="admin-label">Status</label>
                  <select className="admin-select" style={{ width: '100%' }} value={form.status} onChange={e => setForm({ ...form, status: e.target.value as any })}>
                    <option value="active">Active</option>
                    <option value="sold_out">Sold Out</option>
                  </select>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSubmit} disabled={formLoading}>
                  {formLoading ? 'Saving...' : editing ? 'Update Ticket' : 'Create Ticket'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <style>{`@media (max-width: 1024px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: repeat(2, 1fr) !important; } } @media (max-width: 640px) { div[style*="grid-template-columns: repeat(4"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
