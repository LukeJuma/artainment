<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MicMtaaniArticle;
use App\Models\MicMtaaniCategory;
use App\Models\MicMtaaniJournalist;
use App\Models\MicMtaaniComment;
use App\Models\MicMtaaniEvent;
use App\Models\MicMtaaniBusiness;
use App\Models\MicMtaaniSubmission;
use App\Models\MicMtaaniNewsletterSubscriber;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MicMtaaniController extends Controller
{
    public function homepage(): JsonResponse
    {
        $breaking = MicMtaaniArticle::where('is_breaking', true)
            ->where('status', 'published')
            ->with('category:id,name,slug,color')
            ->latest('published_at')
            ->first();

        $featured = MicMtaaniArticle::where('is_featured', true)
            ->where('status', 'published')
            ->with('category:id,name,slug,color')
            ->latest('published_at')
            ->first();

        $latest = MicMtaaniArticle::where('status', 'published')
            ->latest('published_at')
            ->limit(12)
            ->get(['id', 'headline', 'slug', 'subtitle', 'excerpt', 'image_url', 'category_id', 'reading_time', 'published_at', 'is_breaking', 'is_featured']);

        $categories = MicMtaaniCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        $trending = MicMtaaniArticle::where('status', 'published')
            ->orderByDesc('views')
            ->limit(5)
            ->get(['id', 'headline', 'slug', 'views', 'published_at', 'category_id']);

        $events = MicMtaaniEvent::where('status', 'approved')
            ->where('starts_at', '>=', now())
            ->orderBy('starts_at')
            ->limit(6)
            ->get();

        $businesses = MicMtaaniBusiness::where('is_featured', true)
            ->limit(4)
            ->get();

        return response()->json([
            'breaking' => $breaking,
            'featured' => $featured,
            'latest' => $latest,
            'categories' => $categories,
            'trending' => $trending,
            'events' => $events,
            'businesses' => $businesses,
        ]);
    }

    public function articles(Request $request): JsonResponse
    {
        $query = MicMtaaniArticle::where('status', 'published')
            ->with('category:id,name,slug,color');

        if ($request->category) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }
        if ($request->tag) {
            $query->whereJsonContains('tags', $request->tag);
        }

        $articles = $query->latest('published_at')
            ->paginate($request->per_page ?? 12)
            ->through(fn ($a) => [
                'id' => $a->id,
                'headline' => $a->headline,
                'slug' => $a->slug,
                'subtitle' => $a->subtitle,
                'excerpt' => $a->excerpt,
                'image_url' => $a->image_url,
                'category' => $a->category,
                'reading_time' => $a->reading_time,
                'published_at' => $a->published_at,
                'is_breaking' => $a->is_breaking,
                'is_featured' => $a->is_featured,
                'views' => $a->views,
            ]);

        return response()->json($articles);
    }

    public function article($slug): JsonResponse
    {
        $article = MicMtaaniArticle::where('slug', $slug)
            ->where('status', 'published')
            ->with([
                'category:id,name,slug,color',
                'author:id,name',
                'comments' => fn ($q) => $q->where('is_approved', true)->latest()->limit(20),
            ])
            ->firstOrFail();

        $article->increment('views');

        $related = MicMtaaniArticle::where('status', 'published')
            ->where('id', '!=', $article->id)
            ->where('category_id', $article->category_id)
            ->latest('published_at')
            ->limit(4)
            ->get(['id', 'headline', 'slug', 'image_url', 'published_at', 'reading_time']);

        return response()->json(['article' => $article, 'related' => $related]);
    }

    public function categories(): JsonResponse
    {
        $categories = MicMtaaniCategory::where('is_active', true)
            ->orderBy('sort_order')
            ->withCount('articles')
            ->get();

        return response()->json($categories);
    }

    public function journalists(): JsonResponse
    {
        $journalists = MicMtaaniJournalist::where('is_active', true)
            ->withCount('articles')
            ->get();

        return response()->json($journalists);
    }

    public function journalist($slug): JsonResponse
    {
        $journalist = MicMtaaniJournalist::where('slug', $slug)
            ->where('is_active', true)
            ->withCount('articles')
            ->firstOrFail();

        $articles = MicMtaaniArticle::where('author_id', $journalist->id)
            ->where('status', 'published')
            ->latest('published_at')
            ->limit(12)
            ->get(['id', 'headline', 'slug', 'image_url', 'published_at', 'reading_time']);

        return response()->json(['journalist' => $journalist, 'articles' => $articles]);
    }

    public function events(): JsonResponse
    {
        $events = MicMtaaniEvent::where('status', 'approved')
            ->orderBy('starts_at')
            ->get();

        return response()->json($events);
    }

    public function businesses(): JsonResponse
    {
        $businesses = MicMtaaniBusiness::orderByDesc('is_featured')->get();
        return response()->json($businesses);
    }

    public function business($slug): JsonResponse
    {
        $business = MicMtaaniBusiness::where('slug', $slug)->firstOrFail();
        return response()->json($business);
    }

    public function search(Request $request): JsonResponse
    {
        $q = $request->input('q', '');
        if (strlen($q) < 2) {
            return response()->json(['articles' => []]);
        }

        $articles = MicMtaaniArticle::where('status', 'published')
            ->where(function ($query) use ($q) {
                $query->where('headline', 'like', "%{$q}%")
                    ->orWhere('subtitle', 'like', "%{$q}%")
                    ->orWhere('body', 'like', "%{$q}%");
            })
            ->latest('published_at')
            ->limit(20)
            ->get(['id', 'headline', 'slug', 'excerpt', 'image_url', 'published_at', 'reading_time']);

        return response()->json(['articles' => $articles, 'query' => $q]);
    }

    public function submit(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => 'required|in:news_tip,event,announcement,photo,video,story',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'submitter_name' => 'required|string|max:255',
            'submitter_email' => 'nullable|email',
            'submitter_phone' => 'nullable|string|max:50',
            'media_url' => 'nullable|string|max:500',
        ]);

        $submission = MicMtaaniSubmission::create($validated);

        return response()->json([
            'message' => 'Submission received. It will be reviewed before publishing.',
            'id' => $submission->id,
        ]);
    }

    public function subscribe(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'name' => 'nullable|string|max:255',
            'frequency' => 'nullable|in:daily,weekly,breaking',
        ]);

        MicMtaaniNewsletterSubscriber::updateOrCreate(
            ['email' => $validated['email']],
            $validated + ['is_active' => true]
        );

        return response()->json(['message' => 'Subscribed successfully.']);
    }

    public function addComment(Request $request, $articleSlug): JsonResponse
    {
        $article = MicMtaaniArticle::where('slug', $articleSlug)
            ->where('status', 'published')
            ->firstOrFail();

        $validated = $request->validate([
            'name' => 'required_without:user_id|string|max:255',
            'body' => 'required|string|max:2000',
        ]);

        $comment = $article->comments()->create([
            'user_id' => $request->user()?->id,
            'name' => $validated['name'] ?? $request->user()?->name ?? 'Anonymous',
            'body' => $validated['body'],
            'is_approved' => false,
        ]);

        return response()->json([
            'message' => 'Comment submitted for review.',
            'id' => $comment->id,
        ]);
    }
}
