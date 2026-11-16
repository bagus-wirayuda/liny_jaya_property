(function () {
  const { reportCards, constructionTable } = LJ.dashboardShared;
  LJ.pages.admin.construction = function (tab) {
    const d = LJ.db;
    const t = tab || "monitor";
    return (
      LJ.tabs(
        [
          ["monitor", "Monitoring unit"],
          ["tasks", "Penugasan"],
          ["schedules", "Jadwal"],
          ["reports", "Laporan & dokumentasi"],
          ["evaluation", "Evaluasi"],
        ],
        t,
      ) +
      (t === "tasks"
        ? LJ.manager("tasks")
        : t === "schedules"
          ? LJ.manager("schedules")
          : t === "reports"
            ? `<div class="grid three">${d.reports.map((r) => reportCards([r], true)).join("")}</div>`
            : t === "evaluation"
              ? LJ.manager("evaluations")
              : LJ.panel(
                  "Tahapan pembangunan unit",
                  constructionTable(d.units),
                  "",
                  "DP terverifikasi diperlukan untuk memulai pembangunan. Progres berubah melalui persetujuan laporan.",
                ))
    );
  };
})();
