(function () {
  const { icon: I, esc: E, btn: B } = LJ;
  const { permissions } = LJ.dashboardShared;
  LJ.pages.admin.settings = function (tab) {
    const d = LJ.db;
    const t = tab || "accounts";
    return (
      LJ.tabs(
        [
          ["accounts", "Akun pengguna"],
          ["permissions", "Peran & akses"],
          ["content", "Konten publik"],
          ["notifications", "Notifikasi"],
          ["config", "Konfigurasi"],
          ["audit", "Riwayat perubahan"],
          ["publication", "Kesiapan publikasi"],
        ],
        t,
      ) +
      (t === "publication"
        ? LJ.publicationReview()
        : t === "permissions"
          ? permissions()
          : t === "content"
            ? LJ.manager("articles")
            : t === "audit"
              ? LJ.panel(
                  "Riwayat perubahan",
                  LJ.table(
                    ["Waktu", "Pelaku", "Aktivitas"],
                    d.audit.map((l) => [
                      LJ.date(l.date),
                      E(l.actor),
                      E(l.action),
                    ]),
                  ),
                  B(
                    "Ekspor log",
                    "export-report",
                    "audit",
                    "secondary small",
                    "download",
                  ),
                )
              : t === "config"
                ? LJ.panel(
                    "Preferensi ruang kerja",
                    `<div class="notice">${I("info")}Kelola preferensi pemberitahuan dan arsip pencatatan. Perubahan pada halaman ini tidak mengubah kewenangan pengguna atau mengonfirmasi transaksi.</div><label class="toggle-line"><div><strong>Notifikasi aktivitas</strong><p>Tampilkan informasi perubahan dan pengumuman di portal.</p></div><input type="checkbox" data-setting="notifications" ${d.settings.notifications ? "checked" : ""}></label><div class="toggle-line"><div><strong>Unduh catatan administrasi</strong><p>Siapkan arsip catatan untuk peninjauan dan pencocokan kembali.</p></div>${B("Unduh JSON", "backup", "", "secondary small", "download")}</div><div class="toggle-line"><div><strong>Muat data terkini</strong><p>Perbarui tampilan dengan catatan terbaru dari server.</p></div>${B("Muat ulang", "reload-data", "", "secondary small", "refresh")}</div>`,
                  )
                : LJ.manager(t))
    );
  };
})();
