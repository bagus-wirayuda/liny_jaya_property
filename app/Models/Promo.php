<?php

namespace App\Models;

use App\Services\PaymentCalculator;
use Illuminate\Database\Eloquent\Attributes\Scope;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Promo extends WorkspaceModel
{
    protected $table = 'promos';

    protected $fillable = ['id', 'project_id', 'unit_id', 'payload'];

    public static function payloadLinks(): array
    {
        return [
            'project' => 'project_id',
            'unit' => 'unit_id',
        ];
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

    #[Scope]
    protected function active(Builder $query): Builder
    {
        $today = now(PaymentCalculator::TIMEZONE)->toDateString();

        return $query
            ->where('payload->status', 'Aktif')
            ->where('payload->start', '<=', $today)
            ->where('payload->end', '>=', $today);
    }
}
