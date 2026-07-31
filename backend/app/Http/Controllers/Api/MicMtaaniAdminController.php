<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\MicMtaaniArticle;
use App\Models\MicMtaaniCategory;
use App\Models\MicMtaaniJournalist;
use App\Models\MicMtaaniComment;
use App\Models\MicMtaaniSubmission;
use App\Models\MicMtaaniEvent;
use App\Models\MicMtaaniBusiness;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class MicMtaaniAdminController extends Controller
{
    // ─── Articles ────────────────────────────────────────────────
    public function articles(): JsonResponse
    {
        $articles = MicMtaaniArticle::with('category:id,name')
            ->latest()
            ->paginate(20);

        return response()->json($articles);
    }

    public function storeArticle(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'headline' => 'required|string|max:500',
            'subtitle' => 'nullable|string|max:500',
            'body' => 'required|string',
            'category_id' => 'required|exists:mic_mtaani_categories,id',
            'author_id' => 'nullable|exists:users,id',
            'image_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'tags' => 'nullable|array',
            'reading_time' => 'nullable|integer|min:1',
            'is_featured' => 'boolean',
            'is_breaking' => 'boolean',
            'status' => 'in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);

        $validated['slug'] = Str::slug($validated['headline']);
        $validated['excerpt'] = Str::limit(strip_tags($validated['body'] ?? ''), 200);
        if ($validated['status'] === 'published' && empty($validated['published_at'])) {
            $validated['published_at'] = now();
        }

        $article = MicMtaaniArticle::create($validated);

        return response()->json($article, 201);
    }

    public function updateArticle(Request $request, $id): JsonResponse
    {
        $article = MicMtaaniArticle::findOrFail($id);
        $validated = $request->validate([
            'headline' => 'sometimes|string|max:500',
            'subtitle' => 'nullable|string|max:500',
            'body' => 'sometimes|string',
            'category_id' => 'sometimes|exists:mic_mtaani_categories,id',
            'author_id' => 'nullable|exists:users,id',
            'image_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'tags' => 'nullable|array',
            'reading_time' => 'nullable|integer|min:1',
            'is_featured' => 'boolean',
            'is_breaking' => 'boolean',
            'status' => 'in:draft,published,archived',
            'published_at' => 'nullable|date',
        ]);

        if (isset($validated['headline'])) {
            $validated['slug'] = Str::slug($validated['headline']);
        }
        if (isset($validated['body'])) {
            $validated['excerpt'] = Str::limit(strip_tags($validated['body']), 200);
        }

        $article->update($validated);
        return response()->json($article);
    }

    public function deleteArticle($id): JsonResponse
    {
        MicMtaaniArticle::findOrFail($id)->delete();
        return response()->json(['message' => 'Article deleted.']);
    }

    // ─── Categories ──────────────────────────────────────────────
    public function storeCategory(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'color' => 'nullable|string|max:20',
            'icon' => 'nullable|string|max:50',
            'sort_order' => 'nullable|integer',
        ]);
        $validated['slug'] = Str::slug($validated['name']);

        $cat = MicMtaaniCategory::create($validated);
        return response()->json($cat, 201);
    }

    public function deleteCategory($id): JsonResponse
    {
        MicMtaaniCategory::findOrFail($id)->delete();
        return response()->json(['message' => 'Category deleted.']);
    }

    // ─── Journalists ─────────────────────────────────────────────
    public function journalists(): JsonResponse
    {
        return response()->json(MicMtaaniJournalist::withCount('articles')->latest()->get());
    }

    public function storeJournalist(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'bio' => 'nullable|string',
            'role' => 'nullable|string|max:100',
            'avatar_url' => 'nullable|string|max:500',
            'email' => 'nullable|email',
        ]);
        $validated['slug'] = Str::slug($validated['name']);

        $j = MicMtaaniJournalist::create($validated);
        return response()->json($j, 201);
    }

    public function deleteJournalist($id): JsonResponse
    {
        MicMtaaniJournalist::findOrFail($id)->delete();
        return response()->json(['message' => 'Journalist deleted.']);
    }

    // ─── Submissions ─────────────────────────────────────────────
    public function submissions(): JsonResponse
    {
        return response()->json(
            MicMtaaniSubmission::latest()->paginate(20)
        );
    }

    public function approveSubmission($id): JsonResponse
    {
        $sub = MicMtaaniSubmission::findOrFail($id);
        $sub->update(['status' => 'approved']);
        return response()->json($sub);
    }

    public function rejectSubmission($id): JsonResponse
    {
        $sub = MicMtaaniSubmission::findOrFail($id);
        $sub->update(['status' => 'rejected']);
        return response()->json($sub);
    }

    // ─── Comments ────────────────────────────────────────────────
    public function pendingComments(): JsonResponse
    {
        return response()->json(
            MicMtaaniComment::with('article:id,headline,slug')
                ->where('is_approved', false)
                ->latest()
                ->paginate(20)
        );
    }

    public function approveComment($id): JsonResponse
    {
        MicMtaaniComment::findOrFail($id)->update(['is_approved' => true]);
        return response()->json(['message' => 'Comment approved.']);
    }

    public function deleteComment($id): JsonResponse
    {
        MicMtaaniComment::findOrFail($id)->delete();
        return response()->json(['message' => 'Comment deleted.']);
    }

    // ─── Events ──────────────────────────────────────────────────
    public function storeEvent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'organizer' => 'nullable|string|max:255',
            'image_url' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:50',
            'starts_at' => 'required|date',
            'ends_at' => 'nullable|date|after_or_equal:starts_at',
        ]);
        $validated['slug'] = Str::slug($validated['title']);
        $validated['status'] = 'approved';

        $event = MicMtaaniEvent::create($validated);
        return response()->json($event, 201);
    }

    public function deleteEvent($id): JsonResponse
    {
        MicMtaaniEvent::findOrFail($id)->delete();
        return response()->json(['message' => 'Event deleted.']);
    }

    // ─── Businesses ──────────────────────────────────────────────
    public function storeBusiness(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'location' => 'required|string|max:255',
            'phone' => 'nullable|string|max:50',
            'email' => 'nullable|email',
            'website' => 'nullable|string|max:500',
            'opening_hours' => 'nullable|string|max:255',
            'image_url' => 'nullable|string|max:500',
            'category' => 'nullable|string|max:100',
        ]);
        $validated['slug'] = Str::slug($validated['name']);

        $biz = MicMtaaniBusiness::create($validated);
        return response()->json($biz, 201);
    }

    public function deleteBusiness($id): JsonResponse
    {
        MicMtaaniBusiness::findOrFail($id)->delete();
        return response()->json(['message' => 'Business deleted.']);
    }
}
