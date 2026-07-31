<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MicMtaaniJournalist extends Model
{
    protected $table = 'mic_mtaani_journalists';

    protected $fillable = [
        'user_id', 'name', 'slug', 'bio', 'role', 'avatar_url',
        'social_links', 'email', 'is_active',
    ];

    protected function casts(): array
    {
        return [
            'social_links' => 'array',
            'is_active' => 'boolean',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (MicMtaaniJournalist $j) {
            if (empty($j->slug)) {
                $j->slug = Str::slug($j->name);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function articles(): HasMany
    {
        return $this->hasMany(MicMtaaniArticle::class, 'author_id');
    }
}
