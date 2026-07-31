<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Testimonial;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TestimonialController extends Controller
{
    public function index(): JsonResponse
    {
        $testimonials = Testimonial::where('active', true)->orderBy('sort_order')->get();
        return response()->json($testimonials);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'quote' => 'required|string',
            'name' => 'required|string|max:255',
            'role' => 'required|string|max:255',
            'active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $testimonial = Testimonial::create($validated);
        return response()->json($testimonial, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $testimonial = Testimonial::findOrFail($id);
        $validated = $request->validate([
            'quote' => 'sometimes|required|string',
            'name' => 'sometimes|required|string|max:255',
            'role' => 'sometimes|required|string|max:255',
            'active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $testimonial->update($validated);
        return response()->json($testimonial);
    }

    public function destroy(string $id): JsonResponse
    {
        Testimonial::findOrFail($id)->delete();
        return response()->json(['message' => 'Testimonial deleted']);
    }
}
