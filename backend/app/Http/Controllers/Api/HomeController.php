<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\{Film, Service, Talent, NewsArticle, Testimonial, GalleryImage, Contact, Subscriber, Podcast};
use Illuminate\Http\JsonResponse;

class HomeController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'featured_film' => Film::where('featured', true)->first(),
            'films' => Film::orderByDesc('created_at')->limit(6)->get(),
            'services' => Service::where('active', true)->orderBy('sort_order')->get(),
            'talent' => Talent::where('active', true)->orderBy('sort_order')->limit(5)->get(),
            'gallery' => GalleryImage::orderBy('sort_order')->limit(6)->get(),
            'news' => NewsArticle::orderByDesc('published_at')->limit(3)->get(),
            'testimonials' => Testimonial::where('active', true)->orderBy('sort_order')->get(),
            'podcasts' => Podcast::where('active', true)->withCount('episodes')->orderBy('sort_order')->limit(6)->get(),
            'coming_soon' => Film::where('status', 'upcoming')->orderBy('sort_order')->get(),
        ]);
    }
}
