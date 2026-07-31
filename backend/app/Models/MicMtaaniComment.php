<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MicMtaaniComment extends Model
{
    protected $table = 'mic_mtaani_comments';

    protected $fillable = ['article_id', 'user_id', 'name', 'body', 'is_approved'];

    protected function casts(): array
    {
        return ['is_approved' => 'boolean'];
    }

    public function article(): BelongsTo
    {
        return $this->belongsTo(MicMtaaniArticle::class, 'article_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
