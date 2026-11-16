(function () {
  const config = {
    folder: "pimpinan",
    name: "Pimpinan",
    person: "Aditya Wijaya",
    subtitle: "Ringkasan dan keputusan bisnis",
    icon: "chart",
    menus: [
      ["overview", "Dashboard Pimpinan", "grid"],
      ["projects", "Manajemen Proyek", "layers"],
      ["tasks", "Manajemen Penugasan", "clipboard"],
      ["approvals", "Persetujuan", "check"],
      ["employees", "Monitoring Karyawan", "users"],
      ["analytics", "Laporan Manajemen", "chart"],
      ["announcements", "Pengumuman", "message"],
    ],
  };
  if (typeof module !== "undefined" && module.exports) module.exports = config;
  else (window.LJ ||= {}).roles ||= {};
  if (typeof window !== "undefined") window.LJ.roles.director = config;
})();
