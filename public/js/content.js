/* Editorial content and dynamic sales advisories for LinyJaya Property Makassar. */
(function () {
  LJ.editorial = {
    status: "Informasi Hunian Kota Makassar & Promo Berlaku",
    pricing:
      "Bandingkan skema pembayaran Cash Keras, Cash Lunak langsung developer, dan estimasi KPR sesuai kebutuhan keluarga Anda di Kota Makassar.",
    record:
      "Catatan konsultasi dan pemesanan unit dikelola langsung melalui sistem LinyJaya Property.",
    draft:
      "Simulasi pembayaran LinyJaya Property bersifat estimasi untuk membantu perencanaan pembelian rumah Anda.",
    form: "Jadwalkan konsultasi properti atau kunjungan lokasi di Kota Makassar bersama tim pemasaran LinyJaya Property.",
    formResult:
      "Permohonan konsultasi berhasil dikirim. Tim LinyJaya Property akan menghubungi Anda untuk konfirmasi jadwal.",
    paymentResult:
      "Catatan pembayaran berhasil diperbarui. Peninjauan administrasi dilakukan sesuai jadwal dan bukti yang diajukan.",
  };

  LJ.publicationNotice = (projectId, unitId = null) => {
    const unit = unitId ? LJ.unit(unitId) : null;
    const activePromos = (LJ.db?.promos || []).filter((promo) => {
      if (!LJ.isPromoActive(promo)) return false;
      if (unit) return LJ.promoAppliesToUnit(promo, unit);
      if (projectId) return !promo.project || promo.project === projectId;
      return true;
    });
    if (!activePromos.length) {
      return `<div class="publication-note sales-promo-bar">${LJ.icon("spark")}<span><strong>3 Skema Pembayaran Tersedia:</strong> Cash Keras, Cash Lunak, dan estimasi KPR dapat dihitung di <a class="text-link" href="simulasi${unitId ? "?unit=" + encodeURIComponent(unitId) : ""}">halaman Simulasi</a>.</span></div>`;
    }
    const summary = activePromos
      .slice(0, 2)
      .map((p) => {
        const badge =
          Number(p.discountValue) > 0
            ? p.discountType === "Nominal"
              ? `potongan ${LJ.money(p.discountValue, true)}`
              : `potongan ${p.discountValue}%`
            : "";
        return badge ? `${LJ.esc(p.name)} (${badge})` : LJ.esc(p.name);
      })
      .join(" · ");
    return `<div class="publication-note sales-promo-bar">${LJ.icon("spark")}<span><strong>Promo Aktif Makassar:</strong> ${summary}. <a class="text-link" href="promo">Lihat detail promo</a> atau <a class="text-link" href="simulasi${unitId ? "?unit=" + encodeURIComponent(unitId) : ""}">hitung simulasi</a>.</span></div>`;
  };
})();
