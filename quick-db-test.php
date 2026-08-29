<?php
// Quick Database Connection Test
// Run this after you think you have the right connection details

echo "🔍 Testing Supabase Database Connection...\n";
echo "=====================================\n";

// Check if .env file exists
if (!file_exists('backend/.env')) {
    echo "❌ backend/.env file not found!\n";
    echo "💡 Copy the template first:\n";
    echo "   cp deployment-configs/supabase-env.example backend/.env\n";
    exit(1);
}

// Load environment variables
$envFile = 'backend/.env';
$lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

$env = [];
foreach ($lines as $line) {
    if (strpos($line, '=') !== false && strpos($line, '#') !== 0) {
        list($key, $value) = explode('=', $line, 2);
        $env[trim($key)] = trim($value);
    }
}

// Check required variables
$required = ['DB_HOST', 'DB_PORT', 'DB_DATABASE', 'DB_USERNAME', 'DB_PASSWORD'];
$missing = [];

foreach ($required as $var) {
    if (!isset($env[$var]) || empty($env[$var])) {
        $missing[] = $var;
    }
}

if (!empty($missing)) {
    echo "❌ Missing environment variables:\n";
    foreach ($missing as $var) {
        echo "   - $var\n";
    }
    echo "\n💡 Update your backend/.env file with:\n";
    echo "   DB_HOST=db.YOUR_PROJECT_REF.supabase.co\n";
    echo "   DB_PORT=5432\n";
    echo "   DB_DATABASE=postgres\n";
    echo "   DB_USERNAME=postgres\n";
    echo "   DB_PASSWORD=your_actual_password\n";
    exit(1);
}

echo "✅ Environment variables found:\n";
echo "   Host: {$env['DB_HOST']}\n";
echo "   Port: {$env['DB_PORT']}\n";
echo "   Database: {$env['DB_DATABASE']}\n";
echo "   Username: {$env['DB_USERNAME']}\n";
echo "   Password: " . str_repeat('*', strlen($env['DB_PASSWORD'])) . "\n\n";

// Test connection
try {
    $dsn = "pgsql:host={$env['DB_HOST']};port={$env['DB_PORT']};dbname={$env['DB_DATABASE']};sslmode=require";
    $pdo = new PDO($dsn, $env['DB_USERNAME'], $env['DB_PASSWORD']);
    
    echo "✅ Connection successful!\n";
    
    // Test query
    $result = $pdo->query("SELECT current_database(), version()");
    $row = $result->fetch();
    
    echo "📊 Database info:\n";
    echo "   Current database: {$row[0]}\n";
    echo "   PostgreSQL version: " . substr($row[1], 0, 50) . "...\n";
    
    echo "\n🎉 Database connection is working! You can proceed to Step 1.3\n";
    
} catch (Exception $e) {
    echo "❌ Connection failed: " . $e->getMessage() . "\n\n";
    
    echo "🔧 Common fixes:\n";
    echo "1. Check your Supabase project is created and running\n";
    echo "2. Verify the project reference in your host:\n";
    echo "   Format: db.PROJECT_REF.supabase.co\n";
    echo "3. Ensure your database password is correct\n";
    echo "4. Check if your IP is allowed (Supabase free tier allows all IPs)\n";
    echo "5. Try resetting your database password in Supabase Settings\n";
}
?>