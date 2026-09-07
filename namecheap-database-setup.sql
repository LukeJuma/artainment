-- Namecheap MySQL Database Setup for Artainment
-- Run this in your Namecheap cPanel MySQL database

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_admin BOOLEAN DEFAULT FALSE,
    avatar_url TEXT,
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Films table
CREATE TABLE IF NOT EXISTS films (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    trailer_url TEXT,
    release_date DATE,
    genre VARCHAR(100),
    director VARCHAR(255),
    duration INT, -- in minutes
    rating DECIMAL(2,1), -- e.g., 4.5
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_genre (genre),
    INDEX idx_status (status),
    INDEX idx_featured (is_featured)
);

-- Create Series table
CREATE TABLE IF NOT EXISTS series (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    release_date DATE,
    genre VARCHAR(100),
    director VARCHAR(255),
    total_seasons INT DEFAULT 1,
    total_episodes INT DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Talents table (Actors/Directors/etc)
CREATE TABLE IF NOT EXISTS talents (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    bio TEXT,
    image_url TEXT,
    specialty ENUM('actor', 'director', 'producer', 'writer', 'other') DEFAULT 'actor',
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Film-Talent relationship table
CREATE TABLE IF NOT EXISTS film_talent (
    id INT PRIMARY KEY AUTO_INCREMENT,
    film_id INT NOT NULL,
    talent_id INT NOT NULL,
    role VARCHAR(100), -- 'actor', 'director', etc.
    character_name VARCHAR(255), -- if actor
    FOREIGN KEY (film_id) REFERENCES films(id) ON DELETE CASCADE,
    FOREIGN KEY (talent_id) REFERENCES talents(id) ON DELETE CASCADE,
    UNIQUE KEY unique_film_talent_role (film_id, talent_id, role)
);

-- Create Podcasts table
CREATE TABLE IF NOT EXISTS podcasts (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    image_url TEXT,
    audio_url TEXT,
    duration INT, -- in seconds
    episode_number INT,
    season_number INT DEFAULT 1,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create News Articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    headline VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    content TEXT,
    excerpt TEXT,
    image_url TEXT,
    author_id INT,
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create Services table
CREATE TABLE IF NOT EXISTS services (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    icon VARCHAR(100),
    price DECIMAL(10,2),
    is_active BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Testimonials table
CREATE TABLE IF NOT EXISTS testimonials (
    id INT PRIMARY KEY AUTO_INCREMENT,
    client_name VARCHAR(255) NOT NULL,
    client_position VARCHAR(255),
    client_company VARCHAR(255),
    testimonial TEXT NOT NULL,
    rating INT DEFAULT 5,
    project_type VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Gallery Images table
CREATE TABLE IF NOT EXISTS gallery_images (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255),
    image_url TEXT NOT NULL,
    thumbnail_url TEXT,
    category VARCHAR(100),
    description TEXT,
    is_featured BOOLEAN DEFAULT FALSE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Contact Submissions table
CREATE TABLE IF NOT EXISTS contact_submissions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255),
    message TEXT NOT NULL,
    status ENUM('new', 'read', 'replied') DEFAULT 'new',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create Newsletter Subscribers table
CREATE TABLE IF NOT EXISTS subscribers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) UNIQUE NOT NULL,
    status ENUM('active', 'unsubscribed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Mic Mtaani Platform Tables
CREATE TABLE IF NOT EXISTS mic_mtaani_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    color VARCHAR(7),
    description TEXT,
    icon VARCHAR(100),
    sort_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mic_mtaani_articles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    headline VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subtitle TEXT,
    body TEXT,
    excerpt TEXT,
    author_id INT,
    category_id INT,
    image_url TEXT,
    video_url TEXT,
    tags JSON,
    reading_time INT DEFAULT 5,
    is_featured BOOLEAN DEFAULT FALSE,
    is_breaking BOOLEAN DEFAULT FALSE,
    status ENUM('draft', 'published', 'archived') DEFAULT 'draft',
    published_at TIMESTAMP NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY (category_id) REFERENCES mic_mtaani_categories(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS mic_mtaani_events (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(255),
    image_url TEXT,
    category ENUM('Community', 'Business', 'Health', 'Education', 'Sports', 'Culture') DEFAULT 'Community',
    starts_at TIMESTAMP NOT NULL,
    ends_at TIMESTAMP,
    is_featured BOOLEAN DEFAULT FALSE,
    status ENUM('active', 'cancelled', 'completed') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mic_mtaani_businesses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    email VARCHAR(255),
    website TEXT,
    opening_hours TEXT,
    image_url TEXT,
    category VARCHAR(100),
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Insert admin user (password is 'Admin123!' hashed)
INSERT INTO users (name, email, password_hash, is_admin) VALUES 
('Admin', 'admin@theartainment.co.ke', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', TRUE)
ON DUPLICATE KEY UPDATE name=name;

-- Insert some sample data
INSERT INTO services (title, description, icon, price, sort_order) VALUES
('Film Production', 'Full-service film production from concept to completion', 'movie', 50000.00, 1),
('Video Editing', 'Professional video editing and post-production services', 'edit', 5000.00, 2),
('Photography', 'Professional photography for events, portraits, and commercial use', 'camera', 10000.00, 3),
('Audio Production', 'Podcast recording, audio editing, and sound design', 'headphones', 8000.00, 4)
ON DUPLICATE KEY UPDATE title=title;

INSERT INTO testimonials (client_name, client_company, testimonial, rating, project_type) VALUES
('Sarah Johnson', 'Tech Innovations', 'Outstanding film production quality. The team exceeded our expectations!', 5, 'Corporate Video'),
('Michael Chen', 'Local Restaurant', 'Great photography service for our menu and marketing materials.', 5, 'Commercial Photography'),
('Grace Wanjiku', 'Wedding Client', 'Beautiful wedding photography that captured every precious moment.', 5, 'Wedding Photography')
ON DUPLICATE KEY UPDATE client_name=client_name;

INSERT INTO mic_mtaani_categories (name, slug, color, description, sort_order) VALUES
('Local News', 'local-news', '#e74c3c', 'Breaking news and updates from Nakuru and surrounding areas', 1),
('Community Events', 'community-events', '#3498db', 'Local events, festivals, and community gatherings', 2),
('Business Spotlight', 'business-spotlight', '#2ecc71', 'Featured local businesses and entrepreneurs', 3),
('Sports & Recreation', 'sports-recreation', '#f39c12', 'Local sports news, teams, and recreational activities', 4)
ON DUPLICATE KEY UPDATE name=name;

-- Success message
SELECT 'Database setup completed successfully!' as message;