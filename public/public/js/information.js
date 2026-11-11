(function () {
  const faqItems = [
    [
      "Metode Pembayaran",
      "Apa saja metode pembayaran yang tersedia di LinyJaya Development?",
      "LinyJaya menyediakan 3 skema pembayaran resmi yang fleksibel: 1. Cash Keras (Tunai 1 bulan dengan diskon 5% dan bebas seluruh biaya legalitas), 2. Cash Lunak / Bertahap (Cicilan flat bunga 0% langsung ke developer tanpa BI Checking hingga 36 bulan), dan 3. KPR Bank Rekanan (BSI, BTN, Mandiri, BCA, BNI dengan DP ringan mulai 10% dan subsidi biaya KPR s.d. Rp 15 Juta).",
    ],
    [
      "Metode Pembayaran",
      "Bagaimana rincian skema Cash Keras dan keuntungannya?",
      "Pembayaran Cash Keras diawali dengan Booking Fee Rp 10 Juta untuk mengikat kavling dan harga promo. Pembayaran DP 20% dilakukan maksimal 14 hari kerja, dan pelunasan 80% dilakukan maksimal 30 hari kerja saat penandatanganan Akta Jual Beli (AJB). Keuntungan: diskon langsung 5%, Free BPHTB, Free Notaris & AJB, Free Balik Nama SHM, serta bonus Canopy Carport & Smart Door Lock.",
    ],
    [
      "Metode Pembayaran",
      "Apa syarat dan keunggulan Cash Lunak / Bertahap ke Developer?",
      "Cash Bertahap ke developer PT LinyJaya mengenakan bunga 0% flat dan tanpa BI Checking / SLIK OJK (100% approval terjamin). Persyaratannya sangat ringkas: cukup melampirkan KTP dan NPWP tanpa slip gaji bank yang rumit. DP 20% dapat dicicil 3 kali, dan sisa 80% dapat dicicil rata dalam tenor 12, 24, atau 36 bulan.",
    ],
    [
      "Metode Pembayaran",
      "Bagaimana proses pengajuan KPR Bank dan bank apa saja yang bekerjasama?",
      "LinyJaya bekerjasama resmi dengan bank syariah dan konvensional terkemuka: Bank Syariah Indonesia (BSI), Bank Mandiri, BTN, BCA, dan BNI. Tersedia promo suku bunga rendah dan subsidi biaya KPR s.d. Rp 15 Juta. Seluruh pengumpulan dan pemberkasan KPR akan didampingi langsung oleh Property Advisor LinyJaya hingga disetujui (SP3K) dan akad kredit.",
    ],
    [
      "Konsultasi & Survei",
      "Apakah bisa konsultasi atau berkunjung survei lokasi di akhir pekan?",
      "Tentu saja! Sales Gallery dan Show Unit LinyJaya buka setiap hari, termasuk hari Sabtu, Minggu, dan hari libur nasional mulai pukul 08.30 hingga 18.00 WIB. Anda dapat berkonsultasi gratis dan didampingi langsung oleh Property Advisor kami.",
    ],
    [
      "Konsultasi & Survei",
      "Bagaimana cara memesan unit kavling impian saya?",
      "Anda dapat memilih kavling melalui katalog site plan atau berkonsultasi dengan Property Advisor kami. Amankan unit pilihan Anda dengan Booking Fee Rp 10 Juta yang langsung mengurangi harga jual atau DP. Tim kami akan segera menyiapkan kelengkapan dokumen resmi unit Anda.",
    ],
    [
      "Pilihan Rumah",
      "Apa perbedaan tipe 60/90, 72/105, dan 90/120?",
      "Angka pertama menunjukkan luas bangunan (LB) dan angka kedua menunjukkan luas tanah (LT) dalam meter persegi. Tipe 60/90 memiliki 2 kamar tidur & 2 kamar mandi, tipe 72/105 memiliki 3 kamar tidur & 2 kamar mandi, dan tipe 90/120 memiliki 3 kamar tidur & 3 kamar mandi dua lantai. Seluruh tipe mengusung arsitektur tropis modern yang hemat energi.",
    ],
    [
      "Pembangunan",
      "Kapan pembangunan unit dimulai dan bagaimana memantau progresnya?",
      "Pembangunan unit mengikuti kesiapan dokumen dan jadwal serah terima yang disepakati. Konsumen dapat memantau progres konstruksi secara berkala melalui dokumentasi foto, laporan tahap kerja, dan kunjungan lapangan berkala bersama tim teknik.",
    ],
    [
      "Legalitas & Serah Terima",
      "Bagaimana kepastian legalitas dan sertifikat hunian di LinyJaya?",
      "LinyJaya Development menjamin 100% legalitas aman. Seluruh perizinan (PBG/IMB), site plan pemda, dan Sertifikat Hak Milik (SHM) telah terbit dan dipecah per kavling, sehingga siap untuk proses Akta Jual Beli (AJB) dan balik nama.",
    ],
  ];
  LJ.legalDocument = (kind) => {
    const privacy = kind === "privacy";
    const title = privacy ? "Kebijakan Privasi" : "Syarat & Ketentuan";
    const sections = privacy
      ? [
          [
            "Ruang lingkup informasi",
            "Layanan yang diperkenalkan mencakup konsultasi properti, rencana pemesanan, administrasi pembayaran, pembangunan, dan dokumen rumah. Pernyataan privasi resmi untuk layanan tersebut masih memerlukan pengesahan perusahaan.",
          ],
          [
            "Data dalam formulir dan administrasi",
            "Formulir konsultasi memuat nama, kontak, proyek pilihan, waktu yang diinginkan, serta kebutuhan hunian. Administrasi pemesanan dapat berkaitan dengan identitas klien, unit, jadwal pembayaran, bukti pembayaran, serta dokumen perjanjian. Jenis data yang benar-benar diwajibkan perlu ditetapkan perusahaan sesuai kebutuhan layanan.",
          ],
          [
            "Tujuan dan dasar pemrosesan — perlu dilengkapi",
            "Perusahaan perlu menetapkan tujuan setiap pengumpulan data, dasar pemrosesan, serta pemberitahuan dan persetujuan yang relevan. Belum ada pernyataan yang disahkan mengenai penggunaan data untuk pemasaran, pembagian data dengan bank atau kontraktor, maupun penggunaan oleh penyedia layanan lain.",
          ],
          [
            "Pengendali data dan kontak — perlu dilengkapi",
            "Nama badan hukum pengendali data, alamat korespondensi, dan kanal kontak privasi resmi belum disahkan untuk publikasi. Detail tersebut wajib ditetapkan sebelum kebijakan ini diberlakukan.",
          ],
          [
            "Penyimpanan, penerima, dan pelindungan — perlu dilengkapi",
            "Masa penyimpanan, kriteria penghapusan, pihak penerima, kemungkinan pemindahan data, serta langkah pelindungan yang benar-benar diterapkan perlu diverifikasi. Tidak ada janji kerahasiaan mutlak, sertifikasi keamanan, atau jaminan transaksi pada naskah ini.",
          ],
          [
            "Permintaan terkait data — perlu dilengkapi",
            "Prosedur untuk meminta informasi, koreksi, pembaruan, penarikan persetujuan, atau penghapusan data perlu dilengkapi dengan kanal resmi, persyaratan verifikasi, dan ketentuan yang berlaku. Tenggat penanganan tidak ditetapkan sebelum proses perusahaan dikonfirmasi.",
          ],
          [
            "Pemberlakuan kebijakan",
            "Tanggal berlaku, penanggung jawab pengesahan, serta cara pemberitahuan perubahan belum ditetapkan. Naskah ini belum merupakan kebijakan privasi resmi yang berlaku dan harus ditinjau sebelum publikasi.",
          ],
        ]
      : [
          [
            "Informasi properti dan penawaran",
            "Katalog membantu peninjauan awal lokasi, tipe, harga, fasilitas, dan rencana pembangunan. Materi pemasaran bukan pengganti pemeriksaan dokumen unit atau penawaran tertulis. Harga dan rincian proyek perlu diverifikasi perusahaan sebelum digunakan sebagai penawaran resmi.",
          ],
          [
            "Konsultasi dan kunjungan",
            "Pengisian draf konsultasi belum mengonfirmasi penerimaan permintaan atau jadwal kunjungan. Waktu dan lokasi kunjungan perlu disepakati melalui kanal perusahaan yang telah diverifikasi.",
          ],
          [
            "Pemesanan dan dokumen unit",
            "Pemilihan kavling dan pencatatan pemesanan tidak dengan sendirinya membentuk perjanjian jual beli. Identitas para pihak, unit, spesifikasi, harga, tenggat, dan persyaratan administrasi harus ditinjau serta disepakati secara tertulis.",
          ],
          [
            "DP, termin, dan konfirmasi pembayaran",
            "Perhitungan DP dan termin pada rincian unit merupakan rencana administrasi. Penerima pembayaran resmi, nominal, tenggat, dan biaya terkait memerlukan pengesahan perusahaan. Pengunggahan bukti atau perubahan status peninjauan tidak membuktikan dana telah diterima.",
          ],
          [
            "Pembatalan dan pengembalian — perlu dilengkapi",
            "Masa berlaku pemesanan, kondisi pembatalan, biaya yang mungkin timbul, serta ketentuan pengembalian DP belum disahkan. Tidak ada pengembalian dana otomatis atau jaminan pembatalan tanpa biaya yang dapat disimpulkan dari halaman ini.",
          ],
          [
            "Pembangunan dan perubahan pekerjaan",
            "Jadwal mulai, tahapan, target selesai, spesifikasi, perubahan desain, serta penyesuaian biaya menjadi bagian yang perlu dikonfirmasi dalam kesepakatan tertulis. Laporan progres membantu pemantauan dan tidak menggantikan pemeriksaan mutu di lapangan.",
          ],
          [
            "Serah terima dan pemeliharaan — perlu dilengkapi",
            "Pemeriksaan bangunan, pelunasan, dokumen unit, berita acara, penanganan temuan, serta masa pemeliharaan perlu ditetapkan perusahaan. Tidak ada jaminan waktu penyelesaian atau layanan purnajual yang dinyatakan sebelum ketentuan resmi tersedia.",
          ],
          [
            "Materi visual dan referensi perusahaan",
            "Foto dan denah memperkenalkan gagasan arsitektur serta perencanaan ruang. Logo perusahaan lain merupakan referensi industri dan bukan pernyataan kerja sama, persetujuan pembiayaan, atau dukungan resmi.",
          ],
          [
            "Pengesahan ketentuan",
            "Identitas badan hukum, kontak layanan, biaya, mekanisme pengaduan dan penyelesaian perbedaan, serta tanggal berlaku perlu dilengkapi dan disahkan sebelum ketentuan ini diberlakukan.",
          ],
        ];
    return `<div class="legal-status">${LJ.icon("file")}<div><strong>${LJ.editorial.status}</strong><p>Identitas, kontak resmi, dan ketentuan yang mengikat belum disahkan. Bagian bertanda perlu dilengkapi sebelum naskah diberlakukan.</p></div></div><div class="legal-sections">${sections.map(([heading, body], i) => `<section><h2><span>${String(i + 1).padStart(2, "0")}</span>${heading}</h2><p>${body}</p></section>`).join("")}</div><div class="legal-related"><a href="faq">Pertanyaan umum ${LJ.icon("arrow", "sm")}</a><a href="${privacy ? "syarat-ketentuan" : "kebijakan-privasi"}">${privacy ? "Syarat & Ketentuan" : "Kebijakan Privasi"} ${LJ.icon("arrow", "sm")}</a></div>`;
  };
  LJ.informationPage = (path) => {
    const faq = path === "faq" || path === "faq.html";
    const privacy = path === "kebijakan-privasi" || path === "kebijakan-privasi.html";
    const title = faq
      ? "Pertanyaan Umum"
      : privacy
        ? "Kebijakan Privasi"
        : "Syarat & Ketentuan";
    return (
      LJ.pageHero(
        "Informasi pelanggan",
        title,
        faq
          ? "Panduan memahami pilihan hunian, pemesanan, pembayaran, dan perjalanan pembangunan."
          : "Informasi untuk memahami hak, tanggung jawab, dan hal-hal yang perlu dipastikan sebelum melanjutkan proses kepemilikan rumah.",
      ) +
      `<div class="container page-body"><div class="legal-layout"><aside class="legal-nav" aria-label="Informasi pelanggan">${[
        ["kebijakan-privasi", "Kebijakan Privasi"],
        ["syarat-ketentuan", "Syarat & Ketentuan"],
        ["faq", "Pertanyaan Umum"],
      ]
        .map(
          ([url, label]) =>
            `<a href="${url}" class="${label === title ? "active" : ""}">${label}${LJ.icon("chevron", "sm")}</a>`,
        )
        .join(
          "",
        )}<p>Pastikan rincian unit dan kesepakatan selalu ditinjau melalui dokumen resmi perusahaan.</p></aside><article class="panel legal-content">${faq ? `<div class="legal-status">${LJ.icon("info")}<div><strong>Kejelasan sebelum mengambil keputusan</strong><p>Jawaban berikut membantu peninjauan awal. Ketentuan DP, biaya, pembangunan, dan layanan mengikuti pengesahan perusahaan serta dokumen unit.</p></div></div>${faqItems.map(([cat, q, a], i) => `<details class="faq-item" ${i === 0 ? "open" : ""}><summary><span><small>${cat}</small>${q}</span>${LJ.icon("plus", "sm")}</summary><p>${a}</p></details>`).join("")}` : LJ.legalDocument(privacy ? "privacy" : "terms")}</article></div></div>`
    );
  };
})();
