(function () {
  const { icon: I, esc: E } = LJ;
  LJ.pages.public.about = function () {
    return `${LJ.pageHero("Tentang kami", "Ruang yang baik. Kehidupan yang berarti.", "LinyJaya Property menghadirkan hunian terencana di Kota Makassar dengan ruang yang nyaman, desain fungsional, dan informasi pembiayaan yang transparan.")}<div class="container page-body"><div class="split-section"><img src="${LJ.image("hero")}" alt="Hunian dengan lanskap terencana" class="about-page-photo"><div class="about-copy"><span class="eyebrow">CERITA LINYJAYA</span><h2>Membangun dengan hati.<br>Merencanakan untuk esok.</h2><p>Rumah menjadi latar bagi banyak momen penting. Karena itu, setiap pilihan ruang, material, dan lingkungan layak direncanakan dengan cermat.</p><p class="u-mt-15">Dari memilih kawasan hingga menerima kunci, kami mendampingi Anda memahami pilihan tipe, simulasi metode bayar, promo aktif, dan tahapan pembangunan. Kejelasan informasi menjadi bagian penting dari pengalaman memiliki rumah.</p><p class="u-mt-18">Tiga kawasan pilihan di Kota Makassar—Tamalanrea, Panakkukang, dan Manggala—memberi ruang untuk menemukan hunian yang paling sesuai dengan keseharian Anda.</p></div></div><div class="section grid two">${LJ.panel("Visi kami", `<p>${E(LJ.db.company.vision)}</p>`)}${LJ.panel("Misi kami", `<p>${E(LJ.db.company.mission)}</p>`)}</div><div class="section-head"><div><span class="eyebrow">NILAI YANG KAMI BAWA</span><h2>Fondasi setiap keputusan.</h2></div></div><div class="grid four">${[
      [
        "shield",
        "Integritas",
        "Informasi yang jujur dan proses yang dapat ditelusuri.",
      ],
      [
        "gem",
        "Kualitas",
        "Perencanaan dan pengerjaan dengan perhatian pada detail.",
      ],
      [
        "users",
        "Kepedulian",
        "Ruang yang menjawab kebutuhan nyata penghuninya.",
      ],
      [
        "leaf",
        "Keberlanjutan",
        "Kawasan yang mempertimbangkan kehidupan jangka panjang.",
      ],
    ]
      .map(
        ([i, t, d]) =>
          `<div class="process-card"><span class="icon-tile">${I(i)}</span><h3 class="u-mt-20">${t}</h3><p>${d}</p></div>`,
      )
      .join("")}</div><div class="section">${LJ.panel(
      "Konsultasi Lengkap & Layanan Penjualan Prima",
      `<div class="notice sales-promo-bar">${I("spark")}Tim LinyJaya Property siap mendampingi Anda untuk peninjauan site plan, simulasi 3 metode bayar (Cash Keras, Cash Lunak, & KPR), informasi promo aktif, serta konsultasi unit di Kota Makassar.</div>${LJ.table(
        ["Layanan & Dokumen", "Keterangan"],
        [
          [
            "Simulasi & Metode Pembayaran",
            "Pilihan lokasi di Makassar, perhitungan Cash Keras, Cash Lunak bertahap, serta estimasi cicilan KPR",
          ],
          ["Promo & Ketersediaan Unit", "Tinjau denah kavling, program promo aktif, dan ketersediaan real-time"],
          ["Dokumen & Ketentuan Unit", "Kelengkapan dokumen kepemilikan dan jadwal pembangunan ditinjau melalui berkas resmi perusahaan"],
        ],
      )}`,
    )}</div></div>${LJ.cta()}`;
  };
})();
