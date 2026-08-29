<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Film, Series, Podcast, NewsArticle, Talent, Service, GalleryImage, Testimonial, User, Payment, Subscription, Ticket, MicMtaaniArticle, MicMtaaniCategory, MicMtaaniEvent, Contact, Subscriber};
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function stats(Request $request): JsonResponse
    {
        $user = $request->user();

        $now = now();
        $startOfMonth = $now->copy()->startOfMonth();
        $startOfWeek = $now->copy()->startOfWeek();
        $startOfDay = $now->copy()->startOfDay();

        $contentCounts = [
            'films' => Film::count(),
            'series' => Series::count(),
            'podcasts' => Podcast::count(),
            'news' => NewsArticle::count(),
            'talent' => Talent::count(),
            'services' => Service::count(),
            'gallery' => GalleryImage::count(),
            'testimonials' => Testimonial::count(),
        ];

        $userCounts = [
            'total_users' => User::count(),
            'new_this_month' => User::where('created_at', '>=', $startOfMonth)->count(),
            'new_today' => User::where('created_at', '>=', $startOfDay)->count(),
            'active_subscribers' => Subscription::where('status', 'active')
                ->where(function ($q) {
                    $q->whereNull('ends_at')->orWhere('ends_at', '>', now());
                })->count(),
        ];

        $revenue = [
            'total_all_time' => (float) Payment::where('status', 'success')->sum('amount'),
            'this_month' => (float) Payment::where('status', 'success')
                ->where('paid_at', '>=', $startOfMonth)->sum('amount'),
            'this_week' => (float) Payment::where('status', 'success')
                ->where('paid_at', '>=', $startOfWeek)->sum('amount'),
            'today' => (float) Payment::where('status', 'success')
                ->where('paid_at', '>=', $startOfDay)->sum('amount'),
        ];

        $monthlyRevenue = Payment::where('status', 'success')
            ->where('paid_at', '>=', $now->copy()->subMonths(12)->startOfMonth())
            ->get(['amount', 'paid_at', 'description'])
            ->groupBy(fn ($p) => $p->paid_at ? $p->paid_at->format('Y-m') : 'unknown')
            ->map(function ($group, $key) {
                $month = $key === 'unknown'
                    ? ''
                    : \DateTime::createFromFormat('Y-m', $key)->format('M');

                return [
                    'month' => $month,
                    'revenue' => (float) $group->sum('amount'),
                    'subscriptions' => (float) $group->where('description', 'like', '%subscription%')->sum('amount'),
                    'tickets' => (float) $group->where('description', 'like', '%ticket%')->sum('amount'),
                    'streaming' => (float) $group->where('description', 'not like', '%subscription%')
                        ->where('description', 'not like', '%ticket%')->sum('amount'),
                ];
            })
            ->sortKeys()->values();

        $ticketStats = [
            'total_sold' => (int) Ticket::sum('sold'),
            'this_month' => (int) Ticket::whereHas('event', function ($q) use ($startOfMonth) {
                $q->where('starts_at', '>=', $startOfMonth);
            })->sum('sold'),
        ];

        $micMtaani = [
            'articles' => MicMtaaniArticle::count(),
            'categories' => MicMtaaniCategory::count(),
            'events' => MicMtaaniEvent::count(),
        ];

        $recentActivity = collect();

        User::latest()->take(5)->get()->each(function ($u) use ($recentActivity) {
            $recentActivity->push([
                'type' => 'user',
                'label' => 'New user registration',
                'desc' => "{$u->name} created an account",
                'time' => $u->created_at->diffForHumans(),
            ]);
        });

        Film::latest()->take(3)->get()->each(function ($f) use ($recentActivity) {
            $recentActivity->push([
                'type' => 'film',
                'label' => 'Film added',
                'desc' => "\"{$f->title}\" was published",
                'time' => $f->created_at->diffForHumans(),
            ]);
        });

        NewsArticle::latest()->take(3)->get()->each(function ($n) use ($recentActivity) {
            $recentActivity->push([
                'type' => 'news',
                'label' => 'News published',
                'desc' => $n->title,
                'time' => $n->published_at ? $n->published_at->diffForHumans() : 'Recent',
            ]);
        });

        Contact::latest()->take(3)->get()->each(function ($c) use ($recentActivity) {
            $recentActivity->push([
                'type' => 'contact',
                'label' => 'Contact message',
                'desc' => $c->subject ?? 'New message from ' . $c->name,
                'time' => $c->created_at->diffForHumans(),
            ]);
        });

        $recentActivity = $recentActivity->sortByDesc('time')->values()->take(10);

        return response()->json([
            'content_counts' => $contentCounts,
            'user_counts' => $userCounts,
            'revenue' => $revenue,
            'monthly_revenue' => $monthlyRevenue,
            'ticket_stats' => $ticketStats,
            'mic_mtaani' => $micMtaani,
            'recent_activity' => $recentActivity,
            'top_films' => Film::orderByDesc('rating')->limit(5)->get(['id', 'title', 'rating', 'genre', 'year', 'poster_url', 'slug']),
        ]);
    }
}
