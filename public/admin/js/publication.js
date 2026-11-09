(function () {
  const requiredInformation = [
    [
      "Identitas perusahaan",
      "Nama badan hukum, alamat kantor, serta penanggung jawab perusahaan.",
    ],
    [
      "Kontak layanan",
      "Nomor telepon, email, area layanan, dan jam operasional resmi.",
    ],
    [
      "Informasi proyek",
      "Lokasi, rencana unit, harga, fasilitas, spesifikasi, serta hak atas tanah dan perizinan per proyek.",
    ],
    [
      "Pemesanan dan pembayaran",
      "Nominal DP, masa pemesanan, penerima pembayaran resmi, biaya tambahan, serta pembatalan dan pengembalian dana.",
    ],
    [
      "Pembangunan dan serah terima",
      "Jadwal kontraktual, perubahan desain, pemeriksaan mutu, pemeliharaan, dan ketentuan serah terima.",
    ],
    [
      "Pelindungan data pribadi",
      "Identitas pengendali data, tujuan dan dasar pemrosesan, penerima data, masa retensi, langkah pelindungan, serta kanal pelaksanaan hak.",
    ],
    [
      "Publikasi dan afiliasi",
      "Persetujuan materi pemasaran, penggunaan dokumentasi, serta bukti kerja sama sebelum menyebut mitra resmi.",
    ],
  ];
  LJ.publicationReview = () =>
    LJ.panel(
      "Kelengkapan sebelum publikasi",
      `<div class="legal-status">${LJ.icon("clipboard")}<div><strong>Menunggu konfirmasi perusahaan</strong><p>Materi berikut memerlukan data dan pengesahan penanggung jawab. Status ini tidak menyatakan izin, kepatuhan, atau kerja sama telah diperoleh.</p></div></div>${LJ.table(
        ["Bidang", "Informasi yang diperlukan", "Status"],
        requiredInformation.map(([topic, detail]) => [
          topic,
          LJ.esc(detail),
          '<span class="tag orange">Perlu dilengkapi</span>',
        ]),
      )}<div class="legal-related"><a target="_blank" rel="noopener" href="kebijakan-privasi.html">Tinjau Privasi</a><a target="_blank" rel="noopener" href="syarat-ketentuan.html">Tinjau Ketentuan</a><a target="_blank" rel="noopener" href="faq.html">Tinjau FAQ</a></div>`,
    );
})();
