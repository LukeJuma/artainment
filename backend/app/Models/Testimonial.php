<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Testimonial extends Model
{
    use HasFactory;

    protected $fillable = ['quote', 'name', 'role', 'active', 'sort_order'];

    protected $casts = [
        'active' => 'boolean',
    ];
}
