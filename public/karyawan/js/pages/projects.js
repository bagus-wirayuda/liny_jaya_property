(function () {
  LJ.pages.employee.projects = function (tab) {
    const d = LJ.db,
      mytasks = d.tasks.filter((t) => t.employee === LJ.employeeName()),
      myunits = [...new Set(mytasks.map((t) => t.unit))];
    const t = tab || "projects";
    return (
      LJ.tabs(
        [
          ["projects", "Proyek ditugaskan"],
          ["units", "Unit & blueprint"],
          ["schedule", "Jadwal pekerjaan"],
        ],
        t,
      ) +
      (t === "units"
        ? `<div class="grid two">${myunits
            .map((id) => {
              const u = LJ.unit(id);
              return LJ.panel(
                LJ.unitLabel(id),
                LJ.blueprint(u.type) + LJ.progress(u.progress, u.stage),
              );
            })
            .join("")}</div>`
        : t === "schedule"
          ? LJ.manager("schedules", {
              readonly: true,
              filter: (s) => myunits.includes(s.unit),
            })
          : `<div class="grid three">${d.projects
              .filter((p) =>
                myunits.some((id) => LJ.unit(id)?.project === p.id),
              )
              .map(LJ.projectCard)
              .join("")}</div>`)
    );
  };
})();
