<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PodcastEpisode extends Model
{
    use HasFactory;

    protected $table = 'podcast_episodes';

    protected $fillable = [
        'podcast_id', 'episode_number', 'title', 'description',
        'duration', 'audio_url', 'video_url', 'published_at',
    ];

    protected $casts = [
        'published_at' => 'datetime',
    ];

    public function podcast(): BelongsTo
    {
        return $this->belongsTo(Podcast::class);
    }
}
