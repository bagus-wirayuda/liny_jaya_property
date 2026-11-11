(function () {
  const { icon: I, esc: E, btn: B } = LJ;
  const { permissions } = LJ.dashboardShared;
  LJ.pages.admin.settings = function (tab) {
    const d = LJ.db;
    const t = tab || "accounts";
    return (
      LJ.tabs(
        [
          ["accounts", "Akun pengguna"],
          ["permissions", "Peran & akses"],
          ["payment", "Metode Pembayaran"],
          ["content", "Konten publik"],
          ["notifications", "Notifikasi"],
          ["config", "Konfigurasi"],
          ["audit", "Riwayat perubahan"],
          ["publication", "Kesiapan publikasi"],
        ],
        t,
      ) +
      (t === "publication"
        ? LJ.publicationReview()
        : t === "permissions"
          ? permissions()
          : t === "payment"
            ? (() => {
                const cfg = LJ.paymentConfig();
                return LJ.panel(
                  "Konfigurasi Metode Pembayaran Properti",
                  `<div class="notice">${I("info")}<span>Perubahan aturan Cash Keras, Cash Lunak, dan KPR langsung diterapkan ke halaman detail unit, simulasi pembayaran publik, pemesanan client, serta pembuatan tagihan termin.</span></div>
                  <form id="payment-config-form" class="u-mt-18">
                    <div class="form-error" role="alert"></div>
                    <div class="pay-config-grid">
                      <fieldset class="panel pay-config-card">
                        <legend>Cash Keras</legend>
                        <label class="toggle-line"><div><strong>Aktifkan Cash Keras</strong><p>Tersedia pada simulasi dan pemesanan unit.</p></div><input type="checkbox" name="ck_enabled" ${cfg.cashKeras.enabled ? "checked" : ""}></label>
                        ${LJ.field({ name: "ck_dpPercent", label: "DP / Tanda Jadi (%)", type: "number", min: 0, max: 100, step: "0.5", required: true }, cfg.cashKeras.dpPercent)}
                        ${LJ.field({ name: "ck_settlementDays", label: "Batas Pelunasan (Hari)", type: "number", min: 1, max: 90, required: true }, cfg.cashKeras.settlementDays)}
                        ${LJ.field({ name: "ck_description", label: "Keterangan Singkat", required: true, wide: true }, cfg.cashKeras.description)}
                      </fieldset>
                      <fieldset class="panel pay-config-card">
                        <legend>Cash Lunak (Developer)</legend>
                        <label class="toggle-line"><div><strong>Aktifkan Cash Lunak</strong><p>Cicilan bertahap langsung ke developer.</p></div><input type="checkbox" name="cl_enabled" ${cfg.cashLunak.enabled ? "checked" : ""}></label>
                        ${LJ.field({ name: "cl_dpPercent", label: "DP Minimal (%)", type: "number", min: 5, max: 90, step: "0.5", required: true }, cfg.cashLunak.dpPercent)}
                        ${LJ.field({ name: "cl_tenorMonths", label: "Tenor Default (Bulan)", type: "number", min: 1, max: 60, required: true }, cfg.cashLunak.tenorMonths)}
                        ${LJ.field({ name: "cl_maxTenorMonths", label: "Tenor Maksimal (Bulan)", type: "number", min: 1, max: 60, required: true }, cfg.cashLunak.maxTenorMonths)}
                        ${LJ.field({ name: "cl_interestPercent", label: "Bunga / Margin Flat (%/thn)", type: "number", min: 0, max: 30, step: "0.1", required: true }, cfg.cashLunak.interestPercent)}
                        ${LJ.field({ name: "cl_dueDay", label: "Tanggal Jatuh Tempo (1–28)", type: "number", min: 1, max: 28, required: true }, cfg.cashLunak.dueDay)}
                        ${LJ.field({ name: "cl_description", label: "Keterangan Singkat", required: true, wide: true }, cfg.cashLunak.description)}
                      </fieldset>
                      <fieldset class="panel pay-config-card">
                        <legend>KPR Bank (Estimasi)</legend>
                        <label class="toggle-line"><div><strong>Aktifkan KPR</strong><p>Pembiayaan bank dengan estimasi anuitas.</p></div><input type="checkbox" name="kpr_enabled" ${cfg.kpr.enabled ? "checked" : ""}></label>
                        ${LJ.field({ name: "kpr_dpPercent", label: "DP Default (%)", type: "number", min: 5, max: 80, step: "0.5", required: true }, cfg.kpr.dpPercent)}
                        ${LJ.field({ name: "kpr_defaultTenorYears", label: "Tenor Default (Tahun)", type: "number", min: 1, max: 30, required: true }, cfg.kpr.defaultTenorYears)}
                        ${LJ.field({ name: "kpr_minTenorYears", label: "Tenor Minimal (Tahun)", type: "number", min: 1, max: 20, required: true }, cfg.kpr.minTenorYears)}
                        ${LJ.field({ name: "kpr_maxTenorYears", label: "Tenor Maksimal (Tahun)", type: "number", min: 5, max: 35, required: true }, cfg.kpr.maxTenorYears)}
                        ${LJ.field({ name: "kpr_interestRate", label: "Asumsi Suku Bunga Indikatif (%/thn)", type: "number", min: 0, max: 25, step: "0.1", required: true }, cfg.kpr.interestRate)}
                        ${LJ.field({ name: "kpr_description", label: "Keterangan Singkat", required: true, wide: true }, cfg.kpr.description)}
                      </fieldset>
                    </div>
                    <div class="u-mt-18 flex between wrap gap-12">
                      <a href="simulasi" class="btn secondary">${I("calculator")} Tinjau Halaman Simulasi</a>
                      <button type="submit" class="btn primary">${I("check")} Simpan Konfigurasi Metode Bayar</button>
                    </div>
                  </form>`,
                );
              })()
            : t === "content"
            ? LJ.manager("articles")
            : t === "audit"
              ? LJ.panel(
                  "Riwayat perubahan",
                  LJ.table(
                    ["Waktu", "Pelaku", "Aktivitas"],
                    d.audit.map((l) => [
                      LJ.date(l.date),
                      E(l.actor),
                      E(l.action),
                    ]),
                  ),
                  B(
                    "Ekspor log",
                    "export-report",
                    "audit",
                    "secondary small",
                    "download",
                  ),
                )
              : t === "config"
                ? LJ.panel(
                    "Preferensi ruang kerja",
                    `<div class="notice">${I("info")}Kelola preferensi pemberitahuan dan arsip pencatatan. Perubahan pada halaman ini tidak mengubah kewenangan pengguna atau mengonfirmasi transaksi.</div><label class="toggle-line"><div><strong>Notifikasi aktivitas</strong><p>Tampilkan informasi perubahan dan pengumuman di portal.</p></div><input type="checkbox" data-setting="notifications" ${d.settings.notifications ? "checked" : ""}></label><div class="toggle-line"><div><strong>Unduh catatan administrasi</strong><p>Siapkan arsip catatan untuk peninjauan dan pencocokan kembali.</p></div>${B("Unduh JSON", "backup", "", "secondary small", "download")}</div><div class="toggle-line"><div><strong>Muat data terkini</strong><p>Perbarui tampilan dengan catatan terbaru dari server.</p></div>${B("Muat ulang", "reload-data", "", "secondary small", "refresh")}</div>`,
                  )
                : LJ.manager(t))
    );
  };
})();
