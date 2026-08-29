<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    use HasFactory;

    protected $fillable = [
        'title', 'message', 'channel', 'sent_count', 'sent_at',
    ];

    protected $casts = [
        'sent_count' => 'integer',
        'sent_at' => 'datetime',
    ];
}
