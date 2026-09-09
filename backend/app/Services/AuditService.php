<?php

namespace App\Services;

use App\Models\AuditLog;
use Illuminate\Support\Facades\Auth;

class AuditService
{
    public function logAdminLogin(int $userId): void
    {
        AuditLog::log(
            'ADMIN_LOGIN',
            $userId,
            'users',
            (string) $userId,
            ['name' => Auth::user()?->name ?? 'Unknown']
        );
    }

    public function logAdminLogout(int $userId): void
    {
        AuditLog::log(
            'ADMIN_LOGOUT',
            $userId,
            'users',
            (string) $userId,
            ['name' => Auth::user()?->name ?? 'Unknown']
        );
    }

    public function logFilmCreated(int $userId, int $filmId, string $filmTitle): void
    {
        AuditLog::log(
            'FILM_CREATED',
            $userId,
            'films',
            (string) $filmId,
            ['name' => $filmTitle]
        );
    }

    public function logFilmUpdated(int $userId, int $filmId, string $filmTitle): void
    {
        AuditLog::log(
            'FILM_UPDATED',
            $userId,
            'films',
            (string) $filmId,
            ['name' => $filmTitle]
        );
    }

    public function logFilmDeleted(int $userId, int $filmId, string $filmTitle): void
    {
        AuditLog::log(
            'FILM_DELETED',
            $userId,
            'films',
            (string) $filmId,
            ['name' => $filmTitle],
            'WARN'
        );
    }

    public function logSeriesCreated(int $userId, int $seriesId, string $seriesTitle): void
    {
        AuditLog::log(
            'SERIES_CREATED',
            $userId,
            'series',
            (string) $seriesId,
            ['name' => $seriesTitle]
        );
    }

    public function logSeriesUpdated(int $userId, int $seriesId, string $seriesTitle): void
    {
        AuditLog::log(
            'SERIES_UPDATED',
            $userId,
            'series',
            (string) $seriesId,
            ['name' => $seriesTitle]
        );
    }

    public function logSeriesDeleted(int $userId, int $seriesId, string $seriesTitle): void
    {
        AuditLog::log(
            'SERIES_DELETED',
            $userId,
            'series',
            (string) $seriesId,
            ['name' => $seriesTitle],
            'WARN'
        );
    }

    public function logUserRegistered(int $userId, string $userName): void
    {
        AuditLog::log(
            'USER_REGISTERED',
            null, // System event
            'users',
            (string) $userId,
            ['name' => $userName]
        );
    }

    public function logUserRoleChanged(int $adminUserId, int $targetUserId, string $targetUserName, string $newRole): void
    {
        AuditLog::log(
            'USER_ROLE_CHANGED',
            $adminUserId,
            'users',
            (string) $targetUserId,
            ['name' => $targetUserName, 'new_role' => $newRole],
            'WARN'
        );
    }

    public function logPaymentProcessed(int $userId, int $paymentId, float $amount): void
    {
        AuditLog::log(
            'PAYMENT_PROCESSED',
            null, // System event
            'payments',
            (string) $paymentId,
            ['user_id' => $userId, 'amount' => $amount]
        );
    }

    public function logSubscriptionCreated(int $userId, int $subscriptionId): void
    {
        AuditLog::log(
            'SUBSCRIPTION_CREATED',
            null, // System event
            'subscriptions',
            (string) $subscriptionId,
            ['user_id' => $userId]
        );
    }

    public function logSecurityEvent(string $action, ?int $userId = null, string $level = 'WARN', ?array $details = null): void
    {
        AuditLog::log(
            $action,
            $userId,
            null,
            null,
            $details,
            $level
        );
    }
}