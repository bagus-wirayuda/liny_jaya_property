<?php

use App\Models\Partner;
use App\Models\WorkspaceSetting;
use App\Services\PaymentCalculator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (Schema::hasTable('partners') && Partner::query()->exists()) {
            foreach (Partner::query()->get() as $partner) {
                $payload = is_array($partner->payload) ? $partner->payload : [];
                $changed = false;

                if (empty($payload['cooperationType'])) {
                    $payload['cooperationType'] = match ($payload['category'] ?? '') {
                        'Perbankan & pembiayaan' => $partner->id === 'PT-001' ? 'Bank Syariah Rekanan' : 'Bank Rekanan KPR',
                        'Material & solusi bangunan' => 'Material & Bangunan',
                        'Arsitektur & perencanaan' => 'Arsitektur & Konsultan',
                        default => 'Konstruksi & Kontraktor',
                    };
                    $changed = true;
                }

                if (empty($payload['status'])) {
                    $payload['status'] = 'Aktif';
                    $changed = true;
                }

                if (! array_key_exists('kprRate', $payload)) {
                    $payload['kprRate'] = $partner->id === 'PT-001' ? 6.5 : null;
                    $changed = true;
                }

                if (! array_key_exists('kprTenorMax', $payload)) {
                    $payload['kprTenorMax'] = $partner->id === 'PT-001' ? 20 : null;
                    $changed = true;
                }

                if ($changed) {
                    $partner->forceFill(['payload' => $payload])->save();
                }
            }

            if (! Partner::query()->where('id', 'PT-005')->exists()) {
                Partner::query()->create([
                    'id' => 'PT-005',
                    'payload' => [
                        'name' => 'Bank BCA (Bank Central Asia)',
                        'category' => 'Perbankan & pembiayaan',
                        'cooperationType' => 'Bank Rekanan KPR',
                        'status' => 'Aktif',
                        'kprRate' => 4.75,
                        'kprTenorMax' => 25,
                        'logo' => 'assets/partners/bca.svg',
                        'website' => 'https://www.bca.co.id/',
                        'description' => 'Kerja sama pembiayaan KPR Bank BCA untuk unit LinyJaya Property di Makassar dengan acuan bunga fix promo kompetitif dan tenor hingga 25 tahun. Hasil simulasi tetap bersifat estimasi ilustratif dan bukan persetujuan kredit bank.',
                    ],
                ]);
            }
        }

        if (Schema::hasTable('workspace_settings')) {
            $setting = WorkspaceSetting::query()->find('payment_methods');
            if ($setting) {
                $payload = is_array($setting->payload) ? $setting->payload : [];
                $kpr = is_array($payload['kpr'] ?? null) ? $payload['kpr'] : [];
                if (! array_key_exists('presets', $kpr)) {
                    $kpr['presets'] = PaymentCalculator::defaultKprPresets();
                    $payload['kpr'] = $kpr;
                    $setting->forceFill(['payload' => $payload])->save();
                }
            }
        }
    }

    public function down(): void
    {
        if (Schema::hasTable('partners')) {
            Partner::query()->where('id', 'PT-005')->delete();
        }
    }
};
