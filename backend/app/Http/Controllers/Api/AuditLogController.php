<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'page' => 'nullable|integer|min:1',
            'per_page' => 'nullable|integer|min:1|max:100',
            'level' => 'nullable|in:INFO,WARN,ERROR',
            'action' => 'nullable|string',
            'user_id' => 'nullable|integer',
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $query = AuditLog::with('user:id,name,email')
            ->orderBy('created_at', 'desc');

        // Apply filters
        if ($validated['level'] ?? null) {
            $query->where('level', $validated['level']);
        }

        if ($validated['action'] ?? null) {
            $query->where('action', 'like', '%' . $validated['action'] . '%');
        }

        if ($validated['user_id'] ?? null) {
            $query->where('user_id', $validated['user_id']);
        }

        if ($validated['start_date'] ?? null) {
            $query->where('created_at', '>=', $validated['start_date']);
        }

        if ($validated['end_date'] ?? null) {
            $query->where('created_at', '<=', $validated['end_date'] . ' 23:59:59');
        }

        $perPage = min($validated['per_page'] ?? 50, 100);
        $logs = $query->paginate($perPage);

        // Transform the data for frontend consumption
        $logs->getCollection()->transform(function ($log) {
            return [
                'id' => $log->id,
                'action' => $log->action,
                'message' => $log->formatted_message,
                'level' => $log->level,
                'user' => $log->user ? [
                    'id' => $log->user->id,
                    'name' => $log->user->name,
                    'email' => $log->user->email,
                ] : null,
                'resource_type' => $log->resource_type,
                'resource_id' => $log->resource_id,
                'details' => $log->details,
                'ip_address' => $log->ip_address,
                'user_agent' => $log->user_agent,
                'created_at' => $log->created_at->toISOString(),
                'time_ago' => $log->created_at->diffForHumans(),
            ];
        });

        return response()->json($logs);
    }

    public function stats(Request $request): JsonResponse
    {
        $stats = [
            'total_logs' => AuditLog::count(),
            'logs_today' => AuditLog::whereDate('created_at', today())->count(),
            'error_logs_today' => AuditLog::where('level', 'ERROR')->whereDate('created_at', today())->count(),
            'unique_users_today' => AuditLog::whereNotNull('user_id')->whereDate('created_at', today())->distinct('user_id')->count(),
        ];

        $recent_actions = AuditLog::select('action')
            ->selectRaw('COUNT(*) as count')
            ->where('created_at', '>=', now()->subDays(7))
            ->groupBy('action')
            ->orderBy('count', 'desc')
            ->limit(10)
            ->get();

        return response()->json([
            'stats' => $stats,
            'recent_actions' => $recent_actions,
        ]);
    }
}