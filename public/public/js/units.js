(function () {
  const { icon: I, esc: E, btn: B } = LJ;

  LJ.unitPaymentSection = (u, pm, role) => {
    const p = LJ.project(u.project);
    const waBase = "Halo Tim Sales LinyJaya, saya tertarik dengan Rumah " + u.block + "-" + u.number + " (" + u.type + ") di " + (p?.name || "") + " seharga " + LJ.money(u.price) + ".";

    return `
      <section class="panel payment-panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">${I("wallet")}SIMULASI PEMBAYARAN</span>
            <h3 class="u-mt-4">Pilihan Metode Pembayaran & Simulasi Pembelian</h3>
            <p>Pilih skema pembayaran yang paling sesuai dengan rencana finansial Anda. Seluruh opsi didukung pendampingan penuh oleh Property Advisor LinyJaya.</p>
            <p class="publication-caption">Angka berikut digunakan untuk perbandingan. Rencana DP awal di ruang kerja adalah 20% dari harga katalog. Diskon, subsidi, biaya, dan persetujuan KPR mengikuti penawaran resmi serta penilaian bank.</p>
          </div>
        </div>

        <div class="payment-methods-box">
          <div class="payment-method-nav" role="tablist" aria-label="Metode Pembayaran">
            <button type="button" class="pay-tab active" data-pay-tab="cash-keras" role="tab" aria-selected="true">
              ${I("spark", "sm")}
              <span><strong>Cash Keras</strong><small>Diskon Spesial 5%</small></span>
              <span class="pay-tab-badge">Hemat Maksimal</span>
            </button>
            <button type="button" class="pay-tab" data-pay-tab="cash-bertahap" role="tab" aria-selected="false">
              ${I("layers", "sm")}
              <span><strong>Cash Lunak / Bertahap</strong><small>Cicilan Flat ke Developer</small></span>
              <span class="pay-tab-badge green">Bunga 0%</span>
            </button>
            <button type="button" class="pay-tab" data-pay-tab="kpr" role="tab" aria-selected="false">
              ${I("building", "sm")}
              <span><strong>KPR Bank Rekanan</strong><small>Syariah & Konvensional</small></span>
              <span class="pay-tab-badge blue">DP Ringan</span>
            </button>
          </div>

          <!-- PANEL 1: CASH KERAS -->
          <div class="pay-panel active" data-pay-panel="cash-keras" role="tabpanel">
            <div class="pay-banner pay-banner--gold">
              <div>
                <h4>Keuntungan Pembayaran Cash Keras</h4>
                <p>Opsi pembayaran tunai satu bulan dengan potongan harga langsung dan pembebasan seluruh biaya legalitas resmi.</p>
              </div>
              <div class="pay-banner-highlight">
                <small>Potongan Diskon Langsung</small>
                <strong>${LJ.money(pm.cashKeras.discount, true)}</strong>
              </div>
            </div>

            <div class="pay-perks-grid">
              <div class="pay-perk-item">${I("check", "sm")} Diskon spesial 5% dari harga jual</div>
              <div class="pay-perk-item">${I("check", "sm")} Free Biaya BPHTB (Pajak Pembeli)</div>
              <div class="pay-perk-item">${I("check", "sm")} Free Biaya Notaris & Akta Jual Beli (AJB)</div>
              <div class="pay-perk-item">${I("check", "sm")} Free Balik Nama Sertifikat Hak Milik (SHM)</div>
              <div class="pay-perk-item">${I("check", "sm")} Free PPN 100%</div>
              <div class="pay-perk-item">${I("check", "sm")} Bonus Eksklusif: Canopy Carport + Smart Door Lock</div>
            </div>

            <h4 class="u-mt-20 u-mb-10">Rincian & Tahapan Pembayaran Cash Keras</h4>
            ${LJ.table(
              ["Tahapan Pembayaran", "Jadwal Pelaksanaan", "Persentase", "Jumlah Nominal"],
              [
                ["<strong>1. Tanda Jadi (Booking Fee)</strong>", "Saat pemilihan unit kavling", "Mengurangi Total", LJ.money(pm.bookingFee)],
                ["<strong>2. Uang Muka / Termin 1</strong>", "Maksimal 14 hari kalender setelah booking", "20% (Nett)", LJ.money(pm.cashKeras.dp)],
                ["<strong>3. Pelunasan / Termin 2</strong>", "Maksimal 30 hari kalender saat tanda tangan AJB", "80% (Nett)", LJ.money(pm.cashKeras.pelunasan)],
                ["<strong class='blue'>TOTAL HARGA NETT</strong>", "<strong class='blue'>Hemat " + LJ.money(pm.cashKeras.discount) + "</strong>", "<strong class='blue'>100%</strong>", "<strong class='blue'>" + LJ.money(pm.cashKeras.nett) + "</strong>"],
              ]
            )}

            <div class="pay-action-bar u-mt-18">
              ${B("Konsultasi Skema Cash Keras", "consult-payment", u.id + ":cash-keras", "primary", "message")}
              <a href="${LJ.whatsappLink(waBase + ' Saya ingin konsultasi skema Cash Keras dengan diskon 5%.')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp">
                ${I("whatsapp")} Chat WhatsApp Sales
              </a>
            </div>
          </div>

          <!-- PANEL 2: CASH LUNAK / BERTAHAP -->
          <div class="pay-panel" data-pay-panel="cash-bertahap" role="tabpanel">
            <div class="pay-banner pay-banner--blue">
              <div>
                <h4>Keuntungan Cash Lunak / Bertahap ke Developer</h4>
                <p>Cicilan flat langsung ke pengembang PT LinyJaya tanpa perantara bank. Sangat fleksibel, aman, dan tanpa proses berbelit.</p>
              </div>
              <div class="pay-banner-highlight">
                <small>Suku Bunga</small>
                <strong>0% FLAT</strong>
              </div>
            </div>

            <div class="pay-perks-grid">
              <div class="pay-perk-item">${I("check", "sm")} Bunga 0% Flat — Tanpa bunga mengambang bank</div>
              <div class="pay-perk-item">${I("check", "sm")} Persyaratan cicilan dikonfirmasi bersama tim pengembang</div>
              <div class="pay-perk-item">${I("check", "sm")} Syarat Sangat Mudah: Cukup KTP dan NPWP</div>
              <div class="pay-perk-item">${I("check", "sm")} Bebas Biaya Appraisal & Bebas Asuransi Bank</div>
              <div class="pay-perk-item">${I("check", "sm")} DP 20% dapat dicicil hingga 3 kali (3 bulan)</div>
              <div class="pay-perk-item">${I("check", "sm")} Tenor Fleksibel: 12 Bulan, 24 Bulan, atau 36 Bulan</div>
            </div>

            <h4 class="u-mt-20 u-mb-10">Simulasi Cicilan Bertahap ke Developer (Bunga 0%)</h4>
            <div class="grid three u-mb-16">
              <div class="pay-sim-card">
                <span class="pay-sim-label">Tenor 12 Bulan (1 Th)</span>
                <strong class="pay-sim-amount">${LJ.money(pm.cashBertahap.tenor12x)}</strong>
                <small>per bulan (Flat 12x)</small>
              </div>
              <div class="pay-sim-card highlight">
                <span class="pay-sim-badge">Paling Populer</span>
                <span class="pay-sim-label">Tenor 24 Bulan (2 Th)</span>
                <strong class="pay-sim-amount">${LJ.money(pm.cashBertahap.tenor24x)}</strong>
                <small>per bulan (Flat 24x)</small>
              </div>
              <div class="pay-sim-card">
                <span class="pay-sim-label">Tenor 36 Bulan (3 Th)</span>
                <strong class="pay-sim-amount">${LJ.money(pm.cashBertahap.tenor36x)}</strong>
                <small>per bulan (Flat 36x)</small>
              </div>
            </div>

            ${LJ.table(
              ["Komponen Pembayaran", "Keterangan Skema", "Nominal"],
              [
                ["Tanda Jadi (Booking Fee)", "Mengunci kavling dan mengikat harga", LJ.money(pm.bookingFee)],
                ["Uang Muka (DP 20%)", "Dapat dicicil 3 bulan pertama (@ " + LJ.money(pm.cashBertahap.dpPerMonth3x) + " / bln)", LJ.money(pm.cashBertahap.dpTotal)],
                ["Sisa Pokok (80%)", "Dibagi rata sesuai pilihan tenor (12x, 24x, atau 36x)", LJ.money(pm.cashBertahap.sisa)],
                ["Total Nilai Pembelian", "Flat tanpa bunga developer", LJ.money(u.price)],
              ]
            )}

            <div class="pay-action-bar u-mt-18">
              ${B("Konsultasi Skema Cash Bertahap", "consult-payment", u.id + ":cash-bertahap", "primary", "message")}
              <a href="${LJ.whatsappLink(waBase + ' Saya ingin konsultasi cicilan Cash Bertahap bunga 0% ke developer.')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp">
                ${I("whatsapp")} Chat WhatsApp Sales
              </a>
            </div>
          </div>

          <!-- PANEL 3: KPR BANK -->
          <div class="pay-panel" data-pay-panel="kpr" role="tabpanel">
            <div class="pay-banner pay-banner--green">
              <div>
                <h4>KPR Bank Rekanan (Syariah & Konvensional)</h4>
                <p>Kepemilikan hunian dengan cicilan ringan jangka panjang. Tim sales LinyJaya mendampingi seluruh proses pengajuan berkas hingga akad kredit disetujui.</p>
              </div>
              <div class="pay-banner-highlight">
                <small>Cicilan KPR Mulai</small>
                <strong>${LJ.money(pm.kpr.tenor20th, true)}/bln</strong>
              </div>
            </div>

            <div class="pay-perks-grid">
              <div class="pay-perk-item">${I("check", "sm")} DP Ringan mulai 10% (Tersedia program subsidi DP 5%)</div>
              <div class="pay-perk-item">${I("check", "sm")} Pilihan bank dan ketersediaan program perlu dikonfirmasi</div>
              <div class="pay-perk-item">${I("check", "sm")} Suku bunga promo kompetitif mulai 4.75% – 5.5% fixed</div>
              <div class="pay-perk-item">${I("check", "sm")} Subsidi Biaya KPR hingga Rp 15 Juta dari LinyJaya</div>
              <div class="pay-perk-item">${I("check", "sm")} Pilihan Tenor Panjang: 10, 15, 20, hingga 25 Tahun</div>
              <div class="pay-perk-item">${I("check", "sm")} Full pendampingan berkas oleh Property Advisor s.d. Akad</div>
            </div>

            <h4 class="u-mt-20 u-mb-10">Tabel Simulasi Angsuran KPR Bank (Asumsi Suku Bunga Promo 5.0% Fixed)</h4>
            <div class="grid four u-mb-16">
              <div class="pay-sim-card">
                <span class="pay-sim-label">Tenor 10 Tahun</span>
                <strong class="pay-sim-amount">${LJ.money(pm.kpr.tenor10th)}</strong>
                <small>per bulan</small>
              </div>
              <div class="pay-sim-card">
                <span class="pay-sim-label">Tenor 15 Tahun</span>
                <strong class="pay-sim-amount">${LJ.money(pm.kpr.tenor15th)}</strong>
                <small>per bulan</small>
              </div>
              <div class="pay-sim-card highlight">
                <span class="pay-sim-badge">Rekomendasi</span>
                <span class="pay-sim-label">Tenor 20 Tahun</span>
                <strong class="pay-sim-amount">${LJ.money(pm.kpr.tenor20th)}</strong>
                <small>per bulan</small>
              </div>
              <div class="pay-sim-card">
                <span class="pay-sim-label">Tenor 25 Tahun</span>
                <strong class="pay-sim-amount">${LJ.money(pm.kpr.tenor25th)}</strong>
                <small>per bulan</small>
              </div>
            </div>

            ${LJ.table(
              ["Rincian Perhitungan KPR", "Keterangan", "Nominal"],
              [
                ["Harga Unit", "Harga jual resmi", LJ.money(u.price)],
                ["Uang Muka / DP 10%", "Dapat dicicil selama proses pengajuan KPR", LJ.money(pm.kpr.dp)],
                ["Plafon Pinjaman KPR (90%)", "Diajukan ke bank rekanan (BSI / BTN / Mandiri / BCA)", LJ.money(pm.kpr.plafon)],
                ["Booking Fee Awal", "Mengunci unit kavling & subsidi KPR", LJ.money(pm.bookingFee)],
              ]
            )}

            <div class="pay-action-bar u-mt-18">
              ${B("Konsultasi & Simulasi KPR", "consult-payment", u.id + ":kpr", "primary", "message")}
              <a href="${LJ.whatsappLink(waBase + ' Saya ingin konsultasi simulasi KPR Bank dan subsidi biaya KPR.')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp">
                ${I("whatsapp")} Chat WhatsApp Sales
              </a>
            </div>
          </div>
        </div>

        <!-- TABEL KOMPARASI 3 METODE PEMBAYARAN -->
        <div class="u-mt-28">
          <h4 class="u-mb-10">${I("target", "sm")} Komparasi Singkat 3 Metode Pembayaran</h4>
          ${LJ.table(
            ["Kriteria", "Cash Keras", "Cash Lunak / Bertahap", "KPR Bank"],
            [
              ["<strong>Potongan / Suku Bunga</strong>", "<span class='tag green'>Diskon 5%</span>", "<span class='tag green'>Bunga 0% Flat</span>", "<span class='tag blue'>Promo Bunga 5.0%</span>"],
              ["<strong>Uang Muka (DP)</strong>", "DP 20% (14 Hari)", "DP 20% (Cicil 3x)", "DP Ringan Mulai 10%"],
              ["<strong>Jangka Waktu</strong>", "Pelunasan 30 Hari", "12, 24, atau 36 Bulan", "10 s.d. 25 Tahun"],
              ["<strong>BI Checking / SLIK</strong>", "Tidak Perlu", "<strong>Tanpa BI Checking</strong>", "Melalui BI Checking"],
              ["<strong>Persyaratan Dokumen</strong>", "KTP & NPWP", "KTP & NPWP", "KTP, NPWP, Slip Gaji / Rekening"],
              ["<strong>Bonus Khusus</strong>", "Free BPHTB, Notaris & SHM", "Kemudahan cicil langsung", "Subsidi Biaya KPR Rp 15 Jt"],
            ]
          )}
        </div>
      </section>
    `;
  };

  LJ.unitDetail = (u, role) => {
    const p = LJ.project(u.project);
    const pm = LJ.calcPaymentDetails(u.price);
    const waBase = "Halo Tim Sales LinyJaya, saya tertarik berkonsultasi mengenai Rumah " + u.block + "-" + u.number + " (" + u.type + ") di " + (p?.name || "") + " seharga " + LJ.money(u.price) + ".";

    return `
      ${LJ.publicationNotice()}
      <div class="detail-hero">
        <img src="${LJ.image(u.image)}" alt="Visual arsitektur tipe ${E(u.type)}">
        <span class="card-label">${I("home")}UNIT ${E(u.block + "-" + u.number)} · TIPE ${E(u.type)}</span>
      </div>

      <div class="detail-layout">
        <div class="stack">
          <div>
            <a class="text-link" href="${LJ.propertyPage("projects", p.id, role)}">${E(p.name)} ${I("arrow", "sm")}</a>
            <h1 class="unit-card-amenities">Rumah ${E(u.block + "-" + u.number)} <span class="muted">/ Tipe ${E(u.type)}</span></h1>
            <p class="u-text-12">${I("pin", "sm")} ${E(p.location)}</p>

            <div class="detail-features">
              ${[
                ["Luas tanah", u.land + " m²"],
                ["Luas bangunan", u.building + " m²"],
                ["Kamar tidur", u.beds + " Kamar"],
                ["Kamar mandi", u.baths + " Kamar Mandi"],
                ["Jumlah lantai", u.floors + " Lantai"],
              ]
                .map(([l, v]) => `<div><small>${l}</small><strong>${v}</strong></div>`)
                .join("")}
            </div>
          </div>

          <!-- SECTION METODE PEMBAYARAN DETAIL (CASH KERAS, CASH LUNAK, KPR) -->
          ${LJ.unitPaymentSection(u, pm, role)}

          ${LJ.panel(
            "Status & Progres Unit",
            `<div class="grid two">
              <div>
                <p>Status Penjualan</p>
                <div class="u-mt-10">${LJ.badge(u.sale)}</div>
              </div>
              <div>
                <p>Status Pembangunan</p>
                <div class="u-mt-10">${LJ.badge(u.construction)}</div>
              </div>
            </div>
            ${LJ.progress(u.progress, u.stage)}
            <p class="publication-caption">Estimasi kesiapan unit: ${LJ.date(u.estimate)}. Pembangunan dikerjakan sesuai standar mutu tinggi LinyJaya Development.</p>`
          )}

          ${LJ.panel(
            "Konsep Denah Rumah",
            LJ.blueprint(u.type),
            "",
            "Konsep tata ruang optimal dengan sirkulasi udara tropis dan pencahayaan alami yang maksimal."
          )}

          ${LJ.panel(
            "Spesifikasi Teknis & Material Berkualitas",
            LJ.table(
              ["Komponen", "Spesifikasi Material"],
              [
                ["Pondasi", "Beton bertulang cakar ayam standar struktur tahan gempa"],
                ["Dinding", "Bata ringan diplester, diaci halus & dicat premium weather-resistant"],
                ["Lantai Utama", "Homogeneous Tile 60 × 60 cm polished"],
                ["Rangka Atap", "Baja ringan galvalum anti-karat dengan genteng flat beton"],
                ["Kusen & Jendela", "Aluminium powder coating elegan dengan kaca bening 5 mm"],
                ["Sanitasi", "Kloset duduk merk TOTO / setara & instalasi shower modern"],
                ["Daya Listrik & Air", "PLN 2.200 VA (underground cable) & sumur bor jet pump otomatis"],
              ]
            )
          )}

          ${LJ.panel(
            "4 Langkah Mudah Memiliki Hunian LinyJaya",
            `<ol class="property-steps">
              <li><strong>Konsultasi & Pilih Kavling:</strong> Diskusikan kebutuhan ruang, denah, dan ketersediaan kavling bersama Property Advisor LinyJaya.</li>
              <li><strong>Pilih Metode Pembayaran:</strong> Tentukan skema yang paling sesuai: Cash Keras (Diskon 5%), Cash Bertahap (Bunga 0%), atau KPR Bank (DP Ringan).</li>
              <li><strong>Booking Fee & Penyiapan Berkas:</strong> Amankan unit pilihan Anda dengan Booking Fee Rp 10 Juta dan kami bantu seluruh proses administrasi.</li>
              <li><strong>Akad / AJB & Serah Terima Kunci:</strong> Penandatanganan dokumen legal resmi dan pemantauan progres pembangunan hingga serah terima unit.</li>
            </ol>
            ${!role ? `<a class="text-link" href="faq.html">Pelajari selengkapnya di Pertanyaan Umum ${I("arrow", "sm")}</a>` : ""}`
          )}
        </div>

        <!-- SIDEBAR HARGA & KONSULTASI -->
        <aside class="panel detail-price">
          <div class="sales-price-header">
            <span class="sales-promo-pill">${I("spark", "sm")} Promo Spesial Bulan Ini</span>
            <p class="u-text-11 u-mt-6">Harga Katalog Unit</p>
            <h2 class="blue unit-detail-price">${LJ.money(u.price, true)}</h2>
            <div class="unit-price-sub">${LJ.money(u.price)}</div>
          </div>

          <div class="sales-kpr-highlight">
            <span class="u-text-10">Estimasi Cicilan KPR:</span>
            <strong>Mulai ${LJ.money(pm.kpr.tenor20th, true)} <small>/ bulan</small></strong>
          </div>

          <div class="sales-perks-mini">
            <div>${I("check", "sm")} <span>Bisa Cash Keras <strong>(Diskon 5%)</strong></span></div>
            <div>${I("check", "sm")} <span>Bisa Cash Bertahap <strong>(Bunga 0%)</strong></span></div>
            <div>${I("check", "sm")} <span>KPR Bank Rekanan <strong>(DP 10%)</strong></span></div>
            <div>${I("check", "sm")} <span>Free BPHTB, Notaris & SHM</span></div>
          </div>

          <div class="divider"></div>

          <!-- TOMBOL KONSULTASI UTAMA -->
          <div class="sales-action-stack">
            ${u.sale === "Tersedia"
              ? `
                ${role === "client" ? B("Ajukan pemesanan", "book", u.id, "primary full", "home") : ""}
                ${B("Konsultasi Pembelian", "consult", u.project + ":" + u.id, role === "client" ? "secondary full" : "primary full", "message")}
                <a href="${LJ.whatsappLink(waBase)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full u-mt-10">
                  ${I("whatsapp")} Konsultasi via WhatsApp
                </a>
                <button type="button" class="btn secondary full u-mt-10" data-action="consult" data-id="${u.project}:${u.id}:survey">
                  ${I("calendar")} Jadwalkan Survei Lokasi
                </button>
              `
              : `<div class="u-mb-10">${LJ.badge(u.sale)}</div>
                <p class="u-text-11 muted u-mb-10">Unit kavling ini sedang ${u.sale.toLowerCase()}. Anda tetap dapat berkonsultasi mengenai ketersediaan unit sejenis di kawasan ini.</p>
                ${B("Konsultasi Unit Serupa", "consult", u.project + ":" + u.id, "primary full", "message")}
                <a href="${LJ.whatsappLink(waBase + ' Saya ingin menanyakan ketersediaan unit sejenis di kawasan ini.')}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full u-mt-10">
                  ${I("whatsapp")} Chat WhatsApp Sales
                </a>`}
          </div>

          <p class="legal-note u-mt-18">
            Konsultasi properti dan simulasi angsuran tidak dipungut biaya. Property Advisor kami siap mendampingi Anda di Sales Gallery maupun melalui WhatsApp.
          </p>
        </aside>
      </div>
    `;
  };
})();
