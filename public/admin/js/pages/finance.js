(function () {
  const { btn: B } = LJ;
  const { analytics, paymentTable } = LJ.dashboardShared;
  LJ.pages.admin.finance = function (tab) {
    const d = LJ.db;
    const t = tab || "payments";
    return (
      LJ.tabs(
        [
          ["payments", "Pembayaran"],
          ["verify", "Verifikasi DP & termin"],
          ["expenses", "Pengeluaran"],
          ["invoice", "Invoice & kuitansi"],
          ["reports", "Laporan"],
        ],
        t,
      ) +
      (t === "expenses"
        ? LJ.manager("expenses", {
            extra: (e) =>
              e.status === "Menunggu persetujuan"
                ? LJ.iBtn("eye", "expense-review", e.id, "Tinjau pengeluaran")
                : "",
          })
        : t === "reports"
          ? analytics("finance")
          : LJ.panel(
              t === "verify"
                ? "Menunggu verifikasi"
                : t === "invoice"
                  ? "Invoice & kuitansi"
                  : "Semua pembayaran",
              paymentTable(
                t === "verify"
                  ? d.payments.filter((p) => p.status === "Menunggu verifikasi")
                  : d.payments,
                "admin",
              ),
              B("Tambah termin", "payment-new", "", "primary small", "plus"),
            ))
    );
  };
})();
