import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { filmsAPI, servicesAPI, talentAPI, newsAPI, adminAPI, type Film, type Service, type Talent, type NewsArticle, type Contact } from '../lib/api'
import { Section } from '../components/ui/Section'
import { SectionLabel } from '../components/ui/SectionLabel'

const tabs = [
  { key: 'contacts', label: 'Contacts' },
  { key: 'films', label: 'Films' },
  { key: 'services', label: 'Services' },
  { key: 'talent', label: 'Talent' },
  { key: 'news', label: 'News' },
] as const

export function AdminPage() {
  const { token } = useAuth()
  const [tab, setTab] = useState<'contacts' | 'films' | 'services' | 'talent' | 'news'>('contacts')
  const [contacts, setContacts] = useState<Contact[]>([])
  const [films, setFilms] = useState<Film[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [talent, setTalent] = useState<Talent[]>([])
  const [news, setNews] = useState<NewsArticle[]>([])

  useEffect(() => {
    if (!token) return
    if (tab === 'contacts') adminAPI.contacts(token).then(setContacts).catch(() => {})
    if (tab === 'films') filmsAPI.list().then(setFilms).catch(() => {})
    if (tab === 'services') servicesAPI.list().then(setServices).catch(() => {})
    if (tab === 'talent') talentAPI.list().then(setTalent).catch(() => {})
    if (tab === 'news') newsAPI.list().then(setNews).catch(() => {})
  }, [tab, token])

  const deleteItem = async (type: string, id: number) => {
    if (!token || !confirm('Are you sure?')) return
    try {
      if (type === 'film') { await adminAPI.deleteFilm(token, id); setFilms(films.filter(f => f.id !== id)) }
      if (type === 'service') { await adminAPI.deleteService(token, id); setServices(services.filter(s => s.id !== id)) }
      if (type === 'talent') { await adminAPI.deleteTalent(token, id); setTalent(talent.filter(t => t.id !== id)) }
      if (type === 'news') { await adminAPI.deleteNews(token, id); setNews(news.filter(n => n.id !== id)) }
    } catch {}
  }

  return (
    <div style={{ paddingTop: 80, minHeight: '100vh' }}>
      <Section>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <SectionLabel text="Administration" />
          <h1 style={{ fontFamily: 'Chonburi, cursive', fontSize: 'clamp(32px, 5vw, 48px)', fontWeight: 700, color: 'var(--text)', margin: '0 0 48px' }}>Admin Dashboard</h1>

          <div style={{ display: 'flex', gap: 4, marginBottom: 40, borderBottom: '1px solid var(--border)', paddingBottom: 0, overflowX: 'auto' }}>
            {tabs.map(t => (
              <button key={t.key} onClick={() => setTab(t.key)}
                style={{ background: tab === t.key ? 'var(--red)' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'DM Sans, sans-serif', fontSize: 12, fontWeight: 600, letterSpacing: 1, textTransform: 'uppercase', color: tab === t.key ? 'var(--text)' : 'var(--text-secondary)', padding: '10px 16px', minHeight: 44, transition: 'all 0.2s', whiteSpace: 'nowrap' }}>
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'contacts' && (
            <div style={{ display: 'grid', gap: 2 }}>
              {contacts.map(c => (
                <div key={c.id} className="admin-row"
                  style={{ background: 'var(--bg-muted)', padding: '20px 24px', display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 24, alignItems: 'center', borderBottom: '1px solid var(--border)' }}>
                  <div>
                    <div style={{ fontFamily: 'Chonburi, cursive', fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>{c.name}</div>
                    <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)' }}>{c.email}</div>
                  </div>
                  <div style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 14, color: 'var(--text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.message}</div>
                  <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 11, letterSpacing: 1, color: c.status === 'pending' ? 'var(--red)' : '#22c55e', textTransform: 'uppercase', fontWeight: 600 }}>{c.status}</span>
                </div>
              ))}
              {contacts.length === 0 && <p style={{ fontFamily: 'DM Sans, sans-serif', color: 'var(--text-muted)', textAlign: 'center', padding: 40 }}>No contact submissions yet.</p>}
            </div>
          )}

          {tab === 'films' && (
            <div>
              {films.map(f => (
                <div key={f.id} className="admin-item-row"
                  style={{ background: 'var(--bg-muted)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, borderRadius: 4 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: 'Chonburi, cursive', fontSize: 15, color: 'var(--text)', fontWeight: 600 }}>{f.title}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)', marginLeft: 16 }}>{f.genre} · {f.year}</span>
                  </div>
                  <button onClick={() => deleteItem('film', f.id)}
                    style={{ background: 'transparent', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', color: 'var(--red)', cursor: 'pointer', padding: '8px 14px', minHeight: 36, display: 'inline-flex', alignItems: 'center', borderRadius: 4, fontFamily: 'DM Sans, sans-serif', fontSize: 12, flexShrink: 0 }}>Delete</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'services' && (
            <div>
              {services.map(s => (
                <div key={s.id} className="admin-item-row"
                  style={{ background: 'var(--bg-muted)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, borderRadius: 4 }}>
                  <span style={{ fontFamily: 'Chonburi, cursive', fontSize: 15, color: 'var(--text)', fontWeight: 600, minWidth: 0 }}>{s.icon} {s.title}</span>
                  <button onClick={() => deleteItem('service', s.id)}
                    style={{ background: 'transparent', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', color: 'var(--red)', cursor: 'pointer', padding: '8px 14px', minHeight: 36, display: 'inline-flex', alignItems: 'center', borderRadius: 4, fontFamily: 'DM Sans, sans-serif', fontSize: 12, flexShrink: 0 }}>Delete</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'talent' && (
            <div>
              {talent.map(t => (
                <div key={t.id} className="admin-item-row"
                  style={{ background: 'var(--bg-muted)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, borderRadius: 4 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: 'Chonburi, cursive', fontSize: 15, color: 'var(--text)', fontWeight: 600 }}>{t.name}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)', marginLeft: 16 }}>{t.role} · {t.credits} credits</span>
                  </div>
                  <button onClick={() => deleteItem('talent', t.id)}
                    style={{ background: 'transparent', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', color: 'var(--red)', cursor: 'pointer', padding: '8px 14px', minHeight: 36, display: 'inline-flex', alignItems: 'center', borderRadius: 4, fontFamily: 'DM Sans, sans-serif', fontSize: 12, flexShrink: 0 }}>Delete</button>
                </div>
              ))}
            </div>
          )}

          {tab === 'news' && (
            <div>
              {news.map(n => (
                <div key={n.id} className="admin-item-row"
                  style={{ background: 'var(--bg-muted)', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 2, borderRadius: 4 }}>
                  <div style={{ minWidth: 0 }}>
                    <span style={{ fontFamily: 'Chonburi, cursive', fontSize: 15, color: 'var(--text)', fontWeight: 600 }}>{n.title}</span>
                    <span style={{ fontFamily: 'DM Sans, sans-serif', fontSize: 12, color: 'var(--text-muted)', marginLeft: 16 }}>{n.category}</span>
                  </div>
                  <button onClick={() => deleteItem('news', n.id)}
                    style={{ background: 'transparent', border: '1px solid color-mix(in srgb, var(--red) 30%, transparent)', color: 'var(--red)', cursor: 'pointer', padding: '8px 14px', minHeight: 36, display: 'inline-flex', alignItems: 'center', borderRadius: 4, fontFamily: 'DM Sans, sans-serif', fontSize: 12, flexShrink: 0 }}>Delete</button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Section>
    </div>
  )
}
