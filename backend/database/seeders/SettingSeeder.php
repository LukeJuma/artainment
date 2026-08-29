<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingSeeder extends Seeder
{
    public function run(): void
    {
        $defaults = [
            'platform_name' => 'Artainment+',
            'tagline' => 'Kenya\'s Premier Entertainment Platform',
            'support_email' => 'support@artainment.co.ke',
            'currency' => 'KES',
            'timezone' => 'Africa/Nairobi',
            'primary_color' => '#FF4D2D',
            'logo_url' => '',
            'favicon_url' => '',
        ];

        foreach ($defaults as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value, 'group' => 'general']);
        }
    }
}
