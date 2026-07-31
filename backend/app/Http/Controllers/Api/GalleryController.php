<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\GalleryImage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GalleryController extends Controller
{
    public function index(): JsonResponse
    {
        $images = GalleryImage::orderBy('sort_order')->get();
        return response()->json($images);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'image_url' => 'required|string|max:500',
            'caption' => 'nullable|string|max:255',
            'sort_order' => 'nullable|integer',
        ]);

        $image = GalleryImage::create($validated);
        return response()->json($image, 201);
    }

    public function destroy(string $id): JsonResponse
    {
        GalleryImage::findOrFail($id)->delete();
        return response()->json(['message' => 'Image deleted']);
    }
}
