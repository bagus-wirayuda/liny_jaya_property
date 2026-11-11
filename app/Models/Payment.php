<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Payment extends WorkspaceModel
{
    protected $table = 'payments';

    protected $fillable = ['id', 'booking_id', 'payload'];

    public static function payloadLinks(): array
    {
        return ['booking' => 'booking_id'];
    }

    /**
     * @return BelongsTo<Booking, $this>
     */
    public function booking(): BelongsTo
    {
        return $this->belongsTo(Booking::class, 'booking_id');
    }
}
