const API_BASE = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000/api';

interface ApiOptions {
  method?: string;
  body?: any;
  token?: string;
  isFormData?: boolean;
}

export async function api<T = any>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, token, isFormData } = options;

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
    window.location.href = '/login';
    throw new Error('Unauthorized');
  }

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || data.errors?.[Object.keys(data.errors || {})[0]]?.[0] || 'Request failed');
  }

  return data as T;
}

export interface User {
  id: number;
  name: string;
  email: string;
  is_admin: boolean;
}

export interface Film {
  id: number;
  title: string;
  slug: string;
  synopsis: string | null;
  genre: string;
  year: string;
  duration: string | null;
  rating: number;
  poster_url: string | null;
  backdrop_url: string | null;
  video_url: string | null;
  tag: string | null;
  status: 'upcoming' | 'in_production' | 'completed';
  featured: boolean;
  sort_order: number;
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
  active: boolean;
  sort_order: number;
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

export interface HomeData {
  featured_film: Film | null;
  films: Film[];
  services: Service[];
  talent: Talent[];
  gallery: GalleryImage[];
  news: NewsArticle[];
  testimonials: Testimonial[];
  productions: Production[];
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
    api<User>('/auth/user', { token }),
};

// Data APIs
export const homeAPI = {
  get: () => api<HomeData>('/home'),
};

export const filmsAPI = {
  list: (genre?: string) => api<Film[]>(`/films${genre && genre !== 'All' ? `?genre=${genre}` : ''}`),
  get: (slug: string) => api<Film>(`/films/${slug}`),
};

export const servicesAPI = {
  list: () => api<Service[]>('/services'),
};

export const talentAPI = {
  list: () => api<Talent[]>('/talent'),
  get: (slug: string) => api<Talent>(`/talent/${slug}`),
};

export const productionsAPI = {
  list: () => api<Production[]>('/productions'),
};

export const newsAPI = {
  list: () => api<NewsArticle[]>('/news'),
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

  // Films
  createFilm: (token: string, data: Partial<Film>) =>
    api<Film>('/admin/films', { method: 'POST', token, body: data }),
  updateFilm: (token: string, id: number, data: Partial<Film>) =>
    api<Film>(`/admin/films/${id}`, { method: 'PUT', token, body: data }),
  deleteFilm: (token: string, id: number) =>
    api(`/admin/films/${id}`, { method: 'DELETE', token }),

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

  // Upload
  upload: (token: string, file: File, folder?: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (folder) formData.append('folder', folder);
    return api<{ url: string; path: string; filename: string }>('/upload', { method: 'POST', token, body: formData, isFormData: true });
  },
};
