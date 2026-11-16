(function () {
  const config = {
    folder: "karyawan",
    name: "Karyawan",
    person: "Rafi Hidayat",
    subtitle: "Kegiatan proyek dan laporan",
    icon: "tool",
    menus: [
      ["overview", "Dashboard", "grid"],
      ["tasks", "Tugas Saya", "clipboard"],
      ["projects", "Proyek Perumahan", "layers"],
      ["reports", "Laporan Pekerjaan", "file"],
      ["attendance", "Jadwal & Absensi", "calendar"],
      ["communication", "Komunikasi", "message"],
      ["profile", "Profil Karyawan", "user"],
    ],
  };
  if (typeof module !== "undefined" && module.exports) module.exports = config;
  else (window.LJ ||= {}).roles ||= {};
  if (typeof window !== "undefined") window.LJ.roles.employee = config;
})();
