(function () {
  const { paymentTable, documentGrid } = LJ.dashboardShared;
  LJ.pages.client.documents = function (tab) {
    const d = LJ.db,
      bs = LJ.clientBookings(),
      ps = LJ.clientPayments();
    return (
      documentGrid(
        d.documents.filter((x) => bs.some((b) => b.id === x.booking)),
      ) +
      `<div class="mt">${LJ.panel(
        "Bukti pembayaran",
        paymentTable(
          ps.filter((p) => p.status === "Terverifikasi"),
          "client",
        ),
      )}</div>`
    );
  };
})();
