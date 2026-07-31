<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Str;

class MicMtaaniArticle extends Model
{
    protected $table = 'mic_mtaani_articles';

    protected $fillable = [
        'headline', 'slug', 'subtitle', 'body', 'excerpt', 'author_id',
        'category_id', 'image_url', 'video_url', 'tags', 'reading_time',
        'is_featured', 'is_breaking', 'status', 'published_at', 'views',
    ];

    protected function casts(): array
    {
        return [
            'tags' => 'array',
            'is_featured' => 'boolean',
            'is_breaking' => 'boolean',
            'published_at' => 'datetime',
        ];
    }

    protected static function boot(): void
    {
        parent::boot();
        static::creating(function (MicMtaaniArticle $article) {
            if (empty($article->slug)) {
                $article->slug = Str::slug($article->headline);
            }
            if (empty($article->excerpt) && !empty($article->body)) {
                $article->excerpt = Str::limit(strip_tags($article->body), 200);
            }
        });
    }

    public function getRouteKeyName(): string
    {
        return 'slug';
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(MicMtaaniCategory::class, 'category_id');
    }

    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }

    public function journalist(): BelongsTo
    {
        return $this->belongsTo(MicMtaaniJournalist::class, 'author_id');
    }

    public function comments(): HasMany
    {
        return $this->hasMany(MicMtaaniComment::class, 'article_id');
    }
}
