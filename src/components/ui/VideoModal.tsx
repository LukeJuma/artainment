import { useEffect, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { IconX } from './Icons'
import { parseYouTubeId, YouTubePlayer } from './YouTubePlayer'
import { EnhancedVideoPlayer } from './EnhancedVideoPlayer'

interface VideoModalProps {
  src: string
  title: string
  poster?: string | null
  authToken?: string | null
  onClose: () => void
  useCustomPlayer?: boolean // New prop to force custom player
}

const EASE = [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]

export function VideoModal({ src, title, poster, authToken, onClose, useCustomPlayer = false }: VideoModalProps) {
  const reduced = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const [failed, setFailed] = useState(false)
  const [videoSrc, setVideoSrc] = useState(src)
  const [loadingVideo, setLoadingVideo] = useState(false)
  const youTubeId = useCustomPlayer ? null : parseYouTubeId(src) // Skip YouTube if custom player forced

  useEffect(() => {
    setFailed(false)
    setVideoSrc(src)

    if (youTubeId || !authToken) return

    const controller = new AbortController()
    let objectUrl: string | null = null
    setLoadingVideo(true)

    fetch(src, {
      headers: { Authorization: `Bearer ${authToken}` },
      credentials: 'include',
      signal: controller.signal,
    })
      .then(async res => {
        if (!res.ok) throw new Error(`Video request failed with status ${res.status}`)
        const blob = await res.blob()
        objectUrl = URL.createObjectURL(blob)
        setVideoSrc(objectUrl)
      })
      .catch(() => {
        if (!controller.signal.aborted) setFailed(true)
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoadingVideo(false)
      })

    return () => {
      controller.abort()
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [src, authToken, youTubeId])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    closeRef.current?.focus()
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <motion.div
      className="film-trailer-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={reduced ? { duration: 0 } : { duration: 0.25 }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(5,5,7,0.95)', backdropFilter: 'blur(16px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <motion.div
        initial={reduced ? { opacity: 1 } : { opacity: 0, scale: 0.96, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.97, y: 10 }}
        transition={reduced ? { duration: 0 } : { duration: 0.32, ease: EASE }}
        onClick={e => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        style={{ position: 'relative', width: 'min(1200px, 100%)', maxHeight: '90vh' }}
      >
        <div style={{
          position: 'relative', width: '100%', aspectRatio: '16/9', background: '#000',
          borderRadius: 16, overflow: 'hidden',
          boxShadow: '0 50px 140px rgba(0,0,0,0.8), 0 12px 32px rgba(0,0,0,0.6)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}>
          {failed ? (
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center',
              color: 'rgba(255,255,255,0.9)', fontFamily: 'DM Sans, sans-serif',
              background: 'linear-gradient(135deg, rgba(20,20,24,0.95) 0%, rgba(10,10,12,0.95) 100%)',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.2)',
                border: '2px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 24, color: '#ff6b6b', marginBottom: 8,
              }}>
                ⚠️
              </div>
              <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: '#fff' }}>
                Unable to load this video
              </h3>
              <p style={{ fontSize: 15, margin: 0, color: 'rgba(255,255,255,0.7)', maxWidth: 420, lineHeight: 1.6 }}>
                This content may require an active subscription or special access. Please log in or contact support if you believe this is an error.
              </p>
              <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                <a href="/login" className="btn-red" style={{ fontSize: 14, padding: '10px 20px' }}>
                  Log in
                </a>
                <button onClick={onClose} className="btn-outline-light" style={{ fontSize: 14, padding: '10px 20px' }}>
                  Close
                </button>
              </div>
            </div>
          ) : loadingVideo ? (
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 16,
              background: 'linear-gradient(135deg, rgba(20,20,24,0.95) 0%, rgba(10,10,12,0.95) 100%)',
              color: 'rgba(255,255,255,0.85)', fontFamily: 'DM Sans, sans-serif',
            }}>
              <div style={{
                width: 48, height: 48, border: '3px solid rgba(255,255,255,0.2)',
                borderTop: '3px solid var(--red)', borderRadius: '50%',
                animation: 'spin 1s linear infinite',
              }} />
              <p style={{ fontSize: 16, fontWeight: 500, margin: 0 }}>Loading video...</p>
            </div>
          ) : youTubeId ? (
            <YouTubePlayer videoId={youTubeId} />
          ) : (
            <EnhancedVideoPlayer
              src={videoSrc}
              title={title}
              poster={poster}
              autoPlay={true}
              onClose={onClose}
            />
          )}
        </div>

        {/* Custom close button (only show if not using enhanced player which has its own) */}
        {(youTubeId || failed || loadingVideo) && (
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label={`Close ${title}`}
            style={{
              position: 'absolute', top: 16, right: 16, width: 44, height: 44, borderRadius: '50%',
              border: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.7)',
              color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(12px)', zIndex: 10, fontSize: 18, fontWeight: 300,
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.9)'
              e.currentTarget.style.transform = 'scale(1.05)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(0,0,0,0.7)'
              e.currentTarget.style.transform = 'scale(1)'
            }}
          >
            <IconX size={20} />
          </button>
        )}
      </motion.div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </motion.div>
  )
}
