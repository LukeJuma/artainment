<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends Model
{
    use HasFactory;

    protected $fillable = [
        'event_id', 'type', 'price', 'capacity', 'sold', 'status',
    ];

    protected $casts = [
        'price' => 'float',
        'capacity' => 'integer',
        'sold' => 'integer',
    ];

    public function event(): BelongsTo
    {
        return $this->belongsTo(MicMtaaniEvent::class, 'event_id');
    }
}
