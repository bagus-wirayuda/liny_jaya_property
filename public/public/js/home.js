(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;

  const architecture = () => `
    <section class="hero hero--architecture">
      <div class="hero-backdrop" aria-hidden="true">
        <div class="glass-wave glass-wave--top"></div>
        <div class="glass-wave glass-wave--mid"></div>
        <div class="glass-wave glass-wave--glow"></div>
        <div class="glass-leaf-bokeh"></div>
      </div>
      <div class="container architecture-layout">
        <div class="hero-copy reveal">
          <span class="eyebrow">${I("spark")}LINYJAYA PROPERTY · KOTA MAKASSAR</span>
          <h1>Hunian Nyaman untuk Keluarga di <span class="highlight-swoosh">Makassar.</span></h1>
          <p>Kawasan perumahan terencana di Tamalanrea, Panakkukang, dan Manggala – Antang. Dapatkan transparansi progres konstruksi serta simulasi pembayaran Cash Keras, Cash Lunak, dan estimasi KPR langsung di website.</p>
          <div class="hero-value-props">
            <div class="hero-value-pill">${I("spark", "sm")}<span>Cash Keras<br>DP ${LJ.paymentConfig().cashKeras.dpPercent}% · Pelunasan ${LJ.paymentConfig().cashKeras.settlementDays} Hr</span></div>
            <div class="hero-value-pill">${I("layers", "sm")}<span>Cash Lunak<br>Tenor s.d. ${LJ.paymentConfig().cashLunak.maxTenorMonths} Bulan</span></div>
            <div class="hero-value-pill">${I("building", "sm")}<span>Simulasi KPR<br>Asumsi ${LJ.paymentConfig().kpr.interestRate}% p.a.</span></div>
          </div>
          <div class="hero-actions">
            ${A("Jelajahi Properti", "properti", "primary", "arrow")}
            ${A("Simulasi Pembayaran", "simulasi", "secondary", "calculator")}
          </div>
          <div class="hero-proof">
            <span class="icon-tile feature-icon-compact">${I("pin", "sm")}</span>
            <span>Kawasan Hunian Terkini<br><strong>${E([...new Set(LJ.db.projects.map((p) => p.city))].filter(Boolean).join(" · ") || "Kota Makassar, Sulawesi Selatan")}</strong></span>
          </div>
        </div>
        <figure class="architecture" aria-labelledby="architecture-title">
          <div class="architecture-header">
            <div>
              <span class="architecture-kicker">DESAIN HUNIAN —</span>
              <figcaption id="architecture-title">Arsitektur Modern Makassar</figcaption>
              <p class="architecture-subtitle">Tata ruang fungsional, pencahayaan alami optimal, dan lingkungan keluarga yang teratur.</p>
            </div>
            <span class="architecture-index">MAKASSAR</span>
          </div>
          <div class="architecture-stage">
            <img class="architecture-photo" loading="lazy" decoding="async" src="${LJ.image("hero")}" alt="Referensi hunian modern dua lantai dengan taman dan bukaan cahaya alami">
            <canvas class="architecture-canvas" tabindex="0" aria-label="Model hunian tiga dimensi" aria-describedby="architecture-help" hidden></canvas>
          </div>
          <div class="architecture-footer">
            <div class="architecture-legend">
              <div class="architecture-dots" aria-hidden="true">
                <span class="arch-dot active"></span>
                <span class="arch-dot"></span>
                <span class="arch-dot"></span>
              </div>
              <p id="architecture-help">Kunjungan lokasi tersedia melalui penjadwalan</p>
            </div>
            <div class="architecture-controls" hidden>
              <button type="button" data-model-turn="-1" aria-label="Putar model ke kiri">${I("chevron", "sm")}</button>
              <button type="button" data-model-turn="1" aria-label="Putar model ke kanan">${I("chevron", "sm")}</button>
              <button type="button" class="architecture-light" aria-pressed="false"><span class="architecture-light-icon" aria-hidden="true"></span>Senja</button>
            </div>
          </div>
        </figure>
      </div>
    </section>`;

  LJ.searchPanel = () =>
    `<div class="container search-wrap">
      <div class="search-panel">
        <div class="search-tabs" role="tablist" aria-label="Tujuan pencarian">
          <button role="tab" aria-selected="true" class="search-tab active" data-action="search-mode" data-id="hunian">${I("home", "sm")}Cari Hunian Keluarga</button>
          <button role="tab" aria-selected="false" class="search-tab" data-action="search-mode" data-id="investasi">${I("chart", "sm")}Rencana Aset Properti</button>
        </div>
        <form id="hero-search" class="search-fields" action="properti" method="get">
          <div class="search-field">${I("pin")}<div><label for="hero-city">Kota / Kawasan</label><select id="hero-city" name="city"><option value="">Semua Kawasan Makassar</option>${[...new Set(LJ.db.projects.map((p) => p.city))].map((c) => `<option>${E(c)}</option>`).join("")}</select></div>${I("chevron", "sm")}</div>
          <div class="search-field">${I("home")}<div><label for="hero-type">Tipe Rumah</label><select id="hero-type" name="type"><option value="">Semua Tipe (60/90, 72/105, 90/120)</option><option>60/90</option><option>72/105</option><option>90/120</option></select></div>${I("chevron", "sm")}</div>
          <div class="search-field">${I("layers")}<div><label for="hero-price">Rentang Anggaran</label><select id="hero-price" name="price"><option value="">Semua Harga</option><option value="750000000">Di bawah Rp 750 jt</option><option value="900000000">Di bawah Rp 900 jt</option><option value="1000000000">Di bawah Rp 1 M</option></select></div>${I("chevron", "sm")}</div>
          <button class="btn primary" type="submit">${I("search")}Cari Rumah</button>
        </form>
      </div>
    </div>`;

  LJ.paymentFeatureSection = () => {
    const cfg = LJ.paymentConfig();
    return `
      <section class="section">
        <div class="container">
          <div class="section-head text-center">
            <div>
              <span class="eyebrow">${I("wallet")}METODE PEMBAYARAN PROPERTI</span>
              <h2>Tiga Pilihan Skema Pembayaran LinyJaya Property</h2>
              <p>Seluruh metode pembayaran terintegrasi dengan data unit, simulasi perhitungan, dan tagihan klien secara transparan.</p>
            </div>
          </div>

          <div class="grid three u-mt-24">
            <article class="panel pay-feature-card">
              <div class="pay-feature-header">
                <span class="icon-tile pay-feature-icon">${I("spark")}</span>
                <span class="tag green">${cfg.cashKeras.enabled ? "Aktif" : "Nonaktif"}</span>
              </div>
              <h3>${E(cfg.cashKeras.label)}</h3>
              <p>${E(cfg.cashKeras.description)}</p>
              <div class="pay-feature-list">
                <div>${I("check", "sm")} Uang Muka / DP awal <strong>${cfg.cashKeras.dpPercent}%</strong></div>
                <div>${I("check", "sm")} Pelunasan maksimal <strong>${cfg.cashKeras.settlementDays} hari</strong> setelah DP terverifikasi</div>
                <div>${I("check", "sm")} Dapat digabungkan dengan promo aktif yang memenuhi syarat</div>
              </div>
              <div class="pay-feature-action u-mt-20">
                ${A("Simulasi Cash Keras", "simulasi?method=Cash+Keras", "secondary full", "calculator")}
              </div>
            </article>

            <article class="panel pay-feature-card highlight-border">
              <div class="pay-feature-header">
                <span class="icon-tile pay-feature-icon blue">${I("layers")}</span>
                <span class="tag blue">${cfg.cashLunak.enabled ? "Bertahap Developer" : "Nonaktif"}</span>
              </div>
              <h3>${E(cfg.cashLunak.label)}</h3>
              <p>${E(cfg.cashLunak.description)}</p>
              <div class="pay-feature-list">
                <div>${I("check", "sm")} Uang Muka (DP) <strong>${cfg.cashLunak.dpPercent}%</strong> · Tenor default <strong>${cfg.cashLunak.tenorMonths} bln</strong></div>
                <div>${I("check", "sm")} Pilihan tenor hingga <strong>${cfg.cashLunak.maxTenorMonths} bulan</strong> (jatuh tempo tgl ${cfg.cashLunak.dueDay})</div>
                <div>${I("check", "sm")} Bunga developer <strong>${cfg.cashLunak.interestPercent}% per tahun</strong></div>
              </div>
              <div class="pay-feature-action u-mt-20">
                ${A("Simulasi Cash Lunak", "simulasi?method=Cash+Lunak", "primary full", "calculator")}
              </div>
            </article>

            <article class="panel pay-feature-card">
              <div class="pay-feature-header">
                <span class="icon-tile pay-feature-icon green">${I("building")}</span>
                <span class="tag orange">${cfg.kpr.enabled ? "Estimasi KPR" : "Nonaktif"}</span>
              </div>
              <h3>${E(cfg.kpr.label)}</h3>
              <p>${E(cfg.kpr.description)}</p>
              <div class="pay-feature-list">
                <div>${I("check", "sm")} Asumsi DP standar <strong>${cfg.kpr.dpPercent}%</strong> · Tenor ${cfg.kpr.minTenorYears}–${cfg.kpr.maxTenorYears} th</div>
                <div>${I("check", "sm")} Estimasi bunga acuan <strong>${cfg.kpr.interestRate}% / tahun</strong></div>
                <div>${I("check", "sm")} Hasil simulasi bersifat estimasi, bukan persetujuan kredit bank</div>
              </div>
              <div class="pay-feature-action u-mt-20">
                ${A("Simulasi KPR", "simulasi?method=KPR", "secondary full", "calculator")}
              </div>
            </article>
          </div>
        </div>
      </section>
    `;
  };

  LJ.promoHighlightSection = () => {
    const activePromos = (LJ.db.promos || []).filter((p) => LJ.isPromoActive(p));
    if (!activePromos.length) return "";
    return `
      <section class="section soft">
        <div class="container">
          <div class="section-head">
            <div>
              <span class="eyebrow">${I("spark")}PROMO HUNIAN AKTIF</span>
              <h2>Program Promo Makassar Periode Ini</h2>
              <p>Gunakan promo aktif pada unit pilihan saat menghitung simulasi pembayaran atau mengajukan pemesanan.</p>
            </div>
            ${A("Lihat semua promo", "promo", "secondary", "arrow")}
          </div>
          <div class="grid three">
            ${activePromos
              .slice(0, 3)
              .map((p) => {
                const imgSrc = p.promoImageData || LJ.image(p.image || LJ.project(p.project)?.image || "house-1");
                const disc = p.discountType === "Nominal" ? `Potongan ${LJ.money(p.discountValue, true)}` : `Diskon ${p.discountValue}%`;
                return `<article class="panel promo-home-card">
                  <div class="promo-card-media">
                    <img src="${imgSrc}" alt="${E(p.name)}" loading="lazy">
                    <span class="promo-discount-badge">${I("spark", "sm")} ${E(disc)}</span>
                  </div>
                  <div class="promo-home-body">
                    <small class="muted">Berlaku s.d. ${LJ.date(p.end)}</small>
                    <h3>${E(p.name)}</h3>
                    <p>${E(p.description)}</p>
                    <div class="u-mt-14 flex gap-8 wrap">
                      ${A("Detail Promo", "promo", "secondary small", "arrow")}
                      ${A("Simulasi", p.unit ? "simulasi?unit=" + encodeURIComponent(p.unit) + "&promo=" + encodeURIComponent(p.id) : "promo", "primary small", "calculator")}
                    </div>
                  </div>
                </article>`;
              })
              .join("")}
          </div>
        </div>
      </section>
    `;
  };

  LJ.lifestyleSection = () =>
    `<section class="section">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">${I("leaf")}KEHIDUPAN DI MAKASSAR</span>
            <h2>Rumah yang dirancang untuk keseharian keluarga.</h2>
            <p>Mempertimbangkan orientasi cahaya, aksesibilitas jalan utama Makassar, dan fleksibilitas rencana pembayaran.</p>
          </div>
        </div>
        <div class="grid three">
          ${[
            [
              "users",
              "Kawasan Tamalanrea & Antang",
              "Berada dekat jalur pendidikan, perbelanjaan, dan koridor pertumbuhan kota Makassar Timur.",
              "Akses keluarga",
            ],
            [
              "home",
              "Kawasan Panakkukang",
              "Lingkungan strategis menuju pusat niaga dan perkantoran Makassar dengan tata kavling rapi.",
              "Mobilitas mudah",
            ],
            [
              "wallet",
              "Transparansi Progres & Biaya",
              "Client memantau status pembayaran, dokumen, dan laporan pembangunan unit langsung dari workspace.",
              "Proses terukur",
            ],
          ]
            .map(
              ([icon, title, desc, label]) =>
                `<article class="lifestyle-card"><span class="icon-tile">${I(icon)}</span><h3>${title}</h3><p>${desc}</p><span class="lifestyle-label">${label} ${I("arrow", "sm")}</span></article>`,
            )
            .join("")}
        </div>
      </div>
    </section>`;

  LJ.pages.public.home = function () {
    const count = LJ.db.projects.length;
    return `
      ${LJ.nav("./")}
      <main id="main">
        ${architecture()}
        ${LJ.searchPanel()}

        <div class="container benefits">
          ${[
            ["pin", "Fokus Kota Makassar", "Koridor Tamalanrea, Panakkukang & Manggala"],
            ["wallet", "3 Skema Pembayaran", "Cash Keras, Cash Lunak & Estimasi KPR"],
            ["spark", "Promo Terintegrasi", "Potongan langsung terhitung di simulasi"],
            ["shield", "Pantau Progres Unit", "Laporan konstruksi & tagihan transparan"],
          ]
            .map(
              ([i, t, d]) =>
                `<div class="benefit"><span class="icon-tile">${I(i)}</span><div><strong>${t}</strong><p>${d}</p></div></div>`,
            )
            .join("")}
        </div>

        <section class="section">
          <div class="container">
            <div class="section-head">
              <div>
                <span class="eyebrow">${I("layers")}KAWASAN PERUMAHAN MAKASSAR</span>
                <h2>Temukan hunian pilihan di Makassar.</h2>
                <p>Pilih kawasan yang paling sesuai dengan aktivitas kerja, pendidikan keluarga, dan anggaran Anda.</p>
              </div>
              ${A("Lihat semua properti", "properti", "secondary", "arrow")}
            </div>
            <div class="grid three">${LJ.db.projects.slice(0, 3).map(LJ.projectCard).join("")}</div>
            <div class="center-link"><a class="text-link" href="properti">Jelajahi semua proyek ${I("arrow", "sm")}</a></div>
          </div>
        </section>

        ${LJ.latestUnits()}
        ${LJ.promoHighlightSection()}
        ${LJ.paymentFeatureSection()}

        <section class="section soft">
          <div class="container split-section">
            <div class="about-image">
              <img loading="lazy" src="${LJ.image("interior")}" alt="Interior terang dengan ruang keluarga yang hangat">
              <div class="image-note">
                <span class="icon-tile article-feature-icon">${I("leaf")}</span>
                <strong>Tata Ruang Terukur &<br>Pencahayaan Alami.</strong>
                <p>Dirancang sesuai kebutuhan hunian keluarga masa kini di Kota Makassar.</p>
              </div>
            </div>
            <div class="about-copy">
              <span class="eyebrow">${I("building")}TENTANG LINYJAYA PROPERTY</span>
              <h2>Proses terukur.<br>Informasi terbuka.</h2>
              <p>LinyJaya Property menghadirkan kawasan perumahan di Kota Makassar dengan perencanaan konstruksi bertahap, simulasi pembayaran yang dapat dihitung mandiri, serta pemantauan administrasi digital untuk klien.</p>
              <div class="check-list">
                <div>${I("check")}Simulasi Cash Keras, Cash Lunak, dan estimasi KPR dalam Rupiah</div>
                <div>${I("check")}Promo aktif dengan periode berlaku & syarat yang jelas</div>
                <div>${I("check")}Pendampingan jadwal kunjungan dan administrasi unit</div>
              </div>
              <div class="u-mt-20 flex gap-10 wrap">
                ${A("Hitung Simulasi", "simulasi", "primary", "calculator")}
                ${B("Jadwalkan Konsultasi", "consult-sales", "", "secondary", "message")}
              </div>
            </div>
          </div>
        </section>

        <section class="section article-feature-panel">
          <div class="container">
            <div class="stats-strip">
              ${[
                [count, "Kawasan di Makassar"],
                [LJ.db.projects.reduce((sum, p) => sum + p.units, 0), "Rencana Unit Hunian"],
                [LJ.db.units.filter((u) => u.sale === "Tersedia").length, "Unit Tersedia Saat Ini"],
                [(LJ.db.promos || []).filter((p) => LJ.isPromoActive(p)).length, "Promo Aktif"],
              ]
                .map(([v, l]) => `<div><strong>${v}</strong><p>${l}</p></div>`)
                .join("")}
            </div>
          </div>
        </section>

        ${LJ.lifestyleSection()}
        ${LJ.partnerStrip()}

        <section class="section home-cta-section">
          <div class="container">
            <div class="section-head">
              <div>
                <span class="eyebrow">${I("file")}LINYJAYA INSIGHT & PANDUAN</span>
                <h2>Panduan Pembelian & Konstruksi Rumah</h2>
                <p>Pahami skema pembayaran, estimasi KPR, dan tahapan pembangunan sebelum mengambil keputusan.</p>
              </div>
              ${A("Semua artikel", "artikel", "secondary", "arrow")}
            </div>
            <div class="grid three">${LJ.db.articles.slice(0, 3).map(LJ.articleCard).join("")}</div>
          </div>
        </section>

        ${LJ.cta()}
      </main>
      ${LJ.footer()}
    `;
  };
})();
