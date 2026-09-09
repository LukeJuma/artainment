<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    protected $fillable = [
        'user_id',
        'action',
        'resource_type',
        'resource_id',
        'details',
        'ip_address', 
        'user_agent',
        'level',
    ];

    protected function casts(): array
    {
        return [
            'details' => 'array',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Create an audit log entry
     */
    public static function log(
        string $action,
        ?int $userId = null,
        ?string $resourceType = null,
        ?string $resourceId = null,
        ?array $details = null,
        string $level = 'INFO'
    ): self {
        return self::create([
            'user_id' => $userId,
            'action' => $action,
            'resource_type' => $resourceType,
            'resource_id' => $resourceId,
            'details' => $details,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'level' => $level,
        ]);
    }

    /**
     * Format the log entry for display
     */
    public function getFormattedMessageAttribute(): string
    {
        $user = $this->user ? $this->user->name : 'System';
        
        $message = match($this->action) {
            'ADMIN_LOGIN' => "{$user} logged in as admin",
            'ADMIN_LOGOUT' => "{$user} logged out",
            'FILM_CREATED' => "{$user} created film: {$this->getResourceName()}",
            'FILM_UPDATED' => "{$user} updated film: {$this->getResourceName()}",
            'FILM_DELETED' => "{$user} deleted film: {$this->getResourceName()}",
            'SERIES_CREATED' => "{$user} created series: {$this->getResourceName()}",
            'SERIES_UPDATED' => "{$user} updated series: {$this->getResourceName()}",
            'SERIES_DELETED' => "{$user} deleted series: {$this->getResourceName()}",
            'USER_REGISTERED' => "New user registered: {$this->getResourceName()}",
            'USER_ROLE_CHANGED' => "{$user} changed user role for: {$this->getResourceName()}",
            'PAYMENT_PROCESSED' => "Payment processed for user: {$this->getResourceName()}",
            'SUBSCRIPTION_CREATED' => "New subscription created for user: {$this->getResourceName()}",
            default => "{$user} performed action: {$this->action}",
        };

        return $message;
    }

    private function getResourceName(): string
    {
        if ($this->details && isset($this->details['name'])) {
            return $this->details['name'];
        }
        
        if ($this->resource_id) {
            return "#{$this->resource_id}";
        }

        return 'Unknown';
    }
}