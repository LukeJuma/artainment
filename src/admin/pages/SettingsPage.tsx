import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, Globe, Palette, Shield, Key, Database, Mail, Bell, CreditCard, Monitor, Save } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'
import { useApi } from '../hooks/useApi'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI, type PlatformSettings } from '../../lib/api'

const settingsSections = [
  { id: 'general', label: 'General', icon: Settings },
  { id: 'branding', label: 'Branding', icon: Palette },
  { id: 'languages', label: 'Languages', icon: Globe },
  { id: 'security', label: 'Security', icon: Shield },
  { id: 'api', label: 'API Keys', icon: Key },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'email', label: 'Email', icon: Mail },
  { id: 'sms', label: 'SMS', icon: Bell },
  { id: 'payments', label: 'Payment Gateways', icon: CreditCard },
  { id: 'streaming', label: 'Streaming', icon: Monitor },
]

const DEFAULT_SETTINGS: PlatformSettings = {
  platform_name: 'Artainment+',
  tagline: "Kenya's Premier Entertainment Platform",
  support_email: 'support@artainment.co.ke',
  currency: 'KES',
  timezone: 'Africa/Nairobi',
  primary_color: '#FF4D2D',
  logo_url: '',
  favicon_url: '',
}

export function SettingsPage() {
  const { token } = useAuth()
  const [activeSection, setActiveSection] = useState('general')
  const [form, setForm] = useState<PlatformSettings>(DEFAULT_SETTINGS)
  const [saving, setSaving] = useState(false)
  const [savedAt, setSavedAt] = useState<Date | null>(null)
  const [saveError, setSaveError] = useState('')

  const { data: settings, loading } = useApi<PlatformSettings>(
    () => adminAPI.settings(token!),
    [token]
  )

  useEffect(() => {
    if (settings) setForm({ ...DEFAULT_SETTINGS, ...settings })
  }, [settings])

  const set = (key: keyof PlatformSettings, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    if (!token) return
    setSaving(true)
    setSaveError('')
    try {
      const result = await adminAPI.updateSettings(token, form)
      setForm({ ...DEFAULT_SETTINGS, ...result })
      setSavedAt(new Date())
    } catch (e: any) {
      setSaveError(e.message || 'Failed to save settings. Check your connection and try again.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Configure your platform settings"
        actions={
          <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>
            <Save size={15} />
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        }
      />
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center', color: 'var(--admin-text-muted)' }}>Loading settings...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {settingsSections.map(s => {
              const Icon = s.icon
              return (
                <div key={s.id} onClick={() => setActiveSection(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 'var(--admin-radius-md)', cursor: 'pointer', fontSize: 13, fontWeight: activeSection === s.id ? 600 : 500, color: activeSection === s.id ? 'var(--admin-primary)' : 'var(--admin-text-secondary)', background: activeSection === s.id ? 'var(--admin-primary-glow)' : 'transparent', transition: 'all 0.15s' }}>
                  <Icon size={16} strokeWidth={1.8} />
                  {s.label}
                </div>
              )
            })}
          </div>

          <motion.div key={activeSection} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="admin-card" style={{ padding: '28px 32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{settingsSections.find(s => s.id === activeSection)?.label} Settings</h2>
              {savedAt && <span style={{ fontSize: 11, color: 'var(--admin-success)' }}>Saved {savedAt.toLocaleTimeString()}</span>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {activeSection === 'general' && (
                <>
                  <div><label className="admin-label">Platform Name</label><input className="admin-input" value={form.platform_name ?? ''} onChange={e => set('platform_name', e.target.value)} /></div>
                  <div><label className="admin-label">Tagline</label><input className="admin-input" value={form.tagline ?? ''} onChange={e => set('tagline', e.target.value)} /></div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <div><label className="admin-label">Support Email</label><input className="admin-input" value={form.support_email ?? ''} onChange={e => set('support_email', e.target.value)} /></div>
                    <div>
                      <label className="admin-label">Default Currency</label>
                      <select className="admin-select" style={{ width: '100%' }} value={form.currency ?? 'KES'} onChange={e => set('currency', e.target.value)}>
                        <option value="KES">KES - Kenyan Shilling</option>
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="GBP">GBP - British Pound</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="admin-label">Timezone</label>
                    <select className="admin-select" style={{ width: '100%' }} value={form.timezone ?? 'Africa/Nairobi'} onChange={e => set('timezone', e.target.value)}>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT, UTC+3)</option>
                      <option value="Africa/Lagos">Africa/Lagos (WAT, UTC+1)</option>
                      <option value="Africa/Cairo">Africa/Cairo (EET, UTC+2)</option>
                      <option value="Europe/London">Europe/London (GMT/BST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </>
              )}
              {activeSection === 'branding' && (
                <>
                  <div>
                    <label className="admin-label">Primary Color</label>
                    <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <input type="color" value={form.primary_color ?? '#FF4D2D'} onChange={e => set('primary_color', e.target.value)} style={{ width: 40, height: 40, border: 'none', borderRadius: 8, background: 'transparent', cursor: 'pointer', padding: 0 }} />
                      <input className="admin-input" value={form.primary_color ?? ''} onChange={e => set('primary_color', e.target.value)} style={{ width: 160 }} />
                    </div>
                  </div>
                  <div><label className="admin-label">Logo URL</label><input className="admin-input" placeholder="https://..." value={form.logo_url ?? ''} onChange={e => set('logo_url', e.target.value)} /></div>
                  <div><label className="admin-label">Favicon URL</label><input className="admin-input" placeholder="https://..." value={form.favicon_url ?? ''} onChange={e => set('favicon_url', e.target.value)} /></div>
                </>
              )}
              {activeSection !== 'general' && activeSection !== 'branding' && (
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 13, border: '1px dashed var(--admin-border)', borderRadius: 'var(--admin-radius-lg)' }}>
                  <Settings size={28} style={{ color: 'var(--admin-text-faint)', marginBottom: 12 }} />
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--admin-text-secondary)', marginBottom: 6 }}>
                    {settingsSections.find(s => s.id === activeSection)?.label} settings coming soon
                  </div>
                  <div>This section will be available in an upcoming update.</div>
                </div>
              )}
              {saveError && (
                <div style={{ padding: '10px 14px', borderRadius: 8, background: 'var(--admin-danger-glow)', color: 'var(--admin-danger)', fontSize: 12 }}>{saveError}</div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--admin-border)' }}>
                <button className="admin-btn admin-btn-secondary" onClick={() => settings && setForm({ ...DEFAULT_SETTINGS, ...settings })}>Reset</button>
                <button className="admin-btn admin-btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save Changes'}</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 220px 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
