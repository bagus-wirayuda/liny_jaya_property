(function () {
  const config = {
    folder: "client",
    name: "Klien",
    person: "Maya Putri",
    subtitle: "Perjalanan rumah Anda",
    icon: "user",
    menus: [
      ["overview", "Dashboard", "grid"],
      ["search", "Cari Properti", "search"],
      ["bookings", "Pemesanan Saya", "clipboard"],
      ["payments", "Pembayaran Saya", "wallet"],
      ["progress", "Progres Pembangunan", "tool"],
      ["documents", "Dokumen Saya", "file"],
      ["support", "Layanan & Pengaduan", "message"],
      ["profile", "Profil Saya", "user"],
    ],
  };
  if (typeof module !== "undefined" && module.exports) module.exports = config;
  else (window.LJ ||= {}).roles ||= {};
  if (typeof window !== "undefined") window.LJ.roles.client = config;
})();
