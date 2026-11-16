(function () {
  const { link: A } = LJ;
  const { constructionTable } = LJ.dashboardShared;
  LJ.pages.admin.units = function (tab) {
    const d = LJ.db;
    const t = tab || "list";
    return (
      LJ.tabs(
        [
          ["list", "Daftar unit"],
          ["spec", "Denah & spesifikasi"],
          ["status", "Status & ketersediaan"],
        ],
        t,
      ) +
      (t === "list"
        ? LJ.manager("units", {
            note: "Status penjualan mengikuti pemesanan dan verifikasi DP. Status pembangunan dikelola melalui laporan pekerjaan.",
          })
        : t === "spec"
          ? `<div class="grid three">${d.units
              .slice(0, 6)
              .map((u) =>
                LJ.panel(
                  LJ.unitLabel(u.id),
                  LJ.blueprint(u.type) +
                    `<p class="u-mt-12">LT ${u.land} m² · LB ${u.building} m² · ${u.beds} kamar</p>`,
                  A("Detail unit", LJ.propertyPage("units", u.id, "admin"), "ghost small"),
                ),
              )
              .join("")}</div>`
          : constructionTable(d.units))
    );
  };
})();
