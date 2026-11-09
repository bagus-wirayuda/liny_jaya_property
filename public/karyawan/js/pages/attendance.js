(function () {
  const { icon: I, esc: E, btn: B } = LJ;
  const { attendanceTable } = LJ.dashboardShared;
  LJ.pages.employee.attendance = function (tab) {
    const d = LJ.db,
      mytasks = d.tasks.filter((t) => t.employee === LJ.employeeName());
    const t = tab || "attendance",
      today = d.attendance.find(
        (a) => a.employee === LJ.employeeName() && a.date === LJ.today(),
      );
    return (
      LJ.tabs(
        [
          ["attendance", "Kehadiran"],
          ["schedule", "Jadwal kerja"],
          ["leave", "Izin & cuti"],
        ],
        t,
      ) +
      (t === "schedule"
        ? LJ.panel(
            "Jadwal kerja Anda",
            `<div class="notice">${I("calendar")}Rencana kegiatan tercantum pada daftar penugasan. Jam kerja dan perubahan jadwal perlu dikonfirmasi oleh penanggung jawab proyek.</div>${mytasks.map((task) => `<div class="schedule-row"><div class="schedule-date">${new Date(task.deadline + "T12:00:00").getDate()}<small>${new Date(task.deadline + "T12:00:00").toLocaleString("id-ID", { month: "short" })}</small></div><div><h4>${E(task.title)}</h4><p>${LJ.unitLabel(task.unit)} · ${E(task.status)}</p></div></div>`).join("")}`,
          )
        : t === "leave"
          ? LJ.panel(
              "Pengajuan izin & cuti",
              LJ.table(
                ["Tanggal", "Jenis", "Keterangan", "Status"],
                d.leave
                  .filter((a) => a.employee === LJ.employeeName())
                  .map((a) => [
                    LJ.date(a.date),
                    E(a.kind),
                    E(a.reason),
                    LJ.badge(a.status),
                  ]),
              ),
              B("Ajukan izin", "leave-new", "", "primary small", "plus"),
            )
          : `<div class="portal-banner"><div><h3>Kehadiran hari ini</h3><p>${today ? "Masuk " + today.in + (today.out ? " · Pulang " + today.out : " · Belum pencatatan jam pulang") : "Anda belum melakukan pencatatan jam masuk hari ini."}</p></div>${B(today?.out ? "Kehadiran selesai" : today ? "Catat jam pulang" : "Catat jam masuk", "attendance", today?.id || "", "primary small", "clock")}</div>${attendanceTable(d.attendance.filter((a) => a.employee === LJ.employeeName()))}`)
    );
  };
})();
