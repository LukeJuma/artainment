<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Film extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'synopsis', 'genre', 'year', 'release_date', 'duration',
        'rating', 'poster_url', 'backdrop_url', 'video_url', 'full_video_url', 'youtube_url', 'cast', 'tag',
        'status', 'featured', 'sort_order',
    ];

    protected $casts = [
        'rating' => 'float',
        'featured' => 'boolean',
        'cast' => 'array',
        'release_date' => 'date',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
