(function () {
  const { link: A } = LJ;
  const { bookingTable } = LJ.dashboardShared;
  LJ.pages.admin.bookings = function (tab, role = "admin") {
    const d = LJ.db;
    const t = tab || "active";
    let bs = d.bookings.filter((b) =>
      t === "history"
        ? ["Dibatalkan", "Selesai"].includes(b.status)
        : t === "dp"
          ? b.status === "DP terverifikasi"
          : !["Dibatalkan", "Selesai"].includes(b.status),
    );
    return (
      LJ.tabs(
        [
          ["active", "Pengajuan & pemesanan"],
          ["dp", "DP terverifikasi"],
          ["history", "Riwayat & pembatalan"],
        ],
        t,
      ) +
      LJ.panel(
        "Pemesanan " + (t === "history" ? "sebelumnya" : "unit"),
        bookingTable(bs, role),
        A("Lihat pilihan unit", "admin/units.html", "primary small", "plus"),
        "Tinjau unit sebelum menyusun catatan pemesanan pada ruang kerja klien.",
      )
    );
  };
})();
