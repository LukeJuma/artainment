-- Create Mic Mtaani database tables

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
    category_id INTEGER REFERENCES mic_mtaani_categories(id),
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

-- Events table
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
'The Nakuru West Community Center officially opened its doors last weekend, marking a significant milestone for local residents. The facility, which took two years to complete, features a multi-purpose hall, computer lab, library, and meeting rooms. County Governor Susan Kihika praised the project as a testament to community collaboration and development. The center will host various programs including skills training, youth mentorship, and community meetings. Local residents expressed excitement about having a dedicated space for community activities and learning opportunities.', 
'A new community center in Nakuru West opens with modern facilities for local programs and activities.', 
1, 'published', NOW() - INTERVAL '2 days', true, 4),

('Local Farmers Market Boosts Economy', 'farmers-market-boosts-economy', 'Weekly market creates opportunities for small-scale farmers', 
'The Nakuru Farmers Market has become a vital economic hub for local agricultural producers. Every Saturday, over 100 vendors gather to sell fresh produce, dairy products, and handmade crafts. The market, which started with just 20 vendors three years ago, now attracts customers from neighboring counties. Market coordinator Jane Wanjiku notes that the initiative has significantly improved farmers'' incomes and reduced food waste. Plans are underway to expand the market to include a permanent structure with cold storage facilities.', 
'Weekly farmers market in Nakuru creates economic opportunities for local producers and attracts regional customers.', 
3, 'published', NOW() - INTERVAL '5 days', false, 3),

('Youth Football League Championship', 'youth-football-league-championship', 'Local teams compete for the annual trophy', 
'The Nakuru Youth Football League concluded its season with an exciting championship match at Afraha Stadium. Nakuru United defeated Rift Valley Rangers 2-1 in a thrilling final that went into extra time. The league, which features 16 teams from across the county, has been instrumental in developing young talent. Several players have been scouted by professional clubs, with three making it to the national youth team. League organizer Peter Kimani announced plans to expand to include girls'' teams next season.', 
'Nakuru United wins the Youth Football League championship in a thrilling final at Afraha Stadium.', 
4, 'published', NOW() - INTERVAL '1 week', false, 5),

('Digital Literacy Program Launches', 'digital-literacy-program-launches', 'Free computer training for community members', 
'A new digital literacy program launched at the Nakuru Public Library aims to bridge the digital divide in the community. The program offers free computer training, internet skills, and basic digital services to residents of all ages. Funded by a partnership between the county government and local NGOs, the initiative includes classes in computer basics, email setup, social media safety, and online job applications. Library director Mary Njeri expects to train over 500 community members in the first year.', 
'Free digital literacy program at Nakuru Public Library offers computer training to bridge the digital divide.', 
6, 'published', NOW() - INTERVAL '3 days', false, 4)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample events
INSERT INTO mic_mtaani_events (title, slug, description, location, organizer, category, starts_at, ends_at, is_featured, status) VALUES
('Nakuru Cultural Festival', 'nakuru-cultural-festival', 'Annual celebration of local culture, music, and traditional arts', 'Menengai Crater Grounds', 'Nakuru County Cultural Department', 'Culture', NOW() + INTERVAL '2 weeks', NOW() + INTERVAL '2 weeks' + INTERVAL '8 hours', true, 'active'),
('Small Business Workshop', 'small-business-workshop', 'Learn essential skills for starting and growing your business', 'Nakuru Town Hall', 'Nakuru Business Association', 'Business', NOW() + INTERVAL '1 week', NOW() + INTERVAL '1 week' + INTERVAL '6 hours', false, 'active'),
('Community Health Fair', 'community-health-fair', 'Free health screenings and wellness education for all ages', 'Nakuru County Referral Hospital', 'Ministry of Health Nakuru', 'Health', NOW() + INTERVAL '10 days', NOW() + INTERVAL '10 days' + INTERVAL '8 hours', true, 'active'),
('Youth Football Tournament', 'youth-football-tournament', 'Inter-school football competition for ages 12-18', 'Afraha Stadium', 'Nakuru Sports Association', 'Sports', NOW() + INTERVAL '3 weeks', NOW() + INTERVAL '3 weeks' + INTERVAL '2 days', false, 'active')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample businesses
INSERT INTO mic_mtaani_businesses (name, slug, description, location, phone, category, is_featured) VALUES
('Mama Njeri''s Kitchen', 'mama-njeris-kitchen', 'Authentic Kenyan cuisine and traditional recipes passed down through generations', 'Kenyatta Avenue, Nakuru', '+254-712-345-678', 'Restaurant', true),
('TechHub Nakuru', 'techhub-nakuru', 'Computer repair, phone accessories, and digital services for the community', 'Mosque Road, Nakuru', '+254-723-456-789', 'Technology', true),
('Green Valley Farm Store', 'green-valley-farm-store', 'Fresh organic produce from local farms, dairy products, and farming supplies', 'Section 58, Nakuru', '+254-734-567-890', 'Agriculture', false),
('Nakuru Tailoring Co-op', 'nakuru-tailoring-coop', 'Custom clothing, alterations, and fashion design by skilled local tailors', 'Bondeni, Nakuru', '+254-745-678-901', 'Fashion', true),
('Bright Minds Bookshop', 'bright-minds-bookshop', 'Books, stationery, and educational materials for students and professionals', 'Kenol Street, Nakuru', '+254-756-789-012', 'Education', false),
('Rift Valley Motors', 'rift-valley-motors', 'Reliable car repair and maintenance services with experienced mechanics', 'Pipeline Road, Nakuru', '+254-767-890-123', 'Automotive', false)
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