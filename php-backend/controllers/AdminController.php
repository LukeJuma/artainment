<?php
class AdminController {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
        
        // Check admin authentication
        if (!$this->isAdmin()) {
            http_response_code(401);
            echo json_encode(['error' => 'Admin access required']);
            exit();
        }
    }
    
    private function isAdmin() {
        $headers = getallheaders();
        $authHeader = isset($headers['Authorization']) ? $headers['Authorization'] : '';
        
        if (!$authHeader || !str_starts_with($authHeader, 'Bearer ')) {
            return false;
        }
        
        $token = substr($authHeader, 7);
        return str_starts_with($token, 'admin-token-');
    }
    
    public function getDashboardStats() {
        try {
            $stats = [
                'films' => $this->getTableCount('films'),
                'series' => $this->getTableCount('series'),
                'actors' => $this->getTableCount('talents'),
                'podcasts' => $this->getTableCount('podcasts'),
                'news' => $this->getTableCount('news_articles'),
                'users' => $this->getTableCount('users'),
                'contacts' => $this->getTableCount('contact_submissions'),
                'subscribers' => $this->getTableCount('subscribers'),
                'mic_mtaani_articles' => $this->getTableCount('mic_mtaani_articles'),
                'mic_mtaani_events' => $this->getTableCount('mic_mtaani_events'),
                'mic_mtaani_businesses' => $this->getTableCount('mic_mtaani_businesses')
            ];
            
            return json_encode($stats);
        } catch (Exception $e) {
            return json_encode([
                'films' => 0,
                'series' => 0,
                'actors' => 0,
                'podcasts' => 0,
                'news' => 0,
                'users' => 1, // At least admin user
                'contacts' => 0,
                'subscribers' => 0,
                'mic_mtaani_articles' => 0,
                'mic_mtaani_events' => 0,
                'mic_mtaani_businesses' => 0
            ]);
        }
    }
    
    private function getTableCount($tableName) {
        try {
            $query = "SELECT COUNT(*) as count FROM " . $tableName;
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            return (int)$result['count'];
        } catch (Exception $e) {
            return 0;
        }
    }
    
    public function getFilms() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 20;
        $offset = ($page - 1) * $limit;
        
        try {
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM films";
            $countStmt = $this->conn->prepare($countQuery);
            $countStmt->execute();
            $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get films with full admin data
            $query = "SELECT id, title, slug, description, image_url, release_date, genre, 
                             director, duration, rating, trailer_url, is_featured, status, 
                             created_at, updated_at
                     FROM films 
                     ORDER BY created_at DESC 
                     LIMIT :limit OFFSET :offset";
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':limit', $limit, PDO::PARAM_INT);
            $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
            $stmt->execute();
            
            $films = $stmt->fetchAll(PDO::FETCH_ASSOC);
            
            return json_encode([
                'data' => $films,
                'pagination' => [
                    'current_page' => $page,
                    'total_pages' => ceil($totalCount / $limit),
                    'total_items' => $totalCount,
                    'items_per_page' => $limit
                ]
            ]);
        } catch (Exception $e) {
            return json_encode([
                'data' => [],
                'pagination' => [
                    'current_page' => 1,
                    'total_pages' => 0,
                    'total_items' => 0,
                    'items_per_page' => $limit
                ]
            ]);
        }
    }
    
    public function createFilm() {
        $data = json_decode(file_get_contents("php://input"), true);
        
        $required_fields = ['title', 'description', 'genre', 'release_date'];
        foreach ($required_fields as $field) {
            if (!isset($data[$field]) || empty($data[$field])) {
                http_response_code(400);
                return json_encode(['error' => "Field '$field' is required"]);
            }
        }
        
        try {
            // Generate slug from title
            $slug = strtolower(preg_replace('/[^A-Za-z0-9-]+/', '-', $data['title']));
            
            $query = "INSERT INTO films (title, slug, description, genre, release_date, director, 
                                       duration, rating, image_url, trailer_url, is_featured, status) 
                     VALUES (:title, :slug, :description, :genre, :release_date, :director, 
                             :duration, :rating, :image_url, :trailer_url, :is_featured, :status)";
            $stmt = $this->conn->prepare($query);
            
            $stmt->bindParam(':title', $data['title']);
            $stmt->bindParam(':slug', $slug);
            $stmt->bindParam(':description', $data['description']);
            $stmt->bindParam(':genre', $data['genre']);
            $stmt->bindParam(':release_date', $data['release_date']);
            $stmt->bindParam(':director', $data['director'] ?? null);
            $stmt->bindParam(':duration', $data['duration'] ?? null);
            $stmt->bindParam(':rating', $data['rating'] ?? null);
            $stmt->bindParam(':image_url', $data['image_url'] ?? null);
            $stmt->bindParam(':trailer_url', $data['trailer_url'] ?? null);
            $stmt->bindParam(':is_featured', $data['is_featured'] ?? false, PDO::PARAM_BOOL);
            $stmt->bindParam(':status', $data['status'] ?? 'draft');
            
            $stmt->execute();
            
            $filmId = $this->conn->lastInsertId();
            
            return json_encode([
                'success' => true,
                'message' => 'Film created successfully',
                'film_id' => $filmId,
                'slug' => $slug
            ]);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Failed to create film: ' . $e->getMessage()]);
        }
    }
}
?>