<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Episode;
use App\Models\Season;
use App\Models\Series;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SeriesController extends Controller
{
    // ─── Public API ──────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = Series::query()->withCount('seasons');

        if ($request->has('genre') && $request->genre !== 'All') {
            $query->where('genre', $request->genre);
        }

        if ($request->has('featured')) {
            $query->where('featured', true);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $perPage = min((int) $request->input('per_page', 24), 50);
        $series = $query->orderBy('sort_order')->orderByDesc('created_at')->paginate($perPage);

        $ids = $series->pluck('id');
        if ($ids->isNotEmpty()) {
            $counts = Episode::join('seasons', 'episodes.season_id', '=', 'seasons.id')
                ->whereIn('seasons.series_id', $ids)
                ->selectRaw('seasons.series_id, count(*) as total')
                ->groupBy('seasons.series_id')
                ->pluck('total', 'series_id');

            foreach ($series as $s) {
                $s->episodes_count = (int) ($counts[$s->id] ?? 0);
            }
        }

        return response()->json($series);
    }

    public function show(string $slug): JsonResponse
    {
        $series = Series::with(['seasons.episodes'])->where('slug', $slug)->firstOrFail();
        return response()->json($series);
    }

    // ─── Admin: Series CRUD ─────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:series,slug',
            'synopsis' => 'nullable|string',
            'genre' => 'required|string|max:100',
            'year' => 'required|string|max:10',
            'rating' => 'nullable|numeric|min:0|max:10',
            'poster_url' => 'nullable|string|max:500',
            'backdrop_url' => 'nullable|string|max:500',
            'tag' => 'nullable|string|max:50',
            'status' => 'nullable|in:upcoming,in_production,completed',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $series = Series::create($validated);
        return response()->json($series, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $series = Series::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:series,slug,' . $id,
            'synopsis' => 'nullable|string',
            'genre' => 'sometimes|required|string|max:100',
            'year' => 'sometimes|required|string|max:10',
            'rating' => 'nullable|numeric|min:0|max:10',
            'poster_url' => 'nullable|string|max:500',
            'backdrop_url' => 'nullable|string|max:500',
            'tag' => 'nullable|string|max:50',
            'status' => 'nullable|in:upcoming,in_production,completed',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $series->update($validated);
        return response()->json($series);
    }

    public function destroy(string $id): JsonResponse
    {
        Series::findOrFail($id)->delete();
        return response()->json(['message' => 'Series deleted']);
    }

    // ─── Admin: Seasons ─────────────────────────────────────────
    public function seasons(string $seriesId): JsonResponse
    {
        $seasons = Series::findOrFail($seriesId)->seasons()->withCount('episodes')->get();
        return response()->json($seasons);
    }

    public function storeSeason(Request $request, string $seriesId): JsonResponse
    {
        $validated = $request->validate([
            'season_number' => 'required|integer|min:1',
            'title' => 'nullable|string|max:255',
            'synopsis' => 'nullable|string',
        ]);

        $season = Series::findOrFail($seriesId)->seasons()->create($validated);
        return response()->json($season, 201);
    }

    public function updateSeason(Request $request, string $id): JsonResponse
    {
        $season = Season::findOrFail($id);
        $validated = $request->validate([
            'season_number' => 'sometimes|required|integer|min:1',
            'title' => 'nullable|string|max:255',
            'synopsis' => 'nullable|string',
        ]);

        $season->update($validated);
        return response()->json($season);
    }

    public function destroySeason(string $id): JsonResponse
    {
        Season::findOrFail($id)->delete();
        return response()->json(['message' => 'Season deleted']);
    }

    // ─── Admin: Episodes ────────────────────────────────────────
    public function episodes(string $seasonId): JsonResponse
    {
        $episodes = Season::findOrFail($seasonId)->episodes()->get();
        return response()->json($episodes);
    }

    public function storeEpisode(Request $request, string $seasonId): JsonResponse
    {
        $validated = $request->validate([
            'episode_number' => 'required|integer|min:1',
            'title' => 'required|string|max:255',
            'synopsis' => 'nullable|string',
            'duration' => 'nullable|string|max:20',
            'video_url' => 'nullable|string|max:500',
            'poster_url' => 'nullable|string|max:500',
        ]);

        $episode = Season::findOrFail($seasonId)->episodes()->create($validated);
        return response()->json($episode, 201);
    }

    public function updateEpisode(Request $request, string $id): JsonResponse
    {
        $episode = Episode::findOrFail($id);
        $validated = $request->validate([
            'episode_number' => 'sometimes|required|integer|min:1',
            'title' => 'sometimes|required|string|max:255',
            'synopsis' => 'nullable|string',
            'duration' => 'nullable|string|max:20',
            'video_url' => 'nullable|string|max:500',
            'poster_url' => 'nullable|string|max:500',
        ]);

        $episode->update($validated);
        return response()->json($episode);
    }

    public function destroyEpisode(string $id): JsonResponse
    {
        Episode::findOrFail($id)->delete();
        return response()->json(['message' => 'Episode deleted']);
    }
}
