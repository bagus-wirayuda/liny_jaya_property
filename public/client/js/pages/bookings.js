(function () {
  const { link: A } = LJ;
  const { bookingTable } = LJ.dashboardShared;
  LJ.pages.client.bookings = function (tab) {
    const bs = LJ.clientBookings();
    return LJ.panel(
      "Riwayat pemesanan Anda",
      bookingTable(bs, "client"),
      A("Cari unit lain", "client/search.html", "primary small", "plus"),
    );
  };
})();
