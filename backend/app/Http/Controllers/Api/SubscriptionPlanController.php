<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\SubscriptionPlan;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SubscriptionPlanController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(SubscriptionPlan::orderBy('sort_order')->get());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'required|string|unique:subscription_plans,slug',
            'price' => 'required|integer|min:0',
            'billing_interval' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        return response()->json(SubscriptionPlan::create($validated), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $plan = SubscriptionPlan::findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'slug' => 'sometimes|required|string|unique:subscription_plans,slug,' . $id,
            'price' => 'sometimes|required|integer|min:0',
            'billing_interval' => 'nullable|string|max:50',
            'description' => 'nullable|string',
            'features' => 'nullable|array',
            'is_active' => 'nullable|boolean',
            'sort_order' => 'nullable|integer',
        ]);

        $plan->update($validated);

        return response()->json($plan);
    }

    public function destroy(string $id): JsonResponse
    {
        SubscriptionPlan::findOrFail($id)->delete();

        return response()->json(['message' => 'Plan deleted']);
    }
}
