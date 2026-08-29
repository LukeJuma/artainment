<?php

namespace Database\Seeders;

use App\Models\{Podcast, PodcastEpisode};
use Illuminate\Database\Seeder;

class PodcastSeeder extends Seeder
{
    public function run(): void
    {
        $podcasts = [
            [
                'title' => 'The Artainment Sessions',
                'slug' => 'the-artainment-sessions',
                'host' => 'Amara Odhiambo',
                'category' => 'Entertainment',
                'description' => 'In-depth conversations with the actors, directors and creatives shaping African cinema and storytelling.',
                'cover_url' => 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800',
                'active' => true,
                'sort_order' => 1,
                'episodes' => [
                    ['episode_number' => 1, 'title' => 'Building Nairobi Noir', 'description' => 'Director Wilson Osiolo on crafting a gritty Nairobi thriller.', 'duration' => '42:10', 'audio_url' => null, 'published_at' => now()->subWeeks(3)],
                    ['episode_number' => 2, 'title' => 'The Craft of Cinematography', 'description' => 'Neema Wangari breaks down her approach to light and composition.', 'duration' => '38:55', 'audio_url' => null, 'published_at' => now()->subWeeks(2)],
                    ['episode_number' => 3, 'title' => 'Writing for the Screen', 'description' => 'Screenwriter David Mutua on structure, voice and authenticity.', 'duration' => '51:20', 'audio_url' => null, 'published_at' => now()->subWeek()],
                ],
            ],
            [
                'title' => 'Mic Mtaani Untold',
                'slug' => 'mic-mtaani-untold',
                'host' => 'Wanjiku Mwangi',
                'category' => 'Community',
                'description' => 'The stories behind the headlines — community voices and grassroots changemakers across Nakuru.',
                'cover_url' => 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800',
                'active' => true,
                'sort_order' => 2,
                'episodes' => [
                    ['episode_number' => 1, 'title' => 'Women Coding the Future', 'description' => 'Inside the free computer training programme changing lives.', 'duration' => '29:40', 'audio_url' => null, 'published_at' => now()->subDays(10)],
                    ['episode_number' => 2, 'title' => 'Rebuilding After the Fire', 'description' => 'How Wakulima Market traders are recovering together.', 'duration' => '33:05', 'audio_url' => null, 'published_at' => now()->subDays(4)],
                ],
            ],
            [
                'title' => 'Lights, Camera, Business',
                'slug' => 'lights-camera-business',
                'host' => 'Fatuma Hassan',
                'category' => 'Business',
                'description' => 'Where filmmaking meets entrepreneurship — funding, distribution and building a sustainable creative business.',
                'cover_url' => 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800',
                'active' => true,
                'sort_order' => 3,
                'episodes' => [
                    ['episode_number' => 1, 'title' => 'Monetising Your Content', 'description' => 'Subscription models, licensing and brand deals for creators.', 'duration' => '45:30', 'audio_url' => null, 'published_at' => now()->subDays(6)],
                ],
            ],
        ];

        foreach ($podcasts as $data) {
            $episodes = $data['episodes'] ?? [];
            unset($data['episodes']);
            $podcast = Podcast::create($data);
            foreach ($episodes as $ep) {
                PodcastEpisode::create(array_merge($ep, ['podcast_id' => $podcast->id]));
            }
        }
    }
}
