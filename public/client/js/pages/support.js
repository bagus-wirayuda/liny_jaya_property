(function () {
  const { icon: I } = LJ;
  const { ticketList } = LJ.dashboardShared;
  LJ.pages.client.support = function (tab) {
    const d = LJ.db;
    return `<div class="notice">${I("message")}Susun catatan pertanyaan, kebutuhan perubahan, atau keluhan Anda. Pencatatan pada daftar ini belum merupakan konfirmasi penanganan oleh tim.</div>${ticketList(d.tickets.filter((t) => t.client === d.profile.name))}`;
  };
})();
