<?php

namespace Database\Seeders;

use App\Models\Episode;
use App\Models\Film;
use App\Models\Season;
use App\Models\Series;
use Illuminate\Database\Seeder;

class SeriesSeeder extends Seeder
{
    public function run(): void
    {
        $trailerUrl = Film::where('slug', 'nairobi-noir')->value('video_url');
        $samplePath = $trailerUrl
            ? preg_replace('#^https?://[^/]+/storage/#', '', $trailerUrl)
            : null;

        $nairobiFiles = Series::create([
            'title' => 'The Nairobi Files',
            'slug' => 'the-nairobi-files',
            'synopsis' => 'Inside the elite crime unit of Nairobi, a team of detectives chase the city\'s most dangerous cases while navigating their own complicated lives.',
            'genre' => 'Crime Drama',
            'year' => '2026',
            'rating' => 8.1,
            'tag' => 'New Series',
            'status' => 'in_production',
            'featured' => true,
            'sort_order' => 1,
        ]);

        $season1 = $nairobiFiles->seasons()->create([
            'season_number' => 1,
            'title' => 'Kwanza',
            'synopsis' => 'The unit forms and takes on its first case: a string of audacious heists across the city.',
        ]);

        foreach ([
            ['episode_number' => 1, 'title' => 'Pilot', 'duration' => '52m', 'synopsis' => 'Detective Achieng joins a new unit tasked with catching a crew behind a series of high-profile robberies.'],
            ['episode_number' => 2, 'title' => 'The Informant', 'duration' => '48m', 'synopsis' => 'A jailhouse informant offers a lead, but trusting him may cost the team more than they bargained for.'],
            ['episode_number' => 3, 'title' => 'Crossfire', 'duration' => '55m', 'synopsis' => 'A stakeout goes wrong, and the unit must decide who to protect when the city starts to burn.'],
        ] as $episode) {
            $season1->episodes()->create([...$episode, 'video_url' => $samplePath]);
        }

        $season2 = $nairobiFiles->seasons()->create([
            'season_number' => 2,
            'title' => 'Pili',
            'synopsis' => 'With a new case and new enemies, the unit\'s loyalties are pushed to the limit.',
        ]);

        foreach ([
            ['episode_number' => 1, 'title' => 'The Aftermath', 'duration' => '50m', 'synopsis' => 'In the wake of the previous case, the team hunts for the mastermind who escaped.'],
            ['episode_number' => 2, 'title' => 'Enemies Within', 'duration' => '54m', 'synopsis' => 'A leak inside the unit threatens to unravel the case and the team itself.'],
        ] as $episode) {
            $season2->episodes()->create([...$episode, 'video_url' => $samplePath]);
        }

        $coastal = Series::create([
            'title' => 'Coastal Rhythms',
            'slug' => 'coastal-rhythms',
            'synopsis' => 'A docuseries following the musicians, fishers and festival-makers keeping the Swahili coast alive.',
            'genre' => 'Music',
            'year' => '2026',
            'rating' => 7.6,
            'tag' => 'Upcoming',
            'status' => 'upcoming',
            'featured' => false,
            'sort_order' => 2,
        ]);

        $coastal->seasons()->create([
            'season_number' => 1,
            'title' => 'Season 1',
        ])->episodes()->create([
            'episode_number' => 1,
            'title' => 'Strings of Mombasa',
            'duration' => '32m',
            'synopsis' => 'A look at the taarab bands keeping an ancient musical tradition alive in Old Town Mombasa.',
            'video_url' => $samplePath,
        ]);
    }
}
