/* Editorial content and dynamic sales advisories for LinyJaya Development. */
(function () {
  LJ.editorial = {
    status: "Penawaran Resmi & Promo Spesial Berlaku",
    pricing:
      "Dapatkan promo cashback, diskon tunai keras hingga 5%, skema cicilan bertahap 0% ke developer, serta KPR DP ringan dengan subsidi biaya. Hubungi Property Advisor kami untuk penawaran terbaik hari ini.",
    record:
      "Catatan konsultasi dan pemesanan unit ditangani langsung oleh Tim Sales & Legal LinyJaya.",
    draft:
      "Simulasi pembayaran resmi LinyJaya Development untuk mempermudah perencanaan kepemilikan rumah impian Anda.",
    form: "Jadwalkan konsultasi properti dan survei show unit bersama Property Advisor LinyJaya. Layanan konsultasi gratis & fast response.",
    formResult:
      "Permohonan konsultasi berhasil dikirim! Tim Sales LinyJaya akan segera menghubungi Anda melalui WhatsApp atau telepon.",
    paymentResult:
      "Catatan pembayaran berhasil diperbarui. Tim keuangan dan legal siap mendampingi proses administrasi Anda.",
  };

  LJ.publicationNotice = (projectId) => {
    const activePromos = (LJ.db?.promos || []).filter(
      (promo) => !projectId || promo.project === projectId,
    );
    const promos = activePromos.length ? activePromos : (LJ.db?.promos || []);
    if (!promos.length) {
      return `<div class="publication-note sales-promo-bar">${LJ.icon("spark")}<span><strong>Konsultasi Cara Bayar:</strong> Pilihan Cash Keras, Cash Bertahap, dan KPR Bank tersedia bersama Property Advisor LinyJaya.</span></div>`;
    }
    const summary = promos
      .map((p) => {
        const snippet = (p.description || "").split(".")[0]?.trim();
        return snippet ? `${LJ.esc(p.name)} (${LJ.esc(snippet)})` : LJ.esc(p.name);
      })
      .join(" · ");
    return `<div class="publication-note sales-promo-bar">${LJ.icon("spark")}<span><strong>Promo Aktif:</strong> ${summary}. Hubungi tim sales untuk simulasi unit Anda.</span></div>`;
  };
})();
