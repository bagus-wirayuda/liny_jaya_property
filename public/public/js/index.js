(function () {
  const { icon: I, esc: E, link: A } = LJ;
  LJ.publicPage = (path, id) => {
    if (path === "index.html") return LJ.pages.public.home();
    let content,
      active = path;
    if (path === "properti.html")
      content =
        LJ.pageHero(
          "Katalog Properti & Hunian",
          "Koleksi Rumah Modern & Skema Cara Bayar Fleksibel.",
          "Jelajahi kawasan pilihan di Bandung, Bekasi, dan Bogor. Nikmati kemudahan Cash Keras Diskon 5%, Cash Bertahap Bunga 0%, serta KPR Bank DP Ringan.",
        ) +
        `<div class="container page-body">${LJ.publicationNotice()}${LJ.catalog()}</div>`;
    else if (path === "proyek.html") {
      active = "properti.html";
      const p = LJ.project(id);
      content = p
        ? `<div class="container page-body"><div class="breadcrumbs"><a href="properti.html">Properti</a>${I("chevron", "sm")}${E(p.name)}</div>${LJ.projectDetail(p)}</div>`
        : LJ.notFound();
    } else if (path === "unit.html") {
      active = "properti.html";
      const u = LJ.unit(id);
      content = u
        ? `<div class="container page-body"><div class="breadcrumbs"><a href="properti.html">Properti</a>${I("chevron", "sm")}<a href="${LJ.propertyPage("projects", u.project)}">${E(LJ.project(u.project)?.name)}</a>${I("chevron", "sm")}${LJ.unitLabel(u.id)}</div>${LJ.unitDetail(u)}</div>`
        : LJ.notFound();
    } else if (path === "layanan.html") content = LJ.pages.public.services();
    else if (path === "galeri.html") content = LJ.pages.public.gallery();
    else if (path === "tentang.html") content = LJ.pages.public.about();
    else if (path === "mitra.html") content = LJ.pages.public.partners();
    else if (path === "kontak.html") content = LJ.pages.public.contact();
    else if (
      [
        "kebijakan-privasi.html",
        "syarat-ketentuan.html",
        "faq.html",
      ].includes(path)
    )
      content = LJ.informationPage(path);
    else if (path === "artikel.html" || path === "artikel-detail.html") {
      active = "artikel.html";
      content = LJ.pages.public.articles(id);
    } else content = LJ.notFound();
    return `${LJ.nav(active)}<main id="main">${content}</main>${LJ.footer()}`;
  };
  LJ.notFound = () =>
    `<div class="container section">${LJ.empty("Halaman tidak ditemukan", "Alamat mungkin sudah berubah. Silakan kembali ke beranda.", A("Kembali ke beranda", "index.html", "primary", "home"))}</div>`;
})();
