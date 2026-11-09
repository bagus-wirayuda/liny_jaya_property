(function () {
  const { icon: I, esc: E, link: A } = LJ;

  LJ.nav = (active) =>
    `<header class="site-nav"><div class="container nav-inner">${LJ.brand()}<nav id="site-navigation" class="nav-links" aria-label="Navigasi utama">${[
      ["index.html", "Beranda"],
      ["properti.html", "Properti"],
      ["layanan.html", "Layanan"],
      ["galeri.html", "Galeri"],
      ["tentang.html", "Tentang Kami"],
      ["artikel.html", "Insight"],
      ["mitra.html", "Mitra", "optional"],
      [LJ.user ? LJ.endpoints.dashboard : LJ.endpoints.login, LJ.user ? "Dashboard" : "Masuk"],
    ]
      .map(
        ([url, label, cls]) =>
          `<a href="${url}" class="${cls || ""} ${active === url ? "active" : ""}"${active === url ? ' aria-current="page"' : ""}>${label}</a>`,
      )
      .join(
        "",
      )}</nav><div class="nav-actions"><button type="button" class="icon-btn theme-toggle-btn" data-action="theme-toggle" aria-label="${LJ.getTheme?.() === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}" title="${LJ.getTheme?.() === "dark" ? "Mode Terang" : "Mode Gelap"}">${I(LJ.getTheme?.() === "dark" ? "sun" : "moon")}</button>${A("Konsultasi Sekarang", "kontak.html", "primary", "message")}<button class="icon-btn menu-toggle" data-action="mobile-nav" aria-label="Menu navigasi" aria-controls="site-navigation" aria-expanded="false">${I("menu")}</button></div></div></header>`;

  LJ.footer = () =>
    `<footer class="site-footer"><div class="container"><div class="footer-grid"><div class="footer-brand">${LJ.brand()}<p>Membangun hunian berkualitas. Mewujudkan impian keluarga.<br>Pilihan cara bayar fleksibel: Cash Keras, Cash Bertahap 0%, dan KPR Bank.</p><div class="socials">${LJ.iBtn("whatsapp", "consult-sales", "", "Chat WhatsApp Sales")}${LJ.iBtn("message", "contact-info", "", "Jadwalkan Konsultasi")}${LJ.iBtn("mail", "contact-info", "", "Hubungi Tim Pemasaran")}</div></div><div class="footer-col"><strong>Jelajahi LinyJaya</strong><a href="tentang.html">Tentang Kami</a><a href="layanan.html">Layanan Kami</a><a href="mitra.html">Bank & Mitra Rekanan</a><a href="artikel.html">Insight & Panduan Finansial</a></div><div class="footer-col"><strong>Temukan Rumah Anda</strong><a href="properti.html">Semua Properti</a><a href="galeri.html">Galeri Suasana Hunian</a><a href="kontak.html">Jadwalkan Konsultasi</a><a href="properti.html">Pilihan Tipe Rumah</a></div><div class="footer-col"><strong>Sales Gallery & Hotline</strong><p>${E(LJ.db.company.address || "Jl. Raya Utama Residence No. 88, Bandung")}</p><p class="u-mt-10"><strong>Hotline:</strong> ${E(LJ.db.company.phone)}<br><strong>Jam layanan:</strong> ${E(LJ.db.company.hours)}</p><p class="u-mt-10"><a href="${LJ.whatsappLink('Halo Tim Sales LinyJaya, saya ingin konsultasi mengenai hunian.')}" target="_blank" rel="noopener noreferrer" class="text-link">Chat WhatsApp Sales ${I("arrow", "sm")}</a></p></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} LinyJaya Development. All rights reserved.</span><span>Hunian Terencana. Investasi Bernilai Jangka Panjang.</span><div class="footer-legal"><a href="kebijakan-privasi.html">Kebijakan Privasi</a><a href="syarat-ketentuan.html">Syarat & Ketentuan</a><a href="faq.html">FAQ Cara Bayar</a></div></div></div></footer>`;

  LJ.pageHero = (eyebrow, title, desc) =>
    `<section class="page-hero"><div class="container"><div class="breadcrumbs"><a href="index.html">Beranda</a>${I("chevron", "sm")}<span>${eyebrow}</span></div><span class="eyebrow">${I("layers")}${eyebrow}</span><h1>${title}</h1><p>${desc}</p></div></section>`;

  LJ.cta = () =>
    `<section class="container"><div class="cta-band"><div><h2>Wujudkan rumah impian Anda<br>bersama penawaran terbaik hari ini.</h2><p>Dapatkan promo diskon Cash Keras 5%, cicilan bertahap 0% ke developer, atau KPR subsidi DP bersama Property Advisor LinyJaya.</p></div><div class="flex gap-12 wrap">${A("Konsultasi Sekarang", "kontak.html", "secondary", "message")}<a href="${LJ.whatsappLink('Halo Tim Sales LinyJaya, saya ingin konsultasi promo dan simulasi cara bayar.')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp">${I("whatsapp")} Chat WhatsApp Sales</a></div></div></section>`;
})();
