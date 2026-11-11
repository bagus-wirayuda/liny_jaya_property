<?php

namespace App\Services;

use App\Models\Announcement;
use App\Models\Article;
use App\Models\Attendance;
use App\Models\Booking;
use App\Models\Communication;
use App\Models\Document;
use App\Models\Employee;
use App\Models\Evaluation;
use App\Models\Expense;
use App\Models\Lead;
use App\Models\LeaveRequest;
use App\Models\Message;
use App\Models\Offer;
use App\Models\Partner;
use App\Models\Payment;
use App\Models\Project;
use App\Models\Promo;
use App\Models\PropertyAttachment;
use App\Models\PropertyAudit;
use App\Models\PropertyFavorite;
use App\Models\PropertyNotification;
use App\Models\Report;
use App\Models\Schedule;
use App\Models\Service;
use App\Models\Task;
use App\Models\Ticket;
use App\Models\Unit;
use App\Models\User;
use App\Models\WorkspaceModel;
use App\Models\WorkspaceSetting;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PropertyRecords
{
    public const GROUPS = [
        'projects', 'units', 'bookings', 'payments', 'tasks', 'reports', 'leads',
        'employees', 'expenses', 'tickets', 'announcements', 'attendance', 'leave',
        'documents', 'services', 'partners', 'articles', 'audit', 'offers', 'promos',
        'communications', 'schedules', 'messages', 'notifications', 'evaluations',
    ];

    /**
     * @var array<string, class-string<WorkspaceModel>>
     */
    public const MODELS = [
        'projects' => Project::class,
        'units' => Unit::class,
        'bookings' => Booking::class,
        'payments' => Payment::class,
        'tasks' => Task::class,
        'reports' => Report::class,
        'leads' => Lead::class,
        'employees' => Employee::class,
        'expenses' => Expense::class,
        'tickets' => Ticket::class,
        'announcements' => Announcement::class,
        'attendance' => Attendance::class,
        'leave' => LeaveRequest::class,
        'documents' => Document::class,
        'services' => Service::class,
        'partners' => Partner::class,
        'articles' => Article::class,
        'audit' => PropertyAudit::class,
        'offers' => Offer::class,
        'promos' => Promo::class,
        'communications' => Communication::class,
        'schedules' => Schedule::class,
        'messages' => Message::class,
        'notifications' => PropertyNotification::class,
        'evaluations' => Evaluation::class,
        'settings' => WorkspaceSetting::class,
    ];

    private const FILES = [
        'payments' => 'proofData',
        'reports' => 'photoData',
        'documents' => 'fileData',
        'settings' => 'logoData',
        'promos' => 'promoImageData',
    ];

    public const ROLES = [
        'admin' => 'Administrator',
        'client' => 'Klien',
        'employee' => 'Karyawan',
        'director' => 'Pimpinan',
    ];

    /**
     * Resolve the Eloquent model class for a workspace resource group.
     *
     * @return class-string<WorkspaceModel>
     */
    public function modelClass(string $group): string
    {
        return self::MODELS[$group] ?? abort(404);
    }

    /**
     * Start a new Eloquent query builder for the resource group.
     *
     * @return Builder<WorkspaceModel>
     */
    public function query(string $group): Builder
    {
        abort_unless(in_array($group, self::GROUPS, true) || $group === 'settings', 404);
        $modelClass = $this->modelClass($group);

        return $modelClass::query();
    }

    public function row(string $group, string $id): WorkspaceModel
    {
        return $this->query($group)->where('id', $id)->first() ?? abort(404);
    }

    /**
     * Flatten a model row into the workspace JSON record format.
     *
     * @return array<string, mixed>
     */
    public function data(string $group, WorkspaceModel $row): array
    {
        $data = is_array($row->payload) ? $row->payload : [];
        $modelClass = $this->modelClass($group);
        foreach ($modelClass::payloadLinks() as $field => $column) {
            $data[$field] = $row->{$column} ?? '';
        }

        return ['id' => $row->id, ...$data];
    }

    /**
     * Create or update a workspace record along with relational columns and attachments.
     *
     * @param  array<string, mixed>  $record
     * @param  array<string, mixed>  $columns
     */
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
        $modelClass = $this->modelClass($group);
        foreach ($modelClass::payloadLinks() as $key => $column) {
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

        /** @var WorkspaceModel $model */
        $model = $modelClass::query()->find($id) ?? new $modelClass(['id' => $id]);
        $model->fill([...$columns, 'payload' => $record]);
        $model->save();
    }

    public function delete(string $group, string $id): void
    {
        $this->query($group)->where('id', $id)->delete();
        PropertyAttachment::query()->where('resource', $group)->where('record_id', $id)->delete();
        if (in_array($group, ['projects', 'units'], true)) {
            PropertyFavorite::query()->where('property_id', $id)->delete();
        }
    }

    public function identifier(string $prefix): string
    {
        return $prefix.'-'.Str::lower((string) Str::ulid());
    }

    public function today(): string
    {
        return now(PaymentCalculator::TIMEZONE)->toDateString();
    }

    public function notify(string $audience, string $title, string $message, ?int $client = null, ?string $employee = null): void
    {
        $this->put('notifications', $this->identifier('NT'), [
            'title' => $title,
            'message' => $message,
            'date' => $this->today(),
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
        $imageOnly = in_array($group, ['reports', 'settings', 'promos'], true);
        if ($content === false || strlen($content) > 2_097_152 || (new \finfo(FILEINFO_MIME_TYPE))->buffer($content) !== $mime || ($imageOnly && ! str_starts_with($mime, 'image/'))) {
            throw ValidationException::withMessages([$field => 'Isi dan jenis lampiran tidak sesuai.']);
        }
        if (str_starts_with($mime, 'image/')) {
            $dimensions = @getimagesizefromstring($content);
            if (! $dimensions || $dimensions[0] * $dimensions[1] > 24_000_000) {
                throw ValidationException::withMessages([$field => 'Dimensi gambar tidak dapat digunakan.']);
            }
        }

        $attachment = PropertyAttachment::query()->firstOrNew([
            'resource' => $group,
            'record_id' => $id,
            'field' => $field,
        ]);
        $attachment->fill([
            'id' => (string) Str::uuid(),
            'mime' => $mime,
            'content' => $parts[2],
        ]);
        $attachment->save();
    }
}
