<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Series extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'slug', 'synopsis', 'genre', 'year', 'rating',
        'poster_url', 'backdrop_url', 'tag', 'status', 'featured', 'sort_order',
    ];

    protected $casts = [
        'rating' => 'float',
        'featured' => 'boolean',
    ];

    public function seasons(): HasMany
    {
        return $this->hasMany(Season::class)->orderBy('season_number');
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
