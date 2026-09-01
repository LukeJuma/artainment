-- Create missing tables that are causing 404 errors

-- Create talent table (for actors/crew)
CREATE TABLE IF NOT EXISTS talent (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(100),
    bio TEXT,
    credits INTEGER DEFAULT 0,
    image_url TEXT,
    reel_url TEXT,
    socials JSONB,
    active BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create news_articles table
CREATE TABLE IF NOT EXISTS news_articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    category VARCHAR(100),
    excerpt TEXT,
    body TEXT,
    image_url TEXT,
    published_at TIMESTAMP WITH TIME ZONE,
    featured BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample talent data
INSERT INTO talent (name, slug, role, bio, credits, active, sort_order) VALUES
('Maryann Matega', 'maryann-matega', 'Lead Actress', 'Acclaimed Kenyan actress known for her powerful performances in contemporary African cinema.', 12, true, 1),
('Walter Muiruri', 'walter-muiruri', 'Supporting Actor', 'Versatile actor with extensive experience in theatre and film productions.', 8, true, 2),
('Sarah Kimani', 'sarah-kimani', 'Director', 'Award-winning filmmaker specializing in social justice narratives.', 5, true, 3),
('David Ndung''u', 'david-ndungu', 'Cinematographer', 'Master of visual storytelling with expertise in African landscapes.', 15, true, 4),
('Grace Wanjiku', 'grace-wanjiku', 'Producer', 'Experienced producer known for bringing authentic African stories to international audiences.', 10, true, 5),
('James Mwangi', 'james-mwangi', 'Sound Designer', 'Creative sound engineer specializing in authentic African soundscapes.', 7, true, 6)
ON CONFLICT (slug) DO NOTHING;

-- Insert sample news articles
INSERT INTO news_articles (title, slug, category, excerpt, body, status, published_at, featured) VALUES
('The Artainment Wins at Nairobi Film Festival', 'artainment-wins-nairobi-film-festival', 'Awards', 'Our latest production "Nairobi Noir" takes home Best Cinematography award.', 'The Artainment is proud to announce that our latest film "Nairobi Noir" has won the prestigious Best Cinematography award at the Nairobi International Film Festival. This recognition highlights our commitment to visual storytelling excellence and authentic African narratives.', 'published', NOW() - INTERVAL '2 days', true),
('New Series "Coastal Dreams" in Pre-Production', 'coastal-dreams-preproduction', 'Production News', 'Exciting new series exploring life along Kenya''s beautiful coastline begins filming next month.', 'We are thrilled to announce the beginning of pre-production for our upcoming series "Coastal Dreams," a compelling drama that explores the intersection of tradition and modernity along Kenya''s stunning coastline. The series promises to showcase the rich cultural heritage of coastal communities while addressing contemporary challenges.', 'published', NOW() - INTERVAL '5 days', false),
('Behind the Scenes: Making of "The Red Soil"', 'behind-scenes-red-soil', 'Behind the Scenes', 'Go behind the camera to see how we brought this powerful family drama to life.', 'Join us for an exclusive look behind the scenes of our acclaimed film "The Red Soil." From the rolling hills of central Kenya to the intimate family moments that drive the narrative, discover the creative process that brought this powerful story to the screen.', 'published', NOW() - INTERVAL '1 week', false),
('The Artainment Expands Documentary Division', 'artainment-expands-documentary', 'Company News', 'New documentary unit focuses on preserving African oral traditions and cultural heritage.', 'The Artainment is excited to announce the launch of our new documentary division, dedicated to preserving and sharing African oral traditions, cultural heritage, and contemporary social issues. This expansion represents our commitment to diverse storytelling formats and educational content.', 'published', NOW() - INTERVAL '10 days', false)
ON CONFLICT (slug) DO NOTHING;

-- Enable RLS on new tables
ALTER TABLE talent ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_articles ENABLE ROW LEVEL SECURITY;

-- Create policies for public read access
CREATE POLICY "talent_public_read" ON talent
FOR SELECT TO public
USING (active = true);

CREATE POLICY "news_articles_public_read" ON news_articles  
FOR SELECT TO public
USING (status = 'published' AND published_at IS NOT NULL);

-- Insert the migration record
INSERT INTO supabase_migrations.schema_migrations (version, name) 
VALUES ('20260901_create_missing_tables', 'Create missing talent and news_articles tables')
ON CONFLICT (version) DO NOTHING;