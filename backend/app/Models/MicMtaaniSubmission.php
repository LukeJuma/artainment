<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MicMtaaniSubmission extends Model
{
    protected $table = 'mic_mtaani_submissions';

    protected $fillable = [
        'type', 'title', 'description', 'submitter_name', 'submitter_email',
        'submitter_phone', 'media_url', 'status', 'admin_notes',
    ];
}
