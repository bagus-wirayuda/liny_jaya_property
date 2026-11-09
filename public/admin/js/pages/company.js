(function () {
  const { icon: I, btn: B } = LJ;
  const { field } = LJ.dashboardShared;
  LJ.pages.admin.company = function (tab, role = "admin") {
    const d = LJ.db;
    const t = tab || "profile";
    return (
      LJ.tabs(
        [
          ["profile", "Profil & kantor"],
          ["vision", "Visi & misi"],
          ["services", "Layanan"],
          ["partners", "Mitra"],
        ],
        t,
      ) +
      (t === "services"
        ? LJ.manager("services")
        : t === "partners"
          ? LJ.manager("partners")
          : LJ.panel(
              t === "vision"
                ? "Visi & misi perusahaan"
                : "Identitas perusahaan",
              `<form id="company-form"><div class="form-error" role="alert"></div><div class="form-grid">${(t === "vision" ? [field("vision", "Visi", "textarea", [], { wide: true }), field("mission", "Misi", "textarea", [], { wide: true })] : [field("name", "Nama perusahaan"), field("tagline", "Tagline"), field("email", "Email", "email"), field("phone", "Informasi WhatsApp"), field("hours", "Jam layanan"), field("address", "Alamat kantor", "textarea", [], { wide: true })]).map((f) => LJ.field(f, d.company[f.name])).join("")}</div><div class="modal-footer"><button class="btn primary" type="submit">${I("check")}Simpan informasi</button></div></form><div class="divider"></div><div class="flex"><img src="assets/logo.svg" alt="Logo LinyJaya" class="company-partner-logo"><div><strong class="u-text-11">Logo perusahaan</strong><p>Logo lokal · digunakan di seluruh website.</p></div>${B("Ganti logo", "logo-upload", "", "secondary small", "upload")}</div>`,
            ))
    );
  };
})();
