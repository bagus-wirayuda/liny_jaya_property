(function () {
  const { icon: I, esc: E, link: A } = LJ;

  LJ.nav = (active) =>
    `<header class="site-nav"><div class="container nav-inner">${LJ.brand()}<nav id="site-navigation" class="nav-links" aria-label="Navigasi utama">${[
      ["./", "Beranda"],
      ["properti", "Properti"],
      ["promo", "Promo"],
      ["simulasi", "Simulasi"],
      ["layanan", "Layanan"],
      ["galeri", "Galeri", "optional"],
      ["tentang", "Tentang Kami", "optional"],
      ["artikel", "Insight"],
      ["mitra", "Mitra", "optional"],
      [LJ.user ? LJ.endpoints.dashboard : LJ.endpoints.login, LJ.user ? "Dashboard" : "Masuk"],
    ]
      .map(
        ([url, label, cls]) =>
          `<a href="${url}" class="${cls || ""} ${active === url ? "active" : ""}"${active === url ? ' aria-current="page"' : ""}>${label}</a>`,
      )
      .join(
        "",
      )}</nav><div class="nav-actions"><button type="button" class="icon-btn theme-toggle-btn" data-action="theme-toggle" aria-label="${LJ.getTheme?.() === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}" title="${LJ.getTheme?.() === "dark" ? "Mode Terang" : "Mode Gelap"}">${I(LJ.getTheme?.() === "dark" ? "sun" : "moon")}</button>${A("Konsultasi", "kontak", "primary", "message")}<button class="icon-btn menu-toggle" data-action="mobile-nav" aria-label="Menu navigasi" aria-controls="site-navigation" aria-expanded="false">${I("menu")}</button></div></div></header>`;

  LJ.footer = () =>
    `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand">${LJ.brand()}<p>Hunian modern terencana di Kota Makassar, Sulawesi Selatan.<br>Simulasikan metode pembayaran Cash Keras, Cash Lunak, dan estimasi KPR secara transparan.</p><div class="socials">${LJ.iBtn("whatsapp", "consult-sales", "", "Chat WhatsApp")}${LJ.iBtn("message", "contact-info", "", "Jadwalkan Konsultasi")}${LJ.iBtn("mail", "contact-info", "", "Hubungi Pemasaran")}</div></div><div class="footer-col"><strong>Jelajahi LinyJaya</strong><a href="tentang">Tentang Kami</a><a href="layanan">Layanan Kami</a><a href="mitra">Ekosistem Properti</a><a href="artikel">Insight & Panduan</a></div><div class="footer-col"><strong>Hunian & Simulasi</strong><a href="properti">Semua Properti Makassar</a><a href="promo">Promo Properti Aktif</a><a href="simulasi">Simulasi Cash Lunak & KPR</a><a href="kontak">Jadwalkan Konsultasi</a></div><div class="footer-col"><strong>Kontak & Layanan Makassar</strong><p>${E(LJ.db.company.address || "Kota Makassar, Sulawesi Selatan (Alamat kantor resmi tersedia saat konfirmasi)")}</p><p class="u-mt-10"><strong>Hotline:</strong> ${E(LJ.db.company.phone)}<br><strong>Jam layanan:</strong> ${E(LJ.db.company.hours || "Senin – Sabtu, 08.30 – 17.00 WITA")}</p><p class="u-mt-10"><a href="${LJ.whatsappLink('Halo Tim LinyJaya Property Makassar, saya ingin konsultasi mengenai hunian.')}" target="_blank" rel="noopener noreferrer" class="text-link">Chat WhatsApp ${I("arrow", "sm")}</a></p></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} LinyJaya Property Makassar.</span><span>Kota Makassar, Sulawesi Selatan · WITA</span><div class="footer-legal"><a href="kebijakan-privasi">Kebijakan Privasi</a><a href="syarat-ketentuan">Syarat & Ketentuan</a><a href="faq">FAQ Cara Bayar</a></div></div></div></footer>`;

  LJ.pageHero = (eyebrow, title, desc) =>
    `<section class="page-hero"><div class="container"><div class="breadcrumbs"><a href="./">Beranda</a>${I("chevron", "sm")}<span>${eyebrow}</span></div><span class="eyebrow">${I("layers")}${eyebrow}</span><h1>${title}</h1><p>${desc}</p></div></section>`;

  LJ.cta = () =>
    `<section class="container"><div class="cta-band"><div><h2>Rencanakan pembelian rumah<br>di Kota Makassar dengan perhitungan jelas.</h2><p>Gunakan simulasi Cash Keras, Cash Lunak, dan estimasi KPR atau lihat promo aktif yang sesuai dengan unit pilihan Anda.</p></div><div class="flex gap-12 wrap">${A("Buka Simulasi", "simulasi", "secondary", "calculator")}${A("Lihat Promo", "promo", "secondary", "spark")}<a href="${LJ.whatsappLink('Halo Tim LinyJaya Property Makassar, saya ingin konsultasi promo dan simulasi cara bayar.')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp">${I("whatsapp")} Chat WhatsApp</a></div></div></section>`;
})();
