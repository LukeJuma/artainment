# Namecheap cPanel Setup Checklist

## Before You Start
- ✅ Domain pointing to Namecheap nameservers
- ✅ SSL certificate activated
- ✅ cPanel access credentials ready

---

## Step-by-Step cPanel Configuration

### 1. 📋 **PHP Configuration**
**Location**: cPanel → Software → Select PHP Version

**Required Settings**:
- ✅ **PHP Version**: 8.1 or higher
- ✅ **Extensions** (enable these):
  ```
  ☑️ curl      ☑️ mbstring   ☑️ pdo_pgsql
  ☑️ gd        ☑️ openssl    ☑️ zip
  ☑️ json      ☑️ tokenizer ☑️ bcmath
  ☑️ xml       ☑️ ctype     ☑️ fileinfo
  ```

**PHP INI Settings**:
```ini
upload_max_filesize = 2048M
post_max_size = 2048M
memory_limit = 512M
max_execution_time = 600
max_input_time = 600
max_file_uploads = 100
```

---

### 2. 📁 **File Manager Setup**

**Upload Structure**:
```
public_html/
├── index.html          # React app (from dist/ folder)
├── assets/            # React assets (from dist/assets/)
├── api/               # Laravel public files
│   ├── index.php     # Laravel entry point
│   └── .htaccess     # URL rewriting
└── [other React files from dist/]

artainment-backend/    # Laravel application (in home directory)
├── app/
├── bootstrap/
├── config/
├── database/
├── routes/
├── storage/
├── vendor/
├── .env              # Your environment file
└── artisan
```

---

### 3. 🔒 **SSL Certificate**
**Location**: cPanel → Security → SSL/TLS

**Steps**:
1. ✅ Enable **Let's Encrypt** (free SSL)
2. ✅ Enable **Force HTTPS Redirect**
3. ✅ Verify certificate covers:
   - `https://yourdomain.com`
   - `https://www.yourdomain.com`

---

### 4. 🌐 **Domain/Subdomain Setup**

**Option A: Single Domain**
- Frontend: `https://yourdomain.com`
- Backend API: `https://yourdomain.com/api`

**Option B: API Subdomain** (if preferred)
1. Create subdomain `api.yourdomain.com`
2. Point to separate directory
3. Upload Laravel there instead

---

### 5. 📧 **Email Configuration** (for Laravel mail)
**Location**: cPanel → Email → Email Accounts

**Create Account**:
- **Email**: `noreply@yourdomain.com`
- **Password**: Strong password
- **Quota**: 250 MB (sufficient)

**SMTP Settings for Laravel**:
```env
MAIL_MAILER=smtp
MAIL_HOST=mail.yourdomain.com
MAIL_PORT=587
MAIL_USERNAME=noreply@yourdomain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=tls
```

---

### 6. ⚙️ **Cron Jobs** (Optional)
**Location**: cPanel → Advanced → Cron Jobs

**Add Laravel Scheduler**:
```bash
Command: cd /home/username/artainment-backend && php artisan schedule:run
Timing: Every 5 minutes (* * * * *)
```

---

### 7. 📊 **Error Logging**
**Location**: cPanel → Metrics → Errors

**Enable**:
- ✅ Error logging
- ✅ PHP error logging
- Monitor for deployment issues

---

### 8. 🔍 **File Permissions Check**

**Set Correct Permissions**:
```bash
# Folders: 755
artainment-backend/
artainment-backend/storage/
artainment-backend/bootstrap/cache/

# Files: 644
artainment-backend/.env
artainment-backend/storage/logs/
public_html/api/.htaccess
```

**Security**:
```bash
# Protect sensitive files (already in .htaccess)
.env files - No web access
storage/ - No web access
vendor/ - No web access
```

---

## Quick Deployment Commands

**Via cPanel Terminal** (if available) or SSH:
```bash
# Navigate to Laravel directory
cd ~/artainment-backend

# Install dependencies
composer install --optimize-autoloader --no-dev

# Clear and cache
php artisan config:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Run migrations
php artisan migrate --force

# Set permissions
chmod -R 755 storage bootstrap/cache
```

---

## Testing Your Deployment

### ✅ **Frontend Tests**
1. Visit `https://yourdomain.com`
2. Check browser console for errors
3. Verify all assets load (CSS, JS, images)
4. Test navigation between pages

### ✅ **Backend API Tests**
1. Test health check: `https://yourdomain.com/api/health`
2. Test auth endpoint: `https://yourdomain.com/api/auth/login`
3. Check Laravel logs: `artainment-backend/storage/logs/`

### ✅ **Integration Tests**
1. User registration/login
2. Admin panel access
3. File uploads
4. Video streaming

---

## Troubleshooting Common Issues

### 🔧 **500 Internal Server Error**
- Check `.htaccess` syntax in `/api/`
- Verify PHP version and extensions
- Check Laravel error logs
- Ensure proper file permissions

### 🔧 **API Not Accessible**
- Verify mod_rewrite is enabled
- Check `.htaccess` rules
- Test with simple PHP file first
- Confirm Laravel paths in `index.php`

### 🔧 **Database Connection Failed**
- Verify Supabase credentials in `.env`
- Check SSL connection requirements
- Test with simple PDO connection script

### 🔧 **Upload Issues**
- Check PHP upload limits
- Verify directory permissions
- Test with smaller files first
- Check Laravel storage configuration

---

## Security Reminders

- ✅ Never expose `.env` files to web
- ✅ Keep Laravel application outside `public_html`
- ✅ Use strong passwords for all accounts
- ✅ Regularly update dependencies
- ✅ Monitor error logs for suspicious activity
- ✅ Remove deployment scripts after use

---

**🎯 You're ready to deploy Artainment to Namecheap!**

Follow this checklist step by step, and your platform will be live with enterprise-grade security and performance.