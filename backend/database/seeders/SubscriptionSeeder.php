<?php

namespace Database\Seeders;

use App\Models\Payment;
use App\Models\Subscription;
use App\Models\SubscriptionPlan;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SubscriptionSeeder extends Seeder
{
    public function run(): void
    {
        $plans = [
            [
                'name' => 'Premium',
                'slug' => 'premium',
                'price' => 499,
                'billing_interval' => 'monthly',
                'description' => 'HD streaming for the whole family.',
                'features' => ['HD Streaming', 'Unlimited Downloads', 'No Ads', '2 Devices'],
                'is_active' => true,
                'sort_order' => 1,
            ],
            [
                'name' => 'VIP',
                'slug' => 'vip',
                'price' => 999,
                'billing_interval' => 'monthly',
                'description' => 'Everything in Premium plus exclusive early access.',
                'features' => ['4K Streaming', 'Early Access', 'Exclusive Content', '4 Devices', 'Priority Support'],
                'is_active' => true,
                'sort_order' => 2,
            ],
            [
                'name' => 'Family',
                'slug' => 'family',
                'price' => 799,
                'billing_interval' => 'monthly',
                'description' => 'Share the Artainment experience with up to 6 profiles.',
                'features' => ['HD Streaming', '6 Profiles', 'Parental Controls', '3 Devices'],
                'is_active' => true,
                'sort_order' => 3,
            ],
            [
                'name' => 'Student',
                'slug' => 'student',
                'price' => 249,
                'billing_interval' => 'monthly',
                'description' => 'Affordable access for students in East Africa.',
                'features' => ['HD Streaming', '1 Device', 'Student Discount'],
                'is_active' => true,
                'sort_order' => 4,
            ],
        ];

        foreach ($plans as $plan) {
            SubscriptionPlan::updateOrCreate(['slug' => $plan['slug']], $plan);
        }

        $admin = User::where('email', 'admin@theartainment.co.ke')->first();
        $user = User::where('email', 'testuser@example.com')->first();

        if ($admin && $user) {
            $premium = SubscriptionPlan::where('slug', 'premium')->first();
            $vip = SubscriptionPlan::where('slug', 'vip')->first();

            if ($premium && ! Subscription::where('user_id', $user->id)->where('status', 'active')->exists()) {
                Subscription::create([
                    'user_id' => $user->id,
                    'plan_id' => $premium->id,
                    'status' => 'active',
                    'started_at' => now()->subMonths(2),
                    'ends_at' => now()->addMonth(),
                ]);
            }

            if ($vip && ! Subscription::where('user_id', $admin->id)->where('status', 'active')->exists()) {
                Subscription::create([
                    'user_id' => $admin->id,
                    'plan_id' => $vip->id,
                    'status' => 'active',
                    'started_at' => now()->subMonth(),
                    'ends_at' => now()->addMonths(11),
                ]);
            }

            Payment::create([
                'user_id' => $user->id,
                'reference' => 'MPESA-' . strtoupper(Str::random(8)),
                'amount' => 499,
                'currency' => 'KES',
                'method' => 'mpesa',
                'status' => 'success',
                'description' => 'Premium monthly',
                'paid_at' => now()->subMonths(2),
            ]);
        }
    }
}
