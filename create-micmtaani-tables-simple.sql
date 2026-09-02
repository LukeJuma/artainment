-- Create Mic Mtaani database tables (simplified version)

-- Categories table
CREATE TABLE IF NOT EXISTS mic_mtaani_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    color VARCHAR(7),
    description TEXT,
    icon VARCHAR(100),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Articles table
CREATE TABLE IF NOT EXISTS mic_mtaani_articles (
    id SERIAL PRIMARY KEY,
    headline VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    subtitle TEXT,
    body TEXT,
    excerpt TEXT,
    author_id INTEGER,
    category_id INTEGER,
    image_url TEXT,
    video_url TEXT,
    tags JSONB,
    reading_time INTEGER DEFAULT 5,
    is_featured BOOLEAN DEFAULT false,
    is_breaking BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft',
    published_at TIMESTAMP WITH TIME ZONE,
    views INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Events table (simplified)
CREATE TABLE IF NOT EXISTS mic_mtaani_events (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    location VARCHAR(255) NOT NULL,
    organizer VARCHAR(255),
    image_url TEXT,
    category VARCHAR(100),
    starts_at TIMESTAMP WITH TIME ZONE NOT NULL,
    ends_at TIMESTAMP WITH TIME ZONE,
    is_featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Businesses table
CREATE TABLE IF NOT EXISTS mic_mtaani_businesses (
    id SERIAL PRIMARY KEY,
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
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample categories
INSERT INTO mic_mtaani_categories (name, slug, color, description, sort_order, is_active) VALUES
('Local News', 'local-news', '#e74c3c', 'Breaking news and updates from Nakuru', 1, true),
('Community Events', 'community-events', '#3498db', 'Local events and gatherings', 2, true),
('Business Spotlight', 'business-spotlight', '#2ecc71', 'Featured local businesses', 3, true),
('Sports', 'sports', '#f39c12', 'Local sports news and events', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample articles
INSERT INTO mic_mtaani_articles (headline, slug, subtitle, body, excerpt, category_id, status, published_at, is_featured, reading_time) VALUES
('New Community Center Opens in Nakuru West', 'new-community-center-nakuru-west', 'A state-of-the-art facility to serve residents', 
'The Nakuru West Community Center officially opened its doors last weekend. The facility features a multi-purpose hall, computer lab, library, and meeting rooms.', 
'A new community center in Nakuru West opens with modern facilities.', 
1, 'published', NOW() - INTERVAL '2 days', true, 4),

('Local Farmers Market Boosts Economy', 'farmers-market-boosts-economy', 'Weekly market creates opportunities for farmers', 
'The Nakuru Farmers Market has become a vital economic hub for local agricultural producers. Every Saturday, over 100 vendors gather to sell fresh produce.', 
'Weekly farmers market in Nakuru creates economic opportunities.', 
3, 'published', NOW() - INTERVAL '5 days', false, 3)
ON CONFLICT (slug) DO NOTHING;

-- Try simple events without potential constraint issues
INSERT INTO mic_mtaani_events (title, slug, description, location, organizer, starts_at, is_featured, status) VALUES
('Nakuru Cultural Festival', 'nakuru-cultural-festival', 'Annual celebration of local culture and arts', 'Menengai Crater Grounds', 'Nakuru County', NOW() + INTERVAL '2 weeks', true, 'active'),
('Small Business Workshop', 'small-business-workshop', 'Learn business skills', 'Nakuru Town Hall', 'Business Association', NOW() + INTERVAL '1 week', false, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample businesses
INSERT INTO mic_mtaani_businesses (name, slug, description, location, phone, is_featured) VALUES
('Mama Njeris Kitchen', 'mama-njeris-kitchen', 'Authentic Kenyan cuisine', 'Kenyatta Avenue, Nakuru', '+254-712-345-678', true),
('TechHub Nakuru', 'techhub-nakuru', 'Computer repair and digital services', 'Mosque Road, Nakuru', '+254-723-456-789', true)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE mic_mtaani_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE mic_mtaani_businesses ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "mic_mtaani_categories_public_read" ON mic_mtaani_categories
FOR SELECT TO public
USING (is_active = true);

CREATE POLICY "mic_mtaani_articles_public_read" ON mic_mtaani_articles  
FOR SELECT TO public
USING (status = 'published' AND published_at IS NOT NULL);

CREATE POLICY "mic_mtaani_events_public_read" ON mic_mtaani_events
FOR SELECT TO public
USING (status = 'active');

CREATE POLICY "mic_mtaani_businesses_public_read" ON mic_mtaani_businesses
FOR SELECT TO public
USING (true);