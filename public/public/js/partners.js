(function () {
  const { icon: I, esc: E, link: A } = LJ;
  LJ.partnerTile = (p) => {
    const logoUrl = LJ.partnerLogo ? LJ.partnerLogo(p) : p.logo;
    const isBank = p.category === "Perbankan & pembiayaan" || String(p.cooperationType || "").startsWith("Bank");
    const statusText = p.status || "Aktif";
    return `<article class="partner-card">
      <div class="partner-logo-area">
        ${logoUrl ? `<img src="${E(logoUrl)}" alt="Logo ${E(p.name)}" loading="lazy">` : `<span class="partner-wordmark">${E(p.name)}</span>`}
        <span class="partner-category">${E(p.cooperationType || p.category)}</span>
      </div>
      <div class="partner-card-body">
        <div class="flex between wrap gap-8">
          <h3>${E(p.name)}</h3>
          ${LJ.badge(statusText)}
        </div>
        ${
          isBank && (p.kprRate !== null && p.kprRate !== undefined || p.kprTenorMax)
            ? `<div class="partner-kpr-pill">${I("calculator", "sm")} Acuan KPR ${p.kprRate !== null && p.kprRate !== undefined ? `${Number(p.kprRate)}%/thn` : "Kompetitif"}${p.kprTenorMax ? ` · Tenor s.d. ${p.kprTenorMax} thn` : ""}</div>`
            : ""
        }
        <p>${E(p.description)}</p>
        <div class="flex wrap gap-10">
          ${isBank ? A("Simulasi KPR", "simulasi?method=KPR", "primary small", "calculator") : ""}
          ${/^https?:\/\//.test(p.website || "") ? `<a class="text-link" href="${E(p.website)}" target="_blank" rel="noopener noreferrer">Kunjungi situs resmi ${I("external", "sm")}</a>` : A("Informasi kolaborasi", "kontak", "secondary small", "arrow")}
        </div>
      </div>
    </article>`;
  };
  LJ.partnerStrip = () => {
    const activePartners = (LJ.db.partners || []).filter((p) => (p.status || "Aktif") === "Aktif");
    return `<section class="section partner-section"><div class="container"><div class="partner-strip-heading"><span>BANK REKANAN KPR & EKOSISTEM PROPERTI</span><a class="text-link" href="mitra">Lihat kerja sama & mitra ${I("arrow", "sm")}</a></div><div class="partner-logo-row">${activePartners.map((p) => { const logoUrl = LJ.partnerLogo ? LJ.partnerLogo(p) : p.logo; return `<a href="${p.category === "Perbankan & pembiayaan" ? "simulasi?method=KPR" : "mitra"}" title="${E(p.name)}" aria-label="${E(p.name)}">${logoUrl ? `<img loading="lazy" src="${E(logoUrl)}" alt="${E(p.name)}">` : `<span>${E(p.name)}</span>`}</a>`; }).join("")}</div><p class="partner-disclosure">Menampilkan kerja sama pembiayaan KPR bank rekanan terdaftar (termasuk Bank BCA) serta referensi industri konstruksi & material; hasil simulasi kredit tetap bersifat estimasi.</p></div></section>`;
  };
  LJ.pages.public.partners = function () {
    const partners = LJ.db.partners || [];
    return `${LJ.pageHero("Mitra & Bank Rekanan", "Dukungan Pembiayaan KPR & Konstruksi.", "Kenali bank rekanan kerja sama pembiayaan KPR (termasuk Bank BCA) serta ekosistem konstruksi dan material yang mendukung proyek LinyJaya Property.")}<div class="container page-body"><div class="partner-intro"><span class="eyebrow">${I("layers")}KERJA SAMA & EKOSISTEM</span><h2>Pembiayaan KPR & mitra<br>pembangunan tepercaya.</h2><p>LinyJaya Property menghadirkan kerja sama pembiayaan KPR dengan bank rekanan untuk mempermudah pengajuan kepemilikan rumah di Makassar, didukung mitra konstruksi dan penyedia material berkualitas.</p></div><div class="grid two">${partners.map(LJ.partnerTile).join("")}</div><p class="partner-disclosure">Data mitra kerja sama perbankan dan ketentuan acuan simulasi KPR dikelola langsung melalui database Admin LinyJaya Property; persetujuan kredit akhir tetap menjadi kewenangan bank penyalur.</p><div class="section">${LJ.panel("Hitung estimasi cicilan dengan bank rekanan.", "<p>Coba kalkulator KPR interaktif kami untuk memilih program bank rekanan seperti Bank BCA Fix Promo, menyesuaikan DP, dan membandingkan tenor.</p>", A("Buka Simulasi KPR", "simulasi?method=KPR", "primary", "calculator"))}</div></div>${LJ.cta()}`;
  };
})();
