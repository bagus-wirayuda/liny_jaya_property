(function () {
  const { icon: I, esc: E, link: A } = LJ;
  LJ.articleCard = (a) =>
    `<article class="article-card"><a href="artikel/${encodeURIComponent(a.id)}"><img loading="lazy" src="${LJ.image(a.image)}" alt="${E(a.title)}"></a><div class="card-body"><div class="article-meta"><span class="blue">${E(a.category)}</span><span>${LJ.date(a.date)}</span></div><a href="artikel/${encodeURIComponent(a.id)}"><h3>${E(a.title)}</h3></a><p>${E(a.summary)}</p><a class="text-link article-card-meta" href="artikel/${encodeURIComponent(a.id)}">Baca selengkapnya ${I("arrow", "sm")}</a></div></article>`;
  LJ.pages.public.articles = (id) => {
    let content;
    if (!id) {
      const category = LJ.articleCategory || "";
      content =
        LJ.pageHero(
          "Berita & artikel",
          "Ide segar untuk rumah dan masa depan.",
          "Panduan membeli, cerita pembangunan, dan inspirasi ruang untuk keseharian Anda.",
        ) +
        `<div class="container page-body"><div class="filter-bar"><label for="article-cat">Kategori artikel</label><select class="form-control" id="article-cat"><option value="">Semua kategori</option>${[...new Set(LJ.db.articles.map((a) => a.category))].map((c) => `<option ${c === category ? "selected" : ""}>${E(c)}</option>`).join("")}</select></div><div class="grid three">${LJ.db.articles
          .filter((a) => !category || a.category === category)
          .map(LJ.articleCard)
          .join("")}</div></div>`;
    } else {
      const a = LJ.db.articles.find((a) => a.id === id);
      content = a
        ? `<article class="container page-body"><div class="article-content"><div class="breadcrumbs"><a href="artikel">Insight</a>${I("chevron", "sm")}${E(a.category)}</div><span class="eyebrow">${E(a.category)}</span><h1>${E(a.title)}</h1><p class="u-text-11">Tim Editorial LinyJaya · ${LJ.date(a.date)}</p><img src="${LJ.image(a.image)}" alt="${E(a.title)}"><div class="prose">${a.body
            .split("\n\n")
            .map((p) => `<p>${E(p)}</p>`)
            .join(
              "",
            )}</div><div class="u-mt-24"><div class="panel"><h4 class="u-mb-4">${I("message", "sm")} Ingin Konsultasi Pemilihan Unit & Simulasi Cara Bayar?</h4><p class="u-text-11">Property Advisor LinyJaya siap membantu menghitungkan simulasi Cash Keras (Diskon 5%), Cash Bertahap (Bunga 0%), atau KPR Bank secara gratis.</p><div class="u-mt-14 flex gap-10 wrap">${A("Jadwalkan Konsultasi", "kontak", "primary small", "message")}<a href="${LJ.whatsappLink('Halo Tim Sales LinyJaya, saya membaca artikel panduan dan ingin konsultasi skema cara bayar.')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp small">${I("whatsapp")} Chat WhatsApp Sales</a></div></div></div><div class="divider"></div>${A("Kembali ke semua artikel", "artikel", "secondary", "arrow")}</div></article>`
        : LJ.notFound();
    }
    return content;
  };
})();
