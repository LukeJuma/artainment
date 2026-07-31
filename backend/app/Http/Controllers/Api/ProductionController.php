<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Production;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    public function index(): JsonResponse
    {
        $productions = Production::orderBy('sort_order')->orderByDesc('created_at')->get();
        return response()->json($productions);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'type' => 'nullable|string|max:100',
            'year' => 'required|string|max:10',
            'status' => 'nullable|in:completed,in_production,upcoming',
            'image_url' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $production = Production::create($validated);
        return response()->json($production, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $production = Production::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'type' => 'nullable|string|max:100',
            'year' => 'sometimes|required|string|max:10',
            'status' => 'nullable|in:completed,in_production,upcoming',
            'image_url' => 'nullable|string|max:500',
            'description' => 'nullable|string',
            'sort_order' => 'nullable|integer',
        ]);

        $production->update($validated);
        return response()->json($production);
    }

    public function destroy(string $id): JsonResponse
    {
        Production::findOrFail($id)->delete();
        return response()->json(['message' => 'Production deleted']);
    }
}
