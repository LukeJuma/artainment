import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings, Globe, Palette, Shield, Key, Database, Mail, Bell, CreditCard, Monitor, Save } from 'lucide-react'
import { PageHeader } from '../components/PageHeader'

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

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState('general')

  return (
    <div>
      <PageHeader title="Settings" description="Configure your platform settings" actions={<button className="admin-btn admin-btn-primary"><Save size={15} /> Save Changes</button>} />
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Settings Nav */}
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

        {/* Settings Content */}
        <motion.div key={activeSection} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }} className="admin-card" style={{ padding: '28px 32px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800, fontFamily: "'Plus Jakarta Sans', sans-serif", marginBottom: 24 }}>{settingsSections.find(s => s.id === activeSection)?.label} Settings</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {activeSection === 'general' && (
              <>
                <div><label className="admin-label">Platform Name</label><input className="admin-input" defaultValue="Artainment+" /></div>
                <div><label className="admin-label">Tagline</label><input className="admin-input" defaultValue="Kenya's Premier Entertainment Platform" /></div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div><label className="admin-label">Support Email</label><input className="admin-input" defaultValue="support@artainment.co.ke" /></div>
                  <div><label className="admin-label">Default Currency</label><select className="admin-select" style={{ width: '100%' }}><option>KES - Kenyan Shilling</option><option>USD - US Dollar</option></select></div>
                </div>
                <div><label className="admin-label">Timezone</label><select className="admin-select" style={{ width: '100%' }}><option>Africa/Nairobi (EAT, UTC+3)</option></select></div>
              </>
            )}
            {activeSection === 'branding' && (
              <>
                <div><label className="admin-label">Primary Color</label><div style={{ display: 'flex', gap: 10, alignItems: 'center' }}><div style={{ width: 36, height: 36, borderRadius: 8, background: '#FF4D2D', cursor: 'pointer' }} /><input className="admin-input" defaultValue="#FF4D2D" style={{ width: 160 }} /></div></div>
                <div><label className="admin-label">Logo Upload</label><div style={{ border: '2px dashed var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer' }}><div style={{ fontSize: 13, color: 'var(--admin-text-secondary)' }}>Click to upload logo</div><div style={{ fontSize: 11, color: 'var(--admin-text-muted)', marginTop: 4 }}>SVG, PNG up to 2MB</div></div></div>
                <div><label className="admin-label">Favicon</label><div style={{ border: '2px dashed var(--admin-border)', borderRadius: 'var(--admin-radius-lg)', padding: '24px', textAlign: 'center', cursor: 'pointer' }}><div style={{ fontSize: 13, color: 'var(--admin-text-secondary)' }}>Click to upload favicon</div></div></div>
              </>
            )}
            {activeSection !== 'general' && activeSection !== 'branding' && (
              <>
                <div style={{ padding: '40px 20px', textAlign: 'center', color: 'var(--admin-text-muted)', fontSize: 13 }}>
                  Configure your {settingsSections.find(s => s.id === activeSection)?.label.toLowerCase()} settings here.
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 12, paddingTop: 16, borderTop: '1px solid var(--admin-border)' }}>
              <button className="admin-btn admin-btn-secondary">Reset</button>
              <button className="admin-btn admin-btn-primary">Save Changes</button>
            </div>
          </div>
        </motion.div>
      </div>
      <style>{`@media (max-width: 768px) { div[style*="grid-template-columns: 220px 1fr"] { grid-template-columns: 1fr !important; } }`}</style>
    </div>
  )
}
