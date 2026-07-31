<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Film extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'synopsis', 'genre', 'year', 'duration',
        'rating', 'poster_url', 'backdrop_url', 'video_url', 'tag',
        'status', 'featured', 'sort_order',
    ];

    protected $casts = [
        'rating' => 'float',
        'featured' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
