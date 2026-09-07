<?php
class FilmController {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getFilms() {
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $limit = isset($_GET['limit']) ? (int)$_GET['limit'] : 10;
        $genre = isset($_GET['genre']) ? $_GET['genre'] : '';
        $offset = ($page - 1) * $limit;
        
        try {
            // Build query with optional genre filter
            $whereClause = "WHERE status = 'published'";
            $params = [];
            
            if ($genre) {
                $whereClause .= " AND genre = :genre";
                $params[':genre'] = $genre;
            }
            
            // Get total count
            $countQuery = "SELECT COUNT(*) as total FROM films " . $whereClause;
            $countStmt = $this->conn->prepare($countQuery);
            foreach ($params as $key => $value) {
                $countStmt->bindValue($key, $value);
            }
            $countStmt->execute();
            $totalCount = $countStmt->fetch(PDO::FETCH_ASSOC)['total'];
            
            // Get films
            $query = "SELECT id, title, slug, description, image_url, release_date, genre, 
                             director, duration, rating, trailer_url, is_featured 
                     FROM films " . $whereClause . " 
                     ORDER BY created_at DESC 
                     LIMIT :limit OFFSET :offset";
            $stmt = $this->conn->prepare($query);
            
            foreach ($params as $key => $value) {
                $stmt->bindValue($key, $value);
            }
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
    
    public function getFilmBySlug($slug) {
        try {
            $query = "SELECT f.*, 
                             GROUP_CONCAT(DISTINCT t.name) as cast_names,
                             GROUP_CONCAT(DISTINCT t.slug) as cast_slugs
                     FROM films f
                     LEFT JOIN film_talent ft ON f.id = ft.film_id
                     LEFT JOIN talents t ON ft.talent_id = t.id
                     WHERE f.slug = :slug AND f.status = 'published'
                     GROUP BY f.id";
            $stmt = $this->conn->prepare($query);
            $stmt->bindParam(':slug', $slug);
            $stmt->execute();
            
            if ($stmt->rowCount() === 0) {
                http_response_code(404);
                return json_encode(['error' => 'Film not found']);
            }
            
            $film = $stmt->fetch(PDO::FETCH_ASSOC);
            
            // Format cast data
            if ($film['cast_names']) {
                $cast_names = explode(',', $film['cast_names']);
                $cast_slugs = explode(',', $film['cast_slugs']);
                $film['cast'] = array_map(function($name, $slug) {
                    return ['name' => $name, 'slug' => $slug];
                }, $cast_names, $cast_slugs);
            } else {
                $film['cast'] = [];
            }
            
            unset($film['cast_names']);
            unset($film['cast_slugs']);
            
            // Get related films
            $relatedQuery = "SELECT id, title, slug, image_url, genre 
                            FROM films 
                            WHERE genre = :genre AND slug != :slug AND status = 'published' 
                            ORDER BY RAND() LIMIT 4";
            $relatedStmt = $this->conn->prepare($relatedQuery);
            $relatedStmt->bindParam(':genre', $film['genre']);
            $relatedStmt->bindParam(':slug', $slug);
            $relatedStmt->execute();
            $film['related_films'] = $relatedStmt->fetchAll(PDO::FETCH_ASSOC);
            
            return json_encode($film);
        } catch (Exception $e) {
            http_response_code(500);
            return json_encode(['error' => 'Internal server error']);
        }
    }
}
?>