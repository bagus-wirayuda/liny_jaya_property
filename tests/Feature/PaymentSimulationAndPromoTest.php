<?php

namespace Tests\Feature;

use App\Models\Promo;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class PaymentSimulationAndPromoTest extends TestCase
{
    use RefreshDatabase;

    protected $seed = true;

    private const PNG = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ZPWQAAAAASUVORK5CYII=';

    public function test_public_promo_and_simulation_routes_render_with_makassar_identity(): void
    {
        $this->get('/promo')->assertOk()->assertSee('LinyJaya Property');
        $this->get('/simulasi')->assertOk()->assertSee('public/js/simulasi.js', false);
        $this->get('/simulasi/U2')->assertOk()->assertSee('LinyJaya Property');
        $this->get('/promo.html')->assertStatus(301)->assertRedirect('/promo');
        $this->get('/simulasi.html')->assertStatus(301)->assertRedirect('/simulasi');

        $home = $this->get('/');
        $home->assertOk();
        $home->assertSee('LinyJaya Property');
        $home->assertDontSee('LinyJaya Development');

        $snapshot = $this->getJson('/api/property/data')->assertOk();
        $snapshot->assertJsonPath('data.company.name', 'LinyJaya Property');
        $snapshot->assertJsonPath('data.projects.0.city', 'Kota Makassar');
        $snapshot->assertJsonPath('data.paymentConfig.cashKeras.enabled', true);
        $snapshot->assertJsonPath('data.paymentConfig.cashLunak.enabled', true);
        $snapshot->assertJsonPath('data.paymentConfig.kpr.enabled', true);

        $promos = collect($snapshot->json('data.promos'));
        $this->assertTrue($promos->contains(fn (array $promo): bool => $promo['id'] === 'PR-001'));
        $this->assertTrue($promos->every(fn (array $promo): bool => $promo['status'] === 'Aktif'));
    }

    public function test_simulation_endpoint_calculates_cash_keras_cash_lunak_and_kpr_accurately(): void
    {
        $cashKeras = $this->postJson('/api/property/simulate', [
            'unit' => 'U2',
            'method' => 'Cash Keras',
            'promoId' => 'PR-001',
        ])->assertOk()->json('simulation');

        // U2 price = 665,000,000; PR-001 is 5% discount = 33,250,000; net = 631,750,000; DP 20% = 126,350,000.
        $this->assertSame('Cash Keras', $cashKeras['method']);
        $this->assertSame(665000000, $cashKeras['originalPrice']);
        $this->assertSame(33250000, $cashKeras['discountAmount']);
        $this->assertSame(631750000, $cashKeras['finalPrice']);
        $this->assertSame(126350000, $cashKeras['dpAmount']);
        $this->assertSame(505400000, $cashKeras['settlementAmount']);
        $this->assertSame(14, $cashKeras['settlementDays']);

        $cashLunak = $this->postJson('/api/property/simulate', [
            'unit' => 'U7',
            'method' => 'Cash Lunak',
            'promoId' => 'PR-002',
            'dpPercent' => 25,
            'tenorMonths' => 18,
            'interestRate' => 6,
        ])->assertOk()->json('simulation');

        // U7 price = 780,000,000 (P2); PR-002 is Rp 15,000,000; net = 765,000,000; DP 25% = 191,250,000;
        // principal = 573,750,000; flat 6%/yr * 1.5 yrs = 51,637,500; total payable = 625,387,500.
        $this->assertSame('Cash Lunak', $cashLunak['method']);
        $this->assertSame(15000000, $cashLunak['discountAmount']);
        $this->assertSame(765000000, $cashLunak['finalPrice']);
        $this->assertSame(191250000, $cashLunak['dpAmount']);
        $this->assertSame(573750000, $cashLunak['principal']);
        $this->assertSame(51637500, $cashLunak['totalInterest']);
        $this->assertSame(18, $cashLunak['tenorMonths']);
        $this->assertCount(18, $cashLunak['schedule']);
        $this->assertSame(625387500, array_sum(array_column($cashLunak['schedule'], 'amount')));

        $kpr = $this->postJson('/api/property/simulate', [
            'unit' => 'U2',
            'method' => 'KPR',
            'dpPercent' => 20,
            'tenorYears' => 15,
            'interestRate' => 7.5,
        ])->assertOk()->json('simulation');

        $expectedPlafon = (int) round(665000000 * 0.8);
        $r = 0.075 / 12;
        $n = 180;
        $factor = pow(1 + $r, $n);
        $expectedMonthly = (int) round($expectedPlafon * ($r * $factor) / ($factor - 1));

        $this->assertSame('KPR', $kpr['method']);
        $this->assertSame($expectedPlafon, $kpr['plafon']);
        $this->assertSame($expectedMonthly, $kpr['monthlyInstallment']);
        $this->assertStringContainsString('bukan surat persetujuan kredit', strtolower($kpr['disclaimer']));
    }

    public function test_admin_can_configure_payment_methods_and_manage_promos_with_attachment(): void
    {
        $admin = $this->user('admin');
        $this->actingAs($admin);

        $today = CarbonImmutable::now('Asia/Makassar')->toDateString();
        $nextMonth = CarbonImmutable::now('Asia/Makassar')->addMonth()->toDateString();

        // Update payment method configuration
        $this->change('paymentConfig', 'payment_methods', [
            'cashKeras' => [
                'enabled' => true,
                'label' => 'Cash Keras',
                'dpPercent' => 30,
                'settlementDays' => 10,
                'description' => 'Pelunasan cepat 10 hari.',
            ],
            'cashLunak' => [
                'enabled' => true,
                'label' => 'Cash Lunak',
                'dpPercent' => 25,
                'tenorMonths' => 12,
                'maxTenorMonths' => 24,
                'interestPercent' => 0,
                'dueDay' => 15,
                'description' => 'Bertahap s.d. 24 bulan.',
            ],
            'kpr' => [
                'enabled' => false,
                'label' => 'KPR',
                'dpPercent' => 20,
                'defaultTenorYears' => 15,
                'minTenorYears' => 5,
                'maxTenorYears' => 20,
                'interestRate' => 8.0,
                'description' => 'KPR sedang dinonaktifkan sementara.',
            ],
        ])->assertOk();

        // Cash Keras simulation reflects updated defaults (30% DP, 10 settlement days)
        $ckSim = $this->postJson('/api/property/simulate', [
            'unit' => 'U2',
            'method' => 'Cash Keras',
        ])->assertOk()->json('simulation');
        $this->assertSame(30.0, (float) $ckSim['dpPercent']);
        $this->assertSame(10, $ckSim['settlementDays']);

        // Disabled KPR is rejected on simulation and client booking
        $this->postJson('/api/property/simulate', [
            'unit' => 'U2',
            'method' => 'KPR',
        ])->assertUnprocessable();

        // Admin creates a unit-targeted promo with uploaded PNG banner
        $this->change('promos', 'PR-UNIT-IMG', [
            'name' => 'Promo Khusus U4 Makassar',
            'scope' => 'Unit',
            'project' => 'P1',
            'unit' => 'U4',
            'discountType' => 'Nominal',
            'discountValue' => 10000000,
            'eligibleMethods' => ['Cash Keras', 'Cash Lunak'],
            'promoImageData' => self::PNG,
            'start' => $today,
            'end' => $nextMonth,
            'status' => 'Aktif',
            'description' => 'Potongan langsung khusus unit A-04.',
            'terms' => 'Berlaku untuk Cash Keras dan Cash Lunak.',
        ], 'create')->assertOk();

        $attachmentId = DB::table('property_attachments')
            ->where('resource', 'promos')
            ->where('record_id', 'PR-UNIT-IMG')
            ->where('field', 'promoImageData')
            ->value('id');
        $this->assertNotEmpty($attachmentId);
        $this->assertDatabaseHas('promos', ['id' => 'PR-UNIT-IMG', 'project_id' => 'P1', 'unit_id' => 'U4']);

        // Guest can view active promo image & promo snapshot
        $this->post('/logout');
        $this->get('/lampiran/'.$attachmentId)->assertOk()->assertHeader('Content-Type', 'image/png');
        $publicData = $this->getJson('/api/property/data')->assertOk();
        $createdPromo = collect($publicData->json('data.promos'))->firstWhere('id', 'PR-UNIT-IMG');
        $this->assertNotNull($createdPromo);
        $this->assertStringContainsString('/lampiran/'.$attachmentId, $createdPromo['promoImageData']);

        // When client tries disabled KPR or exceeds Cash Lunak maxTenorMonths (24), booking is rejected
        $this->actingAs($this->user('client'));
        $this->workflow('book', ['id' => 'U4', 'method' => 'KPR', 'consent' => true])->assertUnprocessable();
        $this->workflow('book', ['id' => 'U4', 'method' => 'Cash Lunak', 'tenorMonths' => 36, 'consent' => true])->assertUnprocessable();

        // Admin pauses promo to Draf -> public snapshot omits it and attachment returns 404
        $this->actingAs($admin);
        $this->change('promos', 'PR-UNIT-IMG', ['status' => 'Draf'])->assertOk();
        $this->post('/logout');
        $this->get('/lampiran/'.$attachmentId)->assertNotFound();
        $afterPause = collect($this->getJson('/api/property/data')->assertOk()->json('data.promos'));
        $this->assertFalse($afterPause->contains(fn (array $promo): bool => $promo['id'] === 'PR-UNIT-IMG'));
    }

    public function test_expired_inactive_or_mismatched_promos_are_rejected(): void
    {
        $admin = $this->user('admin');
        $client = $this->user('client');
        $yesterday = CarbonImmutable::now('Asia/Makassar')->subDay()->toDateString();
        $lastWeek = CarbonImmutable::now('Asia/Makassar')->subWeek()->toDateString();
        $today = CarbonImmutable::now('Asia/Makassar')->toDateString();
        $nextWeek = CarbonImmutable::now('Asia/Makassar')->addWeek()->toDateString();

        $this->actingAs($admin);
        $this->change('promos', 'PR-EXP', [
            'name' => 'Promo Kedaluwarsa',
            'scope' => 'Semua Properti',
            'discountType' => 'Nominal',
            'discountValue' => 10000000,
            'eligibleMethods' => ['Cash Keras'],
            'start' => $lastWeek,
            'end' => $yesterday,
            'status' => 'Aktif',
            'description' => 'Sudah lewat masa berlaku.',
        ], 'create')->assertOk();

        $this->change('promos', 'PR-DRAF', [
            'name' => 'Promo Draf',
            'scope' => 'Semua Properti',
            'discountType' => 'Persentase',
            'discountValue' => 5,
            'eligibleMethods' => ['KPR'],
            'start' => $today,
            'end' => $nextWeek,
            'status' => 'Draf',
            'description' => 'Belum aktif.',
        ], 'create')->assertOk();

        $this->assertFalse(Promo::query()->active($today)->whereIn('id', ['PR-EXP', 'PR-DRAF'])->exists());

        // Simulation rejects expired, draft, wrong-project (PR-002 belongs to P2 while U2 is P1), and wrong-method (PR-002 disallows KPR on U7)
        $this->actingAs($client);
        $this->postJson('/api/property/simulate', ['unit' => 'U2', 'method' => 'Cash Keras', 'promoId' => 'PR-EXP'])->assertUnprocessable();
        $this->postJson('/api/property/simulate', ['unit' => 'U2', 'method' => 'KPR', 'promoId' => 'PR-DRAF'])->assertUnprocessable();
        $this->postJson('/api/property/simulate', ['unit' => 'U2', 'method' => 'Cash Keras', 'promoId' => 'PR-002'])->assertUnprocessable();
        $this->postJson('/api/property/simulate', ['unit' => 'U7', 'method' => 'KPR', 'promoId' => 'PR-002'])->assertUnprocessable();

        // Client booking also rejects all 4 invalid promo combinations
        $this->workflow('book', ['id' => 'U2', 'method' => 'Cash Keras', 'promoId' => 'PR-EXP', 'consent' => true])->assertUnprocessable();
        $this->workflow('book', ['id' => 'U2', 'method' => 'KPR', 'promoId' => 'PR-DRAF', 'consent' => true])->assertUnprocessable();
        $this->workflow('book', ['id' => 'U2', 'method' => 'Cash Keras', 'promoId' => 'PR-002', 'consent' => true])->assertUnprocessable();
        $this->workflow('book', ['id' => 'U7', 'method' => 'KPR', 'promoId' => 'PR-002', 'consent' => true])->assertUnprocessable();
    }

    public function test_cash_keras_and_cash_lunak_workflows_generate_accurate_bills_and_complete_handover(): void
    {
        $admin = $this->user('admin');
        $director = $this->user('director');
        $employee = $this->user('employee');
        $client = $this->user('client');

        // 1) Cash Keras with PR-001 (5% off U2 = 665,000,000 -> 631,750,000)
        $this->actingAs($client);
        $bookRes = $this->workflow('book', [
            'id' => 'U2',
            'method' => 'Cash Keras',
            'promoId' => 'PR-001',
            'note' => 'Cash Keras dengan promo PR-001',
            'consent' => true,
        ])->assertOk();

        $bookingCk = collect($bookRes->json('data.bookings'))->firstWhere('unit', 'U2');
        $this->assertSame('Cash Keras', $bookingCk['paymentMethod']);
        $this->assertSame('PR-001', $bookingCk['promoId']);
        $this->assertSame(33250000, $bookingCk['discountAmount']);
        $this->assertSame(631750000, $bookingCk['finalPrice']);
        $this->assertSame(631750000, $bookingCk['contractPrice']);

        $dpCk = collect($bookRes->json('data.payments'))->firstWhere('booking', $bookingCk['id']);
        $this->assertSame(126350000, $dpCk['amount']);
        $this->uploadPayment($dpCk['id'])->assertOk();

        $this->actingAs($admin);
        $approvedCk = $this->workflow('payment-review', ['id' => $dpCk['id'], 'approved' => true])->assertOk();
        $pelunasan = collect($approvedCk->json('data.payments'))->first(
            fn (array $bill): bool => $bill['booking'] === $bookingCk['id'] && $bill['kind'] === 'Pelunasan',
        );
        $this->assertNotNull($pelunasan);
        $this->assertSame(505400000, $pelunasan['amount']);

        // Complete construction & pay pelunasan -> handover passes at discounted contractPrice!
        $this->workflow('construction-start', ['id' => 'U2'])->assertOk();
        $this->change('tasks', 'TS-CK-U2', [
            'title' => 'Penyelesaian U2',
            'unit' => 'U2',
            'employee' => $employee->employee_id,
            'deadline' => CarbonImmutable::now('Asia/Makassar')->addDays(2)->toDateString(),
            'priority' => 'Tinggi',
            'status' => 'Baru',
            'description' => 'Kerjakan penyelesaian akhir unit U2.',
        ], 'create')->assertOk();
        $this->actingAs($employee);
        $this->workflow('task-progress', ['id' => 'TS-CK-U2', 'status' => 'Dikerjakan'])->assertOk();
        $this->change('reports', 'RP-CK-U2', [
            'unit' => 'U2',
            'title' => 'Finishing U2 selesai',
            'date' => CarbonImmutable::now('Asia/Makassar')->toDateString(),
            'stage' => 'Finishing',
            'progress' => 100,
            'description' => 'Unit U2 siap serah terima.',
            'issue' => 'Tidak ada kendala.',
        ], 'create')->assertOk();
        $this->actingAs($director);
        $this->workflow('report-review', ['id' => 'RP-CK-U2', 'approved' => true])->assertOk();

        $this->actingAs($client);
        $this->uploadPayment($pelunasan['id'])->assertOk();
        $this->actingAs($admin);
        $this->workflow('payment-review', ['id' => $pelunasan['id'], 'approved' => true])->assertOk();
        $handover = $this->workflow('handover', ['id' => 'U2'])->assertOk();
        $u2After = collect($handover->json('data.units'))->firstWhere('id', 'U2');
        $this->assertSame('Diserahterimakan', $u2After['construction']);
        $this->assertSame('Terjual', $u2After['sale']);

        // 2) Cash Lunak 6 bulan with PR-002 (Rp 15,000,000 off U7 = 780,000,000 -> 765,000,000)
        $this->actingAs($client);
        $bookLunakRes = $this->workflow('book', [
            'id' => 'U7',
            'method' => 'Cash Lunak',
            'promoId' => 'PR-002',
            'tenorMonths' => 6,
            'note' => 'Cash Lunak 6 bulan Makassar',
            'consent' => true,
        ])->assertOk();

        $bookingCl = collect($bookLunakRes->json('data.bookings'))->firstWhere('unit', 'U7');
        $this->assertSame('Cash Lunak', $bookingCl['paymentMethod']);
        $this->assertSame(6, $bookingCl['tenorMonths']);
        $this->assertSame(765000000, $bookingCl['finalPrice']);

        $dpCl = collect($bookLunakRes->json('data.payments'))->firstWhere('booking', $bookingCl['id']);
        $this->assertSame(153000000, $dpCl['amount']);
        $this->uploadPayment($dpCl['id'])->assertOk();

        $this->actingAs($admin);
        $approvedCl = $this->workflow('payment-review', ['id' => $dpCl['id'], 'approved' => true])->assertOk();
        $installments = collect($approvedCl->json('data.payments'))
            ->filter(fn (array $bill): bool => $bill['booking'] === $bookingCl['id'] && str_starts_with($bill['kind'], 'Angsuran '))
            ->values();

        $this->assertCount(6, $installments);
        $this->assertSame('Angsuran 1/6', $installments[0]['kind']);
        $this->assertSame('Angsuran 6/6', $installments[5]['kind']);
        $this->assertSame(612000000, $installments->sum('amount'));
    }

    public function test_bank_bca_cooperation_is_seeded_and_editable_by_admin(): void
    {
        $this->assertFileExists(public_path('assets/partners/bca.svg'));
        $this->get('/mitra')->assertOk()->assertSee('public/js/partners.js', false);

        $snapshot = $this->getJson('/api/property/data')->assertOk();
        $bca = collect($snapshot->json('data.partners'))->firstWhere('id', 'PT-005');

        $this->assertNotNull($bca);
        $this->assertSame('Bank BCA (Bank Central Asia)', $bca['name']);
        $this->assertSame('Bank Rekanan KPR', $bca['cooperationType']);
        $this->assertSame('Aktif', $bca['status']);
        $this->assertSame(4.75, $bca['kprRate']);
        $this->assertSame(25, $bca['kprTenorMax']);
        $this->assertSame('assets/partners/bca.svg', $bca['logo']);

        $client = $this->user('client');
        $this->actingAs($client);
        $this->change('partners', 'PT-005', ['kprRate' => 1.0])->assertForbidden();

        $admin = $this->user('admin');
        $this->actingAs($admin);
        $updated = $this->change('partners', 'PT-005', [
            'cooperationType' => 'Bank Rekanan KPR',
            'status' => 'Aktif',
            'kprRate' => 5.25,
            'kprTenorMax' => 20,
            'logoData' => self::PNG,
            'description' => 'Kerja sama KPR Bank BCA Makassar dengan bunga acuan diperbarui Admin.',
        ])->assertOk();

        $bcaAfter = collect($updated->json('data.partners'))->firstWhere('id', 'PT-005');
        $this->assertSame(5.25, $bcaAfter['kprRate']);
        $this->assertSame(20, $bcaAfter['kprTenorMax']);
        $this->assertStringContainsString('diperbarui Admin', $bcaAfter['description']);
        $this->assertNotEmpty($bcaAfter['logoData']);

        // Uploaded Bank BCA logo attachment is readable on public website.
        $this->post('/logout');
        $logoPath = parse_url($bcaAfter['logoData'], PHP_URL_PATH);
        $this->get($logoPath)->assertOk();
    }

    public function test_admin_can_add_edit_delete_kpr_simulation_presets_and_simulate_with_preset(): void
    {
        $initial = $this->getJson('/api/property/data')->assertOk();
        $presets = collect($initial->json('data.paymentConfig.kpr.presets'));
        $this->assertTrue($presets->contains(fn (array $p): bool => $p['id'] === 'KPR-BCA-FIX' && $p['bankName'] === 'Bank BCA'));

        $bcaSim = $this->postJson('/api/property/simulate', [
            'unit' => 'U2',
            'method' => 'KPR',
            'presetId' => 'KPR-BCA-FIX',
        ])->assertOk()->json('simulation');

        $this->assertSame('KPR-BCA-FIX', $bcaSim['presetId']);
        $this->assertSame('KPR Bank BCA — Fix Promo', $bcaSim['presetName']);
        $this->assertSame(20, (int) $bcaSim['dpPercent']);
        $this->assertSame(15, $bcaSim['tenorYears']);
        $this->assertSame(4.75, $bcaSim['interestRate']);

        $admin = $this->user('admin');
        $this->actingAs($admin);

        $baseKpr = $initial->json('data.paymentConfig.kpr');
        $addedPresets = [
            ...$presets->all(),
            [
                'id' => 'KPR-BCA-MILENIAL',
                'name' => 'KPR Bank BCA — Milenial 20 Thn',
                'partnerId' => 'PT-005',
                'bankName' => 'Bank BCA',
                'dpPercent' => 15,
                'tenorYears' => 20,
                'interestRate' => 5.5,
                'badge' => 'Milenial',
                'note' => 'Pilihan DP 15% tenor panjang.',
                'active' => true,
            ],
        ];

        $afterAdd = $this->change('paymentConfig', 'payment_methods', [
            'kpr' => [...$baseKpr, 'presets' => $addedPresets],
        ])->assertOk();

        $afterPresets = collect($afterAdd->json('data.paymentConfig.kpr.presets'));
        $this->assertCount($presets->count() + 1, $afterPresets);
        $this->assertNotNull($afterPresets->firstWhere('id', 'KPR-BCA-MILENIAL'));

        // Partial update of sibling method preserves custom KPR presets.
        $cashKeras = $initial->json('data.paymentConfig.cashKeras');
        $afterPartial = $this->change('paymentConfig', 'payment_methods', [
            'cashKeras' => [...$cashKeras, 'settlementDays' => 21],
        ])->assertOk();
        $this->assertNotNull(collect($afterPartial->json('data.paymentConfig.kpr.presets'))->firstWhere('id', 'KPR-BCA-MILENIAL'));

        // Public simulation can use newly created KPR preset directly.
        $customSim = $this->postJson('/api/property/simulate', [
            'unit' => 'U2',
            'method' => 'KPR',
            'presetId' => 'KPR-BCA-MILENIAL',
        ])->assertOk()->json('simulation');

        $expectedPlafon = (int) round(665000000 * 0.85);
        $r = 0.055 / 12;
        $n = 240;
        $factor = pow(1 + $r, $n);
        $expectedMonthly = (int) round($expectedPlafon * ($r * $factor) / ($factor - 1));

        $this->assertSame(15, (int) $customSim['dpPercent']);
        $this->assertSame(20, $customSim['tenorYears']);
        $this->assertSame(5.5, $customSim['interestRate']);
        $this->assertSame($expectedMonthly, $customSim['monthlyInstallment']);

        // Admin deletes custom preset cleanly.
        $remaining = $afterPresets->reject(fn (array $p): bool => $p['id'] === 'KPR-BCA-MILENIAL')->values()->all();
        $afterDelete = $this->change('paymentConfig', 'payment_methods', [
            'kpr' => [...$baseKpr, 'presets' => $remaining],
        ])->assertOk();
        $this->assertNull(collect($afterDelete->json('data.paymentConfig.kpr.presets'))->firstWhere('id', 'KPR-BCA-MILENIAL'));
    }

    private function user(string $role): User
    {
        return User::query()->where('role', $role)->orderBy('id')->firstOrFail();
    }

    private function version(): int
    {
        return (int) DB::table('property_revisions')->value('version');
    }

    private function change(
        string $resource,
        string $id,
        array $fields,
        string $operation = 'update',
        bool $workspace = true,
        ?int $version = null,
    ): TestResponse {
        return $this->postJson('/api/property/changes', [
            'revision' => $version ?? $this->version(),
            'workspace' => $workspace,
            'changes' => [['resource' => $resource, 'id' => $id, 'operation' => $operation, 'fields' => $fields]],
        ]);
    }

    private function workflow(string $action, array $input = []): TestResponse
    {
        return $this->postJson('/api/property/workflow/'.$action, [
            'revision' => $this->version(),
            'input' => $input,
        ]);
    }

    private function uploadPayment(string $id): TestResponse
    {
        return $this->workflow('payment-submit', [
            'id' => $id,
            'proof' => 'transfer.png',
            'reference' => 'TRX-MKS-001',
            'proofData' => self::PNG,
        ]);
    }
}
