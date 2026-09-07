-- Add Sample Data to Mic Mtaani Tables
-- Run this AFTER the tables have been created successfully

-- Insert sample categories
INSERT INTO mic_mtaani_categories (name, slug, color, description, sort_order, is_active) VALUES
('Local News', 'local-news', '#e74c3c', 'Breaking news and updates from Nakuru and surrounding areas', 1, true),
('Community Events', 'community-events', '#3498db', 'Local events, festivals, and community gatherings', 2, true),
('Business Spotlight', 'business-spotlight', '#2ecc71', 'Featured local businesses and entrepreneurs', 3, true),
('Sports & Recreation', 'sports-recreation', '#f39c12', 'Local sports news, teams, and recreational activities', 4, true),
('Health & Wellness', 'health-wellness', '#9b59b6', 'Health tips, medical facilities, and wellness programs', 5, true),
('Education', 'education', '#1abc9c', 'Schools, universities, and educational opportunities', 6, true)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample articles
INSERT INTO mic_mtaani_articles (headline, slug, subtitle, body, excerpt, category_id, status, published_at, is_featured, reading_time) VALUES
('New Community Center Opens in Nakuru West', 'new-community-center-nakuru-west', 'A state-of-the-art facility to serve residents of Nakuru West', 
'The Nakuru West Community Center officially opened its doors last weekend, marking a significant milestone for local residents. The facility, which took two years to complete, features a multi-purpose hall, computer lab, library, and meeting rooms.', 
'A new community center in Nakuru West opens with modern facilities for local programs and activities.', 
1, 'published', NOW() - INTERVAL '2 days', true, 4),

('Local Farmers Market Boosts Economy', 'farmers-market-boosts-economy', 'Weekly market creates opportunities for small-scale farmers', 
'The Nakuru Farmers Market has become a vital economic hub for local agricultural producers. Every Saturday, over 100 vendors gather to sell fresh produce, dairy products, and handmade crafts.', 
'Weekly farmers market in Nakuru creates economic opportunities for local producers.', 
3, 'published', NOW() - INTERVAL '5 days', false, 3)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample events (simple categories to avoid constraint issues)
INSERT INTO mic_mtaani_events (title, slug, description, location, organizer, category, starts_at, ends_at, is_featured, status) VALUES
('Nakuru Cultural Festival', 'nakuru-cultural-festival', 'Annual celebration of local culture, music, and traditional arts', 'Menengai Crater Grounds', 'Nakuru County Cultural Department', 'Community', NOW() + INTERVAL '2 weeks', NOW() + INTERVAL '2 weeks' + INTERVAL '8 hours', true, 'active'),
('Small Business Workshop', 'small-business-workshop', 'Learn essential skills for starting and growing your business', 'Nakuru Town Hall', 'Nakuru Business Association', 'Business', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '6 hours', false, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample businesses
INSERT INTO mic_mtaani_businesses (name, slug, description, location, phone, category, is_featured) VALUES
('Mama Njeri Kitchen', 'mama-njeris-kitchen', 'Authentic Kenyan cuisine and traditional recipes', 'Kenyatta Avenue, Nakuru', '+254-712-345-678', 'Restaurant', true),
('TechHub Nakuru', 'techhub-nakuru', 'Computer repair, phone accessories, and digital services', 'Mosque Road, Nakuru', '+254-723-456-789', 'Technology', true),
('Green Valley Farm Store', 'green-valley-farm-store', 'Fresh organic produce from local farms and dairy products', 'Section 58, Nakuru', '+254-734-567-890', 'Agriculture', false)
ON CONFLICT (slug) DO NOTHING;

-- Success message
SELECT 'Sample data added successfully!' as result;