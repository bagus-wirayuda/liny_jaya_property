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
          <span class="eyebrow">${I("spark")}PENGEMBANG HUNIAN MODERN TERPERCAYA</span>
          <h1>Wujudkan Rumah Impian & <span class="highlight-swoosh">Investasi Terbaik.</span></h1>
          <p>Koleksi hunian modern tropis berkualitas di lokasi strategis Jawa Barat. Nikmati kemudahan 3 cara bayar resmi: Diskon Cash Keras 5%, Cicilan Bertahap 0% ke Developer Tanpa Bank, serta KPR DP Ringan dengan Suku Bunga Bersubsidi.</p>
          <div class="hero-value-props">
            <div class="hero-value-pill">${I("spark", "sm")}<span>Diskon Cash Keras<br>Langsung 5%</span></div>
            <div class="hero-value-pill">${I("layers", "sm")}<span>Cash Bertahap 0%<br>Tanpa BI Checking</span></div>
            <div class="hero-value-pill">${I("building", "sm")}<span>KPR DP Ringan<br>Subsidi Biaya Rp 15 Jt</span></div>
          </div>
          <div class="hero-actions">
            ${A("Jelajahi Pilihan Hunian", "properti", "primary", "arrow")}
            ${B("Konsultasi Sales Sekarang", "consult-sales", "", "secondary", "message")}
          </div>
          <div class="hero-proof">
            <span class="icon-tile feature-icon-compact">${I("pin", "sm")}</span>
            <span>Kawasan Hunian Pilihan<br><strong>${E([...new Set(LJ.db.projects.map((p) => p.city))].filter(Boolean).join(" · ") || "Indonesia")}</strong></span>
          </div>
        </div>
        <figure class="architecture" aria-labelledby="architecture-title">
          <div class="architecture-header">
            <div>
              <span class="architecture-kicker">DESAIN EKSKLUSIF —</span>
              <figcaption id="architecture-title">Hunian Tropis Modern</figcaption>
              <p class="architecture-subtitle">Arsitektur elegan, pencahayaan alami optimal, dan lingkungan asri yang mendukung tumbuh kembang keluarga.</p>
            </div>
            <span class="architecture-index">HOT UNIT</span>
          </div>
          <div class="architecture-stage">
            <img class="architecture-photo" loading="lazy" decoding="async" src="${LJ.image("hero")}" alt="Referensi hunian modern dua lantai dengan taman dan kaca lebar">
            <canvas class="architecture-canvas" tabindex="0" aria-label="Model hunian tropis tiga dimensi" aria-describedby="architecture-help" hidden></canvas>
          </div>
          <div class="architecture-footer">
            <div class="architecture-legend">
              <div class="architecture-dots" aria-hidden="true">
                <span class="arch-dot active"></span>
                <span class="arch-dot"></span>
                <span class="arch-dot"></span>
              </div>
              <p id="architecture-help">Show Unit Siap Dikunjungi Setiap Hari</p>
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
          <button role="tab" aria-selected="true" class="search-tab active" data-action="search-mode" data-id="hunian">${I("home", "sm")}Cari Hunian Siap Huni</button>
          <button role="tab" aria-selected="false" class="search-tab" data-action="search-mode" data-id="investasi">${I("chart", "sm")}Peluang Investasi Properti</button>
        </div>
        <form id="hero-search" class="search-fields" action="properti" method="get">
          <div class="search-field">${I("pin")}<div><label for="hero-city">Lokasi Pilihan</label><select id="hero-city" name="city"><option value="">Semua Lokasi${LJ.db.projects.length ? ` (${E([...new Set(LJ.db.projects.map((p) => p.city))].filter(Boolean).join(", "))})` : ""}</option>${[...new Set(LJ.db.projects.map((p) => p.city))].map((c) => `<option>${E(c)}</option>`).join("")}</select></div>${I("chevron", "sm")}</div>
          <div class="search-field">${I("home")}<div><label for="hero-type">Tipe Rumah</label><select id="hero-type" name="type"><option value="">Semua Tipe (60/90, 72/105, 90/120)</option><option>60/90</option><option>72/105</option><option>90/120</option></select></div>${I("chevron", "sm")}</div>
          <div class="search-field">${I("layers")}<div><label for="hero-price">Rentang Anggaran</label><select id="hero-price" name="price"><option value="">Semua Harga</option><option value="750000000">Di bawah Rp 750 jt</option><option value="900000000">Di bawah Rp 900 jt</option><option value="1000000000">Di bawah Rp 1 M</option></select></div>${I("chevron", "sm")}</div>
          <button class="btn primary" type="submit">${I("search")}Cari Rumah Idaman</button>
        </form>
      </div>
    </div>`;

  LJ.paymentFeatureSection = () => `
    <section class="section">
      <div class="container">
        <div class="section-head text-center">
          <div>
            <span class="eyebrow">${I("wallet")}SOLUSI PEMBIAYAAN FLEKSIBEL</span>
            <h2>Kemudahan 3 Metode Pembayaran di LinyJaya</h2>
            <p>Kami memahami setiap keluarga memiliki perencanaan finansial berbeda. Pilih skema pembayaran resmi yang paling menguntungkan bagi Anda.</p>
          </div>
        </div>

        <div class="grid three u-mt-24">
          <article class="panel pay-feature-card">
            <div class="pay-feature-header">
              <span class="icon-tile pay-feature-icon">${I("spark")}</span>
              <span class="tag green">Hemat Maksimal</span>
            </div>
            <h3>Cash Keras (Tunai 1 Bulan)</h3>
            <p>Opsi terbaik untuk Anda yang ingin keuntungan maksimal tanpa beban cicilan masa depan.</p>
            <div class="pay-feature-list">
              <div>${I("check", "sm")} <strong>Diskon langsung 5%</strong> dari harga jual</div>
              <div>${I("check", "sm")} <strong>Free BPHTB</strong>, Biaya Notaris & Akta AJB</div>
              <div>${I("check", "sm")} <strong>Free Balik Nama SHM</strong> (Sertifikat Hak Milik)</div>
              <div>${I("check", "sm")} Bonus Canopy Carport & Smart Door Lock</div>
              <div>${I("check", "sm")} Prioritas serah terima unit</div>
            </div>
            <div class="pay-feature-action u-mt-20">
              ${B("Konsultasi Cash Keras", "consult", ":cash-keras", "secondary full", "message")}
            </div>
          </article>

          <article class="panel pay-feature-card highlight-border">
            <div class="pay-feature-header">
              <span class="icon-tile pay-feature-icon blue">${I("layers")}</span>
              <span class="tag blue">Paling Fleksibel</span>
            </div>
            <h3>Cash Lunak / Bertahap Developer</h3>
            <p>Cicil langsung ke pengembang PT LinyJaya tanpa perantara bank. Sangat mudah dan aman.</p>
            <div class="pay-feature-list">
              <div>${I("check", "sm")} <strong>Bunga 0% Flat</strong> (Tanpa bunga bank)</div>
              <div>${I("check", "sm")} <strong>Tanpa BI Checking / SLIK OJK</strong> (100% Approve)</div>
              <div>${I("check", "sm")} <strong>Syarat Mudah</strong>: Cukup KTP dan NPWP</div>
              <div>${I("check", "sm")} Pilihan Tenor: 12, 24, hingga 36 Bulan</div>
              <div>${I("check", "sm")} DP 20% dapat dicicil hingga 3 kali</div>
            </div>
            <div class="pay-feature-action u-mt-20">
              ${B("Konsultasi Cash Bertahap", "consult", ":cash-bertahap", "primary full", "message")}
            </div>
          </article>

          <article class="panel pay-feature-card">
            <div class="pay-feature-header">
              <span class="icon-tile pay-feature-icon green">${I("building")}</span>
              <span class="tag orange">Cicilan Ringan</span>
            </div>
            <h3>KPR Bank Rekanan Terkemuka</h3>
            <p>Cicilan ringan jangka panjang didukung oleh perbankan syariah dan konvensional nasional.</p>
            <div class="pay-feature-list">
              <div>${I("check", "sm")} <strong>DP Ringan mulai 10%</strong> (Ada subsidi DP 5%)</div>
              <div>${I("check", "sm")} Bank Rekanan: <strong>BSI, BTN, Mandiri, BCA, BNI</strong></div>
              <div>${I("check", "sm")} <strong>Subsidi Biaya KPR</strong> hingga Rp 15 Juta</div>
              <div>${I("check", "sm")} Tenor Panjang: 10, 15, 20, hingga 25 Tahun</div>
              <div>${I("check", "sm")} Full pendampingan berkas oleh tim sales s.d. akad</div>
            </div>
            <div class="pay-feature-action u-mt-20">
              ${B("Konsultasi KPR Bank", "consult", ":kpr", "secondary full", "message")}
            </div>
          </article>
        </div>

        <div class="center-link u-mt-24">
          <a href="${LJ.whatsappLink('Halo Tim Sales LinyJaya, saya ingin konsultasi simulasi cara bayar (Cash Keras / Bertahap / KPR).')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp">
            ${I("whatsapp")} Konsultasi Cepat via WhatsApp Sales
          </a>
        </div>
      </div>
    </section>
  `;

  LJ.lifestyleSection = () =>
    `<section class="section soft">
      <div class="container">
        <div class="section-head">
          <div>
            <span class="eyebrow">${I("leaf")}DIRANCANG UNTUK KEHIDUPAN</span>
            <h2>Rumah yang memahami Anda.</h2>
            <p>Kenyamanan punya banyak bentuk. Temukan ruang yang memberi tempat bagi hal-hal yang Anda sayangi.</p>
          </div>
        </div>
        <div class="grid three">
          ${[
            [
              "users",
              "Untuk keluarga yang bertumbuh",
              "Ruang berkumpul yang hangat, kamar yang nyaman, dan lingkungan aman one-gate system untuk anak-anak.",
              "Kenyamanan keluarga",
            ],
            [
              "home",
              "Untuk rumah pertama Anda",
              "Tata ruang efisien, cicilan KPR terjangkau, serta program DP ringan yang mempermudah kepemilikan awal.",
              "Solusi rumah pertama",
            ],
            [
              "leaf",
              "Untuk investasi jangka panjang",
              "Lokasi berkembang pesat dengan kenaikan nilai investasi (capital gain) tinggi serta potensi sewa menarik.",
              "Investasi bernilai tinggi",
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
            ["shield", "100% Legalitas Aman", "Sertifikat SHM, PBG/IMB Lengkap & Jelas"],
            ["wallet", "3 Pilihan Cara Bayar", "Cash Keras, Bertahap 0%, & KPR Rekanan"],
            ["pin", "Lokasi Super Strategis", "Akses cepat gerbang tol & stasiun utama"],
            ["gem", "Free All Biaya & Bonus", "Free BPHTB, Notaris, & Promo Cashback"],
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
                <span class="eyebrow">${I("layers")}PILIHAN KAWASAN HUNIAN</span>
                <h2>Temukan tempat terbaik Anda pulang.</h2>
                <p>Setiap kawasan dirancang dengan konsep lingkungan hijau terpadu, one-gate system, dan fasilitas lengkap.</p>
              </div>
              ${A("Lihat semua properti", "properti", "secondary", "arrow")}
            </div>
            <div class="grid three">${LJ.db.projects.slice(0, 3).map(LJ.projectCard).join("")}</div>
            <div class="center-link"><a class="text-link" href="properti">Jelajahi semua proyek ${I("arrow", "sm")}</a></div>
          </div>
        </section>

        ${LJ.latestUnits()}

        <!-- FITUR KHUSUS METODE PEMBAYARAN -->
        ${LJ.paymentFeatureSection()}

        <section class="section soft">
          <div class="container split-section">
            <div class="about-image">
              <img loading="lazy" src="${LJ.image("interior")}" alt="Interior terang dengan ruang keluarga yang hangat">
              <div class="image-note">
                <span class="icon-tile article-feature-icon">${I("leaf")}</span>
                <strong>Hunian Nyaman &<br>Bernilai Tinggi.</strong>
                <p>Didukung jaminan mutu bangunan dan legalitas tuntas.</p>
              </div>
            </div>
            <div class="about-copy">
              <span class="eyebrow">${I("building")}TENTANG LINYJAYA DEVELOPMENT</span>
              <h2>Membangun rumah.<br>Mewujudkan masa depan.</h2>
              <p>LinyJaya Development hadir mendampingi perjalanan kepemilikan rumah Anda. Kami menyatukan perencanaan arsitektur tropis, material berkualitas tinggi, dan kepastian legalitas.</p>
              <div class="check-list">
                <div>${I("check")}Desain modern fungsional dengan sirkulasi udara optimal</div>
                <div>${I("check")}Kemudahan cara bayar: Cash Keras Diskon 5%, Bertahap 0%, & KPR</div>
                <div>${I("check")}Pendampingan penuh tim sales profesional hingga serah terima kunci</div>
              </div>
              <div class="u-mt-20">
                ${B("Konsultasi dengan Property Advisor", "consult-sales", "", "primary", "message")}
              </div>
            </div>
          </div>
        </section>

        <section class="section article-feature-panel">
          <div class="container">
            <div class="stats-strip">
              ${[
                [count, "Kawasan Pilihan"],
                [
                  LJ.db.projects.reduce((sum, p) => sum + p.units, 0),
                  "Unit Hunian Berkualitas",
                ],
                [new Set(LJ.db.projects.map((p) => p.city)).size, "Kota Strategis"],
                ["100%", "Komitmen Kepuasan"],
              ]
                .map(([v, l]) => `<div><strong>${v}</strong><p>${l}</p></div>`)
                .join("")}
            </div>
          </div>
        </section>

        <section class="section">
          <div class="container">
            <div class="section-head">
              <div>
                <span class="eyebrow">${I("arrow")}4 LANGKAH MENUJU RUMAH IMPIAN</span>
                <h2>Proses Mudah. Hati Tenang.</h2>
                <p>Dari pemilihan unit kavling hingga serah terima kunci, kami mendampingi setiap tahap.</p>
              </div>
            </div>
            <div class="grid four">
              ${[
                [
                  "01",
                  "Pilih Kavling & Tipe",
                  "Jelajahi denah rumah dan site plan kavling di lokasi terbaik.",
                ],
                [
                  "02",
                  "Konsultasi Skema Bayar",
                  "Tentukan opsi Cash Keras (Diskon 5%), Cash Bertahap 0%, atau KPR Bank.",
                ],
                [
                  "03",
                  "Booking & Penyiapan Berkas",
                  "Amankan unit dengan Booking Fee Rp 10 Jt dan kami bantu berkas sampai tuntas.",
                ],
                [
                  "04",
                  "Akad & Serah Terima Kunci",
                  "Penandatanganan AJB/Akad kredit dan penyerahan rumah siap huni.",
                ],
              ]
                .map(
                  ([n, t, d]) =>
                    `<article class="process-card"><div class="process-num">${n}</div><h3>${t}</h3><p>${d}</p></article>`,
                )
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
                <h2>Inspirasi & Tips Cerdas Membeli Properti</h2>
                <p>Pahami cara memilih rumah, simulasi angsuran, dan perencanaan investasi keluarga.</p>
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
