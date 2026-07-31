<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;

class MicMtaaniBusiness extends Model
{
    protected $table = 'mic_mtaani_businesses';

    protected $fillable = [
        'name', 'slug', 'description', 'location', 'phone', 'email',
        'website', 'opening_hours', 'image_url', 'gallery', 'category',
        'is_featured',
    ];

    protected function casts(): array
    {
        return [
            'gallery' => 'array',
            'is_featured' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (MicMtaaniBusiness $b) {
            if (empty($b->slug)) {
                $b->slug = Str::slug($b->name);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
