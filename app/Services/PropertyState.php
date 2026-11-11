<?php

namespace App\Services;

use App\Models\Promo;
use App\Models\PropertyAttachment;
use App\Models\PropertyRevision;
use App\Models\User;
use App\Models\WorkspaceModel;
use Illuminate\Database\Eloquent\Builder;

class PropertyState
{
    private const PUBLIC_GROUPS = ['projects', 'units', 'services', 'partners', 'articles', 'promos'];

    private const ROLE_GROUPS = [
        'client' => ['bookings', 'payments', 'reports', 'tickets', 'documents', 'notifications'],
        'employee' => ['employees', 'tasks', 'reports', 'schedules', 'attendance', 'leave', 'announcements', 'messages', 'evaluations', 'notifications'],
        'director' => ['bookings', 'payments', 'tasks', 'reports', 'leads', 'employees', 'expenses', 'announcements', 'attendance', 'leave', 'documents', 'audit', 'schedules', 'messages', 'notifications', 'evaluations', 'tickets'],
    ];

    public function __construct(
        private readonly PropertyRecords $records,
        private readonly PaymentCalculator $calculator,
    ) {}

    /**
     * Build the authorized query for a resource group scoped to the given user.
     *
     * @return Builder<WorkspaceModel>
     */
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

        if ($group === 'promos') {
            return Promo::query()->active();
        }

        if ($group === 'notifications') {
            return $query->where('audience', $user->role)
                ->where(fn (Builder $q): Builder => $q->whereNull('client_id')->orWhere('client_id', $user->id))
                ->where(fn (Builder $q): Builder => $q->whereNull('employee_id')->orWhere('employee_id', $user->employee_id));
        }

        if ($user?->role === 'director' && $group === 'tickets') {
            return $query->where('payload->category', 'Perubahan desain');
        }

        if ($user?->role === 'client') {
            $bookingIds = $this->records->query('bookings')->where('client_id', $user->id)->toBase()->select('id');
            $unitIds = $this->records->query('bookings')->where('client_id', $user->id)->whereNotNull('reserved_unit')->toBase()->select('unit_id');

            return match ($group) {
                'bookings', 'tickets' => $query->where('client_id', $user->id),
                'payments' => $query->whereIn('booking_id', $bookingIds),
                'documents' => $query->whereIn('booking_id', $bookingIds)
                    ->whereIn('payload->status', ['Tersedia', 'Disetujui']),
                'reports' => $query->whereIn('unit_id', $unitIds)
                    ->where('payload->status', 'Disetujui'),
                default => $query,
            };
        }

        if ($user?->role === 'employee') {
            $units = $this->records->query('tasks')->where('employee_id', $user->employee_id)->toBase()->select('unit_id')
                ->union($this->records->query('schedules')->where('employee_id', $user->employee_id)->toBase()->select('unit_id'))
                ->union($this->records->query('reports')->where('employee_id', $user->employee_id)->toBase()->select('unit_id'));

            return match ($group) {
                'employees' => $query->where('id', $user->employee_id),
                'tasks', 'reports', 'schedules', 'attendance', 'leave', 'evaluations' => $query->where('employee_id', $user->employee_id),
                'units' => $query->whereIn('id', $units),
                'projects' => $query->whereIn('id', $this->records->query('units')->whereIn('id', $units)->toBase()->select('project_id')),
                'announcements' => $query->whereIn('payload->audience', [
                    'Semua karyawan',
                    $this->records->data('employees', $this->records->row('employees', $user->employee_id))['division'],
                ]),
                default => $query,
            };
        }

        return $query;
    }

    /**
     * Build the role-filtered workspace data snapshot for the frontend bootstrap and polling API.
     *
     * @param  list<string>  $guestFavorites
     * @return array<string, mixed>
     */
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
            ->flatMap(fn (string $group) => ($rows[$group] ?? collect())->map(fn (WorkspaceModel $row) => $row->client_id ?? $row->author_id ?? null))
            ->filter()->unique();
        $usersById = User::query()->whereIn('id', $userIds)->get(['id', 'name', 'role'])->keyBy('id');
        $names = $usersById->map(fn (User $account): string => $account->name);
        $employeeNames = ($rows['employees'] ?? collect())->mapWithKeys(fn (WorkspaceModel $row): array => [
            $row->id => $this->records->data('employees', $row)['name'],
        ]);
        $bookings = ($rows['bookings'] ?? collect())->keyBy('id');
        $reads = $viewer ? $viewer->readNotifications()->pluck('property_notifications.id')->flip() : collect();

        $files['settings']['company'] = $this->attachments('settings', ['company'])['company'] ?? [];
        foreach (['payments', 'reports', 'documents', 'promos'] as $group) {
            if (isset($rows[$group]) && ! ($group === 'payments' && $viewer?->role === 'director')) {
                $files[$group] = $this->attachments($group, $rows[$group]->pluck('id')->all());
            }
        }
        foreach (PropertyRecords::GROUPS as $group) {
            $data[$group] = ($rows[$group] ?? collect())->map(function (WorkspaceModel $row) use ($group, $usersById, $names, $employeeNames, $bookings, $reads, $files, $viewer): array {
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
                    $author = $usersById->get($row->author_id);
                    $record['name'] = $author?->name ?? 'Tim LinyJaya';
                    $record['senderRole'] = $author ? (PropertyRecords::ROLES[$author->role] ?? '') : '';
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
        $data['paymentConfig'] = $this->calculator->config();
        $data['profile'] = $viewer ? $this->profile($viewer) : (object) [];
        $data['account'] = $viewer ? ['name' => $viewer->name, 'email' => $viewer->email] : (object) [];
        $data['accounts'] = $viewer?->role === 'admin' ? User::query()->whereNull('archived_at')->orderBy('name')
            ->get(['id', 'name', 'email', 'role', 'active', 'employee_id'])->map(fn (User $account): array => [
                'id' => (string) $account->id,
                'name' => $account->name,
                'email' => $account->email,
                'role' => PropertyRecords::ROLES[$account->role],
                'status' => $account->active ? 'Aktif' : 'Nonaktif',
                'employeeId' => $account->employee_id ?? '',
            ])->all() : [];
        $data['clients'] = $viewer?->role === 'admin' ? User::query()->clients()->orderBy('name')
            ->get(['id', 'name', 'email', 'phone', 'address', 'notifications_enabled'])->map(fn (User $client): array => [
                'id' => $client->id,
                ...$this->profile($client),
            ])->all() : [];
        $data['favorites'] = $user ? $user->favorites()->pluck('property_id')->all() : $guestFavorites;

        return $data;
    }

    public function version(): int
    {
        return (int) PropertyRevision::query()->where('id', 1)->value('version');
    }

    /**
     * @return array{name: string, email: string, phone: string, address: string, notifications: bool}
     */
    private function profile(User $user): array
    {
        return [
            'name' => $user->name,
            'email' => $user->email,
            'phone' => $user->phone ?? '',
            'address' => $user->address ?? '',
            'notifications' => (bool) $user->notifications_enabled,
        ];
    }

    /**
     * @param  list<string>  $recordIds
     * @return array<string, array<string, string>>
     */
    private function attachments(string $group, array $recordIds): array
    {
        if ($recordIds === []) {
            return [];
        }

        $result = [];
        foreach (PropertyAttachment::query()->where('resource', $group)->whereIn('record_id', $recordIds)
            ->get(['id', 'record_id', 'field', 'mime']) as $attachment) {
            $result[$attachment->record_id][$attachment->field] = route('property.attachment', $attachment->id);
            $result[$attachment->record_id][$attachment->field.'Mime'] = $attachment->mime;
        }

        return $result;
    }
}
