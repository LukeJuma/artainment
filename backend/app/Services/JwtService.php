<?php

namespace App\Services;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use App\Models\User;
use Illuminate\Support\Carbon;

class JwtService
{
    private string $secret;
    private int $expiration;

    public function __construct()
    {
        $this->secret = config('app_custom.jwt_secret');
        $this->expiration = config('app_custom.jwt_expiration');
    }

    /**
     * Generate a JWT token for the given user
     */
    public function generateToken(User $user): string
    {
        $payload = [
            'iss' => config('app.url'), // Issuer
            'sub' => $user->id,         // Subject (user ID)
            'iat' => time(),            // Issued at
            'exp' => time() + $this->expiration, // Expiration
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'is_admin' => $user->is_admin,
            ]
        ];

        return JWT::encode($payload, $this->secret, 'HS256');
    }

    /**
     * Verify and decode a JWT token
     */
    public function verifyToken(string $token): ?array
    {
        try {
            $decoded = JWT::decode($token, new Key($this->secret, 'HS256'));
            return (array) $decoded;
        } catch (\Exception $e) {
            return null;
        }
    }

    /**
     * Get user from token
     */
    public function getUserFromToken(string $token): ?User
    {
        $payload = $this->verifyToken($token);
        
        if (!$payload || !isset($payload['sub'])) {
            return null;
        }

        return User::find($payload['sub']);
    }

    /**
     * Check if token is expired
     */
    public function isTokenExpired(string $token): bool
    {
        $payload = $this->verifyToken($token);
        
        if (!$payload || !isset($payload['exp'])) {
            return true;
        }

        return time() > $payload['exp'];
    }

    /**
     * Refresh a token (generate new one with extended expiration)
     */
    public function refreshToken(string $token): ?string
    {
        $user = $this->getUserFromToken($token);
        
        if (!$user) {
            return null;
        }

        return $this->generateToken($user);
    }
}