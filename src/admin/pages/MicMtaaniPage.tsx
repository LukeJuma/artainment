import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Plus, Search, Pencil, Trash2, X, Image, Video,
  FileText, Eye, Tag, AlertTriangle, Check,
  Filter, Newspaper, MessageSquare,
  Users, Send, Bookmark,
} from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import {
  adminAPI, mmAPI,
  type MMArticle, type MMCategory,
} from '../../lib/api'
import { FileUpload } from '../components/FileUpload'

type Tab = 'articles' | 'categories' | 'journalists' | 'comments' | 'submissions'

const statusColors: Record<string, { bg: string; color: string }> = {
  published: { bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  draft: { bg: 'var(--admin-accent-glow)', color: 'var(--admin-accent)' },
  archived: { bg: 'rgba(255,255,255,.06)', color: 'var(--admin-text-muted)' },
  pending: { bg: 'var(--admin-info-glow)', color: 'var(--admin-info)' },
  approved: { bg: 'var(--admin-success-glow)', color: 'var(--admin-success)' },
  rejected: { bg: 'var(--admin-danger-glow)', color: 'var(--admin-danger)' },
}

interface ArticleForm {
  headline: string
  subtitle: string
  body: string
  category_id: string
  image_url: string
  video_url: string
  tags: string
  reading_time: string
  is_featured: boolean
  is_breaking: boolean
  status: string
  media_type: 'photo' | 'video'
}

const emptyForm: ArticleForm = {
  headline: '', subtitle: '', body: '', category_id: '',
  image_url: '', video_url: '', tags: '', reading_time: '3',
  is_featured: false, is_breaking: false, status: 'draft',
  media_type: 'photo',
}

export function MicMtaaniPage() {
  const { token } = useAuth()
  const [activeTab, setActiveTab] = useState<Tab>('articles')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  const [showArticleModal, setShowArticleModal] = useState(false)
  const [editingArticle, setEditingArticle] = useState<MMArticle | null>(null)
  const [articleForm, setArticleForm] = useState<ArticleForm>(emptyForm)
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const [showDeleteConfirm, setShowDeleteConfirm] = useState<{ type: string; id: number; name: string } | null>(null)
  const [deleteLoading, setDeleteLoading] = useState(false)

  const [showCatModal, setShowCatModal] = useState(false)
  const [catName, setCatName] = useState('')
  const [catColor, setCatColor] = useState('#FF4D2D')
  const [catSubmitting, setCatSubmitting] = useState(false)

  const [showJournalistModal, setShowJournalistModal] = useState(false)
  const [journalistForm, setJournalistForm] = useState({ name: '', email: '', role: '', bio: '' })
  const [journalistLoading, setJournalistLoading] = useState(false)

  const { data: articlesData, loading: artLoading, refetch: refetchArticles } = useApi(
    () => adminAPI.mmArticles(token!), [token]
  )
  const { data: categories, refetch: refetchCategories } = useApi<MMCategory[]>(() => mmAPI.categories(), [])
  const { data: journalists, refetch: refetchJournalists } = useApi(
    () => adminAPI.mmJournalists(token!), [token]
  )
  const { data: commentsData, refetch: refetchComments } = useApi(
    () => adminAPI.mmPendingComments(token!), [token]
  )
  const { data: submissionsData, refetch: refetchSubmissions } = useApi(
    () => adminAPI.mmSubmissions(token!), [token]
  )

  const articles = articlesData?.data || []
  const comments = commentsData?.data || []
  const submissions = submissionsData?.data || []

  const filteredArticles = useMemo(() => {
    return articles.filter(a => {
      const matchSearch = !search || a.headline.toLowerCase().includes(search.toLowerCase()) || a.excerpt?.toLowerCase().includes(search.toLowerCase())
      const matchStatus = statusFilter === 'all' || a.status === statusFilter
      return matchSearch && matchStatus
    })
  }, [articles, search, statusFilter])

  const openCreateModal = useCallback(() => {
    setEditingArticle(null)
    setArticleForm(emptyForm)
    setFormError('')
    setShowArticleModal(true)
  }, [])

  const openEditModal = useCallback((article: MMArticle) => {
    setEditingArticle(article)
    setArticleForm({
      headline: article.headline,
      subtitle: article.subtitle || '',
      body: article.body || '',
      category_id: String(article.category_id || ''),
      image_url: article.image_url || '',
      video_url: article.video_url || '',
      tags: article.tags?.join(', ') || '',
      reading_time: String(article.reading_time || 3),
      is_featured: article.is_featured,
      is_breaking: article.is_breaking,
      status: article.status,
      media_type: article.video_url ? 'video' : 'photo',
    })
    setFormError('')
    setShowArticleModal(true)
  }, [])

  const handleArticleSubmit = async () => {
    if (!articleForm.headline.trim() || !articleForm.body.trim()) {
      setFormError('Headline and body are required.')
      return
    }
    setFormLoading(true)
    setFormError('')
    try {
      const payload: Record<string, any> = {
        headline: articleForm.headline.trim(),
        subtitle: articleForm.subtitle.trim() || null,
        body: articleForm.body.trim(),
        category_id: articleForm.category_id ? Number(articleForm.category_id) : null,
        image_url: articleForm.media_type === 'photo' ? (articleForm.image_url.trim() || null) : null,
        video_url: articleForm.media_type === 'video' ? (articleForm.video_url.trim() || null) : null,
        tags: articleForm.tags ? articleForm.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
        reading_time: Number(articleForm.reading_time) || 3,
        is_featured: articleForm.is_featured,
        is_breaking: articleForm.is_breaking,
        status: articleForm.status,
      }
      if (editingArticle) {
        await adminAPI.mmUpdateArticle(token!, editingArticle.id, payload)
      } else {
        await adminAPI.mmCreateArticle(token!, payload)
      }
      setShowArticleModal(false)
      refetchArticles()
    } catch (e: any) {
      setFormError(e.message || 'Failed to save article.')
    } finally {
      setFormLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!showDeleteConfirm) return
    setDeleteLoading(true)
    try {
      if (showDeleteConfirm.type === 'article') {
        await adminAPI.mmDeleteArticle(token!, showDeleteConfirm.id)
        refetchArticles()
      } else if (showDeleteConfirm.type === 'category') {
        await adminAPI.mmDeleteCategory(token!, showDeleteConfirm.id)
        refetchCategories()
      } else if (showDeleteConfirm.type === 'journalist') {
        await adminAPI.mmDeleteJournalist(token!, showDeleteConfirm.id)
        refetchJournalists()
      }
      setShowDeleteConfirm(null)
    } catch (e: any) {
      alert(e.message || 'Failed to delete.')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreateCategory = async () => {
    if (!catName.trim()) return
    setCatSubmitting(true)
    try {
      await adminAPI.mmCreateCategory(token!, { name: catName.trim(), color: catColor } as any)
      setShowCatModal(false)
      setCatName('')
      refetchCategories()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setCatSubmitting(false)
    }
  }

  const handleCreateJournalist = async () => {
    if (!journalistForm.name.trim()) return
    setJournalistLoading(true)
    try {
      await adminAPI.mmCreateJournalist(token!, journalistForm as any)
      setShowJournalistModal(false)
      setJournalistForm({ name: '', email: '', role: '', bio: '' })
      refetchJournalists()
    } catch (e: any) {
      alert(e.message)
    } finally {
      setJournalistLoading(false)
    }
  }

  const handleApproveComment = async (id: number) => {
    await adminAPI.mmApproveComment(token!, id)
    refetchComments()
  }

  const handleApproveSubmission = async (id: number) => {
    await adminAPI.mmApproveSubmission(token!, id)
    refetchSubmissions()
  }

  const handleRejectSubmission = async (id: number) => {
    await adminAPI.mmRejectSubmission(token!, id)
    refetchSubmissions()
  }

  async function handleDeleteCommentDirect(id: number) {
    await adminAPI.mmDeleteComment(token!, id)
    refetchComments()
  }

  const loading = artLoading && !articlesData
  const tabs: { id: Tab; label: string; icon: any; count?: number }[] = [
    { id: 'articles', label: 'Articles', icon: Newspaper, count: articles.length },
    { id: 'categories', label: 'Categories', icon: Tag, count: categories?.length },
    { id: 'journalists', label: 'Journalists', icon: Users, count: journalists?.length },
    { id: 'comments', label: 'Comments', icon: MessageSquare, count: comments.length },
    { id: 'submissions', label: 'Submissions', icon: Send, count: submissions.length },
  ]

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 300, color: 'var(--admin-text-muted)' }}>
        Loading Mic Mtaani data...
      </div>
    )
  }

  return (
    <div>
      <PageHeader
        title="Mic Mtaani"
        description="Community news platform — manage articles, categories, journalists & moderation"
        actions={
          <div style={{ display: 'flex', gap: 8 }}>
            {activeTab === 'articles' && (
              <button className="admin-btn admin-btn-primary" onClick={openCreateModal}>
                <Plus size={15} /> New Article
              </button>
            )}
            {activeTab === 'categories' && (
              <button className="admin-btn admin-btn-primary" onClick={() => setShowCatModal(true)}>
                <Plus size={15} /> Add Category
              </button>
            )}
            {activeTab === 'journalists' && (
              <button className="admin-btn admin-btn-primary" onClick={() => setShowJournalistModal(true)}>
                <Plus size={15} /> Add Journalist
              </button>
            )}
          </div>
        }
      />

      {/* Tabs */}
      <div className="admin-tabs" style={{ marginBottom: 20 }}>
        {tabs.map(tab => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              className={`admin-tab${activeTab === tab.id ? ' active' : ''}`}
              onClick={() => { setActiveTab(tab.id); setSearch(''); setStatusFilter('all') }}
            >
              <Icon size={14} style={{ marginRight: 6, verticalAlign: -2 }} />
              {tab.label}
              {tab.count != null && <span style={{ marginLeft: 6, opacity: 0.6 }}>({tab.count})</span>}
            </button>
          )
        })}
      </div>

      {/* Filter bar */}
      {activeTab === 'articles' && (
        <div className="admin-filter-bar">
          <div className="search-input">
            <Search size={15} style={{ color: 'var(--admin-text-muted)', flexShrink: 0 }} />
            <input type="text" placeholder="Search articles..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <div className="admin-filter-group">
            <Filter size={14} style={{ color: 'var(--admin-text-muted)' }} />
            {['all', 'published', 'draft', 'archived'].map(s => (
              <button
                key={s}
                className={`admin-btn admin-btn-sm${statusFilter === s ? ' admin-btn-primary' : ' admin-btn-ghost'}`}
                onClick={() => setStatusFilter(s)}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ─── Articles Tab ────────────────────────────────── */}
      {activeTab === 'articles' && (
        <>
          {/* Desktop table */}
          <div className="admin-table-wrap desktop-only">
            <table className="admin-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}></th>
                  <th>Article</th>
                  <th>Category</th>
                  <th>Media</th>
                  <th>Status</th>
                  <th>Views</th>
                  <th>Published</th>
                  <th style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.length === 0 ? (
                  <tr><td colSpan={8}>
                    <div className="admin-empty">
                      <FileText size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
                      <h3>No articles found</h3>
                      <p>Create your first article to get started.</p>
                    </div>
                  </td></tr>
                ) : filteredArticles.map(article => (
                  <tr key={article.id}>
                    <td>
                      <div style={{ width: 40, height: 40, borderRadius: 8, overflow: 'hidden', background: 'var(--admin-secondary)' }}>
                        {article.image_url ? (
                          <img src={article.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : article.video_url ? (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={16} style={{ color: 'var(--admin-primary)' }} /></div>
                        ) : (
                          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={16} style={{ color: 'var(--admin-text-muted)' }} /></div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div style={{ maxWidth: 320 }}>
                        <div className="cell-primary" style={{ marginBottom: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {article.headline}
                          {article.is_breaking && <span className="badge badge-danger" style={{ fontSize: 9, padding: '1px 6px' }}>Breaking</span>}
                          {article.is_featured && <span className="badge badge-warning" style={{ fontSize: 9, padding: '1px 6px' }}>Featured</span>}
                        </div>
                        <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {article.excerpt || article.subtitle || '—'}
                        </div>
                      </div>
                    </td>
                    <td>
                      {article.category ? (
                        <span className="badge" style={{ background: article.category.color ? `${article.category.color}20` : 'rgba(255,255,255,.06)', color: article.category.color || 'var(--admin-text-secondary)' }}>
                          {article.category.name}
                        </span>
                      ) : <span style={{ color: 'var(--admin-text-muted)', fontSize: 12 }}>—</span>}
                    </td>
                    <td>
                      {article.video_url ? (
                        <span className="badge badge-info"><Video size={11} /> Video</span>
                      ) : article.image_url ? (
                        <span className="badge badge-purple"><Image size={11} /> Photo</span>
                      ) : (
                        <span className="badge badge-neutral">Text</span>
                      )}
                    </td>
                    <td>
                      <span className="badge" style={{ background: statusColors[article.status]?.bg || 'rgba(255,255,255,.06)', color: statusColors[article.status]?.color || 'var(--admin-text-muted)' }}>
                        {article.status}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--admin-text-secondary)' }}>
                        <Eye size={13} /> {article.views.toLocaleString()}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>
                      {article.published_at ? new Date(article.published_at).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => openEditModal(article)} title="Edit"><Pencil size={14} /></button>
                        <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setShowDeleteConfirm({ type: 'article', id: article.id, name: article.headline })} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mobile-only" style={{ display: 'grid', gap: 12 }}>
            {filteredArticles.length === 0 ? (
              <div className="admin-empty">
                <FileText size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
                <h3>No articles found</h3>
                <p>Create your first article to get started.</p>
              </div>
            ) : filteredArticles.map((article, idx) => (
              <motion.div
                key={article.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="admin-card"
                style={{ padding: 14 }}
              >
                <div style={{ display: 'flex', gap: 12 }}>
                  {/* Thumbnail */}
                  <div style={{ width: 56, height: 56, borderRadius: 8, overflow: 'hidden', background: 'var(--admin-secondary)', flexShrink: 0 }}>
                    {article.image_url ? (
                      <img src={article.image_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : article.video_url ? (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Video size={20} style={{ color: 'var(--admin-primary)' }} /></div>
                    ) : (
                      <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><FileText size={20} style={{ color: 'var(--admin-text-muted)' }} /></div>
                    )}
                  </div>
                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--admin-text)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {article.headline}
                      </span>
                      {article.is_breaking && <span className="badge badge-danger" style={{ fontSize: 9, padding: '1px 5px', flexShrink: 0 }}>Breaking</span>}
                      {article.is_featured && <span className="badge badge-warning" style={{ fontSize: 9, padding: '1px 5px', flexShrink: 0 }}>Featured</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginBottom: 6, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {article.excerpt || article.subtitle || '—'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: statusColors[article.status]?.bg || 'rgba(255,255,255,.06)', color: statusColors[article.status]?.color || 'var(--admin-text-muted)', fontSize: 10, padding: '2px 7px' }}>
                        {article.status}
                      </span>
                      {article.category && (
                        <span className="badge" style={{ background: 'rgba(255,255,255,.06)', color: 'var(--admin-text-secondary)', fontSize: 10, padding: '2px 7px' }}>
                          {article.category.name}
                        </span>
                      )}
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, fontSize: 11, color: 'var(--admin-text-muted)' }}>
                        <Eye size={11} /> {article.views.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginTop: 10, borderTop: '1px solid var(--admin-border)', paddingTop: 10 }}>
                  <button className="admin-btn admin-btn-ghost admin-btn-sm" style={{ flex: 1 }} onClick={() => openEditModal(article)}>
                    <Pencil size={13} /> Edit
                  </button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setShowDeleteConfirm({ type: 'article', id: article.id, name: article.headline })}>
                    <Trash2 size={13} />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ─── Categories Tab ──────────────────────────────── */}
      {activeTab === 'categories' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 14 }}>
          {categories?.map(cat => (
            <motion.div key={cat.id} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="admin-card" style={{ padding: 20, position: 'relative' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: cat.color || 'var(--admin-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Tag size={16} color="#fff" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--admin-text)' }}>{cat.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{cat.articles_count || 0} articles</div>
                </div>
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setShowDeleteConfirm({ type: 'category', id: cat.id, name: cat.name })}>
                  <Trash2 size={13} />
                </button>
              </div>
              {cat.description && <div style={{ fontSize: 12, color: 'var(--admin-text-muted)' }}>{cat.description}</div>}
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Journalists Tab ─────────────────────────────── */}
      {activeTab === 'journalists' && (
        <>
          {/* Desktop table */}
          <div className="admin-table-wrap desktop-only">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Journalist</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Articles</th>
                  <th style={{ width: 80 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {journalists?.map(j => (
                  <tr key={j.id}>
                    <td className="cell-primary">{j.name}</td>
                    <td style={{ fontSize: 12 }}>{j.email || '—'}</td>
                    <td>{j.role ? <span className="badge badge-neutral">{j.role}</span> : '—'}</td>
                    <td>{j.articles_count || 0}</td>
                    <td>
                      <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setShowDeleteConfirm({ type: 'journalist', id: j.id, name: j.name })}>
                        <Trash2 size={13} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="mobile-only" style={{ display: 'grid', gap: 12 }}>
            {journalists?.map((j, idx) => (
              <motion.div
                key={j.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04 }}
                className="admin-card"
                style={{ padding: 14 }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--admin-info-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-info)', flexShrink: 0 }}>
                    <Users size={18} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--admin-text)', marginBottom: 2 }}>{j.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{j.email || '—'}</div>
                  </div>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => setShowDeleteConfirm({ type: 'journalist', id: j.id, name: j.name })}>
                    <Trash2 size={13} />
                  </button>
                </div>
                <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                  {j.role && <span className="badge badge-neutral" style={{ fontSize: 10 }}>{j.role}</span>}
                  <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{j.articles_count || 0} articles</span>
                </div>
              </motion.div>
            ))}
          </div>
        </>
      )}

      {/* ─── Comments Tab ────────────────────────────────── */}
      {activeTab === 'comments' && (
        <div>
          {comments.length === 0 ? (
            <div className="admin-empty">
              <Check size={32} style={{ color: 'var(--admin-success)', marginBottom: 12 }} />
              <h3>All caught up!</h3>
              <p>No pending comments to moderate.</p>
            </div>
          ) : comments.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="admin-card" style={{ padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--admin-info-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-info)', flexShrink: 0 }}>
                <MessageSquare size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--admin-text)' }}>{c.name}</span>
                  <span style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{new Date(c.created_at).toLocaleDateString()}</span>
                </div>
                <div style={{ fontSize: 13, color: 'var(--admin-text-secondary)', marginBottom: 6 }}>{c.body}</div>
              </div>
              <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                <button className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleApproveComment(c.id)}><Check size={13} /> Approve</button>
                <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleDeleteCommentDirect(c.id)}><Trash2 size={13} /></button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Submissions Tab ─────────────────────────────── */}
      {activeTab === 'submissions' && (
        <div>
          {submissions.length === 0 ? (
            <div className="admin-empty">
              <Send size={32} style={{ color: 'var(--admin-text-muted)', marginBottom: 12 }} />
              <h3>No submissions</h3>
              <p>Community submissions will appear here.</p>
            </div>
          ) : submissions.map(s => (
            <motion.div key={s.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="admin-card" style={{ padding: '16px 20px', marginBottom: 10, display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--admin-purple-glow)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--admin-purple)', flexShrink: 0 }}>
                <Bookmark size={16} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span className="badge" style={{ background: 'var(--admin-accent-glow)', color: 'var(--admin-accent)', fontSize: 10, padding: '2px 8px' }}>{s.type}</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--admin-text)' }}>{s.title}</span>
                  <span className="badge" style={{ background: statusColors[s.status]?.bg || 'rgba(255,255,255,.06)', color: statusColors[s.status]?.color || 'var(--admin-text-muted)', fontSize: 10, padding: '2px 8px' }}>{s.status}</span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--admin-text-muted)', marginBottom: 4 }}>{s.description || 'No description'}</div>
                <div style={{ fontSize: 11, color: 'var(--admin-text-faint)' }}>by {s.submitter_name} · {new Date(s.created_at).toLocaleDateString()}</div>
              </div>
              {s.status === 'pending' && (
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button className="admin-btn admin-btn-success admin-btn-sm" onClick={() => handleApproveSubmission(s.id)}><Check size={13} /> Approve</button>
                  <button className="admin-btn admin-btn-danger admin-btn-sm" onClick={() => handleRejectSubmission(s.id)}><X size={13} /> Reject</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* ─── Article Create/Edit Modal ──────────────────── */}
      <AnimatePresence>
        {showArticleModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowArticleModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 640 }} initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>{editingArticle ? 'Edit Article' : 'New Article'}</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowArticleModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                {formError && (
                  <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <AlertTriangle size={14} /> {formError}
                  </div>
                )}

                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Headline *</label>
                  <input className="admin-input" placeholder="Article headline" value={articleForm.headline} onChange={e => setArticleForm({ ...articleForm, headline: e.target.value })} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Subtitle</label>
                  <input className="admin-input" placeholder="Brief subtitle (optional)" value={articleForm.subtitle} onChange={e => setArticleForm({ ...articleForm, subtitle: e.target.value })} />
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Body *</label>
                  <textarea className="admin-textarea" rows={6} placeholder="Article body content..." value={articleForm.body} onChange={e => setArticleForm({ ...articleForm, body: e.target.value })} />
                </div>

                {/* Media Type Toggle + FileUpload */}
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Media Type</label>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                    <button type="button" className={`admin-btn ${articleForm.media_type === 'photo' ? 'admin-btn-primary' : 'admin-btn-secondary'}`} onClick={() => setArticleForm({ ...articleForm, media_type: 'photo' })}>
                      <Image size={15} /> Photo
                    </button>
                    <button type="button" className={`admin-btn ${articleForm.media_type === 'video' ? 'admin-btn-primary' : 'admin-btn-secondary'}`} onClick={() => setArticleForm({ ...articleForm, media_type: 'video' })}>
                      <Video size={15} /> Video
                    </button>
                  </div>
                  {articleForm.media_type === 'photo' ? (
                    <FileUpload
                      label="Article Image"
                      value={articleForm.image_url}
                      onChange={url => setArticleForm({ ...articleForm, image_url: url })}
                      folder="mic-mtaani/images"
                      type="image"
                    />
                  ) : (
                    <FileUpload
                      label="Article Video"
                      value={articleForm.video_url}
                      onChange={url => setArticleForm({ ...articleForm, video_url: url })}
                      folder="mic-mtaani/videos"
                      type="video"
                    />
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Category</label>
                    <select className="admin-select" style={{ width: '100%' }} value={articleForm.category_id} onChange={e => setArticleForm({ ...articleForm, category_id: e.target.value })}>
                      <option value="">Select category</option>
                      {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="admin-label">Status</label>
                    <select className="admin-select" style={{ width: '100%' }} value={articleForm.status} onChange={e => setArticleForm({ ...articleForm, status: e.target.value })}>
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
                  <div>
                    <label className="admin-label">Tags (comma-separated)</label>
                    <input className="admin-input" placeholder="politics, nakuru, breaking" value={articleForm.tags} onChange={e => setArticleForm({ ...articleForm, tags: e.target.value })} />
                  </div>
                  <div>
                    <label className="admin-label">Reading Time (min)</label>
                    <input className="admin-input" type="number" min="1" value={articleForm.reading_time} onChange={e => setArticleForm({ ...articleForm, reading_time: e.target.value })} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 16 }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--admin-text-secondary)' }}>
                    <input type="checkbox" className="admin-checkbox" checked={articleForm.is_featured} onChange={e => setArticleForm({ ...articleForm, is_featured: e.target.checked })} />
                    Featured
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13, color: 'var(--admin-text-secondary)' }}>
                    <input type="checkbox" className="admin-checkbox" checked={articleForm.is_breaking} onChange={e => setArticleForm({ ...articleForm, is_breaking: e.target.checked })} />
                    Breaking News
                  </label>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowArticleModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleArticleSubmit} disabled={formLoading}>
                  {formLoading ? 'Saving...' : editingArticle ? 'Update Article' : 'Create Article'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Category Modal ────────────────────────────── */}
      <AnimatePresence>
        {showCatModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCatModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 420 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Add Category</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowCatModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Name *</label>
                  <input className="admin-input" placeholder="Category name" value={catName} onChange={e => setCatName(e.target.value)} />
                </div>
                <div>
                  <label className="admin-label">Color</label>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={catColor} onChange={e => setCatColor(e.target.value)} style={{ width: 36, height: 36, border: 'none', borderRadius: 8, cursor: 'pointer', background: 'transparent' }} />
                    <input className="admin-input" value={catColor} onChange={e => setCatColor(e.target.value)} style={{ width: 120 }} />
                  </div>
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowCatModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleCreateCategory} disabled={catSubmitting || !catName.trim()}>
                  {catSubmitting ? 'Creating...' : 'Create Category'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Journalist Modal ───────────────────────────── */}
      <AnimatePresence>
        {showJournalistModal && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowJournalistModal(false)}>
            <motion.div className="admin-modal" style={{ maxWidth: 480 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3>Add Journalist</h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowJournalistModal(false)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Name *</label>
                  <input className="admin-input" placeholder="Full name" value={journalistForm.name} onChange={e => setJournalistForm({ ...journalistForm, name: e.target.value })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Email</label>
                  <input className="admin-input" type="email" placeholder="email@example.com" value={journalistForm.email} onChange={e => setJournalistForm({ ...journalistForm, email: e.target.value })} />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <label className="admin-label">Role</label>
                  <input className="admin-input" placeholder="e.g. Senior Reporter" value={journalistForm.role} onChange={e => setJournalistForm({ ...journalistForm, role: e.target.value })} />
                </div>
                <div>
                  <label className="admin-label">Bio</label>
                  <textarea className="admin-textarea" rows={3} placeholder="Short biography..." value={journalistForm.bio} onChange={e => setJournalistForm({ ...journalistForm, bio: e.target.value })} />
                </div>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowJournalistModal(false)}>Cancel</button>
                <button className="admin-btn admin-btn-primary" onClick={handleCreateJournalist} disabled={journalistLoading || !journalistForm.name.trim()}>
                  {journalistLoading ? 'Creating...' : 'Create Journalist'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Delete Confirmation Modal ──────────────────── */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div className="admin-modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteConfirm(null)}>
            <motion.div className="admin-modal" style={{ maxWidth: 400 }} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onClick={e => e.stopPropagation()}>
              <div className="admin-modal-header">
                <h3 style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AlertTriangle size={18} style={{ color: 'var(--admin-danger)' }} /> Delete {showDeleteConfirm.type}
                </h3>
                <button className="admin-btn admin-btn-ghost admin-btn-sm" onClick={() => setShowDeleteConfirm(null)}><X size={16} /></button>
              </div>
              <div className="admin-modal-body">
                <p style={{ fontSize: 14, color: 'var(--admin-text-secondary)', lineHeight: 1.6 }}>
                  Are you sure you want to delete <strong style={{ color: 'var(--admin-text)' }}>{showDeleteConfirm.name}</strong>? This action cannot be undone.
                </p>
              </div>
              <div className="admin-modal-footer">
                <button className="admin-btn admin-btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
                <button className="admin-btn admin-btn-danger" onClick={handleDelete} disabled={deleteLoading}>
                  {deleteLoading ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
