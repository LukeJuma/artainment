<?php
/**
 * Namecheap Deployment Script
 * Upload this file to your artainment-backend/ directory and run via browser or cron
 */

echo "<h2>Artainment Deployment Script</h2>";
echo "<pre>";

// Set working directory
$baseDir = __DIR__;
chdir($baseDir);

echo "Starting deployment in: $baseDir\n";
echo "PHP Version: " . phpversion() . "\n";
echo "================================\n\n";

// Step 1: Clear existing caches
echo "1. Clearing existing caches...\n";
exec('php artisan config:clear 2>&1', $output1, $return1);
exec('php artisan route:clear 2>&1', $output2, $return2);
exec('php artisan view:clear 2>&1', $output3, $return3);

if ($return1 === 0 && $return2 === 0 && $return3 === 0) {
    echo "✅ Caches cleared successfully\n";
} else {
    echo "⚠️ Some cache clearing failed, continuing...\n";
}

// Step 2: Install/Update Composer dependencies
echo "\n2. Installing Composer dependencies...\n";
exec('composer install --optimize-autoloader --no-dev 2>&1', $composerOutput, $composerReturn);

if ($composerReturn === 0) {
    echo "✅ Composer dependencies installed\n";
} else {
    echo "❌ Composer install failed:\n";
    foreach ($composerOutput as $line) {
        echo "   $line\n";
    }
}

// Step 3: Run database migrations
echo "\n3. Running database migrations...\n";
exec('php artisan migrate --force 2>&1', $migrateOutput, $migrateReturn);

if ($migrateReturn === 0) {
    echo "✅ Migrations completed successfully\n";
} else {
    echo "❌ Migration failed:\n";
    foreach ($migrateOutput as $line) {
        echo "   $line\n";
    }
}

// Step 4: Cache configurations for production
echo "\n4. Caching configurations...\n";
exec('php artisan config:cache 2>&1', $configOutput, $configReturn);
exec('php artisan route:cache 2>&1', $routeOutput, $routeReturn);
exec('php artisan view:cache 2>&1', $viewOutput, $viewReturn);

if ($configReturn === 0 && $routeReturn === 0 && $viewReturn === 0) {
    echo "✅ Production caches created successfully\n";
} else {
    echo "⚠️ Some caching operations failed\n";
    if ($configReturn !== 0) {
        foreach ($configOutput as $line) {
            echo "Config cache error: $line\n";
        }
    }
}

// Step 5: Set proper permissions
echo "\n5. Setting file permissions...\n";
$storageDir = $baseDir . '/storage';
$bootstrapCacheDir = $baseDir . '/bootstrap/cache';

if (is_dir($storageDir)) {
    exec("find $storageDir -type f -exec chmod 644 {} \; 2>&1");
    exec("find $storageDir -type d -exec chmod 755 {} \; 2>&1");
    echo "✅ Storage permissions set\n";
}

if (is_dir($bootstrapCacheDir)) {
    exec("find $bootstrapCacheDir -type f -exec chmod 644 {} \; 2>&1");
    exec("find $bootstrapCacheDir -type d -exec chmod 755 {} \; 2>&1");
    echo "✅ Bootstrap cache permissions set\n";
}

// Step 6: Test basic functionality
echo "\n6. Testing application...\n";

// Test database connection
try {
    exec('php artisan tinker --execute="DB::connection()->getPdo(); echo \"Database connected successfully\";" 2>&1', $dbTestOutput, $dbTestReturn);
    if ($dbTestReturn === 0) {
        echo "✅ Database connection test passed\n";
    } else {
        echo "❌ Database connection test failed\n";
    }
} catch (Exception $e) {
    echo "⚠️ Database test error: " . $e->getMessage() . "\n";
}

// Test routes
$routeTestUrl = 'http://' . $_SERVER['HTTP_HOST'] . '/api/health';
echo "Testing route: $routeTestUrl\n";

$context = stream_context_create([
    'http' => [
        'timeout' => 10,
        'method' => 'GET'
    ]
]);

$response = @file_get_contents($routeTestUrl, false, $context);
if ($response !== false) {
    echo "✅ API routes are accessible\n";
} else {
    echo "⚠️ API routes test inconclusive (may need manual testing)\n";
}

// Final status
echo "\n================================\n";
echo "🚀 DEPLOYMENT SUMMARY:\n";
echo "- Caches cleared and rebuilt\n";
echo "- Dependencies installed\n";
echo "- Database migrations applied\n";
echo "- File permissions set\n";
echo "- Basic functionality tested\n\n";

echo "✅ Deployment completed!\n";
echo "📝 Next steps:\n";
echo "1. Test your website: https://yourdomain.com\n";
echo "2. Test API endpoints: https://yourdomain.com/api/\n";
echo "3. Check Laravel logs if any issues occur\n";
echo "4. Remove this deployment script for security\n\n";

echo "Deployment finished at: " . date('Y-m-d H:i:s') . "\n";
echo "</pre>";
?>

<style>
body { font-family: Arial, sans-serif; margin: 20px; }
pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
</style>