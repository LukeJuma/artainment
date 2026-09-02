-- Create Mic Mtaani tables only (no data inserts to avoid constraints)

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