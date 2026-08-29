# Supabase Database Configuration - Detailed Guide

## Step 1.2: Configure Database Connection (Detailed)

### Finding Your Database Connection Details

#### Method 1: Through Supabase Dashboard (Recommended)

1. **Go to your Supabase project dashboard**
   - URL: `https://supabase.com/dashboard/project/[your-project-id]`

2. **Navigate to Settings → Database**
   - Click on the "Settings" icon (gear) in the left sidebar
   - Click on "Database" from the settings menu

3. **Find Connection Info section**
   You'll see a section called "Connection info" or "Connection parameters" with:
   ```
   Host: db.[your-project-ref].supabase.co
   Database name: postgres
   Port: 5432
   User: postgres
   Password: [the password you set when creating the project]
   ```

4. **Connection Pooling (Important for Laravel)**
   - Look for "Connection pooling" section
   - You'll see additional connection details for pooled connections
   - Use the **pooled connection** for Laravel (better performance)

#### Method 2: Through Connection String

1. **In Settings → Database**
2. **Look for "Connection string" section**
3. **Copy the URI format**:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.[project-ref].supabase.co:5432/postgres
   ```

### What Each Connection Detail Means

```env
# Standard connection (direct)
DB_HOST=db.[your-project-ref].supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=[your-password]

# OR pooled connection (recommended for production)
DB_HOST=aws-0-[region].pooler.supabase.com  
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres.[(your-project-ref)]
DB_PASSWORD=[your-password]
```

### Step-by-Step Configuration

#### 1. Open your backend environment file:
```bash
cd backend
cp ../deployment-configs/supabase-env.example .env
```

#### 2. Edit the .env file with your actual values:
```env
# Replace these with your actual Supabase values
DB_CONNECTION=pgsql
DB_HOST=db.YOUR_PROJECT_REF_HERE.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
DB_SSLMODE=require
```

#### 3. Test the connection:
```bash
# Install dependencies first
composer install

# Test database connection
php artisan tinker
```

In tinker, run:
```php
>>> DB::connection()->getPdo();
// Should return PDO object if connection works

>>> DB::select('SELECT version()');
// Should return PostgreSQL version info
```

### Troubleshooting Connection Issues

#### Issue 1: "Connection refused"
**Cause**: Wrong host or project reference
**Solution**: 
1. Double-check your project reference in the Supabase URL
2. Ensure you're using `db.PROJECT_REF.supabase.co` format

#### Issue 2: "Authentication failed"
**Cause**: Wrong password or username
**Solution**:
1. Verify your database password in Supabase Settings
2. Reset database password if needed:
   - Go to Settings → Database
   - Click "Reset database password"

#### Issue 3: "SSL connection required"
**Cause**: SSL not configured properly
**Solution**: Ensure `DB_SSLMODE=require` in your .env

#### Issue 4: "Database does not exist"
**Cause**: Wrong database name
**Solution**: Always use `postgres` as the database name for Supabase

### Finding Your Project Reference

If you're unsure about your project reference:

1. **From Project URL**:
   - Your project URL: `https://supabase.com/dashboard/project/abcdefghijk`
   - Project reference: `abcdefghijk`
   - Database host: `db.abcdefghijk.supabase.co`

2. **From Settings**:
   - Go to Settings → General
   - Look for "Reference ID"

### Complete .env Example

Replace the placeholder values with your actual Supabase details:

```env
APP_NAME=TheArtainment
APP_ENV=production
APP_DEBUG=false
APP_URL=https://your-project.supabase.co/functions/v1/api
APP_KEY=base64:your-generated-app-key

# Database Configuration
DB_CONNECTION=pgsql
DB_HOST=db.abcdefghijk.supabase.co
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_actual_password_here
DB_SSLMODE=require

# Test the connection after setting these values
```

### Quick Connection Test Script

Create a test file to verify your connection:

```php
<?php
// test-db-connection.php
require_once 'vendor/autoload.php';

$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

try {
    $host = $_ENV['DB_HOST'];
    $port = $_ENV['DB_PORT'];
    $dbname = $_ENV['DB_DATABASE'];
    $username = $_ENV['DB_USERNAME'];
    $password = $_ENV['DB_PASSWORD'];
    
    $dsn = "pgsql:host=$host;port=$port;dbname=$dbname;sslmode=require";
    $pdo = new PDO($dsn, $username, $password);
    
    echo "✅ Database connection successful!\n";
    
    $result = $pdo->query("SELECT version()");
    $version = $result->fetch();
    echo "PostgreSQL version: " . $version[0] . "\n";
    
} catch (Exception $e) {
    echo "❌ Database connection failed: " . $e->getMessage() . "\n";
}
?>
```

Run it with:
```bash
php test-db-connection.php
```

### What to do after successful connection:

1. **Generate Laravel app key**:
   ```bash
   php artisan key:generate
   ```

2. **Run migrations**:
   ```bash
   php artisan migrate
   ```

3. **Test Laravel database**:
   ```bash
   php artisan tinker
   >>> User::count()
   ```

## Next Steps

Once your database connection is working:
- Proceed to Step 1.3 (Setup Storage Bucket)
- The database is ready for your Laravel migrations
- You can continue with the rest of the deployment

Need help with any specific error messages? Share the exact error and I'll help troubleshoot!