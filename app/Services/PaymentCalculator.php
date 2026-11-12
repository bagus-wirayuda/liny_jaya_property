<?php

namespace App\Services;

use App\Models\WorkspaceSetting;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\Schema;
use Illuminate\Validation\ValidationException;

class PaymentCalculator
{
    public const TIMEZONE = 'Asia/Makassar';

    /** @var list<string> */
    public const CANONICAL_METHODS = ['Cash Keras', 'Cash Lunak', 'KPR'];

    /** @var array<string, string> */
    private const METHOD_ALIASES = [
        'Cash Keras' => 'Cash Keras',
        'Cash Lunak' => 'Cash Lunak',
        'Cash Bertahap' => 'Cash Lunak',
        'KPR' => 'KPR',
        'KPR Bank' => 'KPR',
    ];

    /**
     * Default configurable KPR simulation presets including cooperating banks.
     *
     * @return list<array{
     *   id: string,
     *   name: string,
     *   partnerId: string,
     *   bankName: string,
     *   dpPercent: int,
     *   tenorYears: int,
     *   interestRate: float,
     *   badge: string,
     *   note: string,
     *   active: bool
     * }>
     */
    public static function defaultKprPresets(): array
    {
        return [
            [
                'id' => 'KPR-BCA-FIX',
                'name' => 'KPR Bank BCA — Fix Promo',
                'partnerId' => 'PT-005',
                'bankName' => 'Bank BCA',
                'dpPercent' => 20,
                'tenorYears' => 15,
                'interestRate' => 4.75,
                'badge' => 'Bank Rekanan',
                'note' => 'Simulasi bunga fix promo kerja sama Bank BCA selama masa awal kredit.',
                'active' => true,
            ],
            [
                'id' => 'KPR-DP-RINGAN',
                'name' => 'KPR DP Ringan 10%',
                'partnerId' => '',
                'bankName' => 'Bank Rekanan',
                'dpPercent' => 10,
                'tenorYears' => 20,
                'interestRate' => 7.25,
                'badge' => 'DP Rendah',
                'note' => 'Pilihan uang muka ringan 10% dengan tenor panjang agar cicilan lebih terjangkau.',
                'active' => true,
            ],
            [
                'id' => 'KPR-REGULER',
                'name' => 'KPR Reguler Fleksibel',
                'partnerId' => '',
                'bankName' => 'Bank Umum / Syariah',
                'dpPercent' => 20,
                'tenorYears' => 15,
                'interestRate' => 7.5,
                'badge' => 'Standar',
                'note' => 'Acuan simulasi anuitas standar dengan DP 20% dan pilihan tenor fleksibel.',
                'active' => true,
            ],
        ];
    }

    /**
     * Default configurable payment method rules persisted in workspace_settings.
     *
     * @return array{
     *   cashKeras: array{enabled: bool, label: string, dpPercent: int, settlementDays: int, description: string},
     *   cashLunak: array{enabled: bool, label: string, dpPercent: int, tenorMonths: int, maxTenorMonths: int, interestPercent: float, dueDay: int, description: string},
     *   kpr: array{enabled: bool, label: string, dpPercent: int, defaultTenorYears: int, minTenorYears: int, maxTenorYears: int, interestRate: float, description: string, presets: list<array<string, mixed>>}
     * }
     */
    public static function defaultConfig(): array
    {
        return [
            'cashKeras' => [
                'enabled' => true,
                'label' => 'Cash Keras',
                'dpPercent' => 20,
                'settlementDays' => 14,
                'description' => 'Pembayaran tunai penuh atau tanda jadi diikuti pelunasan langsung dalam batas waktu kesepakatan developer.',
            ],
            'cashLunak' => [
                'enabled' => true,
                'label' => 'Cash Lunak',
                'dpPercent' => 20,
                'tenorMonths' => 12,
                'maxTenorMonths' => 36,
                'interestPercent' => 0.0,
                'dueDay' => 10,
                'description' => 'Pembayaran bertahap langsung ke developer dengan DP dan cicilan bulanan terjadwal.',
            ],
            'kpr' => [
                'enabled' => true,
                'label' => 'KPR',
                'dpPercent' => 20,
                'defaultTenorYears' => 15,
                'minTenorYears' => 5,
                'maxTenorYears' => 25,
                'interestRate' => 7.5,
                'description' => 'Pembiayaan pembelian rumah melalui Kredit Pemilikan Rumah (KPR) bank rekanan; nilai cicilan bersifat estimasi dan bukan persetujuan kredit bank.',
                'presets' => self::defaultKprPresets(),
            ],
        ];
    }

    /**
     * Normalize KPR preset structures for both stored configuration and Admin updates.
     *
     * @param  array<int, mixed>  $presets
     * @return list<array<string, mixed>>
     */
    public static function normalizePresets(array $presets): array
    {
        $normalized = [];
        foreach ($presets as $index => $item) {
            if (! is_array($item)) {
                continue;
            }
            $name = trim((string) ($item['name'] ?? ''));
            if ($name === '') {
                continue;
            }
            $id = trim((string) ($item['id'] ?? ''));
            $normalized[] = [
                'id' => $id !== '' ? $id : 'KPR-'.($index + 1),
                'name' => $name,
                'partnerId' => trim((string) ($item['partnerId'] ?? '')),
                'bankName' => trim((string) ($item['bankName'] ?? 'Bank Rekanan')) ?: 'Bank Rekanan',
                'dpPercent' => max(5, min(80, (int) ($item['dpPercent'] ?? 20))),
                'tenorYears' => max(1, min(30, (int) ($item['tenorYears'] ?? 15))),
                'interestRate' => round(max(0.0, min(25.0, (float) ($item['interestRate'] ?? 7.5))), 2),
                'badge' => trim((string) ($item['badge'] ?? '')),
                'note' => trim((string) ($item['note'] ?? '')),
                'active' => (bool) ($item['active'] ?? true),
            ];
        }

        return $normalized;
    }

    /**
     * Load payment method settings merged cleanly with safe defaults.
     *
     * @return array<string, array<string, mixed>>
     */
    public function config(): array
    {
        $defaults = self::defaultConfig();
        if (! Schema::hasTable('workspace_settings')) {
            return $defaults;
        }

        $row = WorkspaceSetting::query()->find('payment_methods');

        return $this->mergeConfig(is_array($row?->payload) ? $row->payload : []);
    }

    /**
     * Merge partial configuration overrides with baseline or current configuration.
     *
     * @param  array<string, mixed>  $overrides
     * @param  array<string, array<string, mixed>>|null  $baseConfig
     * @return array<string, array<string, mixed>>
     */
    public function mergeConfig(array $overrides, ?array $baseConfig = null): array
    {
        $defaults = $baseConfig ?? self::defaultConfig();
        foreach ($defaults as $key => $base) {
            if (isset($overrides[$key]) && is_array($overrides[$key])) {
                $merged = [...$base, ...array_intersect_key($overrides[$key], $base)];
                if ($key === 'kpr') {
                    $merged['presets'] = array_key_exists('presets', $overrides[$key]) && is_array($overrides[$key]['presets'])
                        ? self::normalizePresets($overrides[$key]['presets'])
                        : self::normalizePresets(is_array($base['presets'] ?? null) ? $base['presets'] : self::defaultKprPresets());
                }
                $defaults[$key] = $merged;
            }
        }

        return $defaults;
    }

    public function normalizeMethod(string $method): string
    {
        $canonical = self::METHOD_ALIASES[$method] ?? null;
        if (! $canonical) {
            throw ValidationException::withMessages(['method' => 'Metode pembayaran tidak dikenali.']);
        }

        return $canonical;
    }

    public function configKey(string $method): string
    {
        return match ($this->normalizeMethod($method)) {
            'Cash Keras' => 'cashKeras',
            'Cash Lunak' => 'cashLunak',
            'KPR' => 'kpr',
        };
    }

    public function isMethodEnabled(string $method, ?array $config = null): bool
    {
        $resolved = $config ?? $this->config();
        $key = $this->configKey($method);

        return (bool) ($resolved[$key]['enabled'] ?? true);
    }

    /**
     * Check whether a promo record is currently active, within period, matches property targeting, and supports the method.
     *
     * @param  array<string, mixed>  $promo
     */
    public function promoAppliesTo(array $promo, string $unitId, string $projectId, ?string $method = null, ?string $onDate = null): bool
    {
        $today = $onDate ?? now(self::TIMEZONE)->toDateString();
        if (($promo['status'] ?? '') !== 'Aktif') {
            return false;
        }
        $start = (string) ($promo['start'] ?? '');
        $end = (string) ($promo['end'] ?? '');
        if ($start === '' || $end === '' || $today < $start || $today > $end) {
            return false;
        }

        $promoUnit = (string) ($promo['unit'] ?? '');
        $promoProject = (string) ($promo['project'] ?? '');
        if ($promoUnit !== '') {
            if ($promoUnit !== $unitId) {
                return false;
            }
        } elseif ($promoProject !== '') {
            if ($promoProject !== $projectId) {
                return false;
            }
        }

        if ($method !== null) {
            $canonical = $this->normalizeMethod($method);
            $eligible = is_array($promo['eligibleMethods'] ?? null) && $promo['eligibleMethods'] !== []
                ? $promo['eligibleMethods']
                : self::CANONICAL_METHODS;

            if (! in_array($canonical, $eligible, true)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Compute discount amount and net house price from an eligible promo.
     *
     * @param  array<string, mixed>|null  $promo
     * @return array{originalPrice: int, discountAmount: int, finalPrice: int}
     */
    public function computeDiscount(int $basePrice, ?array $promo, string $unitId, string $projectId, string $method, ?string $onDate = null): array
    {
        if (! $promo) {
            return [
                'originalPrice' => $basePrice,
                'discountAmount' => 0,
                'finalPrice' => $basePrice,
            ];
        }

        if (! $this->promoAppliesTo($promo, $unitId, $projectId, $method, $onDate)) {
            throw ValidationException::withMessages(['promoId' => 'Promo tidak aktif, sudah kedaluwarsa, atau tidak berlaku untuk unit/metode ini.']);
        }

        $type = (string) ($promo['discountType'] ?? 'Persentase');
        $rawValue = (float) ($promo['discountValue'] ?? 0);
        $discount = $type === 'Nominal'
            ? (int) round($rawValue)
            : (int) round($basePrice * ($rawValue / 100));
        $discount = max(0, min($basePrice, $discount));

        return [
            'originalPrice' => $basePrice,
            'discountAmount' => $discount,
            'finalPrice' => max(0, $basePrice - $discount),
        ];
    }

    /**
     * Compute full payment breakdown and schedules for Cash Keras, Cash Lunak, or KPR.
     *
     * @param  array<string, mixed>|null  $promo
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    public function simulate(
        int $basePrice,
        string $unitId,
        string $projectId,
        string $method,
        ?array $promo = null,
        array $overrides = [],
        ?array $config = null,
        ?string $onDate = null,
    ): array {
        $resolvedConfig = $config ?? $this->config();
        $canonical = $this->normalizeMethod($method);
        if (! $this->isMethodEnabled($canonical, $resolvedConfig)) {
            throw ValidationException::withMessages(['method' => "Metode pembayaran {$canonical} sedang dinonaktifkan oleh Admin."]);
        }

        $pricing = $this->computeDiscount($basePrice, $promo, $unitId, $projectId, $canonical, $onDate);
        $netPrice = $pricing['finalPrice'];

        return match ($canonical) {
            'Cash Keras' => $this->simulateCashKeras($netPrice, $pricing, $resolvedConfig['cashKeras'], $overrides),
            'Cash Lunak' => $this->simulateCashLunak($netPrice, $pricing, $resolvedConfig['cashLunak'], $overrides),
            'KPR' => $this->simulateKpr($netPrice, $pricing, $resolvedConfig['kpr'], $overrides),
        };
    }

    /**
     * Generate concrete monthly Cash Lunak installment items after DP verification.
     *
     * @param  array<string, mixed>  $cashLunakConfig
     * @return list<array{kind: string, amount: int, due: string}>
     */
    public function cashLunakSchedule(int $netPrice, int $dpPaid, int $tenorMonths, array $cashLunakConfig, ?string $startDate = null): array
    {
        $months = max(1, $tenorMonths);
        $principal = max(0, $netPrice - $dpPaid);
        $interestPercent = max(0.0, (float) ($cashLunakConfig['interestPercent'] ?? 0));
        $totalInterest = $interestPercent > 0
            ? (int) round($principal * ($interestPercent / 100) * ($months / 12))
            : 0;
        $totalPayable = $principal + $totalInterest;
        if ($totalPayable === 0) {
            return [];
        }

        $dueDay = max(1, min(28, (int) ($cashLunakConfig['dueDay'] ?? 10)));
        $anchor = CarbonImmutable::parse($startDate ?? now(self::TIMEZONE)->toDateString(), self::TIMEZONE);
        $baseInstallment = (int) intdiv($totalPayable, $months);
        $remainder = $totalPayable - ($baseInstallment * $months);

        $items = [];
        for ($i = 1; $i <= $months; $i++) {
            $dueDate = $anchor->addMonthsNoOverflow($i)->day($dueDay)->toDateString();
            $amount = $baseInstallment + ($i === $months ? $remainder : 0);
            $items[] = [
                'kind' => "Angsuran {$i}/{$months}",
                'amount' => $amount,
                'due' => $dueDate,
            ];
        }

        return $items;
    }

    /**
     * @param  array{originalPrice: int, discountAmount: int, finalPrice: int}  $pricing
     * @param  array<string, mixed>  $methodConfig
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function simulateCashKeras(int $netPrice, array $pricing, array $methodConfig, array $overrides): array
    {
        $dpPercent = (float) ($overrides['dpPercent'] ?? $methodConfig['dpPercent']);
        $dpPercent = max(0.0, min(100.0, $dpPercent));
        $dpAmount = (int) round($netPrice * ($dpPercent / 100));
        $settlementAmount = max(0, $netPrice - $dpAmount);
        $settlementDays = max(1, (int) ($methodConfig['settlementDays'] ?? 14));

        return [
            ...$pricing,
            'method' => 'Cash Keras',
            'dpPercent' => $dpPercent,
            'dpAmount' => $dpAmount,
            'settlementAmount' => $settlementAmount,
            'settlementDays' => $settlementDays,
            'totalPayment' => $netPrice,
            'assumptions' => [
                "DP / tanda jadi {$dpPercent}% dibayar saat pemesanan (jatuh tempo 7 hari).",
                "Sisa pelunasan sebesar 100% dikurangi DP dibayar maksimal {$settlementDays} hari setelah verifikasi DP.",
                'Harga akhir sudah memperhitungkan potongan promo apabila promo aktif memenuhi syarat.',
            ],
        ];
    }

    /**
     * @param  array{originalPrice: int, discountAmount: int, finalPrice: int}  $pricing
     * @param  array<string, mixed>  $methodConfig
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function simulateCashLunak(int $netPrice, array $pricing, array $methodConfig, array $overrides): array
    {
        $maxTenor = max(1, (int) ($methodConfig['maxTenorMonths'] ?? 36));
        $dpPercent = (float) ($overrides['dpPercent'] ?? $methodConfig['dpPercent']);
        $dpPercent = max(5.0, min(90.0, $dpPercent));
        $tenorMonths = (int) ($overrides['tenorMonths'] ?? $methodConfig['tenorMonths']);
        $tenorMonths = max(1, min($maxTenor, $tenorMonths));
        $interestPercent = (float) ($overrides['interestPercent'] ?? $overrides['interestRate'] ?? $methodConfig['interestPercent']);
        $interestPercent = max(0.0, min(30.0, $interestPercent));
        $dueDay = max(1, min(28, (int) ($methodConfig['dueDay'] ?? 10)));

        $dpAmount = (int) round($netPrice * ($dpPercent / 100));
        $principal = max(0, $netPrice - $dpAmount);
        $totalInterest = $interestPercent > 0
            ? (int) round($principal * ($interestPercent / 100) * ($tenorMonths / 12))
            : 0;
        $totalInstallmentPayable = $principal + $totalInterest;
        $monthlyInstallment = (int) round($totalInstallmentPayable / $tenorMonths);
        $totalPayment = $dpAmount + $totalInstallmentPayable;
        $schedule = $this->cashLunakSchedule(
            $netPrice,
            $dpAmount,
            $tenorMonths,
            [...$methodConfig, 'interestPercent' => $interestPercent, 'dueDay' => $dueDay],
        );

        return [
            ...$pricing,
            'method' => 'Cash Lunak',
            'dpPercent' => $dpPercent,
            'dpAmount' => $dpAmount,
            'principal' => $principal,
            'tenorMonths' => $tenorMonths,
            'interestPercent' => $interestPercent,
            'totalInterest' => $totalInterest,
            'monthlyInstallment' => $monthlyInstallment,
            'dueDay' => $dueDay,
            'totalPayment' => $totalPayment,
            'schedule' => $schedule,
            'assumptions' => [
                "Uang muka (DP) {$dpPercent}% dari harga bersih, dibayar saat pengajuan pemesanan.",
                "Sisa pokok dicicil langsung ke developer selama {$tenorMonths} bulan berturut-turut dengan jatuh tempo tanggal {$dueDay} setiap bulan.",
                $interestPercent > 0
                    ? "Menggunakan margin/bunga flat {$interestPercent}% per tahun sesuai ketentuan developer."
                    : 'Skema cicilan bertahap 0% bunga langsung kepada developer (tanpa bunga bank).',
            ],
        ];
    }

    /**
     * @param  array{originalPrice: int, discountAmount: int, finalPrice: int}  $pricing
     * @param  array<string, mixed>  $methodConfig
     * @param  array<string, mixed>  $overrides
     * @return array<string, mixed>
     */
    private function simulateKpr(int $netPrice, array $pricing, array $methodConfig, array $overrides): array
    {
        $presetId = isset($overrides['presetId']) ? (string) $overrides['presetId'] : '';
        $preset = null;
        if ($presetId !== '') {
            foreach ($methodConfig['presets'] ?? [] as $item) {
                if (($item['id'] ?? '') === $presetId) {
                    $preset = $item;
                    break;
                }
            }
        }

        $minYears = max(1, (int) ($methodConfig['minTenorYears'] ?? 5));
        $maxYears = max($minYears, (int) ($methodConfig['maxTenorYears'] ?? 25));
        $dpPercent = (float) ($overrides['dpPercent'] ?? $preset['dpPercent'] ?? $methodConfig['dpPercent']);
        $dpPercent = max(5.0, min(80.0, $dpPercent));
        $tenorYears = (int) ($overrides['tenorYears'] ?? $preset['tenorYears'] ?? $methodConfig['defaultTenorYears']);
        $tenorYears = max($minYears, min($maxYears, $tenorYears));
        $interestRate = (float) ($overrides['interestRate'] ?? $preset['interestRate'] ?? $methodConfig['interestRate']);
        $interestRate = max(0.0, min(25.0, $interestRate));

        $dpAmount = (int) round($netPrice * ($dpPercent / 100));
        $plafon = max(0, $netPrice - $dpAmount);
        $months = $tenorYears * 12;
        $monthlyRate = ($interestRate / 100) / 12;

        if ($plafon === 0) {
            $monthlyInstallment = 0;
        } elseif ($monthlyRate > 0) {
            $factor = pow(1 + $monthlyRate, $months);
            $monthlyInstallment = (int) round($plafon * ($monthlyRate * $factor) / ($factor - 1));
        } else {
            $monthlyInstallment = (int) round($plafon / $months);
        }

        $totalInstallments = $monthlyInstallment * $months;
        $totalInterest = max(0, $totalInstallments - $plafon);
        $totalPayment = $dpAmount + $totalInstallments;

        return [
            ...$pricing,
            'method' => 'KPR',
            'presetId' => $preset['id'] ?? null,
            'presetName' => $preset['name'] ?? null,
            'bankName' => $preset['bankName'] ?? null,
            'dpPercent' => $dpPercent,
            'dpAmount' => $dpAmount,
            'plafon' => $plafon,
            'tenorYears' => $tenorYears,
            'tenorMonths' => $months,
            'interestRate' => $interestRate,
            'monthlyInstallment' => $monthlyInstallment,
            'totalInstallments' => $totalInstallments,
            'totalInterest' => $totalInterest,
            'totalPayment' => $totalPayment,
            'disclaimer' => 'Estimasi KPR ini merupakan perhitungan anuitas ilustratif, bukan surat persetujuan kredit (SP3K) dari bank.',
            'assumptions' => [
                "Plafon pinjaman dihitung dari Harga Bersih dikurangi DP ({$dpPercent}%).",
                "Angsuran bulanan dihitung menggunakan rumus anuitas efektif standar perbankan: P × r × (1+r)^n / ((1+r)^n - 1) selama {$months} bulan.",
                "Asumsi suku bunga efektif {$interestRate}% per tahun; besaran cicilan riil mengikuti kebijakan suku bunga fixed/floating bank penyalur.",
                'Estimasi belum termasuk biaya akad kredit, notaris, provisi, BPHTB, maupun asuransi jiwa/kebakaran.',
            ],
        ];
    }
}
