<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;

class Podcast extends Model
{
    use HasFactory, SoftDeletes;

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

    public function latestEpisode(): HasOne
    {
        return $this->hasOne(PodcastEpisode::class)->latestOfMany('published_at');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
