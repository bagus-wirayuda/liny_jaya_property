<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Ticket extends WorkspaceModel
{
    protected $table = 'tickets';

    protected $fillable = ['id', 'client_id', 'payload'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function client(): BelongsTo
    {
        return $this->belongsTo(User::class, 'client_id');
    }
}
