<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Talent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TalentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $perPage = min((int) $request->input('per_page', 24), 50);
        $talent = Talent::where('active', true)->orderBy('sort_order')->paginate($perPage);
        return response()->json($talent);
    }

    public function show(string $slug): JsonResponse
    {
        $talent = Talent::where('slug', $slug)->firstOrFail();
        return response()->json($talent);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:talents,slug',
            'role' => 'required|string|max:100',
            'bio' => 'nullable|string',
            'credits' => 'nullable|integer|min:0',
            'image_url' => 'nullable|string|max:500',
            'reel_url' => 'nullable|string|max:500',
            'socials' => 'nullable|array',
            'active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $talent = Talent::create($validated);
        return response()->json($talent, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $talent = Talent::findOrFail($id);
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:talents,slug,' . $id,
            'role' => 'sometimes|required|string|max:100',
            'bio' => 'nullable|string',
            'credits' => 'nullable|integer|min:0',
            'image_url' => 'nullable|string|max:500',
            'reel_url' => 'nullable|string|max:500',
            'socials' => 'nullable|array',
            'active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $talent->update($validated);
        return response()->json($talent);
    }

    public function destroy(string $id): JsonResponse
    {
        Talent::findOrFail($id)->delete();
        return response()->json(['message' => 'Talent deleted']);
    }
}
