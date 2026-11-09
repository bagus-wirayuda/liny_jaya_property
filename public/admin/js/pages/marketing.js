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
              l.interest === "Survei lokasi" || l.interest === "Konsultasi KPR",
          })
        : LJ.manager(t))
    );
  };
})();
