<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    public function index(): JsonResponse
    {
        $services = Service::where('active', true)->orderBy('sort_order')->get();
        return response()->json($services);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'icon' => 'nullable|string|max:10',
            'image_url' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $service = Service::create($validated);
        return response()->json($service, 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $service = Service::findOrFail($id);
        $validated = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'icon' => 'nullable|string|max:10',
            'image_url' => 'nullable|string|max:500',
            'sort_order' => 'nullable|integer',
            'active' => 'nullable|boolean',
        ]);

        $service->update($validated);
        return response()->json($service);
    }

    public function destroy(string $id): JsonResponse
    {
        Service::findOrFail($id)->delete();
        return response()->json(['message' => 'Service deleted']);
    }
}
