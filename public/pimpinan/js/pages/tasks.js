(function () {
  const { reportCards, taskBoard } = LJ.dashboardShared;
  LJ.pages.director.tasks = function (tab) {
    const d = LJ.db;
    const t = tab || "list";
    return (
      LJ.tabs(
        [
          ["list", "Semua penugasan"],
          ["board", "Papan tugas"],
          ["reports", "Peninjauan laporan"],
        ],
        t,
      ) +
      (t === "board"
        ? taskBoard(d.tasks)
        : t === "reports"
          ? `<div class="grid three">${d.reports.map((r) => reportCards([r], true)).join("")}</div>`
          : LJ.manager("tasks"))
    );
  };
})();
