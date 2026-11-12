<?php

namespace App\Services;

use App\Models\PropertyAttachment;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class PropertyChanges
{
    private const ADMIN_CRUD = [
        'projects', 'units', 'services', 'partners', 'leads', 'offers', 'promos',
        'communications', 'expenses', 'employees', 'tasks', 'schedules', 'evaluations',
        'articles', 'notifications',
    ];

    public function __construct(
        private readonly PropertyRecords $records,
        private readonly PropertyState $state,
        private readonly PaymentCalculator $calculator,
    ) {}

    public function apply(?User $user, bool $workspace, array $change): void
    {
        $group = $change['resource'];
        $id = $change['id'];
        $operation = $change['operation'];
        $fields = $change['fields'] ?? [];
        $role = $workspace ? $user?->role : null;
        abort_if($workspace && ! $user, 401);

        if ($group === 'profile') {
            abort_unless(in_array($role, ['admin', 'director', 'client', 'employee'], true) && $operation === 'update' && $id === 'self', 403);
            $this->updateProfile($user, $fields);

            return;
        }

        if (in_array($group, ['company', 'settings'], true)) {
            abort_unless($role === 'admin' && $operation === 'update' && $id === $group, 403);
            $this->updateSettings($group, $fields);

            return;
        }

        if ($group === 'paymentConfig') {
            abort_unless($role === 'admin' && $operation === 'update' && $id === 'payment_methods', 403);
            $this->updatePaymentConfig($fields);

            return;
        }

        if ($group === 'accounts') {
            abort_unless($role === 'admin', 403);
            $this->account($user, $operation, $id, $fields);

            return;
        }

        if ($group === 'leads' && (! $role || $role === 'client' ||
            ($operation === 'create' && ! array_key_exists('status', $fields)))) {
            abort_unless($operation === 'create', 403);
            $this->consultation($id, $fields);

            return;
        }

        $fullCrud = ($role === 'admin' && in_array($group, self::ADMIN_CRUD, true))
            || ($role === 'director' && in_array($group, ['tasks', 'evaluations', 'announcements'], true));

        if ($fullCrud) {
            $this->manage($group, $operation, $id, $fields);

            return;
        }

        $allowed = match ($role) {
            'admin' => ['payments' => 'create', 'documents' => 'create', 'tickets' => 'update', 'leave' => 'update', 'messages' => ['create', 'update']],
            'director' => ['projects' => 'update', 'expenses' => 'update', 'documents' => 'update', 'tickets' => 'update', 'leave' => 'update', 'messages' => ['create', 'update']],
            'employee' => ['messages' => 'create', 'reports' => ['create', 'update'], 'leave' => 'create'],
            'client' => ['tickets' => 'create'],
            default => [],
        };
        abort_unless(in_array($operation, (array) ($allowed[$group] ?? []), true), 403);

        if ($operation === 'create') {
            $this->createOperational($user, $group, $id, $fields);

            return;
        }

        $row = $this->state->visible($group, $user)->where('id', $id)->first() ?? abort(404);
        $data = $this->records->data($group, $row);
        if ($group === 'reports') {
            $this->saveReport($user, $id, $fields, $data);

            return;
        }
        $rules = match ($group) {
            'projects' => ['status' => config('linyjaya_fields.projects.status'), 'evaluation' => ['required', 'string', 'max:3000']],
            'tickets' => ['status' => ['required', 'in:Baru,Diproses,Disetujui,Ditolak,Selesai'], 'reply' => ['required', 'string', 'max:3000']],
            'messages' => ['status' => ['required', 'in:Baru,Diproses,Selesai'], 'reply' => ['nullable', 'string', 'max:3000']],
            default => ['status' => ['required', 'in:Disetujui,Ditolak']],
        };
        if (in_array($group, ['expenses', 'documents', 'leave'], true)) {
            $this->assert($data['status'] === 'Menunggu persetujuan', 'Catatan telah ditinjau.');
        }
        if ($role === 'director' && $group === 'tickets') {
            abort_unless($data['category'] === 'Perubahan desain', 404);
        }
        $this->records->put($group, $id, [...$data, ...$this->validate($fields, $rules, true)]);
        if ($group === 'messages' && $row->author_id) {
            $author = User::query()->find($row->author_id);
            if ($author?->role === 'employee' && $author->employee_id) {
                $this->records->notify('employee', 'Tanggapan pesan internal', $data['subject'], employee: $author->employee_id);
            }
        }
        if ($group === 'tickets') {
            $this->records->notify('client', 'Tanggapan layanan diperbarui', $data['title'], $row->client_id);
        }
        if ($group === 'documents') {
            $booking = $this->records->row('bookings', $row->booking_id);
            $this->records->notify('client', 'Keputusan dokumen dicatat', $data['title'], $booking->client_id);
        }
        if ($group === 'leave') {
            $this->records->notify('employee', 'Keputusan izin atau cuti', 'Pengajuan '.$id.' telah ditinjau.', employee: $row->employee_id);
        }
    }

    private function manage(string $group, string $operation, string $id, array $fields): void
    {
        $query = $this->records->query($group);
        $creating = $operation === 'create';
        $row = $query->where('id', $id)->first();
        if ($creating) {
            $this->assert(! $row, 'Identitas catatan sudah digunakan.');
        } else {
            abort_unless($row, 404);
        }
        $before = $row ? $this->records->data($group, $row) : [];
        if ($operation === 'delete') {
            $this->assert($group !== 'expenses' || $before['status'] !== 'Disetujui', 'Pengeluaran yang disetujui harus dipertahankan.');
            $this->records->delete($group, $id);

            return;
        }

        $rules = config("linyjaya_fields.$group");
        if ($group === 'projects') {
            $rules['facilities.*'] = ['required', 'string', 'max:200'];
            $rules['evaluation'] = ['nullable', 'string', 'max:3000'];
        }
        if ($group === 'notifications') {
            $rules['role'] = ['required', Rule::in(PropertyRecords::ROLES)];
        }
        if ($group === 'leads') {
            $rules['project'][0] = 'nullable';
        }
        if ($group === 'promos') {
            $rules['eligibleMethods.*'] = ['required', 'string', Rule::in(PaymentCalculator::CANONICAL_METHODS)];
        }
        $patch = $this->validate($fields, $rules, ! $creating);
        $data = [...$before, ...$patch];
        $columns = [];

        if ($group === 'units') {
            if (! $creating && $before['sale'] !== 'Tersedia') {
                foreach (['price', 'project', 'block', 'number', 'type', 'land', 'building', 'floors'] as $field) {
                    $this->assert($before[$field] === $data[$field], 'Harga dan spesifikasi unit yang terikat pemesanan harus dipertahankan.');
                }
            }
            $this->assert($data['land'] >= $data['building'] / $data['floors'], 'Luas lantai dasar tidak boleh melebihi luas tanah.');
            $this->assert(! $this->records->query('units')->where('project_id', $data['project'])
                ->where('block_key', strtolower($data['block']))->where('number_key', strtolower($data['number']))
                ->where('id', '!=', $id)->exists(), 'Nomor kavling sudah digunakan.');
            if ($creating) {
                $data += ['sale' => 'Tersedia', 'construction' => 'Belum dibangun', 'progress' => 0, 'stage' => 'Persiapan'];
            }
        }
        if ($group === 'projects' && $creating) {
            $data['tag'] = $data['category'];
        }
        if ($group === 'promos') {
            $data = $this->normalizePromoData($data, $patch);
        }
        if ($group === 'partners') {
            $data = $this->normalizePartnerData($data, $patch, $id);
        }
        if (in_array($group, ['promos', 'schedules'], true)) {
            $this->assert($data['end'] >= $data['start'], 'Tanggal selesai harus sesudah tanggal mulai.');
        }
        if (in_array($group, ['tasks', 'schedules', 'evaluations'], true)) {
            $columns['employee_id'] = $patch['employee'] ?? $row?->employee_id;
            unset($data['employee']);
            if ($group === 'tasks' && isset($patch['employee'])) {
                $employee = $this->records->data('employees', $this->records->row('employees', $patch['employee']));
                $this->assert($employee['status'] === 'Aktif', 'Penugasan memerlukan karyawan aktif.');
            }
        }
        if ($group === 'expenses') {
            $this->assert($creating || $before['status'] !== 'Disetujui', 'Anggaran yang disetujui tidak dapat diubah.');
            $data['status'] = 'Menunggu persetujuan';
        }
        if ($group === 'notifications') {
            $columns['audience'] = isset($patch['role']) ? array_search($patch['role'], PropertyRecords::ROLES, true) : $row->audience;
            if ($row && $row->audience !== $columns['audience']) {
                $this->assert(! $row->client_id && ! $row->employee_id, 'Penerima notifikasi pribadi tidak dapat diganti.');
            }
            unset($data['role']);
            $data['date'] ??= $this->records->today();
        }
        $this->records->put($group, $id, $data, $columns);
        if ($group === 'employees') {
            $account = User::query()->where('employee_id', $id)->first();
            if ($account) {
                Validator::make(['email' => $data['email']], ['email' => [Rule::unique('users')->ignore($account)]])->validate();
                $account->forceFill([
                    'name' => $data['name'],
                    'email' => $data['email'],
                    ...($account->email !== $data['email'] ? ['email_verified_at' => null] : []),
                    ...($data['status'] === 'Nonaktif' ? ['active' => false, 'remember_token' => null] : []),
                ])->save();
                if (! $account->active) {
                    DB::table('sessions')->where('user_id', $account->id)->delete();
                }
            }
        }
    }

    private function createOperational(User $user, string $group, string $id, array $fields): void
    {
        $this->assert(! $this->records->query($group)->where('id', $id)->exists(), 'Identitas catatan sudah digunakan.');
        $today = $this->records->today();
        if ($group === 'reports') {
            $this->saveReport($user, $id, $fields);

            return;
        }
        if ($group === 'payments') {
            $this->createBill($id, $fields);

            return;
        }
        if ($group === 'documents') {
            $data = $this->validate($fields, [
                'booking' => ['required', 'string', 'exists:bookings,id'], 'title' => ['required', 'string', 'max:240'],
                'kind' => ['required', 'in:Perjanjian,Administrasi,Teknis,Serah terima'],
                'fileData' => ['nullable', 'string', 'max:2800000'],
            ]);
            $booking = $this->records->row('bookings', $data['booking']);
            $this->assert($booking->reserved_unit !== null, 'Pemesanan telah dibatalkan.');
            $this->records->put($group, $id, [...$data, 'date' => $today, 'status' => 'Menunggu persetujuan']);
            $this->records->notify('director', 'Dokumen perlu peninjauan', $data['title']);

            return;
        }
        if ($group === 'messages') {
            $data = $this->validate($fields, config('linyjaya_fields.messages'));
            $this->records->put($group, $id, [...$data, 'date' => $today, 'status' => 'Baru', 'reply' => ''], ['author_id' => $user->id]);
            if ($user->role === 'employee') {
                $this->records->notify('admin', 'Pesan tim internal', $data['subject']);
                $this->records->notify('director', 'Pesan tim internal', $data['subject']);
            } else {
                $this->records->notify('employee', 'Pesan manajemen baru', $data['subject']);
            }

            return;
        }
        if ($group === 'leave') {
            $data = $this->validate($fields, [
                'date' => ['required', 'date_format:Y-m-d', 'after_or_equal:'.$today],
                'kind' => ['required', 'in:Izin,Cuti,Sakit'], 'reason' => ['required', 'string', 'max:3000'],
            ]);
            $this->records->put($group, $id, [...$data, 'status' => 'Menunggu persetujuan'], ['employee_id' => $user->employee_id]);
            $this->records->notify('admin', 'Pengajuan izin atau cuti', $user->name.' · '.$data['date']);

            return;
        }
        $data = $this->validate($fields, [
            'title' => ['required', 'string', 'max:240'],
            'category' => ['required', 'in:Konsultasi marketing,Pertanyaan,Komplain,Perubahan desain'],
            'message' => ['required', 'string', 'max:3000'],
        ]);
        $this->records->put('tickets', $id, [...$data, 'date' => $today, 'status' => 'Baru', 'reply' => ''], ['client_id' => $user->id]);
        $this->records->notify($data['category'] === 'Perubahan desain' ? 'director' : 'admin', 'Permintaan layanan baru', $data['title']);
    }

    private function createBill(string $id, array $fields): void
    {
        $data = $this->validate($fields, [
            'booking' => ['required', 'string', 'exists:bookings,id'], 'kind' => ['required', 'in:Termin 2,Termin 3,Pelunasan'],
            'amount' => ['required', 'integer', 'min:1', 'max:1000000000000'], 'due' => ['required', 'date_format:Y-m-d'],
        ]);
        $booking = $this->records->data('bookings', $this->records->row('bookings', $data['booking']));
        $this->assert($booking['status'] === 'DP terverifikasi', 'Termin lanjutan tersedia setelah DP terverifikasi.');
        $unit = $this->records->data('units', $this->records->row('units', $booking['unit']));
        $contractTarget = (int) ($booking['contractPrice'] ?? $booking['finalPrice'] ?? $unit['price']);
        $total = $this->records->query('payments')->where('booking_id', $data['booking'])->where('payload->status', '!=', 'Dibatalkan')->get()
            ->sum(fn ($row) => $this->records->data('payments', $row)['amount']);
        $this->assert($data['amount'] <= $contractTarget - $total, 'Jumlah melebihi sisa tagihan unit.');
        $this->records->put('payments', $id, [...$data, 'date' => '', 'proof' => '', 'status' => 'Belum dibayar']);
    }

    private function saveReport(User $user, string $id, array $fields, array $before = []): void
    {
        if ($before) {
            $this->assert($before['status'] === 'Perlu revisi', 'Hanya laporan yang diminta revisi dapat disunting.');
        }
        $data = [...$before, ...$this->validate($fields, [
            'unit' => ['required', 'string', 'exists:units,id'],
            'title' => ['required', 'string', 'max:240'],
            'date' => ['required', 'date_format:Y-m-d', 'before_or_equal:'.$this->records->today()],
            'stage' => ['required', 'in:Persiapan,Pondasi,Struktur & dinding,Atap & instalasi,Finishing'],
            'progress' => ['required', 'integer', 'between:0,100'], 'description' => ['required', 'string', 'max:3000'],
            'issue' => ['required', 'string', 'max:3000'], 'photoData' => ['nullable', 'string', 'max:2800000'],
        ], (bool) $before)];
        abort_unless($this->records->query('tasks')->where('unit_id', $data['unit'])->where('employee_id', $user->employee_id)->exists(), 404);
        $unit = $this->records->data('units', $this->records->row('units', $data['unit']));
        $this->assert($unit['sale'] === 'DP terverifikasi' && $unit['construction'] === 'Dalam pembangunan', 'Unit belum dalam pembangunan aktif.');
        $this->assert($data['progress'] >= $unit['progress'], 'Progres tidak boleh lebih rendah dari progres saat ini.');
        $this->assert($data['progress'] !== 100 || $data['stage'] === 'Finishing', 'Pilih Finishing untuk progres 100%.');
        $this->records->put('reports', $id, [...$data, 'status' => 'Menunggu persetujuan', 'image' => 'construction'], ['employee_id' => $user->employee_id]);
        $this->records->notify('director', 'Laporan pembangunan perlu ditinjau', $data['title']);
    }

    private function consultation(string $id, array $fields): void
    {
        $this->assert(! $this->records->query('leads')->where('id', $id)->exists(), 'Identitas catatan sudah digunakan.');
        $rules = config('linyjaya_fields.leads');
        unset($rules['status']);
        $rules['interest'] = ['required', 'string', 'max:240'];
        $rules['project'][0] = 'nullable';
        $rules['unit'] = ['nullable', 'string', 'exists:units,id'];
        $rules['date'][] = 'after_or_equal:'.$this->records->today();
        $data = $this->validate($fields, $rules);
        if (! empty($data['unit'])) {
            $unit = $this->records->row('units', $data['unit']);
            $this->assert(empty($data['project']) || $data['project'] === $unit->project_id, 'Unit tidak berada di proyek ini.');
            $data['project'] = $unit->project_id;
        }
        $this->records->put('leads', $id, [...$data, 'status' => 'Baru']);
        $this->records->notify('admin', 'Permintaan konsultasi properti', $data['name']);
    }

    private function updateProfile(User $user, array $fields): void
    {
        $data = $this->validate($fields, [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:240', Rule::unique('users')->ignore($user)],
            'phone' => ['nullable', 'string', 'max:50'], 'address' => ['nullable', 'string', 'max:500'],
            'notifications' => ['required', 'boolean'],
            'currentPassword' => ['nullable', 'string', 'max:72'],
        ], true);
        if (isset($data['email']) && $data['email'] !== $user->email) {
            $this->assert(Hash::check($data['currentPassword'] ?? '', $user->password), 'Masukkan kata sandi saat ini untuk mengubah email.');
            $data['email_verified_at'] = null;
        }
        unset($data['currentPassword']);
        if (array_key_exists('notifications', $data)) {
            $data['notifications_enabled'] = $data['notifications'];
            unset($data['notifications']);
        }
        $user->forceFill($data)->save();
        if ($user->role === 'employee') {
            $employee = $this->records->data('employees', $this->records->row('employees', $user->employee_id));
            $this->records->put('employees', $user->employee_id, [
                ...$employee, 'name' => $user->name, 'email' => $user->email,
                'phone' => $user->phone ?? '', 'address' => $user->address ?? '',
                'notifications' => $user->notifications_enabled,
            ]);
        }
    }

    private function updateSettings(string $group, array $fields): void
    {
        $id = $group === 'company' ? 'company' : 'workspace';
        $rules = $group === 'company' ? [
            'name' => ['required', 'string', 'max:160'], 'tagline' => ['required', 'string', 'max:240'],
            'email' => ['required', 'email:rfc', 'max:240'], 'phone' => ['required', 'string', 'max:50'],
            'address' => ['required', 'string', 'max:500'], 'vision' => ['required', 'string', 'max:3000'],
            'mission' => ['required', 'string', 'max:3000'], 'logoData' => ['required', 'string', 'max:2800000'],
            'hours' => ['required', 'string', 'max:240'],
        ] : ['notifications' => ['required', 'boolean']];
        $before = $this->records->data('settings', $this->records->row('settings', $id));
        $data = [...$before, ...$this->validate($fields, $rules, true)];
        if ($group === 'company' && isset($fields['phone'])) {
            $phone = preg_replace('/\D/', '', $data['phone']);
            $data['whatsapp'] = str_starts_with($phone, '0') ? '62'.substr($phone, 1) : $phone;
        }
        $this->records->put('settings', $id, $data);
    }

    private function account(User $actor, string $operation, string $id, array $fields): void
    {
        $creating = $operation === 'create';
        $account = $creating ? new User : User::query()->whereNull('archived_at')->findOrFail($id);
        if ($operation === 'delete') {
            abort_if($actor->is($account), 403, 'Akun Anda sendiri tidak dapat diarsipkan.');
            $account->forceFill(['active' => false, 'archived_at' => now(), 'employee_id' => null, 'remember_token' => null])->save();
            DB::table('sessions')->where('user_id', $account->id)->delete();

            return;
        }
        $data = $this->validate($fields, [
            'name' => ['required', 'string', 'max:120'],
            'email' => ['required', 'email:rfc', 'max:240', $creating ? Rule::unique('users') : Rule::unique('users')->ignore($account)],
            'role' => ['required', Rule::in(PropertyRecords::ROLES)], 'status' => ['required', 'in:Aktif,Nonaktif'],
            'password' => [$creating ? 'required' : 'nullable', 'string', 'min:12', 'max:72'],
            'employeeId' => ['nullable', 'string', 'exists:employees,id'],
        ], ! $creating);
        $role = isset($data['role']) ? array_search($data['role'], PropertyRecords::ROLES, true) : $account->role;
        $active = isset($data['status']) ? $data['status'] === 'Aktif' : $account->active;
        abort_if($actor->is($account) && ($role !== 'admin' || ! $active), 403, 'Akses Administrator Anda harus tetap aktif.');
        $employeeId = $role === 'employee' ? ($data['employeeId'] ?? $account->employee_id) : null;
        if ($role === 'employee') {
            $this->assert((bool) $employeeId, 'Pilih data karyawan untuk akun ini.');
            $employee = $this->records->data('employees', $this->records->row('employees', $employeeId));
            $this->assert(! $active || $employee['status'] === 'Aktif', 'Data karyawan harus aktif.');
            $this->assert(! User::query()->where('employee_id', $employeeId)->where('id', '!=', $account->id ?? 0)->exists(), 'Data karyawan sudah terhubung ke akun lain.');
        }
        $this->assert($creating || $account->role === $role || ! $this->records->query('bookings')->where('client_id', $account->id)->exists(), 'Akun yang memiliki pemesanan harus tetap berperan sebagai Klien.');
        $revoke = ! $creating && ($account->role !== $role || ! $active || ! empty($data['password']));
        $account->forceFill([
            ...array_intersect_key($data, array_flip(['name', 'email'])),
            'role' => $role, 'active' => $active, 'employee_id' => $employeeId,
            ...($revoke ? ['remember_token' => null] : []),
            ...(! $creating && isset($data['email']) && $account->email !== $data['email'] ? ['email_verified_at' => null] : []),
            ...(! empty($data['password']) ? ['password' => $data['password'], 'remember_token' => null] : []),
        ])->save();
        if ($employeeId) {
            $this->records->put('employees', $employeeId, [...$employee, 'name' => $account->name, 'email' => $account->email]);
        }
        if ($revoke) {
            DB::table('sessions')->where('user_id', $account->id)->delete();
        }
    }

    private function updatePaymentConfig(array $fields): void
    {
        $rules = [
            'cashKeras' => ['required', 'array:enabled,label,dpPercent,settlementDays,description'],
            'cashKeras.enabled' => ['required', 'boolean'],
            'cashKeras.label' => ['required', 'string', 'max:60'],
            'cashKeras.dpPercent' => ['required', 'integer', 'min:0', 'max:100'],
            'cashKeras.settlementDays' => ['required', 'integer', 'min:1', 'max:90'],
            'cashKeras.description' => ['required', 'string', 'max:500'],
            'cashLunak' => ['required', 'array:enabled,label,dpPercent,tenorMonths,maxTenorMonths,interestPercent,dueDay,description'],
            'cashLunak.enabled' => ['required', 'boolean'],
            'cashLunak.label' => ['required', 'string', 'max:60'],
            'cashLunak.dpPercent' => ['required', 'integer', 'min:5', 'max:90'],
            'cashLunak.tenorMonths' => ['required', 'integer', 'min:1', 'max:60'],
            'cashLunak.maxTenorMonths' => ['required', 'integer', 'min:1', 'max:60'],
            'cashLunak.interestPercent' => ['required', 'numeric', 'min:0', 'max:30'],
            'cashLunak.dueDay' => ['required', 'integer', 'min:1', 'max:28'],
            'cashLunak.description' => ['required', 'string', 'max:500'],
            'kpr' => ['required', 'array:enabled,label,dpPercent,defaultTenorYears,minTenorYears,maxTenorYears,interestRate,description,presets'],
            'kpr.enabled' => ['required', 'boolean'],
            'kpr.label' => ['required', 'string', 'max:60'],
            'kpr.dpPercent' => ['required', 'integer', 'min:5', 'max:80'],
            'kpr.defaultTenorYears' => ['required', 'integer', 'min:1', 'max:30'],
            'kpr.minTenorYears' => ['required', 'integer', 'min:1', 'max:30'],
            'kpr.maxTenorYears' => ['required', 'integer', 'min:1', 'max:30'],
            'kpr.interestRate' => ['required', 'numeric', 'min:0', 'max:25'],
            'kpr.description' => ['required', 'string', 'max:500'],
            'kpr.presets' => ['nullable', 'array', 'max:20'],
            'kpr.presets.*' => ['required', 'array:id,name,partnerId,bankName,dpPercent,tenorYears,interestRate,badge,note,active'],
            'kpr.presets.*.id' => ['required', 'string', 'max:60'],
            'kpr.presets.*.name' => ['required', 'string', 'max:120'],
            'kpr.presets.*.partnerId' => ['nullable', 'string', 'max:60'],
            'kpr.presets.*.bankName' => ['nullable', 'string', 'max:120'],
            'kpr.presets.*.dpPercent' => ['required', 'integer', 'min:5', 'max:80'],
            'kpr.presets.*.tenorYears' => ['required', 'integer', 'min:1', 'max:30'],
            'kpr.presets.*.interestRate' => ['required', 'numeric', 'min:0', 'max:25'],
            'kpr.presets.*.badge' => ['nullable', 'string', 'max:60'],
            'kpr.presets.*.note' => ['nullable', 'string', 'max:300'],
            'kpr.presets.*.active' => ['required', 'boolean'],
        ];
        $validated = $this->validate($fields, $rules, true);
        if (isset($validated['kpr']['presets']) && is_array($validated['kpr']['presets'])) {
            foreach ($validated['kpr']['presets'] as $preset) {
                $this->assert(trim((string) ($preset['name'] ?? '')) !== '', 'Nama program/preset KPR wajib diisi.');
            }
        }
        $merged = $this->calculator->mergeConfig($validated, $this->calculator->config());

        $merged['cashKeras']['enabled'] = (bool) $merged['cashKeras']['enabled'];
        $merged['cashKeras']['dpPercent'] = (int) $merged['cashKeras']['dpPercent'];
        $merged['cashKeras']['settlementDays'] = (int) $merged['cashKeras']['settlementDays'];

        $merged['cashLunak']['enabled'] = (bool) $merged['cashLunak']['enabled'];
        $merged['cashLunak']['dpPercent'] = (int) $merged['cashLunak']['dpPercent'];
        $merged['cashLunak']['tenorMonths'] = (int) $merged['cashLunak']['tenorMonths'];
        $merged['cashLunak']['maxTenorMonths'] = (int) $merged['cashLunak']['maxTenorMonths'];
        $merged['cashLunak']['interestPercent'] = round((float) $merged['cashLunak']['interestPercent'], 2);
        $merged['cashLunak']['dueDay'] = (int) $merged['cashLunak']['dueDay'];

        $merged['kpr']['enabled'] = (bool) $merged['kpr']['enabled'];
        $merged['kpr']['dpPercent'] = (int) $merged['kpr']['dpPercent'];
        $merged['kpr']['defaultTenorYears'] = (int) $merged['kpr']['defaultTenorYears'];
        $merged['kpr']['minTenorYears'] = (int) $merged['kpr']['minTenorYears'];
        $merged['kpr']['maxTenorYears'] = (int) $merged['kpr']['maxTenorYears'];
        $merged['kpr']['interestRate'] = round((float) $merged['kpr']['interestRate'], 2);

        $this->assert($merged['cashLunak']['tenorMonths'] <= $merged['cashLunak']['maxTenorMonths'], 'Tenor default Cash Lunak tidak boleh melebihi tenor maksimal.');
        $this->assert($merged['kpr']['minTenorYears'] <= $merged['kpr']['maxTenorYears'], 'Tenor minimal KPR harus lebih kecil atau sama dengan tenor maksimal.');
        $this->assert(
            $merged['kpr']['defaultTenorYears'] >= $merged['kpr']['minTenorYears']
                && $merged['kpr']['defaultTenorYears'] <= $merged['kpr']['maxTenorYears'],
            'Tenor default KPR harus berada di antara tenor minimal dan maksimal.',
        );
        $this->assert(
            $merged['cashKeras']['enabled'] || $merged['cashLunak']['enabled'] || $merged['kpr']['enabled'],
            'Minimal satu metode pembayaran harus tetap aktif.',
        );

        $this->records->put('settings', 'payment_methods', $merged);
    }

    /**
     * Normalize promo targeting, discounts, and defaults across rich UI and compact payloads.
     *
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $patch
     * @return array<string, mixed>
     */
    private function normalizePromoData(array $data, array $patch): array
    {
        $scope = (string) ($data['scope'] ?? '');
        $unitId = (string) ($data['unit'] ?? '');
        $projectId = (string) ($data['project'] ?? '');

        if ($scope === 'Semua Properti') {
            $projectId = '';
            $unitId = '';
        } elseif ($scope === 'Proyek') {
            $unitId = '';
            $this->assert($projectId !== '', 'Pilih proyek tujuan untuk promo tingkat proyek.');
        } elseif ($scope === 'Unit' || $unitId !== '') {
            $this->assert($unitId !== '', 'Pilih unit tujuan untuk promo tingkat unit.');
            $unit = $this->records->row('units', $unitId);
            $projectId = (string) $unit->project_id;
            $scope = 'Unit';
        } elseif ($projectId !== '') {
            $scope = 'Proyek';
        } else {
            $this->assert(false, 'Pilih proyek, unit, atau cakupan semua properti untuk promo ini.');
        }

        $discountType = (string) ($data['discountType'] ?? 'Persentase');
        $discountValue = array_key_exists('discountValue', $data) && $data['discountValue'] !== null
            ? (int) $data['discountValue']
            : 0;
        if (array_key_exists('discountValue', $patch) || $discountValue > 0) {
            $this->assert($discountValue >= 1, 'Nominal atau persentase potongan harus lebih dari 0.');
        }
        if ($discountType === 'Persentase') {
            $this->assert($discountValue <= 90, 'Persentase potongan promo maksimal 90%.');
        }

        $eligibleMethods = $data['eligibleMethods'] ?? PaymentCalculator::CANONICAL_METHODS;
        if (! is_array($eligibleMethods) || $eligibleMethods === []) {
            $eligibleMethods = PaymentCalculator::CANONICAL_METHODS;
        }

        return [
            ...$data,
            'scope' => $scope,
            'project' => $projectId,
            'unit' => $unitId,
            'discountType' => $discountType,
            'discountValue' => $discountValue,
            'eligibleMethods' => array_values(array_unique($eligibleMethods)),
            'image' => (string) ($data['image'] ?? 'house-1'),
            'terms' => (string) ($data['terms'] ?? ''),
        ];
    }

    /**
     * Normalize partner cooperation fields and clear stale uploaded logo when switching to a static asset.
     *
     * @param  array<string, mixed>  $data
     * @param  array<string, mixed>  $patch
     * @return array<string, mixed>
     */
    private function normalizePartnerData(array $data, array $patch, string $id): array
    {
        if (empty($patch['logoData']) && ! empty($patch['logo']) && str_starts_with((string) $patch['logo'], 'assets/')) {
            PropertyAttachment::query()
                ->where('resource', 'partners')
                ->where('record_id', $id)
                ->where('field', 'logoData')
                ->delete();
        }

        $category = (string) ($data['category'] ?? '');
        $defaultCoop = match ($category) {
            'Perbankan & pembiayaan' => 'Bank Rekanan KPR',
            'Material & solusi bangunan' => 'Material & Bangunan',
            'Arsitektur & perencanaan' => 'Arsitektur & Konsultan',
            default => 'Konstruksi & Kontraktor',
        };

        $kprRate = array_key_exists('kprRate', $data) && $data['kprRate'] !== null && $data['kprRate'] !== ''
            ? round((float) $data['kprRate'], 2)
            : null;
        $kprTenorMax = array_key_exists('kprTenorMax', $data) && $data['kprTenorMax'] !== null && $data['kprTenorMax'] !== ''
            ? (int) $data['kprTenorMax']
            : null;

        return [
            ...$data,
            'cooperationType' => (string) (($data['cooperationType'] ?? '') !== '' ? $data['cooperationType'] : $defaultCoop),
            'status' => in_array($data['status'] ?? '', ['Aktif', 'Nonaktif'], true) ? $data['status'] : 'Aktif',
            'kprRate' => $kprRate,
            'kprTenorMax' => $kprTenorMax,
        ];
    }

    private function validate(array $fields, array $rules, bool $patch = false): array
    {
        $this->assert(! array_diff_key($fields, $rules), 'Kolom yang dikirim tidak dapat diubah.');
        if ($patch) {
            foreach ($rules as $key => $rule) {
                $rules[$key] = ['sometimes', ...$rule];
            }
        }
        $data = Validator::make($fields, $rules)->validate();
        foreach ($data as $key => $value) {
            if (in_array('integer', $rules[$key], true)) {
                $data[$key] = (int) $value;
            } elseif ($value === null && in_array('string', $rules[$key], true)) {
                $data[$key] = '';
            }
        }

        return $data;
    }

    private function assert(bool $condition, string $message): void
    {
        if (! $condition) {
            throw ValidationException::withMessages(['record' => $message]);
        }
    }
}
