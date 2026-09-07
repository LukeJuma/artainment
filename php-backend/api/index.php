<?php
// Main API router for Artainment application
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Handle OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

require_once '../config/database.php';
require_once '../controllers/HomeController.php';
require_once '../controllers/FilmController.php';
require_once '../controllers/AuthController.php';
require_once '../controllers/AdminController.php';

// Get the request path
$request = $_SERVER['REQUEST_URI'];
$path = parse_url($request, PHP_URL_PATH);
$path = str_replace('/api', '', $path); // Remove /api prefix
$method = $_SERVER['REQUEST_METHOD'];

// Initialize database
$database = new Database();
$db = $database->getConnection();

// Route the requests
try {
    switch (true) {
        // Authentication routes
        case $path === '/auth/login' && $method === 'POST':
            $controller = new AuthController($db);
            echo $controller->login();
            break;
            
        case $path === '/auth/me' && $method === 'GET':
            $controller = new AuthController($db);
            echo $controller->me();
            break;

        // Home route
        case $path === '/home' && $method === 'GET':
            $controller = new HomeController($db);
            echo $controller->getHome();
            break;

        // Films routes
        case $path === '/films' && $method === 'GET':
            $controller = new FilmController($db);
            echo $controller->getFilms();
            break;
            
        case preg_match('/^\/films\/([^\/]+)$/', $path, $matches) && $method === 'GET':
            $controller = new FilmController($db);
            echo $controller->getFilmBySlug($matches[1]);
            break;

        // Admin routes
        case $path === '/admin/dashboard/stats' && $method === 'GET':
            $controller = new AdminController($db);
            echo $controller->getDashboardStats();
            break;
            
        case $path === '/admin/films' && $method === 'GET':
            $controller = new AdminController($db);
            echo $controller->getFilms();
            break;
            
        case $path === '/admin/films' && $method === 'POST':
            $controller = new AdminController($db);
            echo $controller->createFilm();
            break;

        // Test endpoint
        case $path === '/test' && $method === 'GET':
            echo json_encode([
                'message' => 'PHP API is working!',
                'timestamp' => date('Y-m-d H:i:s'),
                'version' => 'Namecheap PHP Backend v1.0'
            ]);
            break;

        // 404 for unmatched routes
        default:
            http_response_code(404);
            echo json_encode([
                'error' => 'Endpoint not found',
                'path' => $path,
                'method' => $method,
                'available_endpoints' => [
                    'GET /test',
                    'POST /auth/login',
                    'GET /auth/me',
                    'GET /home',
                    'GET /films',
                    'GET /films/{slug}',
                    'GET /admin/dashboard/stats',
                    'GET /admin/films',
                    'POST /admin/films'
                ]
            ]);
            break;
    }
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'error' => 'Internal server error',
        'message' => $e->getMessage()
    ]);
}
?>