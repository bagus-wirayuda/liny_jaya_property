<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\HasMany;

class Project extends WorkspaceModel
{
    protected $table = 'projects';

    protected $fillable = ['id', 'payload'];

    /**
     * @return HasMany<Unit, $this>
     */
    public function units(): HasMany
    {
        return $this->hasMany(Unit::class, 'project_id');
    }

    /**
     * @return HasMany<Lead, $this>
     */
    public function leads(): HasMany
    {
        return $this->hasMany(Lead::class, 'project_id');
    }

    /**
     * @return HasMany<Expense, $this>
     */
    public function expenses(): HasMany
    {
        return $this->hasMany(Expense::class, 'project_id');
    }

    /**
     * @return HasMany<Promo, $this>
     */
    public function promos(): HasMany
    {
        return $this->hasMany(Promo::class, 'project_id');
    }
}
