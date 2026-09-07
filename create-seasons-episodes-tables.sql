-- Create seasons table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.seasons (
    id SERIAL PRIMARY KEY,
    series_id INTEGER NOT NULL REFERENCES public.series(id) ON DELETE CASCADE,
    season_number INTEGER NOT NULL,
    title VARCHAR(255),
    synopsis TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(series_id, season_number)
);

-- Create episodes table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.episodes (
    id SERIAL PRIMARY KEY,
    season_id INTEGER NOT NULL REFERENCES public.seasons(id) ON DELETE CASCADE,
    episode_number INTEGER NOT NULL,
    title VARCHAR(255) NOT NULL,
    synopsis TEXT,
    duration VARCHAR(20),
    video_url TEXT,
    poster_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(season_id, episode_number)
);

-- Enable Row Level Security (RLS) for seasons
ALTER TABLE public.seasons ENABLE ROW LEVEL SECURITY;

-- Enable Row Level Security (RLS) for episodes  
ALTER TABLE public.episodes ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for seasons (allow all operations with service role, read-only for public)
CREATE POLICY "Allow public read access to seasons" ON public.seasons
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to seasons" ON public.seasons
    USING (auth.role() = 'service_role');

-- Create RLS policies for episodes (allow all operations with service role, read-only for public)
CREATE POLICY "Allow public read access to episodes" ON public.episodes
    FOR SELECT USING (true);

CREATE POLICY "Allow service role full access to episodes" ON public.episodes
    USING (auth.role() = 'service_role');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_seasons_series_id ON public.seasons(series_id);
CREATE INDEX IF NOT EXISTS idx_seasons_season_number ON public.seasons(season_number);
CREATE INDEX IF NOT EXISTS idx_episodes_season_id ON public.episodes(season_id);
CREATE INDEX IF NOT EXISTS idx_episodes_episode_number ON public.episodes(episode_number);

-- Insert a test season and episode to verify tables work
-- Note: This will only work if there's a series with id=1
INSERT INTO public.seasons (series_id, season_number, title, synopsis) 
VALUES (1, 1, 'Season 1', 'First season of the series')
ON CONFLICT (series_id, season_number) DO NOTHING;

-- Get the season ID for the episode insert
DO $$
DECLARE
    season_id_var INTEGER;
BEGIN
    SELECT id INTO season_id_var FROM public.seasons WHERE series_id = 1 AND season_number = 1;
    
    IF season_id_var IS NOT NULL THEN
        INSERT INTO public.episodes (season_id, episode_number, title, synopsis)
        VALUES (season_id_var, 1, 'Episode 1', 'First episode of season 1')
        ON CONFLICT (season_id, episode_number) DO NOTHING;
    END IF;
END $$;

-- Verify the tables were created successfully
SELECT 'seasons table' as table_name, COUNT(*) as row_count FROM public.seasons
UNION ALL
SELECT 'episodes table' as table_name, COUNT(*) as row_count FROM public.episodes;