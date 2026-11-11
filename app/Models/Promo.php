<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promo extends WorkspaceModel
{
    protected $table = 'promos';

    protected $fillable = ['id', 'project_id', 'payload'];

    public static function payloadLinks(): array
    {
        return ['project' => 'project_id'];
    }

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    #[Scope]
    protected function active(Builder $query): Builder
    {
        return $query->where('payload->status', 'Aktif');
    }
}
