import { useState, useRef } from 'react'
import { Upload, X, Film, Loader2 } from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { adminAPI } from '../../lib/api'

interface FileUploadProps {
  value?: string
  onChange: (url: string) => void
  folder?: string
  accept?: string
  label?: string
  type?: 'image' | 'video'
}

export function FileUpload({ value, onChange, folder = 'uploads', accept, label, type = 'image' }: FileUploadProps) {
  const { token } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!token) return
    setUploading(true)
    setError('')
    try {
      const result = await adminAPI.upload(token, file, folder)
      onChange(result.url)
    } catch (e: any) {
      setError(e.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    if (inputRef.current) inputRef.current.value = ''
  }

  const acceptDefault = type === 'video' ? 'video/mp4,video/mov,video/avi' : 'image/jpeg,image/png,image/webp,image/gif'

  return (
    <div>
      {label && <label className="admin-label">{label}</label>}

      {value ? (
        <div style={{ position: 'relative', borderRadius: 'var(--admin-radius-md)', overflow: 'hidden', border: '1px solid var(--admin-border)' }}>
          {type === 'video' ? (
            <div style={{ padding: '14px 16px', display: 'flex', alignItems: 'center', gap: 10, background: 'var(--admin-bg)' }}>
              <Film size={18} style={{ color: 'var(--admin-info)', flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--admin-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                {value}
              </span>
            </div>
          ) : (
            <img src={value} alt="Preview" style={{ width: '100%', maxHeight: 180, objectFit: 'cover', display: 'block', background: 'var(--admin-secondary)' }} />
          )}
          <button
            onClick={() => onChange('')}
            style={{
              position: 'absolute', top: 6, right: 6, width: 26, height: 26, borderRadius: 8,
              background: 'rgba(0,0,0,.6)', border: 'none', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={14} />
          </button>
        </div>
      ) : (
        <div
          onDragOver={e => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          style={{
            border: `2px dashed ${dragOver ? 'var(--admin-primary)' : 'var(--admin-border)'}`,
            borderRadius: 'var(--admin-radius-md)',
            padding: '24px 16px',
            textAlign: 'center',
            cursor: uploading ? 'default' : 'pointer',
            transition: 'border-color 0.2s, background 0.2s',
            background: dragOver ? 'var(--admin-primary-glow)' : 'var(--admin-bg)',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
              <Loader2 size={24} style={{ color: 'var(--admin-primary)', animation: 'spin 1s linear infinite' }} />
              <div style={{ fontSize: 13, color: 'var(--admin-text-muted)' }}>Uploading...</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              {type === 'video' ? <Film size={22} style={{ color: 'var(--admin-text-muted)' }} /> : <Upload size={22} style={{ color: 'var(--admin-text-muted)' }} />}
              <div style={{ fontSize: 13, color: 'var(--admin-text-secondary)' }}>Click or drag to upload</div>
              <div style={{ fontSize: 11, color: 'var(--admin-text-muted)' }}>{type === 'video' ? 'MP4, MOV up to 2GB' : 'PNG, JPG, WebP up to 10MB'}</div>
            </div>
          )}
        </div>
      )}

      {error && <div style={{ fontSize: 11, color: 'var(--admin-danger)', marginTop: 6 }}>{error}</div>}

      <input ref={inputRef} type="file" accept={accept || acceptDefault} onChange={handleInput} style={{ display: 'none' }} />

      <div style={{ marginTop: 6 }}>
        <input
          className="admin-input"
          placeholder="Or paste a URL"
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          style={{ fontSize: 12 }}
        />
      </div>
    </div>
  )
}
