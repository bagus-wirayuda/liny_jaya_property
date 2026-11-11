<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Evaluation extends WorkspaceModel
{
    protected $table = 'evaluations';

    protected $fillable = ['id', 'employee_id', 'payload'];

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
