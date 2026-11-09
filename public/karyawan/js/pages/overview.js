(function () {
  const { link: A, btn: B } = LJ;
  const { announcementList, taskCards, reportCards } = LJ.dashboardShared;
  LJ.pages.employee.overview = function () {
    const d = LJ.db;
    const tasks = d.tasks.filter((t) => t.employee === LJ.employeeName()),
      done = tasks.filter((t) => t.status === "Selesai").length;
    return (
      LJ.kpis([
        ["Tugas saya", tasks.length, "clipboard", "Seluruh penugasan"],
        [
          "Sedang dikerjakan",
          tasks.filter((t) => t.status === "Dikerjakan").length,
          "tool",
          "Aktivitas berjalan",
        ],
        ["Tugas selesai", done, "check", "Pekerjaan dituntaskan"],
        [
          "Laporan saya",
          d.reports.filter((r) => r.employee === LJ.employeeName()).length,
          "file",
          "Laporan lapangan",
        ],
      ]) +
      `<div class="dashboard-grid">${LJ.panel("Prioritas pekerjaan", taskCards(tasks.filter((t) => t.status !== "Selesai")), A("Semua tugas", "karyawan/tasks.html", "ghost small"))}${LJ.panel("Laporan progres terbaru", reportCards(d.reports.filter((r) => r.employee === LJ.employeeName()).slice(0, 1)), B("Buat laporan", "report-new", "", "primary small", "plus"))}</div>${LJ.panel("Pengumuman tim", announcementList(d.announcements))}`
    );
  };
})();
