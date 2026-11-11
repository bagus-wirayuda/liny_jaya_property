<?php

use App\Services\PaymentCalculator;
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('promos', function (Blueprint $table): void {
            $table->dropForeign(['project_id']);
        });

        Schema::table('promos', function (Blueprint $table): void {
            $table->string('project_id', 64)->nullable()->change();
            $table->string('unit_id', 64)->nullable()->after('project_id');
            $table->foreign('project_id')->references('id')->on('projects')->restrictOnDelete();
            $table->foreign('unit_id')->references('id')->on('units')->restrictOnDelete();
        });

        if (! Schema::hasTable('workspace_settings') || ! DB::table('workspace_settings')->where('id', 'company')->exists()) {
            return;
        }

        $now = now();
        if (! DB::table('workspace_settings')->where('id', 'payment_methods')->exists()) {
            DB::table('workspace_settings')->insert([
                'id' => 'payment_methods',
                'payload' => json_encode(PaymentCalculator::defaultConfig(), JSON_THROW_ON_ERROR),
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $companyRow = DB::table('workspace_settings')->where('id', 'company')->first();
        if ($companyRow) {
            $company = json_decode((string) $companyRow->payload, true) ?: [];
            $isLegacy = ($company['name'] ?? '') === 'LinyJaya Development'
                || str_contains((string) ($company['address'] ?? ''), 'Bandung')
                || str_contains((string) ($company['address'] ?? ''), 'Jawa Barat')
                || str_contains((string) ($company['hours'] ?? ''), 'WIB');

            if ($isLegacy) {
                $company['name'] = 'LinyJaya Property';
                $company['tagline'] = 'Hunian modern, terukur, dan nyaman untuk keluarga di Kota Makassar.';
                $company['address'] = 'Kota Makassar, Sulawesi Selatan (Alamat kantor pemasaran resmi tersedia saat konfirmasi)';
                $company['hours'] = 'Senin – Sabtu, 08.30 – 17.00 WITA';
                $company['vision'] = 'Menghadirkan kawasan hunian terukur, transparan, dan layak huni bagi keluarga di Kota Makassar dan Sulawesi Selatan.';
                $company['mission'] = 'Merancang hunian modern yang fungsional, menyediakan 3 skema pembayaran terstruktur (Cash Keras, Cash Lunak, dan estimasi KPR), serta mendampingi setiap calon pemilik rumah secara terbuka.';
                DB::table('workspace_settings')->where('id', 'company')->update([
                    'payload' => json_encode($company, JSON_THROW_ON_ERROR),
                    'updated_at' => $now,
                ]);
            }
        }

        $makassarProjects = [
            'P1' => [
                'legacyCities' => ['Kota Bandung', 'Bandung'],
                'name' => 'LinyJaya Tamalanrea Residence',
                'city' => 'Kota Makassar',
                'location' => 'Koridor Tallasa City, Tamalanrea, Kota Makassar',
                'facilities' => [
                    'Keamanan 24 jam',
                    'Akses Tol Sutami & Jl. Perintis Kemerdekaan',
                    'Dekat kawasan pendidikan Tamalanrea',
                    'Taman lingkungan',
                    'Jalan kawasan 8 meter',
                ],
                'description' => 'Kawasan hunian modern dengan tata ruang efisien di koridor pengembangan Tamalanrea – Tallasa City, Kota Makassar, dekat jalur utama dan fasilitas keluarga.',
            ],
            'P2' => [
                'legacyCities' => ['Kota Bekasi', 'Bekasi'],
                'name' => 'LinyJaya Panakkukang Park',
                'city' => 'Kota Makassar',
                'location' => 'Kawasan Panakkukang, Kota Makassar',
                'facilities' => [
                    'Taman tematik keluarga',
                    'One-gate system',
                    'Akses cepat Jl. Boulevard & AP Pettarani',
                    'Drainase tertutup',
                    'Ruang komunal',
                ],
                'description' => 'Perumahan dua lantai bernuansa hangat di kawasan strategis Panakkukang, Kota Makassar, mendukung mobilitas keluarga ke pusat niaga, sekolah, dan perkantoran.',
            ],
            'P3' => [
                'legacyCities' => ['Kabupaten Bogor', 'Bogor'],
                'name' => 'LinyJaya Antang Asri',
                'city' => 'Kota Makassar',
                'location' => 'Manggala – Antang, Kota Makassar',
                'facilities' => [
                    'Ruang terbuka hijau',
                    'Mushola kawasan',
                    'Jogging track',
                    'Akses Jl. Antang Raya & Urip Sumoharjo',
                    'Sistem CCTV area',
                ],
                'description' => 'Hunian keluarga bertumbuh dengan halaman lega dan lingkungan asri di kawasan Manggala – Antang, Kota Makassar Timur.',
            ],
        ];

        foreach ($makassarProjects as $projectId => $replacement) {
            $row = DB::table('projects')->where('id', $projectId)->first();
            if (! $row) {
                continue;
            }
            $payload = json_decode((string) $row->payload, true) ?: [];
            if (in_array($payload['city'] ?? '', $replacement['legacyCities'], true)) {
                unset($replacement['legacyCities']);
                DB::table('projects')->where('id', $projectId)->update([
                    'payload' => json_encode([...$payload, ...$replacement], JSON_THROW_ON_ERROR),
                    'updated_at' => $now,
                ]);
            }
        }

        if (Schema::hasTable('users')) {
            DB::table('users')
                ->where('email', 'maya@example.com')
                ->whereIn('address', ['Jl. Merpati No. 18, Bandung', 'Bandung, Jawa Barat'])
                ->update(['address' => 'Jl. Perintis Kemerdekaan, Tamalanrea, Kota Makassar']);
        }

        $promoOverrides = [
            'PR-001' => [
                'name' => 'Potongan 5% Tamalanrea Residence',
                'scope' => 'Proyek',
                'discountType' => 'Persentase',
                'discountValue' => 5,
                'eligibleMethods' => ['Cash Keras', 'Cash Lunak', 'KPR'],
                'image' => 'house-1',
                'description' => 'Potongan harga 5% untuk pemesanan unit pilihan di LinyJaya Tamalanrea Residence selama periode promo.',
                'terms' => 'Berlaku untuk pengajuan pemesanan baru pada periode aktif promo sesuai metode pembayaran yang dipilih.',
            ],
            'PR-002' => [
                'name' => 'Potongan Langsung Panakkukang Park',
                'scope' => 'Proyek',
                'discountType' => 'Nominal',
                'discountValue' => 15000000,
                'eligibleMethods' => ['Cash Keras', 'Cash Lunak'],
                'image' => 'house-2',
                'description' => 'Potongan langsung Rp 15.000.000 untuk pembelian unit di LinyJaya Panakkukang Park dengan metode Cash Keras atau Cash Lunak.',
                'terms' => 'Berlaku selama periode promo untuk skema Cash Keras atau cicilan bertahap Cash Lunak langsung ke developer.',
            ],
            'PR-003' => [
                'name' => 'Potongan Rp 20 Juta Antang Asri',
                'scope' => 'Proyek',
                'discountType' => 'Nominal',
                'discountValue' => 20000000,
                'eligibleMethods' => ['Cash Keras', 'Cash Lunak', 'KPR'],
                'image' => 'neighborhood',
                'description' => 'Potongan nominal Rp 20.000.000 untuk unit pilihan di LinyJaya Antang Asri, Makassar.',
                'terms' => 'Berlaku pada periode aktif promo. Untuk skema KPR, persetujuan kredit tetap ditentukan oleh bank pilihan pembeli.',
            ],
        ];

        foreach (DB::table('promos')->get() as $promoRow) {
            $payload = json_decode((string) $promoRow->payload, true) ?: [];
            $legacyNames = [
                'PR-001' => ['Kemudahan pemesanan akhir tahun', 'Promo Cash Keras Diskon 5%'],
                'PR-002' => ['Program pembukaan tahap satu', 'Cash Bertahap Developer Bunga 0%'],
                'PR-003' => ['Konsultasi KPR terstruktur', 'KPR Express & Subsidi Biaya'],
            ];
            $isLegacyPromo = isset($legacyNames[$promoRow->id])
                && in_array($payload['name'] ?? '', $legacyNames[$promoRow->id], true)
                && ! isset($payload['discountType']);

            if ($isLegacyPromo) {
                DB::table('promos')->where('id', $promoRow->id)->update([
                    'payload' => json_encode([...$payload, ...$promoOverrides[$promoRow->id]], JSON_THROW_ON_ERROR),
                    'updated_at' => $now,
                ]);
            } elseif (! isset($payload['discountType'])) {
                DB::table('promos')->where('id', $promoRow->id)->update([
                    'payload' => json_encode([
                        ...$payload,
                        'scope' => $promoRow->unit_id ? 'Unit' : ($promoRow->project_id ? 'Proyek' : 'Semua Properti'),
                        'discountType' => 'Persentase',
                        'discountValue' => 0,
                        'eligibleMethods' => PaymentCalculator::CANONICAL_METHODS,
                        'image' => $payload['image'] ?? 'house-1',
                        'terms' => $payload['terms'] ?? '',
                    ], JSON_THROW_ON_ERROR),
                    'updated_at' => $now,
                ]);
            }
        }

        $article = DB::table('articles')->where('id', 'AR-001')->first();
        if ($article) {
            $payload = json_decode((string) $article->payload, true) ?: [];
            $text = (string) ($payload['body'] ?? ($payload['content'] ?? ''));
            if (str_contains($text, 'bank mitra') || str_contains($text, 'bank nasional terkemuka') || str_contains($text, 'LinyJaya Development')) {
                $payload['title'] = 'Panduan Memilih Cara Bayar: Cash Keras, Cash Lunak, atau KPR';
                $payload['summary'] = 'Panduan praktis membandingkan skema Cash Keras, Cash Lunak langsung ke developer, dan estimasi KPR sebelum pengajuan unit di Kota Makassar.';
                $payload['body'] = "Memilih skema pembayaran rumah perlu disesuaikan dengan likuiditas dan rencana keuangan keluarga. Di LinyJaya Property Makassar, tersedia tiga metode pembayaran yang dapat disimulasikan sebelum mengajukan pemesanan:\n\n1. Cash Keras: Pembayaran tunai penuh atau tanda jadi diikuti pelunasan langsung dalam batas waktu kesepakatan developer, cocok bagi pembeli yang memprioritaskan penyelesaian transaksi lebih cepat.\n\n2. Cash Lunak (Bertahap): Pembayaran bertahap langsung ke developer dengan DP dan cicilan bulanan terjadwal sesuai tenor pilihan tanpa melalui proses kredit bank.\n\n3. KPR: Pembiayaan melalui fasilitas Kredit Pemilikan Rumah (KPR) bank dengan DP, plafon pinjaman, suku bunga, dan tenor jangka panjang. Hasil simulasi KPR di situs ini bersifat estimasi ilustratif dan bukan persetujuan kredit bank.";
                unset($payload['content']);
                DB::table('articles')->where('id', 'AR-001')->update([
                    'payload' => json_encode($payload, JSON_THROW_ON_ERROR),
                    'updated_at' => $now,
                ]);
            }
        }
    }

    public function down(): void
    {
        Schema::table('promos', function (Blueprint $table): void {
            $table->dropForeign(['unit_id']);
            $table->dropForeign(['project_id']);
            $table->dropColumn('unit_id');
        });

        Schema::table('promos', function (Blueprint $table): void {
            $table->string('project_id', 64)->nullable(false)->change();
            $table->foreign('project_id')->references('id')->on('projects')->restrictOnDelete();
        });
    }
};
