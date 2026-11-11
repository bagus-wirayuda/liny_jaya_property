<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PropertyRevision extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'property_revisions';

    protected $fillable = ['id', 'version'];

    protected function casts(): array
    {
        return [
            'version' => 'integer',
        ];
    }
}
