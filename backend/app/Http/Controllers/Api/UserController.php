<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json(
            User::orderBy('is_admin', 'desc')
                ->latest()
                ->get(['id', 'name', 'email', 'is_admin', 'created_at'])
        );
    }

    public function updateRole(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot change your own admin role.'], 403);
        }

        $validated = $request->validate([
            'is_admin' => 'required|boolean',
        ]);

        $user->is_admin = $validated['is_admin'];
        $user->save();

        return response()->json($user->only(['id', 'name', 'email', 'is_admin', 'created_at']));
    }

    public function destroy(Request $request, string $id): JsonResponse
    {
        $user = User::findOrFail($id);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'You cannot delete your own account.'], 403);
        }

        $user->delete();

        return response()->json(['message' => 'User deleted']);
    }
}
