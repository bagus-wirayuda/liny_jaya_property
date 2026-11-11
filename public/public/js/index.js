(function () {
  const { icon: I, esc: E, link: A } = LJ;
  LJ.publicPage = (path, id) => {
    const clean = (path || "home").replace(/\.html$/, "");
    if (clean === "home" || clean === "index") return LJ.pages.public.home();
    let content,
      active = clean;
    if (clean === "properti") {
      const cities = [...new Set((LJ.db.projects || []).map((p) => p.city).filter(Boolean))].join(", ") || "Jawa Barat";
      content =
        LJ.pageHero(
          "Katalog Properti & Hunian",
          "Koleksi Rumah Modern & Skema Cara Bayar Fleksibel.",
          `Jelajahi kawasan pilihan di ${E(cities)}. Nikmati kemudahan Cash Keras Diskon 5%, Cash Bertahap Bunga 0%, serta KPR Bank DP Ringan.`,
        ) +
        `<div class="container page-body">${LJ.publicationNotice()}${LJ.catalog()}</div>`;
    } else if (clean === "proyek") {
      active = "properti";
      const p = LJ.project(id);
      content = p
        ? `<div class="container page-body"><div class="breadcrumbs"><a href="properti">Properti</a>${I("chevron", "sm")}${E(p.name)}</div>${LJ.projectDetail(p)}</div>`
        : LJ.notFound();
    } else if (clean === "unit") {
      active = "properti";
      const u = LJ.unit(id);
      content = u
        ? `<div class="container page-body"><div class="breadcrumbs"><a href="properti">Properti</a>${I("chevron", "sm")}<a href="${LJ.propertyPage("projects", u.project)}">${E(LJ.project(u.project)?.name)}</a>${I("chevron", "sm")}${LJ.unitLabel(u.id)}</div>${LJ.unitDetail(u)}</div>`
        : LJ.notFound();
    } else if (clean === "layanan") content = LJ.pages.public.services();
    else if (clean === "galeri") content = LJ.pages.public.gallery();
    else if (clean === "tentang") content = LJ.pages.public.about();
    else if (clean === "mitra") content = LJ.pages.public.partners();
    else if (clean === "kontak") content = LJ.pages.public.contact();
    else if (["kebijakan-privasi", "syarat-ketentuan", "faq"].includes(clean))
      content = LJ.informationPage(clean);
    else if (clean === "artikel" || clean === "artikel-detail") {
      active = "artikel";
      content = LJ.pages.public.articles(id);
    } else content = LJ.notFound();
    return `${LJ.nav(active)}<main id="main">${content}</main>${LJ.footer()}`;
  };
  LJ.notFound = () =>
    `<div class="container section">${LJ.empty("Halaman tidak ditemukan", "Alamat mungkin sudah berubah. Silakan kembali ke beranda.", A("Kembali ke beranda", "./", "primary", "home"))}</div>`;
})();
