(function () {
  const { paymentTable } = LJ.dashboardShared;
  LJ.pages.client.payments = function (tab) {
    const bs = LJ.clientBookings(),
      ps = LJ.clientPayments();
    const t = tab || "schedule",
      active = bs.filter((b) => b.status !== "Dibatalkan"),
      paid = ps
        .filter((p) => p.status === "Terverifikasi")
        .reduce((s, p) => s + p.amount, 0),
      price = active.reduce((s, b) => s + LJ.unit(b.unit).price, 0);
    return (
      LJ.kpis([
        [
          "Harga total unit",
          LJ.money(price, true),
          "home",
          "Semua pemesanan aktif",
        ],
        [
          "Pembayaran tercatat",
          LJ.money(paid, true),
          "check",
          "Pembayaran terverifikasi",
        ],
        [
          "Sisa kewajiban",
          LJ.money(price - paid, true),
          "wallet",
          "Termasuk termin mendatang",
        ],
        [
          "Menunggu verifikasi",
          ps.filter((p) => p.status === "Menunggu verifikasi").length,
          "clock",
          "Lampiran menunggu peninjauan",
        ],
      ]) +
      LJ.tabs(
        [
          ["schedule", "Jadwal & tagihan"],
          ["history", "Riwayat pembayaran"],
          ["invoice", "Invoice & kuitansi"],
        ],
        t,
      ) +
      LJ.panel(
        "Pembayaran Anda",
        paymentTable(
          t === "history" ? ps.filter((p) => p.status === "Terverifikasi") : ps,
          "client",
        ),
        "",
        "Nominal dan tenggat merupakan rencana administrasi. Bukti serta status pencatatan tidak menggantikan konfirmasi penerimaan dana dari perusahaan.",
      )
    );
  };
})();
