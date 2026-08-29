import {
  LayoutDashboard, BarChart3, Film, Tv, Music, Calendar, Trophy,
  Users, CreditCard, Ticket, Star, Shield, Megaphone,
  MessageSquare, Settings, Terminal, UserCog,
  DollarSign, Podcast, Bell,
} from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon: any
  badge?: number | string
  badgeType?: 'default' | 'warning' | 'success'
}

export interface NavSection {
  title: string
  items: NavItem[]
}

export const NAV_SECTIONS: NavSection[] = [
  {
    title: 'Artainment',
    items: [
      { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'movies', label: 'Movies', icon: Film },
      { id: 'series', label: 'Series', icon: Tv },
      { id: 'music', label: 'Music', icon: Music },
      { id: 'podcasts', label: 'Podcasts', icon: Podcast },
      { id: 'actors', label: 'Actors', icon: Star },
      { id: 'events', label: 'Events', icon: Calendar, badge: 3 },
      { id: 'ticketing', label: 'Ticketing', icon: Ticket },
      { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
      { id: 'payments', label: 'Payments', icon: DollarSign },
      { id: 'marketing', label: 'Marketing', icon: Megaphone },
      { id: 'reviews', label: 'Reviews', icon: Star, badge: 12 },
    ],
  },
  {
    title: 'Mic Mtaani',
    items: [
      { id: 'micmtaani', label: 'Mic Mtaani', icon: Trophy, badge: 'LIVE' as string | number, badgeType: 'warning' as const },
      { id: 'users', label: 'Users', icon: Users },
      { id: 'moderation', label: 'Moderation', icon: Shield, badge: 5, badgeType: 'warning' as const },
      { id: 'messages', label: 'Messages', icon: MessageSquare, badge: 2 },
      { id: 'notifications', label: 'Notifications', icon: Bell },
    ],
  },
  {
    title: 'System',
    items: [
      { id: 'analytics', label: 'Analytics', icon: BarChart3 },
      { id: 'settings', label: 'Settings', icon: Settings },
      { id: 'logs', label: 'System Logs', icon: Terminal },
      { id: 'admins', label: 'Admins', icon: UserCog },
    ],
  },
]

export const PAGE_TITLES: Record<string, string> = {
  dashboard: 'Dashboard',
  analytics: 'Analytics',
  movies: 'Movies',
  series: 'TV Series',
  music: 'Music',
  podcasts: 'Podcasts',
  actors: 'Actors',
  events: 'Events',
  ticketing: 'Ticketing',
  micmtaani: 'Mic Mtaani',
  users: 'Users',
  subscriptions: 'Subscriptions',
  payments: 'Payments',
  reviews: 'Reviews',
  moderation: 'Moderation',
  marketing: 'Marketing',
  notifications: 'Notifications',
  messages: 'Messages',
  settings: 'Settings',
  logs: 'System Logs',
  admins: 'Admins',
}
