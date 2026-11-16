(function () {
  const { btn: B } = LJ;
  const { announcementList } = LJ.dashboardShared;
  LJ.pages.employee.communication = function (tab) {
    const d = LJ.db;
    const t = tab || "announcements";
    return (
      LJ.tabs(
        [
          ["announcements", "Pengumuman"],
          ["messages", "Pesan manajemen"],
          ["discussion", "Diskusi proyek"],
        ],
        t,
      ) +
      (t === "announcements"
        ? LJ.panel("Informasi untuk tim", announcementList(d.announcements))
        : t === "messages"
          ? LJ.panel(
              "Pesan internal & tanggapan",
              announcementList(
                d.messages
                  .filter((m) => m.name !== LJ.employeeName() || m.reply)
                  .map((m) => ({
                    ...m,
                    message: m.reply
                      ? `${m.message} — Tanggapan manajemen: ${m.reply}`
                      : m.message,
                  })),
              ),
            )
          : LJ.manager("messages", {
              readonly: true,
              title: "Diskusi tim",
            }) +
            `<div class="mt">${B("Tulis pesan", "entity-add", "messages", "primary small", "message")}</div>`)
    );
  };
})();
