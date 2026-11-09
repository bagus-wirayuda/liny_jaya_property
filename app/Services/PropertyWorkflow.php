<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;

class PropertyWorkflow
{
    private const AUTHORITY = [
        'book' => ['client'], 'booking-cancel' => ['client', 'admin'],
        'payment-submit' => ['client'], 'payment-review' => ['admin'],
        'construction-start' => ['admin'], 'report-review' => ['admin', 'director'],
        'handover' => ['admin'], 'attendance' => ['employee'],
        'task-progress' => ['admin', 'director', 'employee'],
        'notifications-read' => ['admin', 'director', 'employee', 'client'],
    ];

    public function __construct(private readonly PropertyRecords $records, private readonly PropertyState $state) {}

    public function run(User $user, string $action, array $input): void
    {
        abort_unless(isset(self::AUTHORITY[$action]), 404);
        abort_unless(in_array($user->role, self::AUTHORITY[$action], true), 403);
        $rules = match ($action) {
            'attendance', 'notifications-read' => [],
            default => ['id' => ['required', 'string', 'regex:/\A[\w-]{1,64}\z/']],
        };
        $rules += match ($action) {
            'book' => [
                'note' => ['nullable', 'string', 'max:3000'],
                'method' => ['required', 'in:Cash Keras,Cash Bertahap,KPR Bank'],
                'consent' => ['required', 'accepted'],
            ],
            'payment-submit' => [
                'proof' => ['required', 'string', 'max:240'],
                'reference' => ['nullable', 'string', 'max:240'],
                'proofData' => ['required', 'string', 'max:2800000'],
            ],
            'payment-review', 'report-review' => ['approved' => ['required', 'boolean']],
            'task-progress' => ['status' => ['required', 'in:Dikerjakan,Selesai']],
            default => [],
        };
        $data = Validator::make($input, $rules)->validate();
        match ($action) {
            'book' => $this->book($user, $data['id'], $data['note'] ?? '', $data['method']),
            'booking-cancel' => $this->cancel($user, $data['id']),
            'payment-submit' => $this->submitPayment($user, $data),
            'payment-review' => $this->reviewPayment($data['id'], (bool) $data['approved']),
            'construction-start' => $this->startConstruction($data['id']),
            'report-review' => $this->reviewReport($data['id'], (bool) $data['approved']),
            'handover' => $this->handover($data['id']),
            'attendance' => $this->attendance($user),
            'task-progress' => $this->updateTask($user, $data['id'], $data['status']),
            'notifications-read' => $this->readNotifications($user),
        };
        $label = match ($action) {
            'book' => 'Pemesanan unit dicatat',
            'booking-cancel' => 'Pemesanan dibatalkan',
            'payment-submit' => 'Bukti pembayaran diajukan',
            'payment-review' => $data['approved'] ? 'Pembayaran diverifikasi dan disetujui' : 'Bukti pembayaran ditolak',
            'construction-start' => 'Pembangunan dimulai',
            'report-review' => $data['approved'] ? 'Laporan pembangunan disetujui' : 'Revisi laporan diminta',
            'handover' => 'Serah terima dicatat',
            'attendance' => 'Kehadiran dicatat',
            'task-progress' => 'Status penugasan diperbarui',
            'notifications-read' => 'Notifikasi ditandai dibaca',
        };
        $this->records->audit($user, $label.(isset($data['id']) ? ' · '.$data['id'] : ''));
    }

    private function book(User $user, string $id, string $note, string $method): void
    {
        $unit = $this->records->data('units', $this->records->row('units', $id));
        $this->assert($unit['sale'] === 'Tersedia', 'Unit sudah tidak tersedia.');
        $bookingId = $this->records->identifier('BK');
        $this->records->put('bookings', $bookingId, [
            'unit' => $id, 'date' => $this->records->today(), 'status' => 'Menunggu DP',
            'note' => $note, 'paymentMethod' => $method, 'consentedAt' => now()->toIso8601String(),
        ], ['client_id' => $user->id]);
        $this->records->put('units', $id, [...$unit, 'sale' => 'Dipesan']);
        $this->bill($bookingId, 'DP', (int) round($unit['price'] * 0.2), now('Asia/Jakarta')->addDays(7)->toDateString());
        $this->records->notify('admin', 'Pemesanan baru', $bookingId.' · '.$id);
    }

    private function cancel(User $user, string $id): void
    {
        $row = $this->state->visible('bookings', $user)->where('id', $id)->first() ?? abort(404);
        $booking = $this->records->data('bookings', $row);
        $this->assert($booking['status'] === 'Menunggu DP', 'Pemesanan dengan DP terverifikasi memerlukan peninjauan.');
        $payments = $this->records->query('payments')->where('booking_id', $id)->get();
        foreach ($payments as $paymentRow) {
            $payment = $this->records->data('payments', $paymentRow);
            $this->assert(! in_array($payment['status'], ['Menunggu verifikasi', 'Terverifikasi'], true), 'Selesaikan peninjauan pembayaran sebelum pembatalan.');
            $this->records->put('payments', $payment['id'], [...$payment, 'status' => 'Dibatalkan']);
        }
        $unit = $this->records->data('units', $this->records->row('units', $booking['unit']));
        $this->records->put('bookings', $id, [...$booking, 'status' => 'Dibatalkan'], ['client_id' => $row->client_id]);
        $this->records->put('units', $unit['id'], [...$unit, 'sale' => 'Tersedia']);
    }

    private function submitPayment(User $user, array $data): void
    {
        $row = $this->state->visible('payments', $user)->where('id', $data['id'])->first() ?? abort(404);
        $payment = $this->records->data('payments', $row);
        $this->assert(in_array($payment['status'], ['Belum dibayar', 'Ditolak'], true), 'Pembayaran tidak dapat diajukan kembali pada status ini.');
        $this->assert($this->records->row('bookings', $row->booking_id)->reserved_unit !== null, 'Pemesanan telah dibatalkan.');
        $this->records->put('payments', $row->id, [
            ...$payment, 'proof' => $data['proof'], 'proofData' => $data['proofData'],
            'reference' => $data['reference'] ?? '', 'status' => 'Menunggu verifikasi',
            'date' => $this->records->today(),
        ]);
        $this->records->notify('admin', 'Bukti pembayaran diajukan', $row->id.' · '.$row->booking_id);
    }

    private function reviewPayment(string $id, bool $approved): void
    {
        $payment = $this->records->data('payments', $this->records->row('payments', $id));
        $this->assert($payment['status'] === 'Menunggu verifikasi', 'Pembayaran sudah diproses atau belum diajukan.');
        if ($approved) {
            $this->assert(DB::table('property_attachments')->where([
                'resource' => 'payments', 'record_id' => $id, 'field' => 'proofData',
            ])->exists(), 'Bukti pembayaran belum tersedia untuk diverifikasi.');
        }
        $row = $this->records->row('bookings', $payment['booking']);
        $this->assert($row->reserved_unit !== null, 'Pemesanan telah dibatalkan.');
        $booking = $this->records->data('bookings', $row);
        if ($approved && $payment['kind'] === 'DP') {
            $this->assert($booking['status'] === 'Menunggu DP', 'DP pemesanan sudah diverifikasi.');
            $unit = $this->records->data('units', $this->records->row('units', $booking['unit']));
            $this->records->put('bookings', $booking['id'], [...$booking, 'status' => 'DP terverifikasi'], ['client_id' => $row->client_id]);
            $this->records->put('units', $unit['id'], [...$unit, 'sale' => 'DP terverifikasi']);
            $this->document($booking['id'], 'Konfirmasi pemesanan '.$unit['block'].'-'.$unit['number'], 'Perjanjian');
            if (! $this->records->query('payments')->where('booking_id', $booking['id'])->where('payload->kind', 'Termin 1')->exists()) {
                $this->bill($booking['id'], 'Termin 1', (int) round($unit['price'] * 0.3), $unit['estimate']);
            }
        }
        $this->records->put('payments', $id, [...$payment, 'status' => $approved ? 'Terverifikasi' : 'Ditolak']);
        $this->records->notify('client', $approved ? 'Pembayaran terverifikasi' : 'Bukti pembayaran ditolak', $id.' · '.$payment['kind'], $row->client_id);
    }

    private function startConstruction(string $id): void
    {
        $unit = $this->records->data('units', $this->records->row('units', $id));
        $this->assert($unit['sale'] === 'DP terverifikasi' && $unit['construction'] === 'Belum dibangun', 'Mulai pembangunan setelah DP terverifikasi dan sebelum pekerjaan dimulai.');
        $this->records->put('units', $id, [...$unit, 'construction' => 'Dalam pembangunan', 'stage' => 'Persiapan', 'progress' => 5]);
    }

    private function reviewReport(string $id, bool $approved): void
    {
        $row = $this->records->row('reports', $id);
        $report = $this->records->data('reports', $row);
        $this->assert($report['status'] === 'Menunggu persetujuan', 'Laporan sudah ditinjau.');
        if ($approved) {
            $unit = $this->records->data('units', $this->records->row('units', $row->unit_id));
            $this->assert($unit['sale'] === 'DP terverifikasi' && $unit['construction'] === 'Dalam pembangunan', 'Unit belum dalam pembangunan aktif.');
            $this->assert($report['progress'] >= $unit['progress'] && $report['progress'] <= 100, 'Progres laporan berada di luar rentang yang diperbolehkan.');
            $this->records->put('units', $unit['id'], [
                ...$unit, 'stage' => $report['stage'], 'progress' => $report['progress'],
                'construction' => $report['progress'] === 100 ? 'Selesai' : 'Dalam pembangunan',
            ]);
            $owner = $this->records->query('bookings')->where('reserved_unit', $unit['id'])->value('client_id');
            if ($owner) {
                $this->records->notify('client', 'Progres rumah diperbarui', $unit['id'].' mencapai '.$report['progress'].'%.', (int) $owner);
            }
        } else {
            $this->records->notify('employee', 'Laporan perlu revisi', $report['title'], employee: $row->employee_id);
        }
        $this->records->put('reports', $id, [...$report, 'status' => $approved ? 'Disetujui' : 'Perlu revisi'], ['employee_id' => $row->employee_id]);
    }

    private function handover(string $id): void
    {
        $unit = $this->records->data('units', $this->records->row('units', $id));
        $this->assert($unit['progress'] === 100 && $unit['construction'] === 'Selesai', 'Pembangunan harus selesai 100%.');
        $row = $this->records->query('bookings')->where('reserved_unit', $id)->first() ?? abort(404);
        $booking = $this->records->data('bookings', $row);
        $paid = $this->records->query('payments')->where('booking_id', $row->id)->where('payload->status', 'Terverifikasi')->get()
            ->sum(fn ($item) => $this->records->data('payments', $item)['amount']);
        $this->assert($paid >= $unit['price'], 'Verifikasi seluruh pembayaran sebelum serah terima.');
        $this->records->put('units', $id, [...$unit, 'construction' => 'Diserahterimakan', 'sale' => 'Terjual']);
        $this->records->put('bookings', $row->id, [...$booking, 'status' => 'Selesai'], ['client_id' => $row->client_id]);
        $this->document($row->id, 'Berita acara serah terima '.$unit['block'].'-'.$unit['number'], 'Serah terima');
        $this->records->notify('client', 'Serah terima rumah dicatat', $row->id, $row->client_id);
    }

    private function attendance(User $user): void
    {
        $date = $this->records->today();
        $time = now('Asia/Jakarta')->format('H:i');
        $row = $this->records->query('attendance')->where('employee_id', $user->employee_id)->where('work_date', $date)->first();
        $data = $row ? $this->records->data('attendance', $row) : ['date' => $date, 'in' => $time, 'out' => '', 'status' => 'Hadir'];
        if ($row) {
            $this->assert($data['out'] === '', 'Kehadiran hari ini sudah lengkap.');
            $data['out'] = $time;
        }
        $this->records->put('attendance', $row->id ?? $this->records->identifier('AT'), $data, ['employee_id' => $user->employee_id]);
    }

    private function updateTask(User $user, string $id, string $status): void
    {
        $row = $this->state->visible('tasks', $user)->where('id', $id)->first() ?? abort(404);
        $task = $this->records->data('tasks', $row);
        $this->assert($task['status'] === ($status === 'Dikerjakan' ? 'Baru' : 'Dikerjakan'), 'Urutan perubahan status penugasan tidak valid.');
        $this->records->put('tasks', $id, [...$task, 'status' => $status], ['employee_id' => $row->employee_id]);
    }

    private function readNotifications(User $user): void
    {
        $ids = $this->state->visible('notifications', $user)->where('audience', $user->role)->pluck('id');
        DB::table('property_notification_reads')->insertOrIgnore($ids->map(fn (string $id) => [
            'user_id' => $user->id, 'notification_id' => $id,
        ])->all());
    }

    private function document(string $booking, string $title, string $kind): void
    {
        $this->records->put('documents', $this->records->identifier('DOC'), [
            'booking' => $booking, 'title' => $title, 'kind' => $kind,
            'date' => $this->records->today(), 'status' => 'Tersedia',
        ]);
    }

    private function bill(string $booking, string $kind, int $amount, string $due): void
    {
        $this->records->put('payments', $this->records->identifier('PAY'), [
            'booking' => $booking, 'kind' => $kind, 'amount' => $amount,
            'due' => $due, 'date' => '', 'proof' => '', 'status' => 'Belum dibayar',
        ]);
    }

    private function assert(bool $condition, string $message): void
    {
        if (! $condition) {
            throw ValidationException::withMessages(['workflow' => $message]);
        }
    }
}
