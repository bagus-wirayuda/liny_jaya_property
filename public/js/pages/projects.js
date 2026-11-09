(function () {
  const { esc: E, btn: B } = LJ;
  LJ.pages.shared.projects = function (tab, role) {
    const d = LJ.db,
      readonly = role === "director";
    const t = tab || "list";
    return (
      LJ.tabs(
        [
          ["list", readonly ? "Monitoring proyek" : "Daftar proyek"],
          ["plan", "Site plan & kavling"],
          ["gallery", "Galeri proyek"],
          ["evaluation", "Evaluasi proyek"],
        ],
        t,
      ) +
      (t === "list"
        ? LJ.manager("projects", {
            readonly,
            extra: (p) =>
              `<a class="icon-btn" href="${LJ.propertyPage("projects", p.id, role)}" title="Lihat rincian proyek" aria-label="Lihat rincian proyek">${LJ.icon("external")}</a>`,
          })
        : t === "plan"
          ? `<div class="grid two">${d.projects.map((p) => LJ.panel(E(p.name), LJ.sitePlan(p.id))).join("")}</div>`
          : t === "gallery"
            ? `<div class="gallery-grid">${d.projects.map((p) => `<button data-action="gallery" data-id="${p.image}"><img src="${LJ.image(p.image)}" alt="${E(p.name)}"><h3>${E(p.name)}</h3><p>${E(p.status)}</p></button>`).join("")}</div>`
            : LJ.panel(
                "Evaluasi dan keputusan proyek",
                LJ.table(
                  ["Proyek", "Status", "Evaluasi", "Aksi"],
                  d.projects.map((p) => [
                    E(p.name),
                    LJ.badge(p.status),
                    E(p.evaluation || "Belum ada catatan evaluasi."),
                    B(
                      "Tinjau proyek",
                      "project-review",
                      p.id,
                      "secondary small",
                      "edit",
                    ),
                  ]),
                ),
              ))
    );
  };
})();
