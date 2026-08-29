<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Talent extends Model
{
    use HasFactory;

    protected $table = 'talents';

    protected $fillable = [
        'name', 'slug', 'role', 'bio', 'credits', 'image_url',
        'reel_url', 'socials', 'active', 'sort_order',
    ];

    protected $casts = [
        'credits' => 'integer',
        'active' => 'boolean',
        'socials' => 'array',
    ];

    public function getRouteKeyName(): string
    {
        return 'slug';
    }
}
