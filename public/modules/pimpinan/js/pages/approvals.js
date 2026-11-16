(function () {
  const { esc: E } = LJ;
  const { reportCards, approvalList, documentGrid, ticketList } =
    LJ.dashboardShared;
  LJ.pages.director.approvals = function (tab) {
    const d = LJ.db;
    const t = tab || "pending";
    return (
      LJ.tabs(
        [
          ["pending", "Perlu keputusan"],
          ["budgets", "Anggaran & pengeluaran"],
          ["build", "Laporan pembangunan"],
          ["design", "Perubahan desain"],
          ["documents", "Dokumen"],
          ["history", "Riwayat keputusan"],
        ],
        t,
      ) +
      (t === "budgets"
        ? LJ.manager("expenses", {
            readonly: true,
            extra: (e) =>
              e.status === "Menunggu persetujuan"
                ? LJ.iBtn("check", "expense-review", e.id, "Tinjau anggaran")
                : "",
          })
        : t === "build"
          ? `<div class="grid three">${d.reports.map((r) => reportCards([r], true)).join("")}</div>`
          : t === "design"
            ? ticketList(
                d.tickets.filter((t) => t.category === "Perubahan desain"),
                true,
              )
            : t === "documents"
              ? documentGrid(d.documents)
              : t === "history"
                ? LJ.panel(
                    "Riwayat keputusan",
                    LJ.table(
                      ["Tanggal", "Oleh", "Keputusan"],
                      d.audit
                        .filter((l) =>
                          /setuju|verifikasi|ditolak|revisi|ditinjau/i.test(
                            l.action,
                          ),
                        )
                        .map((l) => [LJ.date(l.date), E(l.actor), E(l.action)]),
                    ),
                  )
                : LJ.panel(
                    "Keputusan yang menunggu",
                    approvalList(),
                    "",
                    "Verifikasi pembayaran merupakan kewenangan Administrator; Pimpinan dapat meninjau ringkasan tanpa mengubah hasil verifikasi.",
                  ))
    );
  };
})();
