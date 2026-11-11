<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PropertyFavorite extends Model
{
    public $incrementing = false;

    public $timestamps = false;

    protected $table = 'property_favorites';

    protected $fillable = ['user_id', 'property_id'];

    /**
     * @return BelongsTo<User, $this>
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }
}
