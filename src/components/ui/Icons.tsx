interface IconProps {
  size?: number
  color?: string
  className?: string
  style?: React.CSSProperties
}

const dflt: IconProps = { size: 20, color: 'currentColor' }

export function IconSun({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  )
}

export function IconMoon({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  )
}

export function IconPlay({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill={color || dflt.color} stroke="none" style={style} className={className}>
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  )
}

export function IconPlayCircle({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" fill={color || dflt.color} />
    </svg>
  )
}

export function IconArrowRight({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <line x1="5" y1="12" x2="19" y2="12" />
      <polyline points="12 5 19 12 12 19" />
    </svg>
  )
}

export function IconCheck({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

export function IconStar({ size, color, style, className, filled }: IconProps & { filled?: boolean }) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill={filled !== false ? (color || dflt.color) : 'none'} stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

export function IconClock({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

export function IconEye({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

export function IconSearch({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

export function IconMenu({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

export function IconX({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

export function IconChevronLeft({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <polyline points="15 18 9 12 15 6" />
    </svg>
  )
}

export function IconChevronRight({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}

export function IconMail({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  )
}

export function IconMapPin({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

export function IconSend({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <line x1="22" y1="2" x2="11" y2="13" />
      <polygon points="22 2 15 22 11 13 2 9 22 2" />
    </svg>
  )
}

export function IconTrash({ size, color, style, className }: IconProps) {
  return (
    <svg width={size || dflt.size} height={size || dflt.size} viewBox="0 0 24 24" fill="none" stroke={color || dflt.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={style} className={className}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  )
}
