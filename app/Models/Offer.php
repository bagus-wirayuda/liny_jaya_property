<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offer extends WorkspaceModel
{
    protected $table = 'offers';

    protected $fillable = ['id', 'unit_id', 'payload'];

    public static function payloadLinks(): array
    {
        return ['unit' => 'unit_id'];
    }

    /**
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
