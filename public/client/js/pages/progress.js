(function () {
  const { esc: E, link: A } = LJ;
  const { homeSummary, reportCards } = LJ.dashboardShared;
  LJ.pages.client.progress = function (tab) {
    const d = LJ.db,
      bs = LJ.clientBookings();
    const active = bs.filter((b) => b.status !== "Dibatalkan"),
      selected = active.find((b) => b.unit === LJ.selectedUnit) || active[0],
      u = LJ.unit(selected?.unit);
    if (!u)
      return LJ.empty(
        "Belum ada rumah yang dipantau",
        "Pesan unit melalui katalog untuk memulai perjalanan Anda.",
        A("Cari properti", "client/search.html", "primary", "home"),
      );
    let rs = d.reports.filter(
      (r) => r.unit === u.id && r.status === "Disetujui",
    );
    return `<div class="filter-bar"><label for="progress-unit" class="u-text-10">Rumah yang dipantau</label><select class="form-control" id="progress-unit">${active.map((b) => `<option value="${b.unit}" ${b.unit === u.id ? "selected" : ""}>${E(LJ.project(LJ.unit(b.unit)?.project)?.name)} · ${LJ.unitLabel(b.unit)}</option>`).join("")}</select><span class="tag blue">Estimasi ${LJ.date(u.estimate)}</span></div>${homeSummary(u)}<div class="dashboard-grid">${LJ.panel("Perjalanan pembangunan", `<div class="flex between"><div><p>Progres keseluruhan</p><h2 class="blue client-progress-value">${u.progress}<small>%</small></h2></div>${LJ.badge(u.construction)}</div>${LJ.progress(u.progress, u.stage)}${LJ.timeline(u)}`)}${LJ.panel("Dokumentasi terbaru", reportCards(rs.slice(0, 2)), "", "Hanya laporan yang disetujui ditampilkan.")}</div>${LJ.panel(
      "Riwayat progres",
      LJ.table(
        ["Tanggal", "Tahap", "Progres", "Catatan"],
        rs.map((r) => [
          LJ.date(r.date),
          E(r.stage),
          r.progress + "%",
          E(r.description),
        ]),
      ),
    )}`;
  };
})();
