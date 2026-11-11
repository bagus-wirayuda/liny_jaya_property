<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\Password;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PropertyWorkspaceTest extends TestCase
{
    use RefreshDatabase;

    protected $seed = true;

    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ZPWQAAAAASUVORK5CYII=';

    public function test_guest_login_routes_each_role_and_enforces_access(): void
    {
        $this->get('/client/bookings')->assertRedirect('/login');
        $this->getJson('/api/property/data?workspace=1')->assertUnauthorized();
        $this->getJson('/api/property/data')->assertOk()
            ->assertJsonCount(0, 'data.bookings')->assertJsonCount(0, 'data.accounts');
        $this->get('/')->assertOk()->assertSee('public/js/architecture.js', false);

        $client = $this->user('client');
        $client->forceFill(['password' => 'LoginExample!42'])->save();
        $this->post('/login', ['email' => $client->email, 'password' => 'wrong-password'])
            ->assertSessionHasErrors('email');
        $this->post('/login', ['email' => $client->email, 'password' => 'LoginExample!42'])
            ->assertRedirect();
        $this->assertAuthenticatedAs($client);
        $this->get('/dashboard')->assertRedirect('/client');
        $this->get('/client/bookings')->assertOk();
        $this->get('/admin')->assertForbidden();
        $this->get('/unit?id=U1&workspace=admin')->assertForbidden();
        $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();
        $this->actingAs($this->user('employee'));
        $this->get('/unit?id=U1&workspace=karyawan')->assertOk();
        $this->get('/unit?id=U2&workspace=karyawan')->assertNotFound();
        $this->get('/pimpinan')->assertForbidden();
    }

    public function test_all_mapped_pages_open_in_their_authorized_workspace(): void
    {
        $this->get('/client/bantuan-akses.html')->assertRedirect('/forgot-password');

        foreach (config('linyjaya_pages') as $page) {
            if (isset($page['role'])) {
                $this->actingAs($this->user($page['role']));
            } else {
                $this->post('/logout');
            }
            $this->get('/'.$page['uri'])->assertOk()->assertSee('css/style.css');
        }
    }

    public function test_public_consultation_is_persisted_but_visible_only_to_staff(): void
    {
        $date = now('Asia/Jakarta')->addDay()->toDateString();
        $lead = [
            'name' => 'Calon Pembeli', 'email' => 'lead@example.com', 'phone' => '081200001234',
            'unit' => 'U2', 'interest' => 'Konsultasi KPR', 'date' => $date, 'notes' => 'Rencana kunjungan.',
        ];
        $this->change('leads', 'LD-TEST', $lead, 'create', false)->assertOk()
            ->assertJsonCount(0, 'data.leads');
        $this->assertDatabaseHas('leads', ['id' => 'LD-TEST', 'project_id' => 'P1', 'unit_id' => 'U2']);
        $this->change('projects', 'P1', ['name' => 'Tidak boleh'], 'update', false)->assertForbidden();
        $this->actingAs($this->user('admin'))->getJson('/api/property/data?workspace=1')
            ->assertJsonFragment(['email' => 'lead@example.com']);
    }

    public function test_catalog_crud_validates_fields_and_rejects_stale_updates(): void
    {
        $this->actingAs($this->user('admin'));
        $before = $this->version();
        $project = [
            'name' => 'Kawasan Uji', 'city' => 'Bandung', 'location' => 'Bandung Barat',
            'category' => 'Hunian', 'price' => 600000000, 'units' => 12, 'status' => 'Perencanaan',
            'image' => 'house-1', 'facilities' => ['Taman'], 'description' => 'Deskripsi kawasan.',
        ];
        $this->change('projects', 'P-TEST', $project, 'create')->assertOk();
        $this->assertDatabaseHas('projects', ['id' => 'P-TEST']);
        $this->change('projects', 'P-TEST', ['name' => 'Usang'], version: $before)->assertConflict();
        $this->change('projects', 'P-TEST', ['name' => 'Kawasan Baru'])->assertOk()
            ->assertJsonFragment(['name' => 'Kawasan Baru']);
        $this->change('projects', 'P-TEST', ['evaluation' => 'Desain kawasan sudah ditinjau.'])
            ->assertOk()->assertJsonFragment(['evaluation' => 'Desain kawasan sudah ditinjau.']);
        $this->change('units', 'U1', ['sale' => 'Tersedia'])->assertUnprocessable()->assertJsonValidationErrors('record');
        $this->change('projects', 'P1', [], 'delete')->assertUnprocessable();
        $this->change('projects', 'P-TEST', [], 'delete')->assertOk();
        $this->assertDatabaseMissing('projects', ['id' => 'P-TEST']);
    }

    public function test_booking_payment_progress_and_handover_share_the_same_unit(): void
    {
        $client = $this->user('client');
        $admin = $this->user('admin');
        $employee = $this->user('employee');
        $director = $this->user('director');

        $this->actingAs($client);
        $this->workflow('book', ['id' => 'U2', 'method' => 'KPR Bank'])->assertUnprocessable()->assertJsonValidationErrors('consent');
        $result = $this->workflow('book', ['id' => 'U2', 'note' => 'KPR', 'method' => 'KPR Bank', 'consent' => true])->assertOk();
        $booking = collect($result->json('data.bookings'))->firstWhere('unit', 'U2');
        $this->assertDatabaseHas('bookings', ['id' => $booking['id'], 'reserved_unit' => 'U2', 'client_id' => $client->id]);
        $this->workflow('book', ['id' => 'U2', 'method' => 'KPR Bank', 'consent' => true])->assertUnprocessable();
        $payment = collect($result->json('data.payments'))->firstWhere('booking', $booking['id']);
        $price = collect($result->json('data.units'))->firstWhere('id', 'U2')['price'];
        $this->assertSame((int) round($price * 0.2), $payment['amount']);
        $this->workflow('payment-review', ['id' => $payment['id'], 'approved' => true])->assertForbidden();
        $this->uploadPayment($payment['id'])->assertOk();
        $attachment = DB::table('property_attachments')->where('record_id', $payment['id'])->value('id');
        $this->get('/lampiran/'.$attachment)->assertOk()->assertHeader('Content-Type', 'image/png');

        $other = User::query()->where('email', 'andi@linyjaya.example')->firstOrFail();
        $this->actingAs($other)->getJson('/api/property/data?workspace=1')->assertJsonMissing(['id' => $booking['id']]);
        $this->workflow('booking-cancel', ['id' => $booking['id']])->assertNotFound();
        $this->get('/lampiran/'.$attachment)->assertNotFound();

        $this->actingAs($admin);
        $this->workflow('construction-start', ['id' => 'U2'])->assertUnprocessable();
        $result = $this->workflow('payment-review', ['id' => $payment['id'], 'approved' => true])->assertOk();
        $this->assertDatabaseHas('documents', ['booking_id' => $booking['id']]);
        $termin = collect($result->json('data.payments'))->first(fn ($bill) => $bill['booking'] === $booking['id'] && $bill['kind'] === 'Termin 1');
        $this->workflow('construction-start', ['id' => 'U2'])->assertOk();
        $this->change('tasks', 'TS-TEST', [
            'title' => 'Pekerjaan Unit U2', 'unit' => 'U2', 'employee' => $employee->employee_id,
            'deadline' => now()->addDays(2)->toDateString(), 'priority' => 'Tinggi', 'status' => 'Baru',
            'description' => 'Kerjakan unit sesuai jadwal.',
        ], 'create')->assertOk();

        $this->actingAs($employee);
        $this->workflow('task-progress', ['id' => 'TS-002', 'status' => 'Dikerjakan'])->assertNotFound();
        $this->workflow('task-progress', ['id' => 'TS-TEST', 'status' => 'Dikerjakan'])->assertOk();
        $this->change('reports', 'RP-TEST', [
            'unit' => 'U2', 'title' => 'Finishing selesai', 'date' => now('Asia/Jakarta')->toDateString(),
            'stage' => 'Finishing', 'progress' => 100, 'description' => 'Pemeriksaan selesai.', 'issue' => 'Tidak ada kendala.',
        ], 'create')->assertOk();
        $this->workflow('report-review', ['id' => 'RP-TEST', 'approved' => true])->assertForbidden();
        $this->actingAs($director);
        $this->workflow('report-review', ['id' => 'RP-TEST', 'approved' => true])->assertOk();

        $this->actingAs($admin);
        $this->workflow('handover', ['id' => 'U2'])->assertUnprocessable();
        $this->change('payments', 'PAY-FINAL', [
            'booking' => $booking['id'], 'kind' => 'Pelunasan', 'amount' => $price - $payment['amount'] - $termin['amount'],
            'due' => now()->addDay()->toDateString(),
        ], 'create')->assertOk();

        $this->actingAs($client);
        $this->uploadPayment($termin['id'])->assertOk();
        $this->uploadPayment('PAY-FINAL')->assertOk();
        $this->actingAs($admin);
        $this->workflow('payment-review', ['id' => $termin['id'], 'approved' => true])->assertOk();
        $this->workflow('payment-review', ['id' => 'PAY-FINAL', 'approved' => true])->assertOk();
        $completed = $this->workflow('handover', ['id' => 'U2'])->assertOk();
        $unit = collect($completed->json('data.units'))->firstWhere('id', 'U2');
        $this->assertSame('Diserahterimakan', $unit['construction']);
        $this->assertSame('Terjual', $unit['sale']);
        $this->assertDatabaseCount('property_attachments', 3);
    }

    public function test_admin_manages_real_accounts_without_exposing_passwords(): void
    {
        $admin = $this->user('admin');
        $this->actingAs($admin);
        $this->change('accounts', 'ACC-NEW', [
            'name' => 'Staf Teknik', 'email' => 'staff@example.com', 'role' => 'Karyawan',
            'status' => 'Aktif', 'employeeId' => 'EMP-002', 'password' => 'AnotherPassword!42',
        ], 'create')->assertOk()->assertJsonMissing(['password' => 'AnotherPassword!42']);
        $account = User::query()->where('email', 'staff@example.com')->firstOrFail();
        $this->assertTrue(Hash::check('AnotherPassword!42', $account->password));
        $this->assertSame('EMP-002', $account->employee_id);
        $this->change('accounts', (string) $admin->id, ['status' => 'Nonaktif'])->assertForbidden();
        $this->change('accounts', (string) $account->id, [], 'delete')->assertOk();
        $this->assertFalse($account->refresh()->active);
        $this->assertNotNull($account->archived_at);
    }

    public function test_notifications_and_attendance_persist_for_the_actual_employee(): void
    {
        $employee = $this->user('employee');
        $this->actingAs($employee);
        $this->workflow('attendance')->assertOk();
        $this->workflow('attendance')->assertOk();
        $this->workflow('attendance')->assertUnprocessable();
        $this->assertDatabaseHas('attendance', ['employee_id' => $employee->employee_id, 'work_date' => now('Asia/Jakarta')->toDateString()]);
        $this->change('leave', 'LV-TEST', [
            'date' => now('Asia/Jakarta')->addDay()->toDateString(), 'kind' => 'Izin', 'reason' => 'Keperluan pribadi',
        ], 'create')->assertOk();
        $this->actingAs($this->user('director'))->change('leave', 'LV-TEST', ['status' => 'Disetujui'])->assertOk();
        $this->actingAs($employee)->workflow('notifications-read')->assertOk()->assertJsonFragment(['status' => 'Dibaca']);
    }

    public function test_registration_and_password_recovery_use_real_client_accounts(): void
    {
        Notification::fake();
        $this->post('/register', [
            'name' => 'Klien Baru', 'email' => 'new-client@example.com',
            'password' => 'PasswordBaru!42', 'password_confirmation' => 'PasswordBaru!42',
            'role' => 'admin',
        ])->assertRedirect('/dashboard');
        $client = User::query()->where('email', 'new-client@example.com')->firstOrFail();
        $this->assertSame('client', $client->role);
        $this->change('profile', 'self', ['email' => 'revised@example.com'])
            ->assertUnprocessable()->assertJsonValidationErrors('record');
        $this->change('profile', 'self', ['email' => 'revised@example.com', 'currentPassword' => 'PasswordBaru!42'])
            ->assertOk()->assertJsonMissing(['currentPassword' => 'PasswordBaru!42']);
        $client->refresh();
        $this->post('/logout')->assertRedirect('/login');

        $this->post('/forgot-password', ['email' => $client->email])->assertSessionHas('status');
        Notification::assertSentTo($client, ResetPassword::class);
        $token = Password::broker()->createToken($client);
        $this->post('/reset-password', [
            'email' => $client->email, 'token' => $token,
            'password' => 'ResetPassword!42', 'password_confirmation' => 'ResetPassword!42',
        ])->assertRedirect('/login');
        $this->assertTrue(Hash::check('ResetPassword!42', $client->refresh()->password));
    }

    public function test_document_and_service_request_visibility_follow_decision_and_owner(): void
    {
        $client = $this->user('client');
        $this->actingAs($client)->change('tickets', 'TK-NEW', [
            'title' => 'Perubahan pintu', 'category' => 'Perubahan desain', 'message' => 'Mohon tinjau tipe pintu.',
        ], 'create')->assertOk();
        $this->actingAs($this->user('admin'))->change('documents', 'DOC-NEW', [
            'booking' => 'BK-001', 'title' => 'Denah yang diajukan', 'kind' => 'Teknis', 'fileData' => self::PNG,
        ], 'create')->assertOk();
        $file = DB::table('property_attachments')->where('record_id', 'DOC-NEW')->value('id');
        $this->actingAs($client)->get('/lampiran/'.$file)->assertNotFound();
        $this->actingAs($this->user('director'))->change('documents', 'DOC-NEW', ['status' => 'Disetujui'])->assertOk();
        $this->change('tickets', 'TK-NEW', ['reply' => 'Perubahan disetujui.', 'status' => 'Disetujui'])->assertOk();
        $this->actingAs($client)->getJson('/api/property/data?workspace=1')
            ->assertJsonFragment(['reply' => 'Perubahan disetujui.'])->assertJsonFragment(['id' => 'DOC-NEW']);
        $this->get('/lampiran/'.$file)->assertOk();
    }

    public function test_favorites_are_separate_for_each_account(): void
    {
        $client = $this->user('client');
        $this->actingAs($client)->postJson('/api/property/favorite', ['id' => 'P1', 'selected' => true])->assertOk();
        $this->assertDatabaseHas('property_favorites', ['user_id' => $client->id, 'property_id' => 'P1']);
        $this->actingAs($this->user('employee'))->getJson('/api/property/data')->assertJsonCount(0, 'data.favorites');
        $this->actingAs($client)->postJson('/api/property/favorite', ['id' => 'P1', 'selected' => false])->assertOk();
        $this->assertDatabaseMissing('property_favorites', ['user_id' => $client->id, 'property_id' => 'P1']);
    }

    public function test_management_catalogue_content_and_staff_records_are_editable(): void
    {
        $date = now('Asia/Jakarta')->toDateString();
        $resources = [
            'services' => [['name' => 'Layanan baru', 'icon' => 'home', 'description' => 'Layanan hunian.'], 'name'],
            'partners' => [['name' => 'Mitra baru', 'category' => 'Arsitektur & perencanaan', 'description' => 'Data mitra.'], 'name'],
            'leads' => [['name' => 'Prospek baru', 'email' => 'prospect@example.com', 'phone' => '08120001', 'interest' => 'Pilihan unit', 'date' => $date, 'status' => 'Baru', 'notes' => 'Kunjungan.'], 'name'],
            'offers' => [['name' => 'Penawaran baru', 'client' => 'Calon pembeli', 'unit' => 'U1', 'amount' => 123000000, 'date' => $date, 'status' => 'Draf'], 'name'],
            'promos' => [['name' => 'Promo baru', 'project' => 'P1', 'start' => $date, 'end' => $date, 'status' => 'Draf', 'description' => 'Ketentuan promo.'], 'name'],
            'communications' => [['name' => 'Kontak baru', 'date' => $date, 'channel' => 'Email', 'status' => 'Selesai', 'notes' => 'Ringkasan kontak.'], 'name'],
            'expenses' => [['title' => 'Anggaran baru', 'project' => 'P1', 'date' => $date, 'amount' => 150000, 'description' => 'Rencana pembelian.'], 'title'],
            'employees' => [['name' => 'Petugas Baru', 'email' => 'new-employee@example.com', 'division' => 'Teknik', 'position' => 'Pengawas', 'status' => 'Aktif'], 'name'],
            'schedules' => [['unit' => 'U1', 'stage' => 'Persiapan', 'start' => $date, 'end' => $date, 'employee' => 'EMP-001', 'status' => 'Terjadwal'], 'end'],
            'evaluations' => [['employee' => 'EMP-001', 'period' => 'November', 'score' => 90, 'notes' => 'Evaluasi.'], 'notes'],
            'articles' => [['title' => 'Artikel baru', 'category' => 'Konstruksi', 'date' => $date, 'image' => 'construction', 'summary' => 'Ringkasan.', 'body' => 'Isi artikel.'], 'title'],
            'notifications' => [['title' => 'Pembaruan baru', 'role' => 'Klien', 'message' => 'Informasi layanan.'], 'title'],
        ];
        $this->actingAs($this->user('admin'));
        foreach ($resources as $group => [$fields, $editable]) {
            $id = 'TEST-'.strtoupper($group);
            $this->change($group, $id, $fields, 'create')->assertOk()->assertJsonFragment(['id' => $id]);
            $value = $group === 'schedules' ? now('Asia/Jakarta')->addDay()->toDateString() : 'Catatan diperbarui';
            $this->change($group, $id, [$editable => $value])->assertOk()->assertJsonFragment([$editable => $value]);
            $this->change($group, $id, [], 'delete')->assertOk()->assertJsonMissing(['id' => $id]);
        }

        $this->actingAs($this->user('director'));
        $this->change('announcements', 'AN-TEST', [
            'title' => 'Koordinasi proyek', 'audience' => 'Konstruksi', 'date' => $date, 'message' => 'Briefing besok pagi.',
        ], 'create')->assertOk();
        $this->change('announcements', 'AN-TEST', ['message' => 'Briefing dipindah.'])->assertOk();
        $this->actingAs($this->user('employee'))->getJson('/api/property/data?workspace=1')
            ->assertJsonFragment(['message' => 'Briefing dipindah.']);
        $this->change('announcements', 'AN-TEST', [], 'delete')->assertForbidden();
        $this->actingAs($this->user('director'))->change('announcements', 'AN-TEST', [], 'delete')->assertOk();
    }

    public function test_failed_attachment_upload_does_not_change_payment_or_audit(): void
    {
        $this->actingAs($this->user('client'));
        $revision = $this->version();
        $auditCount = DB::table('property_audits')->count();
        $this->workflow('payment-submit', [
            'id' => 'PAY-002', 'proof' => 'image.png',
            'proofData' => 'data:image/png;base64,'.base64_encode('<?php echo "invalid";'),
        ])->assertUnprocessable()->assertJsonValidationErrors('proofData');
        $this->assertSame($revision, $this->version());
        $this->assertDatabaseCount('property_audits', $auditCount);
        $this->assertDatabaseMissing('property_attachments', ['record_id' => 'PAY-002']);
        $this->getJson('/api/property/data?workspace=1')->assertJsonFragment(['id' => 'PAY-002', 'status' => 'Belum dibayar']);
        $this->actingAs($this->user('admin'))->workflow('payment-review', ['id' => 'PAY-003', 'approved' => true])
            ->assertUnprocessable()->assertJsonValidationErrors('workflow');
    }

    public function test_company_changes_are_reflected_publicly_and_decisions_are_audited(): void
    {
        $this->actingAs($this->user('admin'))->change('company', 'company', [
            'phone' => '081200009999', 'hours' => 'Senin–Jumat 09.00–17.00',
        ])->assertOk();
        $this->getJson('/api/property/data')->assertJsonPath('data.company.whatsapp', '6281200009999');
        $this->actingAs($this->user('director'))->change('expenses', 'EX-001', ['status' => 'Disetujui'])->assertOk();
        $audit = json_decode(DB::table('property_audits')->where('payload->action', 'like', '%EX-001%')->first()->payload, true);
        $this->assertStringContainsString('disetujui', $audit['action']);
        $this->change('expenses', 'EX-001', ['status' => 'Ditolak'])->assertUnprocessable();
    }

    public function test_rejected_reports_can_be_revised_but_cannot_regress_unit_progress(): void
    {
        $report = [
            'unit' => 'U1', 'title' => 'Pekerjaan struktur', 'date' => now('Asia/Jakarta')->toDateString(),
            'stage' => 'Struktur & dinding', 'progress' => 50,
            'description' => 'Pemeriksaan pekerjaan.', 'issue' => 'Dokumentasi perlu dilengkapi.',
        ];
        $this->actingAs($this->user('employee'))->change('reports', 'RP-REVISE', $report, 'create')->assertOk();
        $this->change('reports', 'RP-REVISE', ['progress' => 52])->assertUnprocessable();
        $this->actingAs($this->user('director'))->workflow('report-review', ['id' => 'RP-REVISE', 'approved' => false])->assertOk();
        $this->actingAs($this->user('employee'))->change('reports', 'RP-REVISE', ['progress' => 20])->assertUnprocessable();
        $this->change('reports', 'RP-REVISE', ['progress' => 55, 'issue' => 'Dokumentasi dilengkapi.'])->assertOk();
        $this->actingAs($this->user('admin'))->workflow('report-review', ['id' => 'RP-REVISE', 'approved' => true])
            ->assertOk()->assertJsonFragment(['id' => 'U1', 'progress' => 55]);
        $this->actingAs($this->user('client'))->getJson('/api/property/data?workspace=1')
            ->assertJsonFragment(['id' => 'RP-REVISE'])->assertJsonMissing(['issue' => 'Dokumentasi dilengkapi.']);
    }

    public function test_batch_failure_rolls_back_earlier_changes_and_disabled_accounts_cannot_log_in(): void
    {
        $this->actingAs($this->user('director'));
        $before = json_decode(DB::table('projects')->where('id', 'P1')->value('payload'), true);
        $this->postJson('/api/property/changes', [
            'revision' => $this->version(), 'workspace' => true,
            'changes' => [
                ['resource' => 'projects', 'id' => 'P1', 'operation' => 'update', 'fields' => ['evaluation' => 'Review belum tersimpan.']],
                ['resource' => 'accounts', 'id' => 'ACC-FAKE', 'operation' => 'create', 'fields' => []],
            ],
        ])->assertForbidden();
        $this->assertSame($before, json_decode(DB::table('projects')->where('id', 'P1')->value('payload'), true));

        $this->post('/logout');
        $client = $this->user('client');
        $client->forceFill(['active' => false, 'password' => 'PasswordInactive!42'])->save();
        $this->post('/login', ['email' => $client->email, 'password' => 'PasswordInactive!42'])
            ->assertSessionHasErrors('email');
        $this->assertGuest();
    }

    private function user(string $role): User
    {
        return User::query()->where('role', $role)->orderBy('id')->firstOrFail();
    }

    private function version(): int
    {
        return (int) DB::table('property_revisions')->value('version');
    }

    private function change(string $resource, string $id, array $fields, string $operation = 'update', bool $workspace = true, ?int $version = null): TestResponse
    {
        return $this->postJson('/api/property/changes', [
            'revision' => $version ?? $this->version(), 'workspace' => $workspace,
            'changes' => [['resource' => $resource, 'id' => $id, 'operation' => $operation, 'fields' => $fields]],
        ]);
    }

    private function workflow(string $action, array $input = []): TestResponse
    {
        return $this->postJson('/api/property/workflow/'.$action, ['revision' => $this->version(), 'input' => $input]);
    }

    private function uploadPayment(string $id): TestResponse
    {
        return $this->workflow('payment-submit', [
            'id' => $id, 'proof' => 'transfer.png', 'reference' => 'BANK-001', 'proofData' => self::PNG,
        ]);
    }
}
