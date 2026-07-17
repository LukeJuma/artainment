import { PLACEHOLDER } from './constants'

export function imgOr(type: 'film' | 'service' | 'talent' | 'production' | 'news', url: string | null, idx = 0): string {
  if (url) return url
  const pool = { film: PLACEHOLDER.film, service: PLACEHOLDER.serviceImgs, talent: PLACEHOLDER.talentPool, production: PLACEHOLDER.production, news: PLACEHOLDER.news }
  const p = pool[type]
  return Array.isArray(p) ? p[idx % p.length] : p
}

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}
