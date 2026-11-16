(function () {
  LJ.pages.admin.marketing = function (tab) {
    const t = tab || "leads";
    return (
      LJ.tabs(
        [
          ["leads", "Leads"],
          ["survey", "Jadwal survei"],
          ["offers", "Penawaran"],
          ["promos", "Promo"],
          ["communications", "Komunikasi"],
        ],
        t,
      ) +
      (t === "survey"
        ? LJ.manager("leads", {
            title: "Jadwal survei & konsultasi",
            filter: (l) =>
              l.interest === "Survei lokasi" ||
              l.interest === "Konsultasi KPR" ||
              (l.interest || "").includes("Simulasi"),
          })
        : t === "promos"
          ? `<div class="notice sales-promo-bar u-mb-18">${LJ.icon("spark")}<span>Promo berstatus <strong>Aktif</strong> dalam periode tanggal berlaku otomatis tampil pada <a href="promo" class="text-link">halaman publik Promo</a> dan halaman <a href="simulasi" class="text-link">Simulasi Pembayaran</a>. Promo nonaktif atau kedaluwarsa tidak dapat dipilih.</span></div>${LJ.manager("promos")}`
          : LJ.manager(t))
    );
  };
})();
