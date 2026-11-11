<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Employee;
use App\Models\Evaluation;
use App\Models\Project;
use App\Models\Promo;
use App\Models\PropertyRevision;
use App\Models\Unit;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class CleanRoutesAndModelsTest extends TestCase
{
    use RefreshDatabase;

    protected $seed = true;

    public function test_clean_parameterized_routes_and_legacy_html_redirects(): void
    {
        $this->get('/proyek/P1')
            ->assertOk()
            ->assertViewIs('public.proyek')
            ->assertViewHas('recordId', 'P1');

        $this->get('/unit/U1')
            ->assertOk()
            ->assertViewIs('public.unit')
            ->assertViewHas('recordId', 'U1');

        $this->get('/artikel/AR-001')
            ->assertOk()
            ->assertViewIs('public.artikel-detail')
            ->assertViewHas('recordId', 'AR-001');

        $this->get('/proyek/TIDAK-ADA')->assertNotFound();
        $this->get('/unit/TIDAK-ADA')->assertNotFound();

        $this->get('/unit.html?id=U1&workspace=admin')
            ->assertStatus(301)
            ->assertRedirect('/unit?id=U1&workspace=admin');

        $this->get('/properti.html')
            ->assertStatus(301)
            ->assertRedirect('/properti');

        $this->get('/client/bookings.html')
            ->assertStatus(301)
            ->assertRedirect('/client/bookings');

        $this->actingAs($this->user('client'))
            ->get('/portal.html')
            ->assertStatus(301)
            ->assertRedirect('/dashboard');
    }

    public function test_eloquent_models_and_relationships_resolve_seeded_records(): void
    {
        /** @var Project $project */
        $project = Project::query()->with('units')->findOrFail('P1');
        $this->assertTrue($project->units->contains('id', 'U1'));

        /** @var Unit $unit */
        $unit = Unit::query()->with('project')->findOrFail('U1');
        $this->assertSame('P1', $unit->project?->id);

        /** @var Booking|null $booking */
        $booking = Booking::query()->with(['unit', 'client', 'payments'])->first();
        $this->assertNotNull($booking);
        $this->assertInstanceOf(Unit::class, $booking->unit);
        $this->assertInstanceOf(User::class, $booking->client);

        $activeClientCount = User::query()->clients()->count();
        $this->assertGreaterThan(0, $activeClientCount);

        /** @var Employee $employee */
        $employee = Employee::query()->has('evaluations')->with('evaluations')->firstOrFail();
        $this->assertTrue($employee->evaluations->every(
            fn (Evaluation $evaluation): bool => $evaluation->employee_id === $employee->id,
        ));

        $activePromos = Promo::query()->active()->get();
        $this->assertTrue($activePromos->every(
            fn (Promo $promo): bool => ($promo->payload['status'] ?? null) === 'Aktif',
        ));
    }

    public function test_public_snapshot_exposes_active_promos_only_and_admin_can_edit_seeded_article(): void
    {
        $this->actingAs($this->user('admin'));

        $this->change('promos', 'PR-DRAFT', [
            'name' => 'Promo Internal Draf',
            'project' => 'P1',
            'start' => '2026-11-01',
            'end' => '2026-12-31',
            'status' => 'Draf',
            'description' => 'Belum siap dipublikasikan.',
        ], 'create')->assertOk();

        $this->change('promos', 'PR-ACTIVE', [
            'name' => 'Promo Akhir Tahun',
            'project' => 'P1',
            'start' => '2026-11-01',
            'end' => '2026-12-31',
            'status' => 'Aktif',
            'description' => 'Promo aktif untuk pengunjung.',
        ], 'create')->assertOk();

        $this->getJson('/api/property/data?workspace=1')
            ->assertOk()
            ->assertJsonFragment(['id' => 'PR-DRAFT'])
            ->assertJsonFragment(['id' => 'PR-ACTIVE']);

        $this->post('/logout')->assertRedirect('/login');

        $this->getJson('/api/property/data')
            ->assertOk()
            ->assertJsonFragment(['id' => 'PR-ACTIVE'])
            ->assertJsonMissing(['id' => 'PR-DRAFT']);

        $this->actingAs($this->user('admin'));
        $this->change('articles', 'AR-001', ['title' => 'Panduan KPR Diperbarui'], 'update')
            ->assertOk()
            ->assertJsonFragment(['title' => 'Panduan KPR Diperbarui', 'category' => 'Panduan Finansial']);
    }

    public function test_cross_role_internal_messages_evaluations_and_notifications(): void
    {
        $employee = $this->user('employee');

        $this->actingAs($employee);
        $this->change('messages', 'MSG-TEST', [
            'subject' => 'Kebutuhan Material Blok A',
            'message' => 'Mohon persetujuan tambahan semen untuk tahap struktur.',
        ], 'create')->assertOk();

        $this->assertDatabaseHas('messages', [
            'id' => 'MSG-TEST',
            'author_id' => $employee->id,
        ]);

        $this->actingAs($this->user('admin'));
        $this->getJson('/api/property/data?workspace=1')
            ->assertOk()
            ->assertJsonFragment(['id' => 'MSG-TEST', 'senderRole' => 'Karyawan'])
            ->assertJsonFragment(['title' => 'Pesan tim internal', 'message' => 'Kebutuhan Material Blok A']);

        $this->change('messages', 'MSG-TEST', [
            'status' => 'Diproses',
            'reply' => 'Pengadaan semen sedang diproses hari ini.',
        ], 'update')->assertOk();

        $this->actingAs($this->user('admin'));
        $this->change('employees', 'EMP-OTHER', [
            'name' => 'Karyawan Lain',
            'email' => 'karyawan.lain@example.com',
            'division' => 'Teknik',
            'position' => 'Inspector',
            'status' => 'Aktif',
        ], 'create')->assertOk();

        $this->change('evaluations', 'EV-SELF', [
            'employee' => $employee->employee_id,
            'period' => '2026-Q4',
            'score' => 92,
            'notes' => 'Kinerja lapangan sangat baik.',
        ], 'create')->assertOk();

        $this->change('evaluations', 'EV-OTHER', [
            'employee' => 'EMP-OTHER',
            'period' => '2026-Q4',
            'score' => 75,
            'notes' => 'Catatan khusus karyawan lain.',
        ], 'create')->assertOk();

        $this->actingAs($employee);
        $this->getJson('/api/property/data?workspace=1')
            ->assertOk()
            ->assertJsonFragment(['id' => 'MSG-TEST', 'reply' => 'Pengadaan semen sedang diproses hari ini.'])
            ->assertJsonFragment(['title' => 'Tanggapan pesan internal', 'message' => 'Kebutuhan Material Blok A'])
            ->assertJsonFragment(['id' => 'EV-SELF'])
            ->assertJsonMissing(['id' => 'EV-OTHER']);
    }

    public function test_authenticated_password_update_invalidates_other_sessions(): void
    {
        $client = $this->user('client');
        $client->forceFill(['password' => 'OldPassword!123'])->save();

        DB::table('sessions')->insert([
            'id' => 'other-device-session',
            'user_id' => $client->id,
            'ip_address' => '127.0.0.1',
            'user_agent' => 'OtherDevice',
            'payload' => base64_encode('session'),
            'last_activity' => time(),
        ]);

        $this->actingAs($client);

        $this->postJson('/profile/password', [
            'current_password' => 'WrongPassword!123',
            'password' => 'NewPassword!456',
            'password_confirmation' => 'NewPassword!456',
        ])->assertUnprocessable()->assertJsonValidationErrors('current_password');

        $this->postJson('/profile/password', [
            'current_password' => 'OldPassword!123',
            'password' => 'NewPassword!456',
            'password_confirmation' => 'NewPassword!456',
        ])->assertOk()->assertJsonFragment(['message' => 'Kata sandi berhasil diperbarui.']);

        $client->refresh();
        $this->assertTrue(Hash::check('NewPassword!456', $client->password));
        $this->assertDatabaseMissing('sessions', ['id' => 'other-device-session']);
    }

    public function test_guest_favorites_merge_on_login_and_register(): void
    {
        $this->postJson('/api/property/favorite', ['id' => 'U2', 'selected' => true])->assertOk();

        $this->post('/register', [
            'name' => 'Pembeli Baru',
            'email' => 'pembeli.baru@example.com',
            'phone' => '081234567890',
            'password' => 'RegisterPass!123',
            'password_confirmation' => 'RegisterPass!123',
        ])->assertRedirect(route('workspace'));

        /** @var User $registered */
        $registered = User::query()->where('email', 'pembeli.baru@example.com')->firstOrFail();
        $this->assertDatabaseHas('property_favorites', [
            'user_id' => $registered->id,
            'property_id' => 'U2',
        ]);

        $this->post('/logout')->assertRedirect('/login');
        $this->assertGuest();

        $this->postJson('/api/property/favorite', ['id' => 'P1', 'selected' => true])->assertOk();

        $client = $this->user('client');
        $client->forceFill(['password' => 'LoginFavPass!123'])->save();

        $this->post('/login', [
            'email' => $client->email,
            'password' => 'LoginFavPass!123',
        ])->assertRedirect();

        $this->assertDatabaseHas('property_favorites', [
            'user_id' => $client->id,
            'property_id' => 'P1',
        ]);
    }

    public function test_archived_clients_excluded_and_handover_requires_active_booking(): void
    {
        $archivedClient = new User;
        $archivedClient->forceFill([
            'name' => 'Klien Arsip',
            'email' => 'klien.arsip@example.com',
            'password' => 'ArchivedClient!123',
            'role' => 'client',
            'active' => false,
            'archived_at' => now(),
        ])->save();

        $admin = $this->user('admin');

        $this->actingAs($admin);
        $this->getJson('/api/property/data?workspace=1')
            ->assertOk()
            ->assertJsonMissing(['email' => 'klien.arsip@example.com']);

        $this->change('units', 'U-HANDOVER', [
            'project' => 'P1',
            'block' => 'Z',
            'number' => '99',
            'type' => '60/90',
            'land' => 90,
            'building' => 60,
            'beds' => 2,
            'baths' => 1,
            'floors' => 1,
            'price' => 650000000,
            'estimate' => now('Asia/Jakarta')->addMonths(3)->toDateString(),
            'image' => 'house-1',
        ], 'create')->assertOk();

        /** @var Unit $unit */
        $unit = Unit::query()->findOrFail('U-HANDOVER');
        $unit->forceFill([
            'payload' => [...$unit->payload, 'progress' => 100, 'construction' => 'Selesai'],
        ])->save();

        $this->workflow('handover', ['id' => 'U-HANDOVER'])
            ->assertUnprocessable()
            ->assertJsonValidationErrors('workflow');
    }

    private function user(string $role): User
    {
        return User::query()->where('role', $role)->orderBy('id')->firstOrFail();
    }

    private function version(): int
    {
        return (int) PropertyRevision::query()->value('version');
    }

    private function change(string $resource, string $id, array $fields, string $operation = 'update', bool $workspace = true, ?int $version = null): TestResponse
    {
        return $this->postJson('/api/property/changes', [
            'revision' => $version ?? $this->version(),
            'workspace' => $workspace,
            'changes' => [[
                'resource' => $resource,
                'id' => $id,
                'operation' => $operation,
                'fields' => $fields,
            ]],
        ]);
    }

    private function workflow(string $action, array $input = []): TestResponse
    {
        return $this->postJson('/api/property/workflow/'.$action, [
            'revision' => $this->version(),
            'input' => $input,
        ]);
    }
}
