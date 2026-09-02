-- Insert sample data for Mic Mtaani (run after tables are created)

-- Insert categories
INSERT INTO mic_mtaani_categories (name, slug, color, description, sort_order, is_active) VALUES
('Local News', 'local-news', '#e74c3c', 'Breaking news from Nakuru', 1, true),
('Community Events', 'community-events', '#3498db', 'Local events and gatherings', 2, true),
('Business Spotlight', 'business-spotlight', '#2ecc71', 'Featured local businesses', 3, true),
('Sports', 'sports', '#f39c12', 'Local sports news', 4, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert articles
INSERT INTO mic_mtaani_articles (headline, slug, subtitle, body, excerpt, category_id, status, published_at, is_featured, reading_time) VALUES
('New Community Center Opens', 'new-community-center-opens', 'Modern facility for residents', 
'The Nakuru West Community Center officially opened with modern facilities including a multi-purpose hall, computer lab, and library.', 
'New community center opens in Nakuru West with modern facilities.', 
1, 'published', NOW() - INTERVAL '2 days', true, 4),

('Local Market Boosts Economy', 'local-market-boosts-economy', 'Farmers market success story', 
'The weekly farmers market has become vital for local producers, hosting over 100 vendors every Saturday.', 
'Weekly farmers market creates opportunities for local producers.', 
3, 'published', NOW() - INTERVAL '5 days', false, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert businesses
INSERT INTO mic_mtaani_businesses (name, slug, description, location, phone, is_featured) VALUES
('Mama Njeris Kitchen', 'mama-njeris-kitchen', 'Authentic Kenyan cuisine', 'Kenyatta Avenue, Nakuru', '+254-712-345-678', true),
('TechHub Nakuru', 'techhub-nakuru', 'Computer repair services', 'Mosque Road, Nakuru', '+254-723-456-789', true)
ON CONFLICT (slug) DO NOTHING;