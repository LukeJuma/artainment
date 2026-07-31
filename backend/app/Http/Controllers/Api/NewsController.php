<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\NewsArticle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NewsController extends Controller
{
    public function index(): JsonResponse
    {
        $news = NewsArticle::orderByDesc('published_at')->get();
        return response()->json($news);
    }

    public function show(string $slug): JsonResponse
    {
        $article = NewsArticle::where('slug', $slug)->firstOrFail();
        return response()->json($article);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|unique:news,slug',
            'category' => 'required|string|max:100',
            'excerpt' => 'nullable|string',
            'body' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
            'featured' => 'nullable|boolean',
        ]);

        $article = NewsArticle::create($validated);
        return response()->json($article, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $article = NewsArticle::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:news,slug,' . $id,
            'category' => 'sometimes|required|string|max:100',
            'excerpt' => 'nullable|string',
            'body' => 'nullable|string',
            'image_url' => 'nullable|string|max:500',
            'published_at' => 'nullable|date',
            'featured' => 'nullable|boolean',
        ]);

        $article->update($validated);
        return response()->json($article);
    }

    public function destroy(string $id): JsonResponse
    {
        NewsArticle::findOrFail($id)->delete();
        return response()->json(['message' => 'Article deleted']);
    }
}
