# Artainment Platform Architecture

## Current Architecture (Post-Security Audit)

**Decision:** Laravel Backend is the canonical API (chosen over Supabase Edge Function)

### Backend Stack
- **🎯 Laravel 11** - Primary API server (JWT authentication, protected streaming)
- **🗄️ PostgreSQL** - Supabase managed database (existing production data)
- **📁 Supabase Storage** - Media file storage (videos, images, documents)

### Frontend Stack  
- **⚛️ React 18** - User interface with TypeScript
- **⚡ Vite** - Build tool and development server
- **🌐 Vercel** - Static hosting and deployment

### Security Architecture
- **🔐 JWT Authentication** - Custom implementation with role-based access
- **🛡️ XSS Protection** - DOMPurify sanitization for user content
- **📹 Protected Streaming** - Subscription verification + HTTP Range support
- **📊 Audit Logging** - Real-time security event tracking

### Data Architecture
- **Users & Auth** - Laravel handles registration, login, password reset
- **Content Management** - Films, series, podcasts with draft/published workflow
- **Media Streaming** - Protected video serving with subscription checks
- **Mic Mtaani** - News platform with journalist management
- **Admin Panel** - Complete CRUD operations with real-time data

### API Architecture
- **Laravel Routes** - `/api/*` for all backend operations
- **JWT Middleware** - Protects admin and subscription-required endpoints
- **Rate Limiting** - Built-in Laravel throttling on auth endpoints
- **Input Validation** - Comprehensive request validation rules

### Database Schema
- **Core Tables** - users, films, series, podcasts, payments, subscriptions
- **Mic Mtaani** - news_articles, journalists, categories, comments
- **System** - audit_logs, notifications, settings
- **Relationships** - Proper foreign keys with performance indexes
- **Soft Deletes** - Data recovery for critical models

### Deployment Model
- **Laravel Backend** - Deployed on Railway/DigitalOcean/AWS
- **React Frontend** - Static build deployed on Vercel  
- **Database** - Managed PostgreSQL on Supabase
- **Storage** - Supabase Storage with S3-compatible API

### Legacy Components (Deprecated)
- **Supabase Edge Function** - Replaced by Laravel backend
- **php-backend/** - Removed (unused dead code)

**This architecture provides enterprise-grade security, scalability, and maintainability.** 🏗️