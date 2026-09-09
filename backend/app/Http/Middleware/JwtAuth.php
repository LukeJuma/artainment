<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use App\Services\JwtService;
use Illuminate\Http\JsonResponse;

class JwtAuth
{
    protected JwtService $jwtService;

    public function __construct(JwtService $jwtService)
    {
        $this->jwtService = $jwtService;
    }

    public function handle(Request $request, Closure $next, string $role = null): mixed
    {
        $token = $this->extractToken($request);

        if (!$token) {
            return $this->unauthorized('Authentication token not provided');
        }

        $user = $this->jwtService->getUserFromToken($token);

        if (!$user) {
            return $this->unauthorized('Invalid or expired token');
        }

        // Check role if specified
        if ($role === 'admin' && !$user->is_admin) {
            return $this->forbidden('Admin access required');
        }

        // Add user to request
        $request->merge(['auth_user' => $user]);
        $request->setUserResolver(fn() => $user);

        return $next($request);
    }

    private function extractToken(Request $request): ?string
    {
        $header = $request->header('Authorization');
        
        if (!$header || !str_starts_with($header, 'Bearer ')) {
            return null;
        }

        return substr($header, 7);
    }

    private function unauthorized(string $message): JsonResponse
    {
        return response()->json([
            'error' => 'Unauthorized',
            'message' => $message
        ], 401);
    }

    private function forbidden(string $message): JsonResponse
    {
        return response()->json([
            'error' => 'Forbidden', 
            'message' => $message
        ], 403);
    }
}