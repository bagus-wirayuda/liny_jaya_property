<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Expense extends WorkspaceModel
{
    protected $table = 'expenses';

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
}
