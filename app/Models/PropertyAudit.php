<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyAudit extends WorkspaceModel
{
    protected $table = 'property_audits';

    protected $fillable = ['id', 'author_id', 'payload'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function author(): BelongsTo
    {
        return $this->belongsTo(User::class, 'author_id');
    }
}
