<?php

namespace Database\Seeders;

use App\Models\{Contact, Subscriber, GalleryImage, MicMtaaniComment, MicMtaaniSubmission, MicMtaaniArticle};
use Illuminate\Database\Seeder;

class AdditionalDataSeeder extends Seeder
{
    public function run(): void
    {
        // Contacts
        Contact::insert([
            ['name' => 'James Kamau', 'email' => 'james@example.com', 'service' => 'Film Production', 'message' => 'We need a promotional video for our new product launch. Budget is flexible.', 'status' => 'pending', 'created_at' => now()->subMinutes(5), 'updated_at' => now()->subMinutes(5)],
            ['name' => 'Amina Hassan', 'email' => 'amina@example.com', 'service' => 'Photography', 'message' => 'Looking for event photographers for our annual gala. 200+ guests expected.', 'status' => 'read', 'created_at' => now()->subMinutes(15), 'updated_at' => now()->subMinutes(10)],
            ['name' => 'Peter Otieno', 'email' => 'peter@example.com', 'service' => 'Casting', 'message' => 'We are casting for a new TV series. Do you have talent available?', 'status' => 'replied', 'created_at' => now()->subHours(1), 'updated_at' => now()->subMinutes(45)],
            ['name' => 'Grace Wanjiku', 'email' => 'grace@example.com', 'service' => 'Scriptwriting', 'message' => 'I have a script for a short film and would love your team to produce it.', 'status' => 'pending', 'created_at' => now()->subHours(3), 'updated_at' => now()->subHours(3)],
            ['name' => 'David Mwangi', 'email' => 'david@example.com', 'service' => 'Videography', 'message' => 'Need drone footage for our real estate development showcase. Nakuru area.', 'status' => 'read', 'created_at' => now()->subHours(6), 'updated_at' => now()->subHours(5)],
            ['name' => 'Sarah Akinyi', 'email' => 'sarah@example.com', 'service' => 'Film Production', 'message' => 'Documentary production inquiry. We are a NGO covering environmental stories.', 'status' => 'replied', 'created_at' => now()->subDays(1), 'updated_at' => now()->subHours(20)],
            ['name' => 'Brian Kiprop', 'email' => 'brian@example.com', 'service' => 'Post-Production', 'message' => 'Need color grading and sound design for a completed short film.', 'status' => 'pending', 'created_at' => now()->subDays(1), 'updated_at' => now()->subDays(1)],
            ['name' => 'Lucy Wambui', 'email' => 'lucy@example.com', 'service' => 'Photography', 'message' => 'Corporate headshot session for 50 employees. Office location in Westlands.', 'status' => 'read', 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)],
            ['name' => 'Kevin Mutua', 'email' => 'kevin@example.com', 'service' => 'Videography', 'message' => 'Music video production for an upcoming Gengetone artist.', 'status' => 'pending', 'created_at' => now()->subDays(2), 'updated_at' => now()->subDays(2)],
            ['name' => 'Nadia Mukami', 'email' => 'nadia@example.com', 'service' => 'Casting', 'message' => 'Need background extras for a music video shoot. 30 people needed.', 'status' => 'replied', 'created_at' => now()->subDays(3), 'updated_at' => now()->subDays(3)],
        ]);

        // Subscribers
        $emails = [
            'subscriber1@gmail.com', 'subscriber2@gmail.com', 'subscriber3@yahoo.com',
            'subscriber4@outlook.com', 'subscriber5@gmail.com', 'subscriber6@gmail.com',
            'subscriber7@yahoo.com', 'subscriber8@gmail.com', 'subscriber9@hotmail.com',
            'subscriber10@gmail.com', 'subscriber11@yahoo.com', 'subscriber12@gmail.com',
        ];
        foreach ($emails as $email) {
            Subscriber::create(['email' => $email, 'active' => true]);
        }

        // Gallery Images (placeholder URLs)
        GalleryImage::insert([
            ['image_url' => 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', 'caption' => 'On set of Nairobi Noir', 'sort_order' => 1, 'created_at' => now(), 'updated_at' => now()],
            ['image_url' => 'https://images.unsplash.com/photo-1524712245354-2c4e5e7121c0?w=800', 'caption' => 'Behind the scenes', 'sort_order' => 2, 'created_at' => now(), 'updated_at' => now()],
            ['image_url' => 'https://images.unsplash.com/photo-1598899134739-24c46f58b8c0?w=800', 'caption' => 'Camera equipment', 'sort_order' => 3, 'created_at' => now(), 'updated_at' => now()],
            ['image_url' => 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800', 'caption' => 'Film premiere night', 'sort_order' => 4, 'created_at' => now(), 'updated_at' => now()],
            ['image_url' => 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800', 'caption' => 'Cinema screening', 'sort_order' => 5, 'created_at' => now(), 'updated_at' => now()],
            ['image_url' => 'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800', 'caption' => 'Production team', 'sort_order' => 6, 'created_at' => now(), 'updated_at' => now()],
        ]);

        // Mic Mtaani Comments
        $articles = MicMtaaniArticle::all();
        if ($articles->count() > 0) {
            $comments = [
                ['article_id' => $articles->first()->id, 'name' => 'James Kamau', 'body' => 'Great article! This is exactly what Nakuru needs.', 'is_approved' => true, 'created_at' => now()->subHours(1), 'updated_at' => now()->subHours(1)],
                ['article_id' => $articles->first()->id, 'name' => 'Amina Hassan', 'body' => 'Finally some good news about road development.', 'is_approved' => false, 'created_at' => now()->subMinutes(30), 'updated_at' => now()->subMinutes(30)],
                ['article_id' => $articles->skip(1)->first()->id, 'name' => 'Peter Otieno', 'body' => 'This is terrible! Hope everyone is safe.', 'is_approved' => true, 'created_at' => now()->subHours(4), 'updated_at' => now()->subHours(4)],
                ['article_id' => $articles->skip(1)->first()->id, 'name' => 'Grace Wanjiku', 'body' => 'Do we know the cause of the fire yet?', 'is_approved' => false, 'created_at' => now()->subHours(3), 'updated_at' => now()->subHours(3)],
                ['article_id' => $articles->skip(2)->first()->id, 'name' => 'Brian Kiprop', 'body' => 'This is a wonderful initiative. More power to them!', 'is_approved' => false, 'created_at' => now()->subHours(8), 'updated_at' => now()->subHours(8)],
            ];
            foreach ($comments as $c) {
                MicMtaaniComment::create($c);
            }
        }

        // Mic Mtaani Submissions
        MicMtaaniSubmission::insert([
            ['type' => 'news_tip', 'title' => 'Local Artist Wins National Award', 'description' => 'A Nakuru-based artist has won a national art competition.', 'submitter_name' => 'User1', 'submitter_email' => 'user1@example.com', 'status' => 'pending', 'created_at' => now()->subHours(6), 'updated_at' => now()->subHours(6)],
            ['type' => 'event', 'title' => 'Community Clean-Up Drive', 'description' => 'Join us for a community clean-up at Nakuru CBD this Saturday.', 'submitter_name' => 'User2', 'submitter_email' => 'user2@example.com', 'status' => 'pending', 'created_at' => now()->subHours(12), 'updated_at' => now()->subHours(12)],
            ['type' => 'story', 'title' => 'New Sacco Benefits Nakuru Matatu Operators', 'description' => 'A new savings cooperative has been launched for matatu operators.', 'submitter_name' => 'User3', 'submitter_email' => 'user3@example.com', 'status' => 'approved', 'created_at' => now()->subDays(1), 'updated_at' => now()->subDays(1)],
        ]);
    }
}
