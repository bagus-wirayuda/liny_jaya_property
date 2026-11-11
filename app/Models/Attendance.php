<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attendance extends WorkspaceModel
{
    protected $table = 'attendance';

    protected $fillable = ['id', 'employee_id', 'work_date', 'payload'];

    protected function casts(): array
    {
        return [
            ...parent::casts(),
            'work_date' => 'date:Y-m-d',
        ];
    }

    /**
     * @return BelongsTo<Employee, $this>
     */
    public function employee(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'employee_id');
    }
}
