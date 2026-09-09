# Artainment Security Audit - Complete Task List
*Generated from comprehensive security audit of artainment platform*

## 🔴 CRITICAL TASKS (Fix Immediately)

### Task #1: XSS Vulnerability in Mic Mtaani Article Rendering
- **File**: `src/pages/MicMtaaniArticlePage.tsx`
- **Issue**: Line 99 uses `dangerouslySetInnerHTML={{ __html: article.body }}` without sanitization
- **Risk**: Any malicious `<script>` tag in article body executes in visitor's browser
- **Fix**: Install `dompurify` and sanitize before rendering
- **Command**: `npm install dompurify @types/dompurify`
- **Code Change**: Replace with `<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(article.body) }} />`

### Task #2: Secrets Committed to Git History  
- **Files**: 
  - `backend/.env` - Contains APP_KEY, DB_PASSWORD, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY
  - `backend/.env.bak` - Same credentials, also committed
  - `.env.production` - Contains Supabase project ID
- **Risk**: All credentials are exposed in version control
- **Actions Required**:
  1. Remove from git history: `git filter-repo --path backend/.env --invert-paths`
  2. Add `backend/.env*` to `.gitignore`
  3. Rotate ALL credentials:
     - Database password
     - APP_KEY (generate new with `php artisan key:generate`)
     - AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY
     - SEED_ADMIN_PASSWORD
     - Supabase service role key

### Task #3: Replace Fake Authentication System
- **File**: `supabase/functions/api/index.ts`
- **Issue**: Lines 1089-1099 hardcoded login, lines 35-40 fake token verification
- **Current Logic**:
  ```typescript
  if (email === 'admin@theartainment.co.ke' && password === 'Admin123!') {
    return { token: 'admin-token-' + Date.now() }
  }
  // Later verification just checks:
  if (!token.startsWith('admin-token-')) throw error
  ```
- **Risk**: Anyone can forge admin tokens by knowing the prefix
- **Fix**: Replace with proper Supabase Auth or real JWT validation
- **New Architecture**:
  - Use Supabase Auth for user management
  - Implement proper JWT verification
  - Add role-based access control

### Task #4: Fix env() Usage in Runtime Code
- **Files**: 
  - `backend/app/Http/Controllers/Api/AuthController.php:98`
  - `backend/database/seeders/DatabaseSeeder.php:13`
- **Issue**: `env()` returns null after `php artisan config:cache`
- **Current Broken Code**:
  ```php
  $url = env('FRONTEND_URL') . '/reset-password'; // Returns null in production
  'password' => bcrypt(env('SEED_ADMIN_PASSWORD')) // Fails with cached config
  ```
- **Fix**: Replace with `config()` calls
- **Solution**: Create `config/app.php` entries and use `config('app.frontend_url')`

### Task #5: Fix Broken &lt;style jsx&gt; in Vite Components
- **Files**: 
  - `src/components/ui/VideoModal.tsx:198`
  - `src/components/ui/EnhancedVideoPlayer.tsx:625`
- **Issue**: `<style jsx>` is Next.js syntax, doesn't work in Vite
- **Symptoms**: Loading spinner doesn't rotate, volume slider unstyled
- **Fix**: Convert to regular `<style>` tags or CSS modules

## 🟡 HIGH PRIORITY TASKS

### Task #6: Clean Up Debug Console Logs
- **File**: `src/lib/api.ts:20-27`
- **Issue**: 6 console.log statements expose internals in production
- **Exposed Data**: hostname, API base URL, env vars, CORS status
- **Fix**: Remove or gate behind `DEBUG` flag

### Task #7: Fix Duplicate FILESYSTEM_DISK in .env
- **File**: `backend/.env`
- **Issue**: Line 31 sets `FILESYSTEM_DISK=public`, line 50 sets `FILESYSTEM_DISK=local`
- **Result**: PHP uses last value (local), breaking public uploads
- **Fix**: Remove duplicate, keep only one declaration

### Task #8: Remove is_admin from User Fillable Array
- **File**: `backend/app/Models/User.php:26`
- **Issue**: Mass assignment vulnerability
- **Risk**: Attacker could send `is_admin=1` in registration to self-escalate
- **Fix**: Remove `'is_admin'` from `$fillable` array

### Task #9: Fix Unbounded per_page Query Parameter
- **File**: `backend/app/Http/Controllers/Api/MicMtaaniController.php:82`
- **Issue**: `?per_page=999999` causes resource exhaustion
- **Fix**: Add validation: `$perPage = min(request('per_page', 20), 50);`

### Task #10: Fix Broken Social Media Links  
- **File**: `src/components/home/ComingSoonSection.tsx:150`
- **Issue**: All four social links are `href="#"`
- **Fix**: Replace with actual social media URLs

### Task #11: Add Missing User Model Relationships
- **File**: `backend/app/Models/User.php`
- **Issue**: Zero relationships defined, forces raw queries everywhere
- **Add**: subscriptions(), payments(), micMtaaniArticles(), reviews(), tickets()

### Task #12: Fix Wrong Foreign Key in Journalist Relationship
- **File**: `backend/app/Models/MicMtaaniArticle.php:58-61`
- **Issue**: `journalist()` uses `author_id` which references `users.id`, not `mic_mtaani_journalists.id`
- **Fix**: Update relationship or foreign key column

### Task #13: Add Missing Database Indexes on Foreign Keys
- **Tables Affected**: 13 tables missing FK indexes
- **Critical For Performance**: 
  - `subscriptions.user_id`
  - `payments.user_id` 
  - `payments.subscription_id`
  - `podcast_episodes.podcast_id`
  - `reviews.film_id`
  - `tickets.event_id`
- **Fix**: Add migration with indexes

### Task #14: Fix Payments Status Default Value
- **File**: `backend/database/migrations/2026_07_21_000003_create_payments_table.php:19`
- **Issue**: Defaults to `'success'` - new payments appear successful without verification
- **Fix**: Change default to `'pending'`

### Task #15: Replace Empty Catch Blocks with Proper Error Handling
- **Files**: 16 empty `catch {}` blocks across:
  - `AuthContext.tsx`
  - `FilmsPage.tsx`
  - `SeriesPage.tsx` 
  - `TalentPage.tsx`
  - `PodcastsPage.tsx`
  - 11 admin pages
- **Issue**: Errors silently swallowed, impossible to debug
- **Fix**: Add proper error logging and user feedback

## 🔵 MEDIUM PRIORITY TASKS

### Task #16: Choose Single Backend Architecture
- **Current Problem**: Two competing backends
  - Laravel API (complete but unused in production)
  - Supabase Edge Functions (incomplete but live)
- **Decision Required**: Pick one canonical backend
- **Recommendation**: Laravel API → Supabase PostgreSQL + Storage
- **Action**: Deprecate Edge Functions or make Laravel production API

### Task #17: Implement Missing Authentication Endpoints  
- **Missing in Production API**:
  - `/auth/register` - Called by RegisterPage.tsx
  - `/auth/logout` - Called by AuthContext
  - `/auth/forgot-password` - Called by ForgotPasswordPage.tsx
  - `/auth/reset-password` - Called by ResetPasswordPage.tsx
- **Result**: All these frontend flows fail with 404
- **Fix**: Implement in chosen backend system

### Task #18: Fix Missing /stream/{slug} Endpoint
- **Issue**: Frontend expects protected streaming endpoint
- **Current**: Laravel implements it, Edge Functions don't
- **Frontend Call**: `videoStreamUrl()` generates `/stream/{filmSlug}`
- **Result**: "Watch Now" buttons fail
- **Fix**: Implement protected streaming in production API

### Task #19: Standardize Database Table Names
- **Conflicts**:
  - Laravel: `talents`, Edge Functions: `talent`
  - Laravel: `news`, Edge Functions: `news_articles`
- **Problem**: Data appears in one system but not the other
- **Fix**: Choose canonical names and migrate data

### Task #20: Fix Mic Mtaani Event Status Mismatch
- **Laravel**: Creates events with `status = 'approved'`
- **Edge Functions**: Queries for `status = 'active'`
- **Result**: Zero events returned
- **Fix**: Standardize status values across systems

### Task #21: Replace Fake Analytics/Marketing/Music Modules
- **Files**:
  - `AnalyticsPage.tsx` - Hardcoded revenue/streaming numbers
  - `MarketingPage.tsx` - Converts news articles to fake campaigns
  - `MusicPage.tsx` - Converts talent records to fake tracks
  - `LogsPage.tsx` - Generates fake system logs
- **Problem**: Displays fabricated business data as real metrics
- **Fix**: Either implement real functionality or mark as "Beta/Coming Soon"

### Task #22: Fix Video Streaming Architecture
- **Current Problem**: `VideoModal.tsx` downloads entire movie into browser memory
- **Issue**: 500MB+ movies cause memory exhaustion on mobile devices
- **Current Flow**: Fetch → Blob → createObjectURL → Play
- **Proper Flow**: Video element → HTTP Range requests → CDN/Storage
- **Fix**: Implement proper streaming with range request support

### Task #23: Add Real Audit Logging System
- **Current**: LogsPage.tsx shows fake "Film loaded successfully" entries
- **Need**: Real audit_logs table tracking:
  - ADMIN_LOGIN
  - FILM_CREATED/UPDATED/DELETED
  - UPLOAD_CREATED
  - USER_DELETED
  - ROLE_CHANGED
  - ARTICLE_PUBLISHED
- **Schema**: user_id, action, resource_type, resource_id, ip_address, metadata, timestamp

### Task #24: Fix Upload Size Limit Inconsistencies
- **Frontend UI**: Shows "2GB allowed"
- **Laravel Backend**: Supports ~2GB
- **Edge Functions**: Limited to 500MB
- **Result**: UX promises more than backend delivers
- **Fix**: Standardize limits across all systems

### Task #25: Remove Dead Backend Code and Duplicate Files
- **Dead Backends**:
  - `backend/` (Laravel - unused in production)
  - `php-backend/` (Raw PHP - completely abandoned)
- **Duplicate Edge Functions**:
  - `complete-api-final.ts`
  - `complete-function-part1/2/3.ts`
  - `PRODUCTION_READY_FUNCTION.ts`
  - `cors-fix.ts`
  - 3+ more variants
- **Action**: Archive or delete unused code to prevent confusion

## 🟢 LOW PRIORITY TASKS

### Task #26: Add TypeScript Definitions for import.meta.env
- **File**: `src/vite-env.d.ts`
- **Issue**: No `ImportMetaEnv` interface
- **Result**: All env var access is untyped
- **Fix**: Define interface with VITE_* variables

### Task #27: Add SoftDeletes to Models
- **Issue**: All 30 models use permanent deletion
- **Risk**: Accidental deletions are irreversible
- **Fix**: Add SoftDeletes trait to critical models

### Task #28: Fix N+1 Query in PodcastController
- **File**: `backend/app/Http/Controllers/Api/PodcastController.php:20-22`
- **Issue**: `latest_episode` calculated for each podcast individually
- **Performance**: 1 query + N queries pattern
- **Fix**: Use eager loading or subquery

### Task #29: Add validation for Settings Updates
- **File**: `backend/app/Http/Controllers/Api/SettingController.php:24-26`
- **Issue**: Allows arbitrary setting key creation
- **Risk**: Unlimited setting bloat
- **Fix**: Add whitelist of allowed setting keys

### Task #30: Fix Stale State in EpisodeList Component
- **Issue**: `useState` initialized from props doesn't update on navigation
- **Fix**: Use `useEffect` to sync with prop changes

### Task #31: Filter Draft Content from Public Endpoints
- **Files**:
  - `NewsController:15` - Returns all articles including drafts
  - `ProductionController:14` - Same issue
- **Fix**: Add `WHERE status = 'published'` to public endpoints

## 📊 TASK SUMMARY

| Priority | Count | Description |
|----------|-------|-------------|
| 🔴 CRITICAL | 5 | Security vulnerabilities requiring immediate attention |
| 🟡 HIGH | 10 | Important bugs affecting functionality and security |
| 🔵 MEDIUM | 11 | Architecture and feature completion issues |
| 🟢 LOW | 5 | Code quality and optimization improvements |
| **TOTAL** | **31** | **Complete security and architecture audit** |

## 🎯 EXECUTION PRIORITY

1. **Security First**: Complete all CRITICAL tasks immediately
2. **Stability**: Fix HIGH priority architectural issues  
3. **Features**: Address MEDIUM priority missing functionality
4. **Quality**: Implement LOW priority improvements

## 🔧 RECOMMENDED EXECUTION ORDER

### Phase 1: Security (CRITICAL)
1. Rotate exposed credentials (#2)
2. Fix XSS vulnerability (#1) 
3. Replace fake authentication (#3)
4. Fix runtime configuration (#4)
5. Fix broken styling (#5)

### Phase 2: Architecture (HIGH + Key MEDIUM)
1. Choose single backend (#16)
2. Clean up duplicate code (#25)
3. Fix missing relationships (#11-13)
4. Implement missing auth endpoints (#17)
5. Fix streaming endpoint (#18)

### Phase 3: Features (Remaining MEDIUM)
1. Standardize data model (#19-20)
2. Replace fake modules (#21)
3. Fix video architecture (#22)
4. Add audit logging (#23)

### Phase 4: Quality (LOW)
1. Add TypeScript definitions (#26)
2. Performance optimizations (#28)
3. Add SoftDeletes (#27)
4. Validation improvements (#29-31)

---

*Generated from comprehensive security audit - September 2026*
*All tasks based on actual code analysis of deployed systems*