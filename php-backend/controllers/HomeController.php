<?php
class HomeController {
    private $conn;
    
    public function __construct($db) {
        $this->conn = $db;
    }
    
    public function getHome() {
        try {
            $result = [
                'featured_films' => $this->getFeaturedFilms(),
                'latest_series' => $this->getLatestSeries(),
                'top_actors' => $this->getTopActors(),
                'recent_podcasts' => $this->getRecentPodcasts(),
                'latest_news' => $this->getLatestNews(),
                'services' => $this->getServices(),
                'testimonials' => $this->getTestimonials(),
                'gallery_images' => $this->getGalleryImages(),
                'mic_mtaani_latest' => $this->getMicMtaaniLatest()
            ];
            
            return json_encode($result);
        } catch (Exception $e) {
            return json_encode([
                'featured_films' => [],
                'latest_series' => [],
                'top_actors' => [],
                'recent_podcasts' => [],
                'latest_news' => [],
                'services' => [],
                'testimonials' => [],
                'gallery_images' => [],
                'mic_mtaani_latest' => []
            ]);
        }
    }
    
    private function getFeaturedFilms() {
        try {
            $query = "SELECT id, title, slug, description, image_url, release_date, genre 
                     FROM films WHERE is_featured = 1 AND status = 'published' 
                     ORDER BY created_at DESC LIMIT 6";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getLatestSeries() {
        try {
            $query = "SELECT id, title, slug, description, image_url, release_date, genre 
                     FROM series WHERE status = 'published' 
                     ORDER BY created_at DESC LIMIT 6";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getTopActors() {
        try {
            $query = "SELECT id, name, slug, bio, image_url, specialty 
                     FROM talents WHERE is_featured = 1 
                     ORDER BY created_at DESC LIMIT 8";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getRecentPodcasts() {
        try {
            $query = "SELECT id, title, slug, description, image_url, duration 
                     FROM podcasts WHERE status = 'published' 
                     ORDER BY created_at DESC LIMIT 4";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getLatestNews() {
        try {
            $query = "SELECT id, headline, slug, excerpt, image_url, published_at 
                     FROM news_articles WHERE status = 'published' 
                     ORDER BY published_at DESC LIMIT 4";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getServices() {
        try {
            $query = "SELECT id, title, description, icon, price 
                     FROM services WHERE is_active = 1 
                     ORDER BY sort_order ASC LIMIT 6";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getTestimonials() {
        try {
            $query = "SELECT id, client_name, testimonial, rating, project_type 
                     FROM testimonials WHERE is_featured = 1 
                     ORDER BY created_at DESC LIMIT 6";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getGalleryImages() {
        try {
            $query = "SELECT id, title, image_url, category 
                     FROM gallery_images WHERE is_featured = 1 
                     ORDER BY created_at DESC LIMIT 12";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
    
    private function getMicMtaaniLatest() {
        try {
            $query = "SELECT id, headline, slug, excerpt, image_url, published_at 
                     FROM mic_mtaani_articles WHERE status = 'published' 
                     ORDER BY published_at DESC LIMIT 3";
            $stmt = $this->conn->prepare($query);
            $stmt->execute();
            return $stmt->fetchAll(PDO::FETCH_ASSOC);
        } catch (Exception $e) {
            return [];
        }
    }
}
?>