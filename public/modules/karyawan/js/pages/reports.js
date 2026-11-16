(function () {
  const { reportCards } = LJ.dashboardShared;
  LJ.pages.employee.reports = function (tab) {
    const d = LJ.db;
    const t = tab || "all";
    return (
      LJ.tabs(
        [
          ["all", "Semua laporan"],
          ["pending", "Menunggu persetujuan"],
          ["revision", "Perlu revisi"],
        ],
        t,
      ) +
      `<div class="grid three">${
        d.reports
          .filter(
            (r) =>
              r.employee === LJ.employeeName() &&
              (t === "all" ||
                r.status ===
                  (t === "pending" ? "Menunggu persetujuan" : "Perlu revisi")),
          )
          .map((r) => reportCards([r]))
          .join("") ||
        LJ.empty(
          "Tidak ada laporan dalam kategori ini",
          "Buat laporan setelah melakukan pekerjaan lapangan.",
        )
      }</div>`
    );
  };
})();
