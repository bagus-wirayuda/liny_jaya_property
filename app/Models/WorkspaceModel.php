<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

/**
 * Base Eloquent model for JSON-payload-backed workspace tables.
 *
 * @property string $id
 * @property array<string, mixed> $payload
 */
abstract class WorkspaceModel extends Model
{
    public $incrementing = false;

    protected $keyType = 'string';

    /**
     * Foreign-key links mapped from payload keys to relational DB columns.
     *
     * @return array<string, string>
     */
    public static function payloadLinks(): array
    {
        return [];
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'payload' => 'array',
        ];
    }
}
