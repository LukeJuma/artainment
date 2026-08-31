// Get API URL from environment or use hardcoded fallback
const getApiUrl = () => {
  // Always use environment variable in production
  if ((import.meta as any).env?.VITE_API_URL) {
    return (import.meta as any).env.VITE_API_URL;
  }
  
  // Check if we're on any Vercel deployment domain
  if (typeof window !== 'undefined' && window.location.hostname.includes('vercel.app')) {
    return 'https://etjkivwwnqafyphqamgh.supabase.co/functions/v1/api';
  }
  
  // Default for local development
  return 'http://localhost:8000/api';
};

const API_BASE = getApiUrl();

// Debug: Always log API configuration for troubleshooting
if (typeof window !== 'undefined') {
  console.log('🔧 API Configuration:');
  console.log('- Hostname:', window.location.hostname);
  console.log('- API_BASE:', API_BASE);
  console.log('- Environment VITE_API_URL:', (import.meta as any).env?.VITE_API_URL);
  console.log('- Is Vercel:', window.location.hostname.includes('vercel.app'));
}

export const API_ORIGIN = API_BASE.replace(/\/api\/?$/, '');

export function videoStreamUrl(path?: string | null): string | null {
  if (!path) return null;
  if (/^https?:\/\//i.test(path) || path.startsWith('//')) return path;
  if (path.startsWith('/storage/')) return `${API_ORIGIN}${path}`;
  return `${API_ORIGIN}/api/stream?file=${encodeURIComponent(path)}`;
}

export function fullFilmStreamUrl(filmSlug: string): string {
  return `${API_BASE}/stream/${encodeURIComponent(filmSlug)}`;
}

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
  isFormData?: boolean;
  suppressRedirect?: boolean;
}

let unauthorizedHandler: (() => void) | null = null;

export function setUnauthorizedHandler(fn: (() => void) | null) {
  unauthorizedHandler = fn;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, isFormData, suppressRedirect } = options;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (!isFormData && body) headers['Content-Type'] = 'application/json';
  headers['Accept'] = 'application/json';

  const config: RequestInit = {
    method,
    headers,
    credentials: 'include',
  };

  if (body) {
    config.body = isFormData ? body : JSON.stringify(body);
  }

  const res = await fetch(`${API_BASE}${endpoint}`, config);

  if (res.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('auth_user');
    if (!suppressRedirect) unauthorizedHandler?.();
    throw new Error('Unauthorized');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.errors?.[Object.keys(data.errors || {})[0]]?.[0] || 'Request failed');
  }

  return data as T;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  first_page_url: string;
  last_page_url: string;
  next_page_url: string | null;
  prev_page_url: string | null;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
  created_at: string;
}

export interface PlatformSettings {
  platform_name?: string;
  tagline?: string;
  support_email?: string;
  currency?: string;
  timezone?: string;
  primary_color?: string;
  logo_url?: string;
  favicon_url?: string;
}

export interface DashboardStats {
  content_counts: {
    films: number;
    series: number;
    podcasts: number;
    news: number;
    talent: number;
    services: number;
    gallery: number;
    testimonials: number;
  };
  user_counts: {
    total_users: number;
    new_this_month: number;
    new_today: number;
    active_subscribers: number;
  };
  revenue: {
    total_all_time: number;
    this_month: number;
    this_week: number;
    today: number;
  };
  monthly_revenue: {
    month: string;
    revenue: number;
    subscriptions: number;
    tickets: number;
    streaming: number;
  }[];
  ticket_stats: {
    total_sold: number;
    this_month: number;
  };
  mic_mtaani: {
    articles: number;
    categories: number;
    events: number;
  };
  recent_activity: {
    type: string;
    label: string;
    desc: string;
    time: string;
  }[];
  top_films: Film[];
}

export interface CastPerson {
  name: string
  image_url?: string | null
  character?: string
  role?: string
}

export interface FilmCast {
  director?: string
  producer?: string
  writer?: string
  cinematographer?: string
  editor?: string
  cast?: (string | CastPerson)[]
}

export interface Film {
  id: number;
  title: string;
  slug: string;
  synopsis: string | null;
  genre: string;
  year: string;
  release_date: string | null;
  duration: string | null;
  rating: number;
  poster_url: string | null;
  backdrop_url: string | null;
  video_url: string | null;
  full_video_url: string | null;
  youtube_url: string | null;
  has_full_video?: boolean;
  cast: FilmCast | null;
  tag: string | null;
  status: 'upcoming' | 'in_production' | 'completed';
  featured: boolean;
  sort_order: number;
}

export interface Episode {
  id: number;
  season_id: number;
  episode_number: number;
  title: string;
  synopsis: string | null;
  duration: string | null;
  video_url: string | null;
  poster_url: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface Season {
  id: number;
  series_id: number;
  season_number: number;
  title: string | null;
  synopsis: string | null;
  episodes?: Episode[];
  episodes_count?: number;
  created_at?: string;
  updated_at?: string;
}

export interface Series {
  id: number;
  title: string;
  slug: string;
  synopsis: string | null;
  genre: string;
  year: string;
  rating: number;
  poster_url: string | null;
  backdrop_url: string | null;
  tag: string | null;
  status: 'upcoming' | 'in_production' | 'completed';
  featured: boolean;
  sort_order: number;
  seasons_count?: number;
  episodes_count?: number;
  seasons?: Season[];
  created_at?: string;
  updated_at?: string;
}

export interface Service {
  id: number;
  title: string;
  description: string;
  icon: string | null;
  image_url: string | null;
  sort_order: number;
  active: boolean;
}

export interface Talent {
  id: number;
  name: string;
  slug: string;
  role: string;
  bio: string | null;
  credits: number;
  image_url: string | null;
  reel_url: string | null;
  socials: Record<string, string> | null;
  active: boolean;
  sort_order: number;
}

export interface PodcastEpisode {
  id: number
  podcast_id: number
  episode_number: number
  title: string
  description: string | null
  duration: string | null
  audio_url: string | null
  video_url: string | null
  published_at: string | null
  created_at?: string
  updated_at?: string
}

export interface Podcast {
  id: number;
  title: string;
  slug: string;
  host: string | null;
  category: string | null;
  description: string | null;
  cover_url: string | null;
  active: boolean;
  sort_order: number;
  episodes_count?: number;
  latest_episode?: PodcastEpisode | null;
  episodes?: PodcastEpisode[];
  created_at?: string;
  updated_at?: string;
}

export interface Production {
  id: number;
  title: string;
  type: string | null;
  year: string;
  status: 'completed' | 'in_production' | 'upcoming';
  image_url: string | null;
  description: string | null;
  sort_order: number;
}

export interface NewsArticle {
  id: number;
  title: string;
  slug: string;
  category: string;
  excerpt: string | null;
  body: string | null;
  image_url: string | null;
  published_at: string | null;
  featured: boolean;
}

export interface SubscriptionPlan {
  id: number;
  name: string;
  slug: string;
  price: number;
  billing_interval: string;
  description: string | null;
  features: string[] | null;
  is_active: boolean;
  sort_order: number;
}

export interface Subscription {
  id: number;
  user_id: number;
  plan_id: number;
  status: 'active' | 'cancelled' | 'expired';
  started_at: string | null;
  ends_at: string | null;
  cancelled_at: string | null;
  plan?: SubscriptionPlan | null;
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
}

export interface Payment {
  id: number;
  user_id: number | null;
  subscription_id: number | null;
  reference: string | null;
  amount: number;
  currency: string;
  method: string;
  status: 'success' | 'pending' | 'refunded' | 'failed';
  description: string | null;
  paid_at: string | null;
  created_at?: string | null;
  updated_at?: string | null;
  user?: Pick<User, 'id' | 'name' | 'email'> | null;
  subscription?: { plan?: SubscriptionPlan | null } | null;
}

export interface Testimonial {
  id: number;
  quote: string;
  name: string;
  role: string;
  active: boolean;
  sort_order: number;
}

export interface GalleryImage {
  id: number;
  image_url: string;
  caption: string | null;
  sort_order: number;
}

export interface Contact {
  id: number;
  name: string;
  email: string;
  service: string | null;
  message: string;
  status: 'pending' | 'read' | 'replied';
  created_at: string;
}

export interface Review {
  id: number;
  film_id: number | null;
  name: string;
  rating: number;
  comment: string | null;
  is_approved: boolean;
  created_at?: string;
  film?: { id: number; title: string; slug: string } | null;
}

export interface Ticket {
  id: number;
  event_id: number | null;
  type: string;
  price: number;
  capacity: number;
  sold: number;
  status: 'active' | 'sold_out';
  created_at?: string;
  event?: { id: number; title: string; starts_at: string; status: string } | null;
}

export interface AppNotification {
  id: number;
  title: string;
  message: string | null;
  channel: string;
  sent_count: number;
  sent_at: string | null;
  created_at?: string;
}

export interface HomeData {
  featured_film: Film | null;
  films: Film[];
  services: Service[];
  talent: Talent[];
  gallery: GalleryImage[];
  news: NewsArticle[];
  testimonials: Testimonial[];
  podcasts: Podcast[];
  coming_soon: Film[];
}

// Auth APIs
export const authAPI = {
  login: (email: string, password: string) =>
    api<{ user: User; token: string }>('/auth/login', { method: 'POST', body: { email, password } }),
  register: (name: string, email: string, password: string, password_confirmation: string) =>
    api<{ user: User; token: string }>('/auth/register', { method: 'POST', body: { name, email, password, password_confirmation } }),
  logout: (token: string) =>
    api('/auth/logout', { method: 'POST', token }),
  user: (token: string) =>
    api<User>('/auth/user', { token, suppressRedirect: true }),
  forgotPassword: (email: string) =>
    api<{ message: string }>('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token: string, email: string, password: string, password_confirmation: string) =>
    api<{ message: string }>('/auth/reset-password', { method: 'POST', body: { token, email, password, password_confirmation } }),
};

// Data APIs
export const homeAPI = {
  get: () => api<HomeData>('/home'),
};

export const filmsAPI = {
  list: (genre?: string) => {
    const params = new URLSearchParams();
    if (genre && genre !== 'All') params.set('genre', genre);
    params.set('paginate', 'true');
    return api<PaginatedResponse<Film>>(`/films?${params.toString()}`).then(r => r.data);
  },
  listPaginated: (genre?: string, page: number = 1) => {
    const params = new URLSearchParams();
    if (genre && genre !== 'All') params.set('genre', genre);
    params.set('page', String(page));
    params.set('paginate', 'true');
    return api<PaginatedResponse<Film>>(`/films?${params.toString()}`);
  },
  get: (slug: string) => api<Film>(`/films/${slug}`),
};

export const seriesAPI = {
  list: () => api<PaginatedResponse<Series>>('/series?paginate=true').then(r => r.data),
  listPaginated: (page: number = 1) => api<PaginatedResponse<Series>>(`/series?page=${page}&paginate=true`),
  get: (slug: string) => api<Series>(`/series/${slug}`),
};

export const servicesAPI = {
  list: () => api<Service[]>('/services'),
};

export const talentAPI = {
  list: () => api<PaginatedResponse<Talent>>('/actors?paginate=true').then(r => r.data),
  listPaginated: (page: number = 1) => api<PaginatedResponse<Talent>>(`/actors?page=${page}&paginate=true`),
  get: (slug: string) => api<Talent>(`/actors/${slug}`),
};

export const podcastAPI = {
  list: () => api<PaginatedResponse<Podcast>>('/podcasts?paginate=true').then(r => r.data),
  listPaginated: (page: number = 1) => api<PaginatedResponse<Podcast>>(`/podcasts?page=${page}&paginate=true`),
  get: (slug: string) => api<Podcast>(`/podcasts/${slug}`),
};

export const productionsAPI = {
  list: () => api<Production[]>('/productions'),
};

export const newsAPI = {
  list: () => api<PaginatedResponse<NewsArticle>>('/news?paginate=true').then(r => r.data),
  listPaginated: (page: number = 1) => api<PaginatedResponse<NewsArticle>>(`/news?page=${page}&paginate=true`),
  get: (slug: string) => api<NewsArticle>(`/news/${slug}`),
};

export const testimonialsAPI = {
  list: () => api<Testimonial[]>('/testimonials'),
};

export const galleryAPI = {
  list: () => api<GalleryImage[]>('/gallery'),
};

// Contact & Subscribe
export const contactAPI = {
  submit: (data: { name: string; email: string; service?: string; message: string }) =>
    api('/contact', { method: 'POST', body: data }),
  subscribe: (email: string) =>
    api('/subscribe', { method: 'POST', body: { email } }),
};

export const reviewsAPI = {
  submit: (data: { film_id?: number | null; name: string; rating: number; comment?: string }) =>
    api('/reviews', { method: 'POST', body: data }),
};

// ─── Mic Mtaani Types ──────────────────────────────────────────────
export interface MMCategory {
  id: number;
  name: string;
  slug: string;
  color: string | null;
  description: string | null;
  icon: string | null;
  sort_order: number;
  is_active: boolean;
  articles_count?: number;
}

export interface MMArticle {
  id: number;
  headline: string;
  slug: string;
  subtitle: string | null;
  body: string | null;
  excerpt: string | null;
  author_id: number | null;
  author?: { id: number; name: string } | null;
  category_id: number | null;
  category?: MMCategory | null;
  image_url: string | null;
  video_url: string | null;
  tags: string[] | null;
  reading_time: number;
  is_featured: boolean;
  is_breaking: boolean;
  status: string;
  published_at: string | null;
  views: number;
  comments?: MMComment[];
}

export interface MMComment {
  id: number;
  name: string;
  body: string;
  is_approved: boolean;
  created_at: string;
}

export interface MMJournalist {
  id: number;
  name: string;
  slug: string;
  bio: string | null;
  role: string | null;
  email: string | null;
  is_active: boolean;
  articles_count?: number;
}

export interface MMEvent {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  location: string;
  organizer: string | null;
  image_url: string | null;
  category: string;
  starts_at: string;
  ends_at: string | null;
  is_featured: boolean;
  status: string;
}

export interface MMBusiness {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  location: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  opening_hours: string | null;
  image_url: string | null;
  category: string;
  is_featured: boolean;
}

export interface MMHomepage {
  breaking: MMArticle | null;
  featured: MMArticle | null;
  latest: { id: number; headline: string; slug: string; subtitle: string | null; excerpt: string | null; image_url: string | null; category_id: number; reading_time: number; published_at: string; is_breaking: boolean; is_featured: boolean }[];
  categories: MMCategory[];
  trending: { id: number; headline: string; slug: string; views: number; published_at: string; category_id: number }[];
  events: MMEvent[];
  businesses: MMBusiness[];
}

export interface MMPaginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

// ─── Mic Mtaani API ──────────────────────────────────────────────
export const mmAPI = {
  homepage: () => api<MMHomepage>('/micmtaani'),
  articles: (params?: { category?: string; tag?: string; page?: number; per_page?: number }) => {
    const qs = new URLSearchParams();
    if (params?.category) qs.set('category', params.category);
    if (params?.tag) qs.set('tag', params.tag);
    if (params?.page) qs.set('page', String(params.page));
    if (params?.per_page) qs.set('per_page', String(params.per_page));
    const q = qs.toString();
    return api<MMPaginated<MMArticle>>(`/micmtaani/articles${q ? '?' + q : ''}`);
  },
  article: (slug: string) => api<{ article: MMArticle; related: MMArticle[] }>(`/micmtaani/articles/${slug}`),
  categories: () => api<MMCategory[]>('/micmtaani/categories'),
  journalists: () => api<MMJournalist[]>('/micmtaani/journalists'),
  journalist: (slug: string) => api<{ journalist: MMJournalist; articles: MMArticle[] }>(`/micmtaani/journalists/${slug}`),
  events: () => api<MMEvent[]>('/micmtaani/events'),
  businesses: () => api<MMBusiness[]>('/micmtaani/businesses'),
  business: (slug: string) => api<MMBusiness>(`/micmtaani/businesses/${slug}`),
  search: (q: string) => api<{ articles: MMArticle[]; query: string }>(`/micmtaani/search?q=${encodeURIComponent(q)}`),
  submit: (data: Record<string, any>) => api('/micmtaani/submit', { method: 'POST', body: data }),
  subscribe: (email: string, name?: string) => api('/micmtaani/subscribe', { method: 'POST', body: { email, name } }),
  addComment: (slug: string, data: { name: string; body: string }) => api(`/micmtaani/articles/${slug}/comments`, { method: 'POST', body: data }),
};

// Admin APIs
export const adminAPI = {
  // Contacts
  contacts: (token: string) => api<Contact[]>('/admin/contacts', { token }),
  updateContactStatus: (token: string, id: number, status: string) =>
    api(`/admin/contacts/${id}`, { method: 'PUT', token, body: { status } }),

  // Reviews
  reviews: (token: string) => api<Review[]>('/admin/reviews', { token }),
  updateReview: (token: string, id: number, data: Partial<Review>) =>
    api<Review>(`/admin/reviews/${id}`, { method: 'PUT', token, body: data }),
  deleteReview: (token: string, id: number) =>
    api(`/admin/reviews/${id}`, { method: 'DELETE', token }),

  // Tickets
  tickets: (token: string) => api<Ticket[]>('/admin/tickets', { token }),
  createTicket: (token: string, data: Partial<Ticket>) =>
    api<Ticket>('/admin/tickets', { method: 'POST', token, body: data }),
  updateTicket: (token: string, id: number, data: Partial<Ticket>) =>
    api<Ticket>(`/admin/tickets/${id}`, { method: 'PUT', token, body: data }),
  deleteTicket: (token: string, id: number) =>
    api(`/admin/tickets/${id}`, { method: 'DELETE', token }),

  // Notifications
  notifications: (token: string) => api<AppNotification[]>('/admin/notifications', { token }),
  createNotification: (token: string, data: Partial<AppNotification>) =>
    api<AppNotification>('/admin/notifications', { method: 'POST', token, body: data }),
  deleteNotification: (token: string, id: number) =>
    api(`/admin/notifications/${id}`, { method: 'DELETE', token }),

  // Films
  createFilm: (token: string, data: Partial<Film>) =>
    api<Film>('/admin/films', { method: 'POST', token, body: data }),
  updateFilm: (token: string, id: number, data: Partial<Film>) =>
    api<Film>(`/admin/films/${id}`, { method: 'PUT', token, body: data }),
  deleteFilm: (token: string, id: number) =>
    api(`/admin/films/${id}`, { method: 'DELETE', token }),

  // Series
  createSeries: (token: string, data: Partial<Series>) =>
    api<Series>('/admin/series', { method: 'POST', token, body: data }),
  updateSeries: (token: string, id: number, data: Partial<Series>) =>
    api<Series>(`/admin/series/${id}`, { method: 'PUT', token, body: data }),
  deleteSeries: (token: string, id: number) =>
    api(`/admin/series/${id}`, { method: 'DELETE', token }),

  // Seasons
  seriesSeasons: (token: string, seriesId: number) =>
    api<Season[]>(`/admin/series/${seriesId}/seasons`, { token }),
  createSeason: (token: string, seriesId: number, data: Partial<Season>) =>
    api<Season>(`/admin/series/${seriesId}/seasons`, { method: 'POST', token, body: data }),
  updateSeason: (token: string, id: number, data: Partial<Season>) =>
    api<Season>(`/admin/seasons/${id}`, { method: 'PUT', token, body: data }),
  deleteSeason: (token: string, id: number) =>
    api(`/admin/seasons/${id}`, { method: 'DELETE', token }),

  // Episodes
  seasonEpisodes: (token: string, seasonId: number) =>
    api<Episode[]>(`/admin/seasons/${seasonId}/episodes`, { token }),
  createEpisode: (token: string, seasonId: number, data: Partial<Episode>) =>
    api<Episode>(`/admin/seasons/${seasonId}/episodes`, { method: 'POST', token, body: data }),
  updateEpisode: (token: string, id: number, data: Partial<Episode>) =>
    api<Episode>(`/admin/episodes/${id}`, { method: 'PUT', token, body: data }),
  deleteEpisode: (token: string, id: number) =>
    api(`/admin/episodes/${id}`, { method: 'DELETE', token }),

  // Podcasts
  createPodcast: (token: string, data: Partial<Podcast>) =>
    api<Podcast>('/admin/podcasts', { method: 'POST', token, body: data }),
  updatePodcast: (token: string, id: number, data: Partial<Podcast>) =>
    api<Podcast>(`/admin/podcasts/${id}`, { method: 'PUT', token, body: data }),
  deletePodcast: (token: string, id: number) =>
    api(`/admin/podcasts/${id}`, { method: 'DELETE', token }),
  podcastEpisodes: (token: string, podcastId: number) =>
    api<PodcastEpisode[]>(`/admin/podcasts/${podcastId}/episodes`, { token }),
  createPodcastEpisode: (token: string, podcastId: number, data: Partial<PodcastEpisode>) =>
    api<PodcastEpisode>(`/admin/podcasts/${podcastId}/episodes`, { method: 'POST', token, body: data }),
  updatePodcastEpisode: (token: string, id: number, data: Partial<PodcastEpisode>) =>
    api<PodcastEpisode>(`/admin/podcast-episodes/${id}`, { method: 'PUT', token, body: data }),
  deletePodcastEpisode: (token: string, id: number) =>
    api(`/admin/podcast-episodes/${id}`, { method: 'DELETE', token }),

  // Services
  createService: (token: string, data: Partial<Service>) =>
    api<Service>('/admin/services', { method: 'POST', token, body: data }),
  updateService: (token: string, id: number, data: Partial<Service>) =>
    api<Service>(`/admin/services/${id}`, { method: 'PUT', token, body: data }),
  deleteService: (token: string, id: number) =>
    api(`/admin/services/${id}`, { method: 'DELETE', token }),

  // Talent
  createTalent: (token: string, data: Partial<Talent>) =>
    api<Talent>('/admin/talent', { method: 'POST', token, body: data }),
  updateTalent: (token: string, id: number, data: Partial<Talent>) =>
    api<Talent>(`/admin/talent/${id}`, { method: 'PUT', token, body: data }),
  deleteTalent: (token: string, id: number) =>
    api(`/admin/talent/${id}`, { method: 'DELETE', token }),

  // Productions
  createProduction: (token: string, data: Partial<Production>) =>
    api<Production>('/admin/productions', { method: 'POST', token, body: data }),
  updateProduction: (token: string, id: number, data: Partial<Production>) =>
    api<Production>(`/admin/productions/${id}`, { method: 'PUT', token, body: data }),
  deleteProduction: (token: string, id: number) =>
    api(`/admin/productions/${id}`, { method: 'DELETE', token }),

  // News
  createNews: (token: string, data: Partial<NewsArticle>) =>
    api<NewsArticle>('/admin/news', { method: 'POST', token, body: data }),
  updateNews: (token: string, id: number, data: Partial<NewsArticle>) =>
    api<NewsArticle>(`/admin/news/${id}`, { method: 'PUT', token, body: data }),
  deleteNews: (token: string, id: number) =>
    api(`/admin/news/${id}`, { method: 'DELETE', token }),

  // Testimonials
  createTestimonial: (token: string, data: Partial<Testimonial>) =>
    api<Testimonial>('/admin/testimonials', { method: 'POST', token, body: data }),
  deleteTestimonial: (token: string, id: number) =>
    api(`/admin/testimonials/${id}`, { method: 'DELETE', token }),

  // Gallery
  createGalleryImage: (token: string, data: Partial<GalleryImage>) =>
    api<GalleryImage>('/admin/gallery', { method: 'POST', token, body: data }),
  deleteGalleryImage: (token: string, id: number) =>
    api(`/admin/gallery/${id}`, { method: 'DELETE', token }),

  // Mic Mtaani Admin
  mmArticles: (token: string) => api<MMPaginated<MMArticle>>('/admin/micmtaani/articles', { token }),
  mmCreateArticle: (token: string, data: Partial<MMArticle>) =>
    api<MMArticle>('/admin/micmtaani/articles', { method: 'POST', token, body: data }),
  mmUpdateArticle: (token: string, id: number, data: Partial<MMArticle>) =>
    api<MMArticle>(`/admin/micmtaani/articles/${id}`, { method: 'PUT', token, body: data }),
  mmDeleteArticle: (token: string, id: number) =>
    api(`/admin/micmtaani/articles/${id}`, { method: 'DELETE', token }),
  mmCreateCategory: (token: string, data: Partial<MMCategory>) =>
    api<MMCategory>('/admin/micmtaani/categories', { method: 'POST', token, body: data }),
  mmDeleteCategory: (token: string, id: number) =>
    api(`/admin/micmtaani/categories/${id}`, { method: 'DELETE', token }),
  mmJournalists: (token: string) => api<MMJournalist[]>('/admin/micmtaani/journalists', { token }),
  mmCreateJournalist: (token: string, data: Partial<MMJournalist>) =>
    api<MMJournalist>('/admin/micmtaani/journalists', { method: 'POST', token, body: data }),
  mmDeleteJournalist: (token: string, id: number) =>
    api(`/admin/micmtaani/journalists/${id}`, { method: 'DELETE', token }),
  mmSubmissions: (token: string) => api<MMPaginated<any>>('/admin/micmtaani/submissions', { token }),
  mmApproveSubmission: (token: string, id: number) =>
    api(`/admin/micmtaani/submissions/${id}/approve`, { method: 'POST', token }),
  mmRejectSubmission: (token: string, id: number) =>
    api(`/admin/micmtaani/submissions/${id}/reject`, { method: 'POST', token }),
  mmPendingComments: (token: string) => api<MMPaginated<MMComment>>('/admin/micmtaani/comments', { token }),
  mmApproveComment: (token: string, id: number) =>
    api(`/admin/micmtaani/comments/${id}/approve`, { method: 'POST', token }),
  mmDeleteComment: (token: string, id: number) =>
    api(`/admin/micmtaani/comments/${id}`, { method: 'DELETE', token }),
  mmCreateEvent: (token: string, data: Partial<MMEvent>) =>
    api<MMEvent>('/admin/micmtaani/events', { method: 'POST', token, body: data }),
  mmDeleteEvent: (token: string, id: number) =>
    api(`/admin/micmtaani/events/${id}`, { method: 'DELETE', token }),
  mmCreateBusiness: (token: string, data: Partial<MMBusiness>) =>
    api<MMBusiness>('/admin/micmtaani/businesses', { method: 'POST', token, body: data }),
  mmDeleteBusiness: (token: string, id: number) =>
    api(`/admin/micmtaani/businesses/${id}`, { method: 'DELETE', token }),

  // Subscription plans
  plans: (token: string) => api<SubscriptionPlan[]>('/admin/subscription-plans', { token }),
  createPlan: (token: string, data: Partial<SubscriptionPlan>) =>
    api<SubscriptionPlan>('/admin/subscription-plans', { method: 'POST', token, body: data }),
  updatePlan: (token: string, id: number, data: Partial<SubscriptionPlan>) =>
    api<SubscriptionPlan>(`/admin/subscription-plans/${id}`, { method: 'PUT', token, body: data }),
  deletePlan: (token: string, id: number) =>
    api(`/admin/subscription-plans/${id}`, { method: 'DELETE', token }),

  // Subscriptions
  subscriptions: (token: string) => api<Subscription[]>('/admin/subscriptions', { token }),

  // Payments
  payments: (token: string) => api<Payment[]>('/admin/payments', { token }),

  // Users
  users: (token: string) => api<AdminUser[]>('/admin/users', { token }),
  updateUserRole: (token: string, id: number, isAdmin: boolean) =>
    api<AdminUser>(`/admin/users/${id}/role`, { method: 'PUT', token, body: { is_admin: isAdmin } }),
  deleteUser: (token: string, id: number) =>
    api(`/admin/users/${id}`, { method: 'DELETE', token }),

  // Settings
  settings: (token: string) => api<PlatformSettings>('/admin/settings', { token }),
  updateSettings: (token: string, settings: Partial<PlatformSettings>) =>
    api<PlatformSettings>('/admin/settings', { method: 'PUT', token, body: { settings } }),

  // Dashboard stats
  dashboardStats: (token: string) => api<DashboardStats>('/admin/dashboard/stats', { token }),

  // Upload
  upload: (token: string, file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api<{ url: string; path: string; filename: string }>('/upload', { method: 'POST', token, body: formData, isFormData: true });
  },
};
