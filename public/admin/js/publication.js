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
  LJ.publicationReview = () => {
    const d = LJ.db,
      c = d.company || {};
    const readiness = {
      "Identitas perusahaan": Boolean(c.name && c.address && c.vision),
      "Kontak layanan": Boolean(c.phone && c.email && c.hours),
      "Informasi proyek":
        (d.projects || []).length > 0 && (d.units || []).length > 0,
      "Pemesanan dan pembayaran":
        (d.units || []).some((u) => Number(u.price) > 0) &&
        Boolean(d.settings && Object.keys(d.settings).length > 0),
      "Pembangunan dan serah terima": (d.units || []).some((u) =>
        Boolean(u.estimate),
      ),
      "Pelindungan data pribadi": Boolean(c.name && c.address && c.email),
      "Publikasi dan afiliasi":
        (d.partners || []).length > 0 &&
        (d.promos || []).some((p) => p.status === "Aktif"),
    };
    const readyCount = requiredInformation.filter(
      ([topic]) => readiness[topic],
    ).length;
    const allReady = readyCount === requiredInformation.length;
    return LJ.panel(
      "Kelengkapan sebelum publikasi",
      `<div class="legal-status">${LJ.icon("clipboard")}<div><strong>${allReady ? `Seluruh ${readyCount} bidang informasi siap` : `${readyCount} dari ${requiredInformation.length} bidang siap · menunggu kelengkapan`}</strong><p>Status kelengkapan dihitung langsung dari data perusahaan, proyek, unit, pengaturan, mitra, dan promo pada database. Pengesahan hukum tetap menjadi tanggung jawab perusahaan.</p></div></div>${LJ.table(
        ["Bidang", "Informasi yang diperlukan", "Status"],
        requiredInformation.map(([topic, detail]) => [
          topic,
          LJ.esc(detail),
          readiness[topic]
            ? '<span class="tag green">Siap</span>'
            : '<span class="tag orange">Perlu dilengkapi</span>',
        ]),
      )}<div class="legal-related"><a target="_blank" rel="noopener" href="kebijakan-privasi">Tinjau Privasi</a><a target="_blank" rel="noopener" href="syarat-ketentuan">Tinjau Ketentuan</a><a target="_blank" rel="noopener" href="faq">Tinjau FAQ</a></div>`,
    );
  };
})();
