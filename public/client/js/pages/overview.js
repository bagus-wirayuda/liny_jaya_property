(function () {
  const { link: A, esc: E } = LJ;
  const { homeSummary, paymentCards, announcementList } = LJ.dashboardShared;
  LJ.pages.client.overview = function () {
    const d = LJ.db;
    const bs = LJ.clientBookings().filter((b) => b.status !== "Dibatalkan"),
      u = LJ.unit(bs[0]?.unit),
      ps = LJ.clientPayments(),
      paid = ps
        .filter((p) => p.status === "Terverifikasi")
        .reduce((s, p) => s + p.amount, 0),
      total = bs.reduce((s, b) => s + (LJ.unit(b.unit)?.price || 0), 0);
    return (
      LJ.kpis([
        ["Unit dipesan", bs.length, "home", "Pemesanan aktif Anda"],
        [
          "Pembayaran tercatat",
          LJ.money(paid, true),
          "wallet",
          "Telah terverifikasi",
        ],
        [
          "Sisa pembayaran",
          LJ.money(total - paid, true),
          "clipboard",
          "Dari total harga unit",
        ],
        [
          "Progres rumah",
          u ? u.progress + "%" : "—",
          "tool",
          u ? E(u.stage) : "Belum ada unit",
        ],
      ]) +
      `<div class="portal-banner"><div><h3>Perjalanan menuju rumah, kini lebih dekat.</h3><p>Pantau pekerjaan dan dokumentasi terbaru dari tim lapangan.</p></div>${A("Lihat progres rumah", "client/progress.html", "primary small", "arrow")}</div>` +
      (u
        ? `<div class="dashboard-grid"><div>${homeSummary(u)}${LJ.panel("Tahapan pembangunan", LJ.timeline(u), A("Detail progres", "client/progress.html", "secondary small"))}</div>${LJ.panel("Pembayaran berikutnya", paymentCards(ps.filter((p) => p.status !== "Terverifikasi" && p.status !== "Dibatalkan").slice(0, 3)), A("Semua tagihan", "client/payments.html", "ghost small"))}</div>`
        : LJ.empty(
            "Cerita rumah Anda dimulai di sini",
            "Pilih proyek dan pesan unit pertama Anda.",
            A(
              "Jelajahi properti",
              "client/search.html",
              "primary",
              "search",
            ),
          )) +
      LJ.panel(
        "Informasi untuk Anda",
        announcementList(d.announcements.slice(0, 2)),
      )
    );
  };
})();
