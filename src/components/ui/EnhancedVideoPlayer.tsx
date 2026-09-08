import { useEffect, useRef, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { IconPlay, IconPause, IconVolumeX, IconVolume2, IconMaximize, IconSettings, IconSkipBack, IconSkipForward, IconX } from './Icons'
import { loadYouTubeApi } from './YouTubePlayer'

interface EnhancedVideoPlayerProps {
  src: string
  title: string
  poster?: string | null
  autoPlay?: boolean
  onClose?: () => void
  youtubeId?: string | null
}

type YTState = -1 | 0 | 1 | 2 | 3 | 5

export function EnhancedVideoPlayer({ src, title, poster, autoPlay = true, onClose, youtubeId }: EnhancedVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const ytContainerRef = useRef<HTMLDivElement>(null)
  const ytPlayerRef = useRef<any>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(1)
  const [isMuted, setIsMuted] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  const [playbackRate, setPlaybackRate] = useState(1)
  const [showSettings, setShowSettings] = useState(false)
  const [ytReady, setYtReady] = useState(false)
  const [isSeeking, setIsSeeking] = useState(false)

  const controlsTimeoutRef = useRef<NodeJS.Timeout>(null)
  const ytTimeIntervalRef = useRef<NodeJS.Timeout>(null)
  const isYouTube = Boolean(youtubeId)

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
                 : `${m}:${s.toString().padStart(2, '0')}`
  }

  const resetControlsTimeout = useCallback(() => {
    if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current)
    setShowControls(true)
    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => setShowControls(false), 3000)
    }
  }, [isPlaying])

  // ── YouTube IFrame API ──────────────────────────────────────────────
  useEffect(() => {
    if (!youtubeId || !ytContainerRef.current) return
    let cancelled = false

    loadYouTubeApi().then(() => {
      if (cancelled || !ytContainerRef.current || !(window as any).YT) return
      ytPlayerRef.current = new (window as any).YT.Player(ytContainerRef.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: autoPlay ? 1 : 0,
          controls: 0,
          disablekb: 1,
          iv_load_policy: 3,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          playsinline: 1,
          fs: 0,
          cc_load_policy: 0,
          origin: window.location.origin,
        },
        events: {
          onReady: () => {
            if (cancelled) return
            setYtReady(true)
            setIsLoading(false)
            const d = ytPlayerRef.current?.getDuration?.()
            if (d && isFinite(d)) setDuration(d)
            if (autoPlay) ytPlayerRef.current?.playVideo?.()
          },
          onStateChange: (e: { data: YTState }) => {
            if (cancelled) return
            const state = e.data
            setIsPlaying(state === 1)
            if (state === 0) setShowControls(true) // ended
          },
          onError: () => {
            if (!cancelled) { setHasError(true); setIsLoading(false) }
          },
        },
      })
    })

    return () => {
      cancelled = true
      if (ytTimeIntervalRef.current) clearInterval(ytTimeIntervalRef.current)
      try { ytPlayerRef.current?.destroy?.() } catch { /* ignore */ }
      ytPlayerRef.current = null
    }
  }, [youtubeId, autoPlay])

  // YouTube time polling
  useEffect(() => {
    if (!isYouTube || !ytReady) return
    ytTimeIntervalRef.current = setInterval(() => {
      const p = ytPlayerRef.current
      if (!p?.getCurrentTime) return
      const t = p.getCurrentTime()
      const d = p.getDuration()
      if (!isSeeking) setCurrentTime(t)
      if (d && isFinite(d)) setDuration(d)
    }, 250)
    return () => { if (ytTimeIntervalRef.current) clearInterval(ytTimeIntervalRef.current) }
  }, [isYouTube, ytReady, isSeeking])

  // ── Native <video> events ───────────────────────────────────────────
  useEffect(() => {
    const video = videoRef.current
    if (!video || isYouTube) return

    const onMeta = () => { setDuration(video.duration); setIsLoading(false); if (autoPlay) video.play().catch(() => setIsLoading(false)) }
    const onTime = () => { if (!isSeeking) setCurrentTime(video.currentTime) }
    const onPlay = () => { setIsPlaying(true); resetControlsTimeout() }
    const onPause = () => { setIsPlaying(false); setShowControls(true); if (controlsTimeoutRef.current) clearTimeout(controlsTimeoutRef.current) }
    const onVol = () => { setVolume(video.volume); setIsMuted(video.muted) }
    const onWait = () => setIsLoading(true)
    const onCan = () => setIsLoading(false)

    video.addEventListener('loadedmetadata', onMeta)
    video.addEventListener('timeupdate', onTime)
    video.addEventListener('play', onPlay)
    video.addEventListener('pause', onPause)
    video.addEventListener('volumechange', onVol)
    video.addEventListener('waiting', onWait)
    video.addEventListener('canplay', onCan)
    return () => {
      video.removeEventListener('loadedmetadata', onMeta)
      video.removeEventListener('timeupdate', onTime)
      video.removeEventListener('play', onPlay)
      video.removeEventListener('pause', onPause)
      video.removeEventListener('volumechange', onVol)
      video.removeEventListener('waiting', onWait)
      video.removeEventListener('canplay', onCan)
    }
  }, [autoPlay, resetControlsTimeout, isSeeking])

  useEffect(() => {
    if (!isYouTube && videoRef.current) videoRef.current.volume = volume
  }, [volume, isYouTube])

  // ── Controls ────────────────────────────────────────────────────────
  const ytToggle = useCallback(() => {
    const p = ytPlayerRef.current
    if (!p) return
    const state = p.getPlayerState?.()
    if (state === 1) p.pauseVideo()
    else p.playVideo()
  }, [])

  const togglePlayPause = useCallback(() => {
    if (isYouTube) return ytToggle()
    const v = videoRef.current
    if (!v) return
    isPlaying ? v.pause() : v.play()
  }, [isPlaying, isYouTube, ytToggle])

  const toggleMute = useCallback(() => {
    if (isYouTube) {
      const p = ytPlayerRef.current
      if (!p) return
      if (isMuted) { p.unMute(); setIsMuted(false); setVolume(p.getVolume?.() / 100 || 1) }
      else { p.mute(); setIsMuted(true) }
      return
    }
    const v = videoRef.current
    if (!v) return
    v.muted = !isMuted
    setIsMuted(!isMuted)
  }, [isMuted, isYouTube])

  const seekTo = useCallback((pct: number) => {
    if (!duration) return
    const t = (pct / 100) * duration
    if (isYouTube) { ytPlayerRef.current?.seekTo?.(t, true); setCurrentTime(t); return }
    if (videoRef.current) { videoRef.current.currentTime = t; setCurrentTime(t) }
  }, [duration, isYouTube])

  const skip = useCallback((s: number) => {
    if (isYouTube) { const t = Math.max(0, ytPlayerRef.current?.getCurrentTime?.() + s); ytPlayerRef.current?.seekTo?.(t, true); return }
    if (videoRef.current) videoRef.current.currentTime += s
  }, [isYouTube])

  const changePlaybackRate = useCallback((r: number) => {
    if (isYouTube) { ytPlayerRef.current?.setPlaybackRate?.(r); setPlaybackRate(r); setShowSettings(false); return }
    if (videoRef.current) { videoRef.current.playbackRate = r; setPlaybackRate(r); setShowSettings(false) }
  }, [isYouTube])

  const changeVolume = useCallback((v: number) => {
    setVolume(v)
    if (v > 0) setIsMuted(false)
    if (isYouTube) { ytPlayerRef.current?.setVolume?.(v * 100); if (isMuted) ytPlayerRef.current?.unMute?.(); return }
    if (videoRef.current) videoRef.current.volume = v
  }, [isYouTube, isMuted])

  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return
    if (!isFullscreen) containerRef.current.requestFullscreen?.()
    else document.exitFullscreen?.()
  }, [isFullscreen])

  // ── Seekbar drag ────────────────────────────────────────────────────
  const seekbarRef = useRef<HTMLDivElement>(null)

  const handleSeekStart = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    setIsSeeking(true)
    const seekbar = seekbarRef.current
    if (!seekbar) return
    const rect = seekbar.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setCurrentTime((pct / 100) * duration)
  }, [duration])

  const handleSeekMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isSeeking) return
    const seekbar = seekbarRef.current
    if (!seekbar) return
    const rect = seekbar.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    setCurrentTime((pct / 100) * duration)
  }, [isSeeking, duration])

  const handleSeekEnd = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (!isSeeking) return
    const seekbar = seekbarRef.current
    if (!seekbar) return
    const rect = seekbar.getBoundingClientRect()
    const clientX = 'changedTouches' in e ? e.changedTouches[0].clientX : e.clientX
    const pct = Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100))
    seekTo(pct)
    setIsSeeking(false)
  }, [isSeeking, seekTo])

  // ── Keyboard ────────────────────────────────────────────────────────
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement) return
      switch (e.code) {
        case 'Space': e.preventDefault(); togglePlayPause(); break
        case 'KeyM': toggleMute(); break
        case 'KeyF': toggleFullscreen(); break
        case 'ArrowLeft': skip(-10); break
        case 'ArrowRight': skip(10); break
        case 'ArrowUp': e.preventDefault(); changeVolume(Math.min(1, volume + 0.1)); break
        case 'ArrowDown': e.preventDefault(); changeVolume(Math.max(0, volume - 0.1)); break
        case 'Escape': onClose?.(); break
      }
      resetControlsTimeout()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [togglePlayPause, toggleMute, toggleFullscreen, skip, changeVolume, volume, resetControlsTimeout, onClose])

  useEffect(() => {
    const h = () => setIsFullscreen(!!document.fullscreenElement)
    document.addEventListener('fullscreenchange', h)
    return () => document.removeEventListener('fullscreenchange', h)
  }, [])

  const progressPct = duration ? (currentTime / duration) * 100 : 0

  // ── RENDER ──────────────────────────────────────────────────────────
  return (
    <div
      ref={containerRef}
      className="enhanced-video-player"
      onMouseMove={resetControlsTimeout}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      style={{
        position: 'relative', width: '100%', height: '100%', background: '#000',
        cursor: showControls || !isPlaying ? 'default' : 'none',
        overflow: 'hidden', borderRadius: '16px',
      }}
    >
      {/* YouTube: hidden API container */}
      {isYouTube && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
          <div ref={ytContainerRef} style={{ width: '100%', height: '100%' }} />
        </div>
      )}

      {/* Native video */}
      {!isYouTube && (
        <video
          ref={videoRef}
          src={src}
          poster={poster || undefined}
          playsInline
          preload="metadata"
          onClick={togglePlayPause}
          onError={() => setHasError(true)}
          style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block', zIndex: 0, position: 'absolute', inset: 0 }}
        />
      )}

      {/* Error state */}
      {hasError && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', gap: 16, padding: 32, textAlign: 'center',
          color: 'rgba(255,255,255,0.9)', fontFamily: 'DM Sans, sans-serif',
          background: 'linear-gradient(135deg, rgba(20,20,24,0.95) 0%, rgba(10,10,12,0.95) 100%)',
          zIndex: 10,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: '50%', background: 'rgba(239,68,68,0.2)',
            border: '2px solid rgba(239,68,68,0.4)', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontSize: 24, color: '#ff6b6b', marginBottom: 8,
          }}>
            ⚠️
          </div>
          <h3 style={{ fontSize: 20, fontWeight: 600, margin: 0, color: '#fff' }}>Playback Error</h3>
          <p style={{ fontSize: 15, margin: 0, color: 'rgba(255,255,255,0.7)', maxWidth: 420, lineHeight: 1.6 }}>
            This video could not be loaded. Please try again later.
          </p>
          <button onClick={onClose} className="btn-red" style={{ fontSize: 14, padding: '10px 20px', marginTop: 8 }}>
            Close
          </button>
        </div>
      )}

      {/* Loading spinner */}
      {isLoading && !hasError && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: 'rgba(0,0,0,0.6)', zIndex: 10,
        }}>
          <div style={{
            width: 50, height: 50, border: '3px solid rgba(255,255,255,0.15)',
            borderTop: '3px solid #e11d48', borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }} />
        </div>
      )}

      {/* ─── Center play button ─── */}
      <AnimatePresence>
        {!isPlaying && !isLoading && !hasError && (
          <motion.button
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.2 }}
            onClick={togglePlayPause}
            style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
              width: 88, height: 88, borderRadius: '50%', background: 'rgba(0,0,0,0.55)',
              border: '2px solid rgba(225,29,72,0.6)', color: '#fff', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backdropFilter: 'blur(12px)', zIndex: 20,
              boxShadow: '0 0 60px rgba(225,29,72,0.25)',
            }}
          >
            <IconPlay size={36} color="#fff" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* ─── Controls overlay ─── */}
      <AnimatePresence>
        {(showControls || !isPlaying) && !hasError && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            style={{
              position: 'absolute', inset: 0, zIndex: 15,
              background: 'linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 28%, transparent 42%, transparent 68%, rgba(0,0,0,0.4) 100%)',
              pointerEvents: 'none',
            }}
          >
            {/* Top bar: title + close */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0,
              padding: '18px 22px', pointerEvents: 'all',
              background: 'linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, transparent 100%)',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <h3 style={{
                    color: '#fff', fontFamily: 'DM Sans, sans-serif', fontSize: 17,
                    fontWeight: 600, margin: 0, textShadow: '0 2px 8px rgba(0,0,0,0.6)',
                    letterSpacing: '-0.01em',
                  }}>
                    {title}
                  </h3>
                  <span style={{
                    fontSize: 10, fontWeight: 700, color: '#e11d48',
                    background: 'rgba(225,29,72,0.15)', border: '1px solid rgba(225,29,72,0.3)',
                    padding: '2px 8px', borderRadius: 4, textTransform: 'uppercase',
                    letterSpacing: '0.08em', fontFamily: 'DM Sans, sans-serif',
                  }}>
                    Enhanced
                  </span>
                </div>
                {onClose && (
                  <button onClick={onClose} style={{
                    background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)',
                    color: '#fff', width: 36, height: 36, borderRadius: '50%', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    backdropFilter: 'blur(8px)', transition: 'all 0.2s ease',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(225,29,72,0.4)'; e.currentTarget.style.borderColor = 'rgba(225,29,72,0.6)' }}
                    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)' }}
                  >
                    <IconX size={16} />
                  </button>
                )}
              </div>
            </div>

            {/* Bottom controls */}
            <div style={{
              position: 'absolute', bottom: 0, left: 0, right: 0,
              padding: '0 22px 20px', pointerEvents: 'all',
            }}>
              {/* Progress bar */}
              <div
                ref={seekbarRef}
                onMouseDown={handleSeekStart}
                onMouseMove={handleSeekMove}
                onMouseUp={handleSeekEnd}
                onMouseLeave={handleSeekEnd}
                onTouchStart={handleSeekStart}
                onTouchMove={handleSeekMove}
                onTouchEnd={handleSeekEnd}
                style={{
                  width: '100%', height: isSeeking ? 8 : 5, borderRadius: 3, marginBottom: 14, cursor: 'pointer',
                  background: 'rgba(255,255,255,0.15)', position: 'relative', transition: 'height 0.15s ease',
                }}
              >
                {/* Buffer bar (decorative) */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 3,
                  width: `${Math.min(100, progressPct + 15)}%`, background: 'rgba(255,255,255,0.1)',
                }} />
                {/* Played bar */}
                <div style={{
                  position: 'absolute', top: 0, left: 0, height: '100%', borderRadius: 3,
                  width: `${progressPct}%`,
                  background: 'linear-gradient(90deg, #e11d48 0%, #f43f5e 100%)',
                  transition: isSeeking ? 'none' : 'width 0.25s linear',
                }}>
                  {/* Thumb */}
                  <div style={{
                    position: 'absolute', right: -7, top: '50%', transform: 'translateY(-50%)',
                    width: isSeeking ? 16 : 12, height: isSeeking ? 16 : 12, borderRadius: '50%',
                    background: '#fff', boxShadow: '0 0 10px rgba(225,29,72,0.5), 0 2px 6px rgba(0,0,0,0.3)',
                    transition: 'all 0.15s ease',
                  }} />
                </div>
                {/* Hover time tooltip */}
                {isSeeking && (
                  <div style={{
                    position: 'absolute', top: -32, left: `${progressPct}%`, transform: 'translateX(-50%)',
                    background: 'rgba(0,0,0,0.85)', color: '#fff', fontSize: 12, fontWeight: 600,
                    padding: '4px 8px', borderRadius: 4, fontFamily: 'DM Sans, sans-serif',
                    whiteSpace: 'nowrap',
                  }}>
                    {formatTime(currentTime)}
                  </div>
                )}
              </div>

              {/* Button row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  {/* Play / Pause */}
                  <button onClick={togglePlayPause} style={{
                    background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                    padding: 8, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'background 0.15s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    {isPlaying ? <IconPause size={22} /> : <IconPlay size={22} />}
                  </button>

                  {/* Skip back */}
                  <button onClick={() => skip(-10)} style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                    padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.15s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    <IconSkipBack size={18} />
                  </button>

                  {/* Skip forward */}
                  <button onClick={() => skip(10)} style={{
                    background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
                    padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'color 0.15s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.7)'}
                  >
                    <IconSkipForward size={18} />
                  </button>

                  {/* Volume */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <button onClick={toggleMute} style={{
                      background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                      padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {isMuted || volume === 0 ? <IconVolumeX size={20} /> : <IconVolume2 size={20} />}
                    </button>
                    <input
                      type="range" min="0" max="1" step="0.02"
                      value={isMuted ? 0 : volume}
                      onChange={e => changeVolume(parseFloat(e.target.value))}
                      className="enhanced-volume-slider"
                      style={{ width: 72, height: 4, cursor: 'pointer' }}
                    />
                  </div>

                  {/* Time */}
                  <div style={{
                    color: 'rgba(255,255,255,0.85)', fontFamily: 'DM Sans, monospace', fontSize: 13,
                    fontWeight: 500, marginLeft: 6, letterSpacing: '0.02em',
                    fontVariantNumeric: 'tabular-nums',
                  }}>
                    <span style={{ color: '#fff' }}>{formatTime(currentTime)}</span>
                    <span style={{ margin: '0 4px', opacity: 0.4 }}>/</span>
                    <span style={{ opacity: 0.6 }}>{formatTime(duration)}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {/* Settings */}
                  <div style={{ position: 'relative' }}>
                    <button onClick={() => setShowSettings(!showSettings)} style={{
                      background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                      padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                      borderRadius: 6, transition: 'background 0.15s ease',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'none'}
                    >
                      <IconSettings size={20} />
                    </button>

                    <AnimatePresence>
                      {showSettings && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.95 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 8, scale: 0.95 }}
                          transition={{ duration: 0.15 }}
                          style={{
                            position: 'absolute', bottom: 44, right: 0,
                            background: 'rgba(12,12,15,0.95)', borderRadius: 10, padding: 10,
                            minWidth: 140, backdropFilter: 'blur(20px)',
                            border: '1px solid rgba(255,255,255,0.08)',
                            boxShadow: '0 16px 48px rgba(0,0,0,0.6)',
                          }}
                        >
                          <div style={{
                            color: 'rgba(255,255,255,0.5)', fontSize: 10, fontWeight: 700,
                            textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 6,
                            padding: '0 6px', fontFamily: 'DM Sans, sans-serif',
                          }}>
                            Speed
                          </div>
                          {[0.25, 0.5, 0.75, 1, 1.25, 1.5, 2].map(rate => (
                            <button key={rate} onClick={() => changePlaybackRate(rate)} style={{
                              display: 'block', width: '100%', padding: '6px 10px',
                              background: playbackRate === rate ? 'rgba(225,29,72,0.25)' : 'transparent',
                              border: playbackRate === rate ? '1px solid rgba(225,29,72,0.4)' : '1px solid transparent',
                              color: playbackRate === rate ? '#f43f5e' : 'rgba(255,255,255,0.7)',
                              cursor: 'pointer', borderRadius: 6, fontSize: 13, textAlign: 'left',
                              fontFamily: 'DM Sans, sans-serif', fontWeight: playbackRate === rate ? 600 : 400,
                              transition: 'all 0.15s ease',
                            }}>
                              {rate === 1 ? 'Normal' : `${rate}x`}
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Fullscreen */}
                  <button onClick={toggleFullscreen} style={{
                    background: 'none', border: 'none', color: '#fff', cursor: 'pointer',
                    padding: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 6, transition: 'background 0.15s ease',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'none'}
                  >
                    <IconMaximize size={20} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ─── Inline styles ─── */}
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .enhanced-volume-slider {
          -webkit-appearance: none;
          appearance: none;
          background: rgba(255,255,255,0.2);
          border-radius: 2px;
          outline: none;
        }
        .enhanced-volume-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: 2px solid rgba(225,29,72,0.6);
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
        .enhanced-volume-slider::-moz-range-thumb {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #fff;
          cursor: pointer;
          border: 2px solid rgba(225,29,72,0.6);
          box-shadow: 0 1px 4px rgba(0,0,0,0.3);
        }
      `}</style>
    </div>
  )
}
