// Build script to prepare files for Namecheap deployment
const fs = require('fs');
const path = require('path');

console.log('🔨 Building Artainment for Namecheap Deployment...');

// Create deployment directory structure
const deployDir = 'namecheap-deployment';
const directories = [
    `${deployDir}`,
    `${deployDir}/public_html`,
    `${deployDir}/public_html/api`,
    `${deployDir}/public_html/api/config`,
    `${deployDir}/public_html/api/controllers`,
    `${deployDir}/api-backup`
];

directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
        console.log(`✅ Created directory: ${dir}`);
    }
});

// Step 1: Build React frontend for production
console.log('\n📦 Building React frontend...');
try {
    require('child_process').execSync('npm run build', { stdio: 'inherit' });
    console.log('✅ Frontend built successfully');
} catch (error) {
    console.log('❌ Frontend build failed, using existing build if available');
}

// Step 2: Copy frontend files to deployment directory
if (fs.existsSync('dist')) {
    console.log('📁 Copying frontend files from dist/...');
    copyDirectory('dist', `${deployDir}/public_html`);
} else if (fs.existsSync('build')) {
    console.log('📁 Copying frontend files from build/...');
    copyDirectory('build', `${deployDir}/public_html`);
} else {
    console.log('⚠️ No build directory found. Run npm run build first.');
}

// Step 3: Copy PHP backend files
console.log('📁 Copying PHP backend files...');
copyDirectory('php-backend', `${deployDir}/api-backup`);

// Copy PHP files to the correct API location
copyFile('php-backend/api/index.php', `${deployDir}/public_html/api/index.php`);
copyFile('php-backend/config/database.php', `${deployDir}/public_html/api/config/database.php`);
copyDirectory('php-backend/controllers', `${deployDir}/public_html/api/controllers`);

// Step 4: Create .htaccess files for proper routing
console.log('⚙️ Creating .htaccess files...');

// Main .htaccess for frontend routing
const mainHtaccess = `# Enable rewrite engine
RewriteEngine On

# Handle Angular/React Router (HTML5 mode)
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} !^/api/
RewriteRule . /index.html [L]

# CORS headers for API requests
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Handle preflight requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]

# Security headers
<IfModule mod_headers.c>
    Header always set X-Content-Type-Options nosniff
    Header always set X-Frame-Options DENY
    Header always set X-XSS-Protection "1; mode=block"
    Header always set Referrer-Policy "strict-origin-when-cross-origin"
</IfModule>

# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Cache static files
<IfModule mod_expires.c>
    ExpiresActive on
    ExpiresByType text/css "access plus 1 year"
    ExpiresByType application/javascript "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
</IfModule>`;

fs.writeFileSync(`${deployDir}/public_html/.htaccess`, mainHtaccess);

// API .htaccess for PHP routing
const apiHtaccess = `RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ index.php [QSA,L]

# CORS headers
<IfModule mod_headers.c>
    Header always set Access-Control-Allow-Origin "*"
    Header always set Access-Control-Allow-Methods "GET, POST, PUT, DELETE, OPTIONS"
    Header always set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>

# Handle OPTIONS requests
RewriteCond %{REQUEST_METHOD} OPTIONS
RewriteRule ^(.*)$ $1 [R=200,L]`;

fs.writeFileSync(`${deployDir}/public_html/api/.htaccess`, apiHtaccess);

// Step 5: Create deployment instructions
const instructions = `# 🚀 Namecheap Deployment Instructions

## Files Ready for Upload

All files are prepared in the \`namecheap-deployment\` folder:

### 📁 Upload Structure
\`\`\`
namecheap-deployment/
├── public_html/           # Upload contents to your domain's public_html
│   ├── index.html         # React app entry point
│   ├── assets/            # CSS, JS, images
│   ├── api/               # PHP backend
│   │   ├── index.php      # Main API router
│   │   ├── config/        # Database configuration
│   │   └── controllers/   # API controllers
│   └── .htaccess          # Apache configuration
└── api-backup/            # Backup of PHP files
\`\`\`

## 🗄️ Database Setup

1. **In cPanel, go to MySQL Databases**
2. **Create a new database**: \`your_username_artainment\`
3. **Create a database user** with full privileges
4. **Import** \`namecheap-database-setup.sql\` using phpMyAdmin
5. **Update** \`public_html/api/config/database.php\` with your credentials:
   \`\`\`php
   $this->host = "localhost";
   $this->db_name = "your_username_artainment";
   $this->username = "your_db_username";
   $this->password = "your_db_password";
   \`\`\`

## 📤 File Upload Steps

1. **Zip the public_html contents**: Select all files/folders inside \`namecheap-deployment/public_html\`
2. **Upload via cPanel File Manager** to your domain's public_html folder
3. **Extract the zip file** in public_html
4. **Set permissions** (if needed): 755 for folders, 644 for files

## 🧪 Test Your Deployment

After upload, test these URLs (replace with your domain):

- **Frontend**: \`https://yourdomain.com\`
- **API Test**: \`https://yourdomain.com/api/test\`
- **Admin Login**: \`https://yourdomain.com/login\`
  - Email: \`admin@theartainment.co.ke\`
  - Password: \`Admin123!\`

## 🔧 Configuration

1. **Update API URL** in your frontend if needed
2. **Configure SSL** in cPanel (usually automatic)
3. **Set up domain** if using custom domain
4. **Test all functionality**

## 📞 Need Help?

Check the deployment works by visiting \`/api/test\` endpoint first!
`;

fs.writeFileSync(`${deployDir}/DEPLOYMENT_INSTRUCTIONS.md`, instructions);

console.log('\n🎉 Deployment preparation complete!');
console.log('📁 Files ready in: namecheap-deployment/');
console.log('📋 Read: namecheap-deployment/DEPLOYMENT_INSTRUCTIONS.md');
console.log('🗄️ Database: namecheap-database-setup.sql');

// Helper functions
function copyDirectory(src, dest) {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
    }
    
    const items = fs.readdirSync(src);
    items.forEach(item => {
        const srcPath = path.join(src, item);
        const destPath = path.join(dest, item);
        
        if (fs.statSync(srcPath).isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            fs.copyFileSync(srcPath, destPath);
        }
    });
}

function copyFile(src, dest) {
    const destDir = path.dirname(dest);
    if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
    }
    fs.copyFileSync(src, dest);
}