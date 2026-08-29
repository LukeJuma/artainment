<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Podcast extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'host', 'category', 'description',
        'cover_url', 'active', 'sort_order',
    ];

    protected $casts = [
        'active' => 'boolean',
    ];

    public function episodes(): HasMany
    {
        return $this->hasMany(PodcastEpisode::class)->orderBy('episode_number');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
