<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(): JsonResponse
    {
        $notifications = Notification::orderByDesc('sent_at')->orderByDesc('created_at')->get();
        return response()->json($notifications);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'message' => 'nullable|string',
            'channel' => 'required|string|max:50',
            'sent_count' => 'nullable|integer|min:0',
            'sent_at' => 'nullable|date',
        ]);

        $notification = Notification::create($validated);
        return response()->json($notification, 201);
    }

    public function destroy(string $id): JsonResponse
    {
        Notification::findOrFail($id)->delete();
        return response()->json(['message' => 'Notification deleted']);
    }
}
