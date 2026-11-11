<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Lead extends WorkspaceModel
{
    protected $table = 'leads';

    protected $fillable = ['id', 'project_id', 'unit_id', 'payload'];

    public static function payloadLinks(): array
    {
        return ['project' => 'project_id', 'unit' => 'unit_id'];
    }

    /**
     * @return BelongsTo<Project, $this>
     */
    public function project(): BelongsTo
    {
        return $this->belongsTo(Project::class, 'project_id');
    }

    /**
     * @return BelongsTo<Unit, $this>
     */
    public function unit(): BelongsTo
    {
        return $this->belongsTo(Unit::class, 'unit_id');
    }
}
