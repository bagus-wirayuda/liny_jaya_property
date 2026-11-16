(function () {
  const config = {
    folder: "admin",
    name: "Administrator",
    person: "Administrator",
    subtitle: "Pengelolaan perusahaan",
    icon: "shield",
    menus: [
      ["overview", "Ringkasan", "grid"],
      ["company", "Perusahaan", "building"],
      ["projects", "Proyek Perumahan", "layers"],
      ["units", "Unit Rumah", "home"],
      ["marketing", "Pemasaran", "target"],
      ["bookings", "Pemesanan", "clipboard"],
      ["finance", "Keuangan", "wallet"],
      ["construction", "Pembangunan", "tool"],
      ["employees", "Karyawan", "users"],
      ["clients", "Klien", "user"],
      ["analytics", "Laporan & Analitik", "chart"],
      ["settings", "Pengaturan Sistem", "settings"],
    ],
  };
  if (typeof module !== "undefined" && module.exports) module.exports = config;
  else (window.LJ ||= {}).roles ||= {};
  if (typeof window !== "undefined") window.LJ.roles.admin = config;
})();
