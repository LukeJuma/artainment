<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MicMtaaniNewsletterSubscriber extends Model
{
    protected $table = 'mic_mtaani_newsletter_subscribers';

    protected $fillable = ['email', 'name', 'frequency', 'is_active'];

    protected function casts(): array
    {
        return ['is_active' => 'boolean'];
    }
}
