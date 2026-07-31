<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Film;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FilmController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Film::query();

        if ($request->has('genre') && $request->genre !== 'All') {
            $query->where('genre', $request->genre);
        }

        if ($request->has('featured')) {
            $query->where('featured', true);
        }

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $films = $query->orderBy('sort_order')->orderByDesc('created_at')->get();

        return response()->json($films);
    }

    public function show(string $slug): JsonResponse
    {
        $film = Film::where('slug', $slug)->firstOrFail();
        return response()->json($film);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:films,slug',
            'synopsis' => 'nullable|string',
            'genre' => 'required|string|max:100',
            'year' => 'required|string|max:10',
            'duration' => 'nullable|string|max:20',
            'rating' => 'nullable|numeric|min:0|max:10',
            'poster_url' => 'nullable|string|max:500',
            'backdrop_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'tag' => 'nullable|string|max:50',
            'status' => 'nullable|in:upcoming,in_production,completed',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $film = Film::create($validated);
        return response()->json($film, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $film = Film::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:films,slug,' . $id,
            'synopsis' => 'nullable|string',
            'genre' => 'sometimes|required|string|max:100',
            'year' => 'sometimes|required|string|max:10',
            'duration' => 'nullable|string|max:20',
            'rating' => 'nullable|numeric|min:0|max:10',
            'poster_url' => 'nullable|string|max:500',
            'backdrop_url' => 'nullable|string|max:500',
            'video_url' => 'nullable|string|max:500',
            'tag' => 'nullable|string|max:50',
            'status' => 'nullable|in:upcoming,in_production,completed',
            'featured' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $film->update($validated);
        return response()->json($film);
    }

    public function destroy(string $id): JsonResponse
    {
        Film::findOrFail($id)->delete();
        return response()->json(['message' => 'Film deleted']);
    }
}
