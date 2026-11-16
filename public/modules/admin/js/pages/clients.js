(function () {
  const { esc: E, btn: B } = LJ;
  const { bookingTable, paymentTable, documentGrid, ticketList } =
    LJ.dashboardShared;
  LJ.pages.admin.clients = function (tab, role = "admin") {
    const d = LJ.db;
    const t = tab || "profiles";
    return (
      LJ.tabs(
        [
          ["profiles", "Profil klien"],
          ["purchases", "Pembelian & kepemilikan"],
          ["payments", "Pembayaran"],
          ["documents", "Dokumen"],
          ["support", "Layanan klien"],
        ],
        t,
      ) +
      (t === "support"
        ? ticketList(d.tickets, true)
        : t === "payments"
          ? LJ.panel("Pembayaran klien", paymentTable(d.payments, "admin"))
          : t === "documents"
            ? `<div class="flex between mb"><h3>Dokumen klien</h3>${B("Tambahkan dokumen", "document-new", "", "primary small", "plus")}</div>` +
              documentGrid(d.documents)
            : t === "purchases"
              ? LJ.panel("Riwayat pembelian", bookingTable(d.bookings, role))
              : LJ.panel(
                  "Data klien",
                  LJ.table(
                    ["Klien", "Pemesanan aktif", "Total pembayaran", "Aksi"],
                    d.clients.map((client) => [
                      E(client.name),
                      d.bookings.filter(
                        (b) => b.clientId === client.id && b.status !== "Dibatalkan",
                      ).length,
                      LJ.money(
                        d.payments
                          .filter(
                            (p) =>
                              p.clientId === client.id && p.status === "Terverifikasi",
                          )
                          .reduce((s, p) => s + p.amount, 0),
                        true,
                      ),
                      B(
                        "Lihat profil",
                        "client-view",
                        client.id,
                        "secondary small",
                        "eye",
                      ),
                    ]),
                  ),
                ))
    );
  };
})();
