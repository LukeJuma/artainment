<?php

namespace Database\Seeders;

use App\Models\{Film, Service, Talent, Production, NewsArticle, Testimonial, GalleryImage, User, MicMtaaniCategory, MicMtaaniArticle, MicMtaaniJournalist, MicMtaaniEvent, MicMtaaniBusiness};
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        User::create([
            'name' => 'Admin',
            'email' => 'admin@theartainment.co.ke',
            'password' => Hash::make('password'),
        ]);

        Film::insert([
            ['title' => 'Nairobi Noir', 'slug' => 'nairobi-noir', 'synopsis' => 'A gritty thriller set in the dark alleys of Nairobi, where a detective uncovers a web of corruption that reaches the highest levels of power.', 'genre' => 'Thriller', 'year' => '2024', 'duration' => '1h 52m', 'rating' => 8.4, 'tag' => 'Featured', 'status' => 'completed', 'featured' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'The Red Soil', 'slug' => 'the-red-soil', 'synopsis' => 'A family torn between tradition and modernity in rural Kenya must confront land, legacy, and love when their eldest son returns from Nairobi with a secret.', 'genre' => 'Drama', 'year' => '2024', 'duration' => '2h 08m', 'rating' => 9.1, 'tag' => 'Award Winner', 'status' => 'completed', 'featured' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Mombasa Blue', 'slug' => 'mombasa-blue', 'synopsis' => 'A sweeping romance along the Kenyan coast, where two strangers from different worlds discover that love knows no boundaries.', 'genre' => 'Romance', 'year' => '2023', 'duration' => '1h 44m', 'rating' => 7.8, 'tag' => 'New', 'status' => 'completed', 'featured' => false, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Savannah Dreams', 'slug' => 'savannah-dreams', 'synopsis' => 'An intimate documentary following three Maasai families as they navigate the intersection of ancient traditions and modern life.', 'genre' => 'Documentary', 'year' => '2023', 'duration' => '1h 28m', 'rating' => 8.7, 'tag' => 'Documentary', 'status' => 'completed', 'featured' => false, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Rift Valley Stories', 'slug' => 'rift-valley-stories', 'synopsis' => 'An anthology of interconnected tales from Kenya\'s Great Rift Valley, weaving together the lives of farmers, teachers, and dreamers.', 'genre' => 'Drama', 'year' => '2024', 'duration' => '1h 58m', 'rating' => 8.2, 'tag' => 'New', 'status' => 'completed', 'featured' => false, 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'City of Lights', 'slug' => 'city-of-lights', 'synopsis' => 'A sci-fi vision of Nairobi in 2050, where technology and African spirituality collide in unexpected ways.', 'genre' => 'Sci-Fi', 'year' => '2023', 'duration' => '2h 15m', 'rating' => 7.6, 'tag' => null, 'status' => 'completed', 'featured' => false, 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Service::insert([
            ['title' => 'Film Production', 'description' => 'Full-scale cinematic production from concept to screen. We handle everything — direction, cinematography, post-production.', 'icon' => '🎬', 'sort_order' => 1, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Photography', 'description' => 'Editorial, commercial and event photography. Telling stories through light, composition and authentic African moments.', 'icon' => '📷', 'sort_order' => 2, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Videography', 'description' => 'Corporate, music video, documentary and event coverage. Cinematic grade output for every project.', 'icon' => '🎥', 'sort_order' => 3, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Scriptwriting', 'description' => 'Original screenplays, TV scripts, commercial copy and documentary narratives crafted by our writers collective.', 'icon' => '✍️', 'sort_order' => 4, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Casting', 'description' => 'Access our network of professional Kenyan and East African actors, extras and presenting talent.', 'icon' => '🎭', 'sort_order' => 5, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Post-Production', 'description' => 'Color grading, sound design, VFX, subtitling and finishing for broadcast, streaming and theatrical release.', 'icon' => '🖥️', 'sort_order' => 6, 'active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Talent::insert([
            ['name' => 'Amara Odhiambo', 'slug' => 'amara-odhiambo', 'role' => 'Lead Actress', 'credits' => 12, 'active' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'James Kariuki', 'slug' => 'james-kariuki', 'role' => 'Director', 'credits' => 8, 'active' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Neema Wangari', 'slug' => 'neema-wangari', 'role' => 'Cinematographer', 'credits' => 15, 'active' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'David Mutua', 'slug' => 'david-mutua', 'role' => 'Screenwriter', 'credits' => 20, 'active' => true, 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Fatuma Hassan', 'slug' => 'fatuma-hassan', 'role' => 'Producer', 'credits' => 11, 'active' => true, 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Production::insert([
            ['title' => 'Nairobi Noir', 'type' => 'Feature Film', 'year' => '2024', 'status' => 'completed', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'The Red Soil', 'type' => 'Drama Series', 'year' => '2024', 'status' => 'completed', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Savannah Dreams', 'type' => 'Documentary', 'year' => '2023', 'status' => 'completed', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'City of Tomorrow', 'type' => 'Feature Film', 'year' => '2025', 'status' => 'in_production', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Coastal Rhythms', 'type' => 'Documentary', 'year' => '2025', 'status' => 'upcoming', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'The Nairobi Files', 'type' => 'Series', 'year' => '2026', 'status' => 'upcoming', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
        ]);

        NewsArticle::insert([
            ['title' => '"Nairobi Noir" Wins Best African Film at Zanzibar IFF', 'slug' => 'nairobi-noir-zanzibar-win', 'category' => 'Production', 'excerpt' => 'Our latest thriller took home the prestigious Best Film award, cementing The Artainment\'s place on the continental stage.', 'published_at' => '2025-07-10', 'featured' => true, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Mic Mtaani TV Surpasses 500K Monthly Viewers', 'slug' => 'mic-mtaani-500k-viewers', 'category' => 'Mic Mtaani', 'excerpt' => 'Our community storytelling platform continues to grow, now reaching half a million viewers across East Africa every month.', 'published_at' => '2025-06-28', 'featured' => false, 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Acting Group Opens Auditions for 2025 Cohort', 'slug' => 'acting-group-auditions-2025', 'category' => 'Talent', 'excerpt' => 'We\'re inviting aspiring actors from across Kenya to join our structured training and mentorship programme.', 'published_at' => '2025-06-14', 'featured' => false, 'created_at' => now(), 'updated_at' => now()],
        ]);

        Testimonial::insert([
            ['quote' => 'Working with The Artainment was a revelation. They brought our brand story to life with a level of artistry we hadn\'t seen from any production house in Nairobi.', 'name' => 'Lydia Njoroge', 'role' => 'Marketing Director, Safaricom', 'active' => true, 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['quote' => 'The team understood our vision immediately. From scriptwriting to the final cut, every frame felt intentional. This is what African cinema should look like.', 'name' => 'Omar Sharif Hassan', 'role' => 'Festival Director, Swahili International Film Festival', 'active' => true, 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['quote' => 'Their photography for our launch event was beyond anything we expected. Real storytelling through images — not just documentation.', 'name' => 'Cynthia Achieng', 'role' => 'Creative Director, Nairobi Fashion Week', 'active' => true, 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // ─── Mic Mtaani ──────────────────────────────────────────
        $adminId = User::where('email', 'admin@theartainment.co.ke')->first()->id;

        MicMtaaniCategory::insert([
            ['name' => 'Latest News', 'slug' => 'latest-news', 'color' => '#F00000', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Breaking News', 'slug' => 'breaking-news', 'color' => '#DC2626', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Community', 'slug' => 'community', 'color' => '#2563EB', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'County News', 'slug' => 'county-news', 'color' => '#059669', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Business', 'slug' => 'business', 'color' => '#D97706', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Education', 'slug' => 'education', 'color' => '#7C3AED', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Health', 'slug' => 'health', 'color' => '#0891B2', 'sort_order' => 7, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Sports', 'slug' => 'sports', 'color' => '#EA580C', 'sort_order' => 8, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Entertainment', 'slug' => 'entertainment', 'color' => '#DB2777', 'sort_order' => 9, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Opinion', 'slug' => 'opinion', 'color' => '#4B5563', 'sort_order' => 10, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Events', 'slug' => 'events', 'color' => '#9333EA', 'sort_order' => 11, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Announcements', 'slug' => 'announcements', 'color' => '#1D4ED8', 'sort_order' => 12, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $catLatest = MicMtaaniCategory::where('slug', 'latest-news')->first()->id;
        $catBreaking = MicMtaaniCategory::where('slug', 'breaking-news')->first()->id;
        $catCommunity = MicMtaaniCategory::where('slug', 'community')->first()->id;
        $catCounty = MicMtaaniCategory::where('slug', 'county-news')->first()->id;
        $catBusiness = MicMtaaniCategory::where('slug', 'business')->first()->id;
        $catEducation = MicMtaaniCategory::where('slug', 'education')->first()->id;
        $catHealth = MicMtaaniCategory::where('slug', 'health')->first()->id;
        $catSports = MicMtaaniCategory::where('slug', 'sports')->first()->id;
        $catEntertainment = MicMtaaniCategory::where('slug', 'entertainment')->first()->id;

        MicMtaaniJournalist::insert([
            ['name' => 'Wanjiku Mwangi', 'slug' => 'wanjiku-mwangi', 'bio' => 'Senior reporter covering Nakuru County politics and governance. Over 8 years of experience in investigative journalism.', 'role' => 'Senior Reporter', 'email' => 'wanjiku@micmtaani.co.ke', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Otieno Ochieng', 'slug' => 'otieno-ochieng', 'bio' => 'Community correspondent covering Nakuru East. Passionate about grassroots stories that mainstream media overlooks.', 'role' => 'Community Correspondent', 'email' => 'otieno@micmtaani.co.ke', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Amina Osman', 'slug' => 'amina-osman', 'bio' => 'Health and education reporter. Holds a degree in Public Health from Moi University.', 'role' => 'Health Reporter', 'email' => 'amina@micmtaani.co.ke', 'is_active' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);

        $wanjiku = MicMtaaniJournalist::where('slug', 'wanjiku-mwangi')->first()->id;
        $otieno = MicMtaaniJournalist::where('slug', 'otieno-ochieng')->first()->id;
        $amina = MicMtaaniJournalist::where('slug', 'amina-osman')->first()->id;

        $articles = [
            [
                'headline' => 'Nakuru County Allocates KSh 2.8 Billion for Road Rehabilitation',
                'slug' => 'nakuru-county-allocates-ksh-28-billion-road-rehabilitation',
                'subtitle' => 'The funds will target major arteries including the Nakuru-Eldoret highway and inner-city roads',
                'body' => '<p>Nakuru County Governor has announced a massive KSh 2.8 billion allocation for road rehabilitation in the 2026/2027 financial year. The project will cover over 200 kilometers of roads across the county, with priority given to the Nakuru-Eldoret highway, the Naivasha-Mai Mahiu road, and several inner-city streets that have deteriorated over the years.</p><p>Speaking at a press briefing at the County headquarters, the Governor emphasized that improved infrastructure is key to economic growth and attracting investment to the region. "Our roads connect farmers to markets, students to schools, and businesses to customers. This investment is an investment in the future of Nakuru," he said.</p><p>The project is expected to create over 3,000 temporary jobs during the construction phase. County residents have welcomed the announcement, though some have expressed concerns about potential disruptions during the rehabilitation period.</p>',
                'author_id' => $adminId, 'category_id' => $catCounty, 'reading_time' => 4,
                'is_featured' => true, 'is_breaking' => false, 'status' => 'published',
                'published_at' => now()->subHours(2), 'views' => 1847,
                'tags' => ['infrastructure', 'county government', 'roads'],
            ],
            [
                'headline' => 'BREAKING: Major Fire Destroys Section of Nakuru Market',
                'slug' => 'breaking-fire-destroys-nakuru-market',
                'subtitle' => 'Over 50 traders affected as fire breaks out at Wakulima Market in the early hours of Wednesday',
                'body' => '<p>A devastating fire broke out at Wakulima Market in Nakuru early Wednesday morning, destroying over 50 stalls and leaving dozens of traders counting their losses.</p>',
                'author_id' => $adminId, 'category_id' => $catBreaking, 'reading_time' => 3,
                'is_featured' => false, 'is_breaking' => true, 'status' => 'published',
                'published_at' => now()->subHours(5), 'views' => 4231,
                'tags' => ['fire', 'market', 'emergency', 'wakulima'],
            ],
            [
                'headline' => 'Nakuru Women Group Launches Free Computer Training Programme',
                'slug' => 'nakuru-women-group-free-computer-training',
                'subtitle' => 'The initiative targets 500 youth in Nakuru East sub-county over the next six months',
                'body' => '<p>A Nakuru-based women\'s group has launched an ambitious programme to provide free computer training to youth in the Nakuru East sub-county.</p>',
                'author_id' => $adminId, 'category_id' => $catCommunity, 'reading_time' => 3,
                'is_featured' => false, 'is_breaking' => false, 'status' => 'published',
                'published_at' => now()->subDay(), 'views' => 892,
                'tags' => ['youth', 'digital literacy', 'women empowerment'],
            ],
            [
                'headline' => 'Nakuru Referral Hospital Opens New Maternity Wing',
                'slug' => 'nakuru-referral-hospital-maternity-wing',
                'subtitle' => 'The new wing adds 100 beds and modern neonatal equipment to serve the growing population',
                'body' => '<p>Nakuru Referral Hospital has officially opened a new maternity wing that will significantly improve maternal and child healthcare services in the county.</p>',
                'author_id' => $adminId, 'category_id' => $catHealth, 'reading_time' => 4,
                'is_featured' => false, 'is_breaking' => false, 'status' => 'published',
                'published_at' => now()->subDays(2), 'views' => 1203,
                'tags' => ['healthcare', 'maternity', 'hospital'],
            ],
            [
                'headline' => 'Nakuru AllStars FC Secures Promotion to FKF Premier League',
                'slug' => 'nakuru-allstars-promotion-premier-league',
                'subtitle' => 'A 3-1 victory over Muhoroni Youth seals the historic promotion for the Nakuru-based club',
                'body' => '<p>Nakuru AllStars FC has secured promotion to the FKF Premier League after a commanding 3-1 victory over Muhoroni Youth at the Nakuru ASK Showground.</p>',
                'author_id' => $adminId, 'category_id' => $catSports, 'reading_time' => 3,
                'is_featured' => false, 'is_breaking' => false, 'status' => 'published',
                'published_at' => now()->subDays(1), 'views' => 3456,
                'tags' => ['football', 'sports', 'premier league'],
            ],
            [
                'headline' => 'Three Schools in Nakuru County Score 100% in KCSE',
                'slug' => 'three-schools-nakuru-kcse-100-percent',
                'subtitle' => 'St. Mary\'s Girls, Nakuru High, and Molo Academy lead the county\'s academic excellence',
                'body' => '<p>Three schools in Nakuru County have achieved a remarkable 100% university transition rate in the 2025 KCSE examinations.</p>',
                'author_id' => $adminId, 'category_id' => $catEducation, 'reading_time' => 3,
                'is_featured' => false, 'is_breaking' => false, 'status' => 'published',
                'published_at' => now()->subDays(3), 'views' => 2156,
                'tags' => ['education', 'KCSE', 'schools'],
            ],
            [
                'headline' => 'New Nakuru City Market to Open by December 2026',
                'slug' => 'new-nakuru-city-market-december-2026',
                'subtitle' => 'The modern market will feature 2,000 stalls, cold storage, and a digital payment system',
                'body' => '<p>The Nakuru County Government has announced that construction of the new Nakuru City Market is on track for completion by December 2026.</p>',
                'author_id' => $adminId, 'category_id' => $catBusiness, 'reading_time' => 4,
                'is_featured' => false, 'is_breaking' => false, 'status' => 'published',
                'published_at' => now()->subDays(4), 'views' => 987,
                'tags' => ['business', 'market', 'development'],
            ],
            [
                'headline' => 'Nakuru Cultural Festival Returns with Star-Studded Lineup',
                'slug' => 'nakuru-cultural-festival-star-studded-lineup',
                'subtitle' => 'This year\'s edition features local and national artists, cultural exhibitions, and food fairs',
                'body' => '<p>The annual Nakuru Cultural Festival is set to return this August with what organizers are calling the most exciting lineup yet.</p>',
                'author_id' => $adminId, 'category_id' => $catEntertainment, 'reading_time' => 3,
                'is_featured' => false, 'is_breaking' => false, 'status' => 'published',
                'published_at' => now()->subDays(5), 'views' => 1567,
                'tags' => ['festival', 'culture', 'entertainment'],
            ],
        ];

        foreach ($articles as $data) {
            MicMtaaniArticle::create($data);
        }

        MicMtaaniEvent::insert([
            ['title' => 'Nakuru Cultural Festival 2026', 'slug' => 'nakuru-cultural-festival-2026', 'description' => 'Three days of music, food, and cultural celebrations at the Nakuru ASK Showground.', 'location' => 'Nakuru ASK Showground', 'organizer' => 'Nakuru County Government', 'category' => 'festival', 'starts_at' => now()->addMonth()->toDateTimeString(), 'ends_at' => now()->addMonth()->addDays(3)->toDateTimeString(), 'is_featured' => true, 'status' => 'approved', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Free Health Screening at Nakuru Referral Hospital', 'slug' => 'free-health-screening-nakuru', 'description' => 'Free screening for diabetes, hypertension, and cervical cancer.', 'location' => 'Nakuru Referral Hospital', 'organizer' => 'Nakuru County Health Dept', 'category' => 'community', 'starts_at' => now()->addWeek()->toDateTimeString(), 'ends_at' => now()->addWeek()->addHours(6)->toDateTimeString(), 'is_featured' => false, 'status' => 'approved', 'created_at' => now(), 'updated_at' => now()],
            ['title' => 'Nakuru Farmers Market', 'slug' => 'nakuru-farmers-market', 'description' => 'Weekly farmers market featuring fresh produce from local farms.', 'location' => 'Kenyatta Avenue', 'organizer' => 'Nakuru Farmers Cooperative', 'category' => 'market', 'starts_at' => now()->addDays(3)->toDateTimeString(), 'ends_at' => now()->addDays(3)->addHours(8)->toDateTimeString(), 'is_featured' => false, 'status' => 'approved', 'created_at' => now(), 'updated_at' => now()],
        ]);

        MicMtaaniBusiness::insert([
            ['name' => 'Java House Nakuru CBD', 'slug' => 'java-house-nakuru-cbd', 'description' => 'Popular coffee house and restaurant in the heart of Nakuru offering breakfast, lunch, and dinner.', 'location' => 'Kenyatta Avenue, Nakuru CBD', 'phone' => '+254 51 221 0000', 'opening_hours' => 'Mon-Sun: 7:00 AM - 10:00 PM', 'category' => 'restaurant', 'is_featured' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Nakuru City Gym', 'slug' => 'nakuru-city-gym', 'description' => 'Modern fitness center with equipment, classes, and personal training services.', 'location' => 'Oginga Odinga Street, Nakuru', 'phone' => '+254 722 123 456', 'opening_hours' => 'Mon-Fri: 5:30 AM - 9:00 PM, Sat-Sun: 7:00 AM - 6:00 PM', 'category' => 'fitness', 'is_featured' => true, 'created_at' => now(), 'updated_at' => now()],
            ['name' => 'Mama Njeri Catering Services', 'slug' => 'mama-njeri-catering', 'description' => 'Home-cooked meals and event catering specializing in traditional Kikuyu cuisine.', 'location' => 'Langas, Nakuru', 'phone' => '+254 712 987 654', 'opening_hours' => 'Mon-Sat: 6:00 AM - 8:00 PM', 'category' => 'food', 'is_featured' => true, 'created_at' => now(), 'updated_at' => now()],
        ]);
    }
}
