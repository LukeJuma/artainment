<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MicMtaaniEvent extends Model
{
    protected $table = 'mic_mtaani_events';

    protected $fillable = [
        'title', 'slug', 'description', 'location', 'organizer', 'image_url',
        'category', 'starts_at', 'ends_at', 'contact_phone', 'contact_email',
        'website', 'is_featured', 'status',
    ];

    protected function casts(): array
    {
        return [
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_featured' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (MicMtaaniEvent $event) {
            if (empty($event->slug)) {
                $event->slug = Str::slug($event->title);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
