<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Podcast;
use App\Models\PodcastEpisode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PodcastController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 24), 50);
        $podcasts = Podcast::where('active', true)
            ->withCount('episodes')
            ->orderBy('sort_order')
            ->paginate($perPage)
            ->through(function (Podcast $podcast) {
                $podcast->latest_episode = $podcast->episodes()->orderByDesc('published_at')->first();
                return $podcast;
            });

        return response()->json($podcasts);
    }

    public function show(string $slug): JsonResponse
    {
        $podcast = Podcast::with('episodes')->where('slug', $slug)->firstOrFail();
        return response()->json($podcast);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:podcasts,slug',
            'host' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'cover_url' => 'nullable|string|max:500',
            'active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $podcast = Podcast::create($validated);
        return response()->json($podcast, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $podcast = Podcast::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:podcasts,slug,' . $id,
            'host' => 'nullable|string|max:255',
            'category' => 'nullable|string|max:100',
            'description' => 'nullable|string',
            'cover_url' => 'nullable|string|max:500',
            'active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $podcast->update($validated);
        return response()->json($podcast);
    }

    public function destroy(string $id): JsonResponse
    {
        Podcast::findOrFail($id)->delete();
        return response()->json(['message' => 'Podcast deleted']);
    }

    public function episodes(string $id): JsonResponse
    {
        $podcast = Podcast::findOrFail($id);
        return response()->json($podcast->episodes);
    }

    public function storeEpisode(Request $request, string $id): JsonResponse
    {
        $podcast = Podcast::findOrFail($id);
        $validated = $request->validate([
            'episode_number' => 'nullable|integer',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'nullable|string|max:20',
            'audio_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
        ]);

        $episode = $podcast->episodes()->create($validated);
        return response()->json($episode, 201);
    }

    public function updateEpisode(Request $request, string $id): JsonResponse
    {
        $episode = PodcastEpisode::findOrFail($id);
        $validated = $request->validate([
            'episode_number' => 'nullable|integer',
            'title' => 'sometimes|required|string|max:255',
            'description' => 'nullable|string',
            'duration' => 'nullable|string|max:20',
            'audio_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
        ]);

        $episode->update($validated);
        return response()->json($episode);
    }

    public function destroyEpisode(string $id): JsonResponse
    {
        PodcastEpisode::findOrFail($id)->delete();
        return response()->json(['message' => 'Episode deleted']);
    }
}
