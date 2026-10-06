import type { SyntheticEvent } from 'react'

/**
 * Responsive images without breakage risk.
 *
 * - `src` ALWAYS stays the original URL, so browsers without srcset support,
 *   crawlers, and copy-image flows behave exactly as before.
 * - srcset candidates are only emitted for hosts with documented,
 *   server-side resizing: Unsplash (imgix) and Supabase Storage
 *   (`/render/image/`, only for public-bucket object URLs).
 * - If a resized candidate ever fails (e.g. storage transformations are
 *   disabled on the project), `imgFallback` swaps the original back in and
 *   permanently stops emitting Supabase candidates for the session. Worst
 *   case is one failed request — never a broken image.
 */

// Tri-state: null = untested, true = transforms work, false = stop trying.
let supaTransforms: boolean | null = null;

function parseUrl(src: string): URL | null {
  try {
    return new URL(src)
  } catch {
    return null
  }
}

/** imgix width variant — documented params, always safe on Unsplash. */
function unsplashVariant(src: string, w: number): string | null {
  const u = parseUrl(src)
  if (!u || u.hostname !== 'images.unsplash.com') return null
  u.searchParams.set('w', String(w))
  u.searchParams.set('q', '70')
  u.searchParams.set('auto', 'format')
  // Width-descriptor candidates must share one aspect ratio.
  u.searchParams.delete('h')
  return u.toString()
}

/** Supabase Storage image-transformation variant (public buckets only). */
function supabaseVariant(src: string, w: number): string | null {
  if (supaTransforms === false) return null
  const u = parseUrl(src)
  if (!u) return null
  const m = u.pathname.match(/^\/storage\/v1\/object\/public\/(.+)$/)
  if (!m) return null
  return `${u.origin}/storage/v1/render/image/public/${m[1]}?width=${w}&quality=70`
}

function variant(src: string, w: number): string | null {
  return unsplashVariant(src, w) ?? supabaseVariant(src, w)
}

export interface ResponsiveOpts {
  /** Candidate widths. Defaults suit cards and mid-size art. */
  widths?: number[]
  /** Mirrors how the image is actually displayed — keep honest. */
  sizes?: string
}

export interface ResponsiveProps {
  src: string
  srcSet?: string
  sizes?: string
}

export function responsive(src: string, opts: ResponsiveOpts = {}): ResponsiveProps {
  const widths = opts.widths ?? [480, 800, 1280]
  const parts: string[] = []
  for (const w of widths) {
    const url = variant(src, w)
    if (url) parts.push(`${url} ${w}w`)
  }
  if (!parts.length) return { src }
  return { src, srcSet: parts.join(', '), sizes: opts.sizes ?? '(max-width: 768px) 100vw, 800px' }
}

/** Cheap blurred-ambient source: a tiny variant, original as fallback. */
export function smallSrc(src: string): string {
  return variant(src, 480) ?? src
}

/**
 * Error handler for images using `responsive()`. Restores the original URL
 * and, when the failed request was a Supabase render URL, disables further
 * Supabase candidates session-wide. Idempotent — never loops.
 */
export function imgFallback(e: SyntheticEvent<HTMLImageElement>, original: string) {
  const el = e.currentTarget
  if (el.dataset.imgFb) return
  el.dataset.imgFb = '1'
  if (el.src.includes('/storage/v1/render/image/')) supaTransforms = false
  el.removeAttribute('srcset')
  el.removeAttribute('sizes')
  // Resolve relative-vs-absolute so the comparison is meaningful.
  const absolute = parseUrl(original)?.toString() ?? original
  if (el.src !== absolute) el.src = original
}

/** Call on a successful resized load so later images skip re-probing. */
export function imgTransformOk(e: SyntheticEvent<HTMLImageElement>) {
  if (e.currentTarget.src.includes('/storage/v1/render/image/')) supaTransforms = true
}
