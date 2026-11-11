(function () {
  const { esc: E, btn: B } = LJ;
  const { attendanceTable } = LJ.dashboardShared;
  LJ.pages.shared.employees = function (tab, role) {
    const d = LJ.db,
      readonly = role === "director";
    const t = tab || "list";
    return (
      LJ.tabs(
        [
          ["list", "Data karyawan"],
          ["assignments", "Penugasan"],
          ["attendance", "Absensi"],
          ["leave", "Izin & cuti"],
          ["evaluation", "Evaluasi"],
          ["messages", "Pesan internal"],
        ],
        t,
      ) +
      (t === "assignments"
        ? LJ.manager("tasks", { readonly })
        : t === "evaluation"
          ? LJ.manager("evaluations")
          : t === "messages"
            ? LJ.manager("messages", {
                readonly: true,
                extra: (m) =>
                  LJ.iBtn("message", "message-reply", m.id, "Tanggapi pesan"),
              }) +
              `<div class="mt">${B("Kirim pesan internal", "entity-add", "messages", "primary small", "message")}</div>`
          : t === "leave"
            ? LJ.panel(
                "Pengajuan izin & cuti",
                LJ.table(
                  ["Karyawan", "Tanggal", "Jenis", "Alasan", "Status", "Aksi"],
                  d.leave.map((x) => [
                    E(x.employee),
                    LJ.date(x.date),
                    E(x.kind),
                    E(x.reason),
                    LJ.badge(x.status),
                    x.status === "Menunggu persetujuan"
                      ? B(
                          "Tinjau",
                          "leave-review",
                          x.id,
                          "secondary small",
                          "eye",
                        )
                      : "—",
                  ]),
                ),
              )
            : t === "attendance"
              ? attendanceTable(d.attendance)
              : LJ.manager("employees", { readonly }))
    );
  };
})();
