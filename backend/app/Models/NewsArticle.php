<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NewsArticle extends Model
{
    use HasFactory;

    protected $table = 'news';

    protected $fillable = [
        'title', 'slug', 'category', 'excerpt', 'body', 'image_url',
        'published_at', 'featured',
    ];

    protected $casts = [
        'published_at' => 'date',
        'featured' => 'boolean',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
