import { motion } from 'framer-motion'
import { Star, ThumbsUp, Flag, MessageSquare, MoreHorizontal, Search, X } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useState } from 'react'
import { useApi } from '../hooks/useApi'
import { filmsAPI, talentAPI, type Film, type Talent } from '../../lib/api'

interface Review {
  id: number
  user: string
  content: string
  type: string
  rating: number
  comment: string
  date: string
  flagged: boolean
}

function filmToReview(f: Film): Review {
  return {
    id: f.id,
    user: 'System',
    content: f.title,
    type: 'Movie',
    rating: Math.round(f.rating),
    comment: f.synopsis || 'No description available.',
    date: f.year || 'Unknown',
    flagged: false,
  }
}

function talentToReview(t: Talent): Review {
  return {
    id: t.id + 10000,
    user: 'System',
    content: t.name,
    type: 'Talent',
    rating: 5,
    comment: t.bio || 'No bio available.',
    date: t.role || 'Unknown',
    flagged: false,
  }
}

export function ReviewsPage() {
  const { data: films } = useApi<Film[]>(() => filmsAPI.list(), [])
  const { data: talent } = useApi<Talent[]>(() => talentAPI.list(), [])

  const reviews: Review[] = [
    ...(films ?? []).map(filmToReview),
    ...(talent ?? []).map(talentToReview),
  ]

  const [search, setSearch] = useState('')
  const filtered = reviews.filter(r => r.content.toLowerCase().includes(search.toLowerCase()) || r.user.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <PageHeader title="Reviews" description="Manage user reviews and feedback" />
      <div className="admin-filter-bar">
        <div className="search-input">
          <Search size={15} style={{ color: 'var(--admin-text-muted)' }} />
          <input type="text" placeholder="Search reviews..." value={search} onChange={e => setSearch(e.target.value)} />
          {search && <X size={14} style={{ color: 'var(--admin-text-muted)', cursor: 'pointer' }} onClick={() => setSearch('')} />}
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {filtered.map((review, idx) => (
          <motion.div
            key={review.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 + idx * 0.05 }}
            className="admin-card"
            style={{ padding: '20px 24px' }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 13, color: '#fff', flexShrink: 0 }}>
                {review.user.split(' ').map(n => n[0]).join('')}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--admin-text)' }}>{review.user}</span>
                  <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>·</span>
                  <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{review.date}</span>
                  {review.flagged && <span className="badge badge-danger"><Flag size={9} /> Flagged</span>}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                  <span style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>on</span>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--admin-text)' }}>{review.content}</span>
                  <span className="badge badge-neutral">{review.type}</span>
                </div>
                <div style={{ display: 'flex', gap: 2, marginBottom: 8 }}>
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} size={14} style={{ color: s <= review.rating ? 'var(--admin-accent)' : 'var(--admin-text-faint)', fill: s <= review.rating ? 'var(--admin-accent)' : 'none' }} />
                  ))}
                </div>
                <p style={{ fontSize: 13, color: 'var(--admin-text-secondary)', lineHeight: 1.6 }}>{review.comment}</p>
              </div>
              <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ padding: 5 }}><MoreHorizontal size={14} /></button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
