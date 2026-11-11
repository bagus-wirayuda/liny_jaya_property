<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends WorkspaceModel
{
    protected $table = 'tasks';

    protected $fillable = ['id', 'unit_id', 'employee_id', 'payload'];

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

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
