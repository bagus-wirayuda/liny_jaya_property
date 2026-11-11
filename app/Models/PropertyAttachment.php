<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyAttachment extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'property_attachments';

    protected $keyType = 'string';

    protected $fillable = ['id', 'resource', 'record_id', 'field', 'mime', 'content'];
}
