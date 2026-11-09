<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Database\Query\Builder;
use Illuminate\Support\Facades\DB;

class PropertyState
{
    private const PUBLIC_GROUPS = ['projects', 'units', 'services', 'partners', 'articles'];

    private const ROLE_GROUPS = [
        'client' => ['bookings', 'payments', 'reports', 'tickets', 'documents', 'notifications'],
        'employee' => ['employees', 'tasks', 'reports', 'schedules', 'attendance', 'leave', 'announcements', 'messages', 'notifications'],
        'director' => ['bookings', 'payments', 'tasks', 'reports', 'leads', 'employees', 'expenses', 'announcements', 'attendance', 'leave', 'documents', 'audit', 'schedules', 'messages', 'notifications', 'evaluations', 'tickets'],
    ];

    public function __construct(private readonly PropertyRecords $records) {}

    public function visible(string $group, ?User $user): Builder
    {
        $query = $this->records->query($group);
        if ($user?->role === 'admin') {
            return $query;
        }

        $public = in_array($group, self::PUBLIC_GROUPS, true);
        if (! $public && ! in_array($group, self::ROLE_GROUPS[$user?->role] ?? [], true)) {
            return $query->whereRaw('1 = 0');
        }

        if ($group === 'notifications') {
            return $query->where('audience', $user->role)
                ->where(fn (Builder $q) => $q->whereNull('client_id')->orWhere('client_id', $user->id))
                ->where(fn (Builder $q) => $q->whereNull('employee_id')->orWhere('employee_id', $user->employee_id));
        }
        if ($user?->role === 'director' && $group === 'tickets') {
            return $query->where('payload->category', 'Perubahan desain');
        }

        if ($user?->role === 'client') {
            $bookings = $this->records->query('bookings')->where('client_id', $user->id);

            return match ($group) {
                'bookings', 'tickets' => $query->where('client_id', $user->id),
                'payments' => $query->whereIn('booking_id', $bookings->select('id')),
                'documents' => $query->whereIn('booking_id', $bookings->select('id'))
                    ->whereIn('payload->status', ['Tersedia', 'Disetujui']),
                'reports' => $query->whereIn('unit_id', $bookings->whereNotNull('reserved_unit')->select('unit_id'))
                    ->where('payload->status', 'Disetujui'),
                default => $query,
            };
        }

        if ($user?->role === 'employee') {
            $units = $this->records->query('tasks')->where('employee_id', $user->employee_id)->select('unit_id')
                ->union($this->records->query('schedules')->where('employee_id', $user->employee_id)->select('unit_id'))
                ->union($this->records->query('reports')->where('employee_id', $user->employee_id)->select('unit_id'));

            return match ($group) {
                'employees' => $query->where('id', $user->employee_id),
                'tasks', 'reports', 'schedules', 'attendance', 'leave' => $query->where('employee_id', $user->employee_id),
                'units' => $query->whereIn('id', $units),
                'projects' => $query->whereIn('id', $this->records->query('units')->whereIn('id', $units)->select('project_id')),
                'announcements' => $query->whereIn('payload->audience', [
                    'Semua karyawan',
                    $this->records->data('employees', $this->records->row('employees', $user->employee_id))['division'],
                ]),
                default => $query,
            };
        }

        return $query;
    }

    public function snapshot(?User $user, bool $workspace, array $guestFavorites = []): array
    {
        $viewer = $workspace ? $user : null;
        $data = [];
        $files = [];
        $rows = [];
        $visibleGroups = match ($viewer?->role) {
            'admin' => PropertyRecords::GROUPS,
            default => [...self::PUBLIC_GROUPS, ...(self::ROLE_GROUPS[$viewer?->role] ?? [])],
        };
        foreach ($visibleGroups as $group) {
            $query = $this->visible($group, $viewer)->orderByDesc('created_at')
                ->orderBy('id', $group === 'audit' ? 'desc' : 'asc');
            $rows[$group] = ($group === 'audit' ? $query->limit(150) : $query)->get();
        }

        $userIds = collect(['bookings', 'tickets', 'notifications', 'messages'])
            ->flatMap(fn (string $group) => ($rows[$group] ?? collect())->map(fn ($row) => $row->client_id ?? $row->author_id ?? null))
            ->filter()->unique();
        $names = User::query()->whereIn('id', $userIds)->pluck('name', 'id');
        $employeeNames = ($rows['employees'] ?? collect())->mapWithKeys(fn ($row) => [
            $row->id => $this->records->data('employees', $row)['name'],
        ]);
        $bookings = ($rows['bookings'] ?? collect())->keyBy('id');
        $reads = $viewer ? DB::table('property_notification_reads')->where('user_id', $viewer->id)->pluck('notification_id')->flip() : collect();

        $files['settings']['company'] = $this->attachments('settings', ['company'])['company'] ?? [];
        foreach (['payments', 'reports', 'documents'] as $group) {
            if (isset($rows[$group]) && ! ($group === 'payments' && $viewer?->role === 'director')) {
                $files[$group] = $this->attachments($group, $rows[$group]->pluck('id')->all());
            }
        }
        foreach (PropertyRecords::GROUPS as $group) {
            $data[$group] = ($rows[$group] ?? collect())->map(function ($row) use ($group, $names, $employeeNames, $bookings, $reads, $files, $viewer): array {
                $record = $this->records->data($group, $row);
                if (isset($row->employee_id) && $group !== 'notifications') {
                    $record['employee'] = $employeeNames[$row->employee_id] ?? 'Tim lapangan';
                    $record['employeeId'] = $row->employee_id;
                }
                if (isset($row->client_id) || isset($row->booking_id)) {
                    $owner = $row->client_id ?? $bookings->get($row->booking_id)?->client_id;
                    $record['client'] = $names[$owner] ?? '';
                    if ($viewer?->role === 'admin') {
                        $record['clientId'] = $owner;
                    }
                }
                if ($group === 'messages' && isset($row->author_id)) {
                    $record['name'] = $names[$row->author_id] ?? 'Tim LinyJaya';
                }
                if ($group === 'notifications') {
                    $record['role'] = PropertyRecords::ROLES[$row->audience];
                    $record['status'] = $reads->has($row->id) ? 'Dibaca' : 'Baru';
                }
                if ($group === 'reports' && $viewer?->role === 'client') {
                    unset($record['issue'], $record['employeeId']);
                }

                return [...$record, ...($files[$group][$row->id] ?? [])];
            })->all();
        }
        $company = $this->records->data('settings', $this->records->row('settings', 'company'));
        $settings = $viewer ? $this->records->data('settings', $this->records->row('settings', 'workspace')) : [];
        unset($company['id'], $settings['id']);

        $data['company'] = [...$company, ...$files['settings']['company']];
        $data['settings'] = $settings;
        $data['profile'] = $viewer ? $this->profile($viewer) : (object) [];
        $data['account'] = $viewer ? ['name' => $viewer->name, 'email' => $viewer->email] : (object) [];
        $data['accounts'] = $viewer?->role === 'admin' ? User::query()->whereNull('archived_at')->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'active', 'employee_id'])->map(fn (User $account): array => [
                'id' => (string) $account->id, 'name' => $account->name, 'email' => $account->email,
                'role' => PropertyRecords::ROLES[$account->role], 'status' => $account->active ? 'Aktif' : 'Nonaktif',
                'employeeId' => $account->employee_id ?? '',
            ])->all() : [];
        $data['clients'] = $viewer?->role === 'admin' ? User::query()->where('role', 'client')
            ->get(['id', 'name', 'email', 'phone', 'address', 'notifications_enabled'])->map(fn (User $client): array => [
                'id' => $client->id, ...$this->profile($client),
            ])->all() : [];
        $data['favorites'] = $user ? DB::table('property_favorites')->where('user_id', $user->id)->pluck('property_id')->all() : $guestFavorites;

        return $data;
    }

    public function version(): int
    {
        return (int) DB::table('property_revisions')->where('id', 1)->value('version');
    }

    private function profile(User $user): array
    {
        return [
            'name' => $user->name, 'email' => $user->email, 'phone' => $user->phone ?? '',
            'address' => $user->address ?? '', 'notifications' => (bool) $user->notifications_enabled,
        ];
    }

    private function attachments(string $group, array $recordIds): array
    {
        $result = [];
        foreach (DB::table('property_attachments')->where('resource', $group)->whereIn('record_id', $recordIds)
            ->get(['id', 'record_id', 'field', 'mime']) as $attachment) {
            $result[$attachment->record_id][$attachment->field] = route('property.attachment', $attachment->id);
            $result[$attachment->record_id][$attachment->field.'Mime'] = $attachment->mime;
        }

        return $result;
    }
}
