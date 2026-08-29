<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Episode extends Model
{
    use HasFactory;

    protected $fillable = [
        'season_id', 'episode_number', 'title', 'synopsis',
        'duration', 'video_url', 'poster_url',
    ];

    public function season(): BelongsTo
    {
        return $this->belongsTo(Season::class);
    }
}
