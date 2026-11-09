<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use stdClass;

class PropertyRecords
{
    public const GROUPS = [
        'projects', 'units', 'bookings', 'payments', 'tasks', 'reports', 'leads',
        'employees', 'expenses', 'tickets', 'announcements', 'attendance', 'leave',
        'documents', 'services', 'partners', 'articles', 'audit', 'offers', 'promos',
        'communications', 'schedules', 'messages', 'notifications', 'evaluations',
    ];

    private const TABLES = [
        'audit' => 'property_audits',
        'leave' => 'leave_requests',
        'notifications' => 'property_notifications',
        'settings' => 'workspace_settings',
    ];

    private const LINKS = [
        'units' => ['project' => 'project_id'],
        'leads' => ['project' => 'project_id', 'unit' => 'unit_id'],
        'expenses' => ['project' => 'project_id'],
        'promos' => ['project' => 'project_id'],
        'bookings' => ['unit' => 'unit_id'],
        'tasks' => ['unit' => 'unit_id'],
        'reports' => ['unit' => 'unit_id'],
        'offers' => ['unit' => 'unit_id'],
        'schedules' => ['unit' => 'unit_id'],
        'payments' => ['booking' => 'booking_id'],
        'documents' => ['booking' => 'booking_id'],
    ];

    private const FILES = [
        'payments' => 'proofData',
        'reports' => 'photoData',
        'documents' => 'fileData',
        'settings' => 'logoData',
    ];

    public const ROLES = [
        'admin' => 'Administrator',
        'client' => 'Klien',
        'employee' => 'Karyawan',
        'director' => 'Pimpinan',
    ];

    public function query(string $group): Builder
    {
        abort_unless(in_array($group, self::GROUPS, true) || $group === 'settings', 404);

        return DB::table(self::TABLES[$group] ?? $group);
    }

    public function row(string $group, string $id): stdClass
    {
        return $this->query($group)->where('id', $id)->first() ?? abort(404);
    }

    public function data(string $group, stdClass $row): array
    {
        $data = json_decode($row->payload, true, 512, JSON_THROW_ON_ERROR);
        foreach (self::LINKS[$group] ?? [] as $field => $column) {
            $data[$field] = $row->{$column} ?? '';
        }

        return ['id' => $row->id, ...$data];
    }

    public function put(string $group, string $id, array $record, array $columns = []): void
    {
        unset($record['id']);
        $field = self::FILES[$group] ?? null;
        if ($field && array_key_exists($field, $record)) {
            if ($record[$field]) {
                $this->attach($group, $id, $field, $record[$field]);
            }
            unset($record[$field]);
        }
        foreach (self::LINKS[$group] ?? [] as $key => $column) {
            $columns[$column] = ($record[$key] ?? '') !== '' ? $record[$key] : null;
            unset($record[$key]);
        }
        if ($group === 'units') {
            $columns['block_key'] = Str::lower($record['block']);
            $columns['number_key'] = Str::lower($record['number']);
        }
        if ($group === 'bookings') {
            $columns['reserved_unit'] = $record['status'] === 'Dibatalkan' ? null : $columns['unit_id'];
        }
        if ($group === 'attendance') {
            $columns['work_date'] = $record['date'];
        }
        $this->query($group)->updateOrInsert(['id' => $id], fn (bool $exists): array => [
            ...$columns,
            'payload' => json_encode($record, JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR),
            'updated_at' => now(),
            ...($exists ? [] : ['created_at' => now()]),
        ]);
    }

    public function delete(string $group, string $id): void
    {
        $this->query($group)->where('id', $id)->delete();
        DB::table('property_attachments')->where('resource', $group)->where('record_id', $id)->delete();
        if (in_array($group, ['projects', 'units'], true)) {
            DB::table('property_favorites')->where('property_id', $id)->delete();
        }
    }

    public function identifier(string $prefix): string
    {
        return $prefix.'-'.Str::lower((string) Str::ulid());
    }

    public function today(): string
    {
        return now('Asia/Jakarta')->toDateString();
    }

    public function notify(string $audience, string $title, string $message, ?int $client = null, ?string $employee = null): void
    {
        $this->put('notifications', $this->identifier('NT'), [
            'title' => $title, 'message' => $message, 'date' => $this->today(),
        ], ['audience' => $audience, 'client_id' => $client, 'employee_id' => $employee]);
    }

    public function audit(?User $user, string $action): void
    {
        $this->put('audit', $this->identifier('LOG'), [
            'date' => now()->toIso8601String(),
            'actor' => self::ROLES[$user?->role] ?? 'Pengunjung',
            'action' => $action,
        ], ['author_id' => $user?->id]);
    }

    private function attach(string $group, string $id, string $field, string $encoded): void
    {
        if (strlen($encoded) > 2_800_000 || ! preg_match('~\Adata:(image/(?:jpeg|png|webp)|application/pdf);base64,([a-zA-Z0-9+/=]+)\z~', $encoded, $parts)) {
            throw ValidationException::withMessages([$field => 'Gunakan lampiran PDF, JPG, PNG, atau WebP hingga 2 MB.']);
        }
        $content = base64_decode($parts[2], true);
        $mime = $parts[1];
        $imageOnly = in_array($group, ['reports', 'settings'], true);
        if ($content === false || strlen($content) > 2_097_152 || (new \finfo(FILEINFO_MIME_TYPE))->buffer($content) !== $mime || ($imageOnly && ! str_starts_with($mime, 'image/'))) {
            throw ValidationException::withMessages([$field => 'Isi dan jenis lampiran tidak sesuai.']);
        }
        if (str_starts_with($mime, 'image/')) {
            $dimensions = @getimagesizefromstring($content);
            if (! $dimensions || $dimensions[0] * $dimensions[1] > 24_000_000) {
                throw ValidationException::withMessages([$field => 'Dimensi gambar tidak dapat digunakan.']);
            }
        }
        DB::table('property_attachments')->updateOrInsert(
            ['resource' => $group, 'record_id' => $id, 'field' => $field],
            ['id' => (string) Str::uuid(), 'mime' => $mime, 'content' => $parts[2]],
        );
    }
}
