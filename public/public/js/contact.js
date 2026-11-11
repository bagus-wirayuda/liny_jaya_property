(function () {
  const { icon: I, esc: E } = LJ;

  LJ.pages.public.contact = function () {
    const cfg = LJ.paymentConfig();
    const waText = "Halo Tim LinyJaya Property, saya ingin menjadwalkan konsultasi hunian di Makassar dan membahas simulasi pembayaran.";
    const methodOptions = [
      cfg.cashKeras.enabled && ["Cash Keras", `Cash Keras (${cfg.cashKeras.description || "Pelunasan penuh sesuai ketentuan"})`],
      cfg.cashLunak.enabled && ["Cash Lunak", `Cash Lunak (${cfg.cashLunak.description || "Cicilan bertahap langsung ke developer"})`],
      cfg.kpr.enabled && ["KPR", `KPR (${cfg.kpr.description || "Pembiayaan bank, simulasi bersifat estimasi"})`],
      ["Belum Menentukan", "Belum Menentukan (Minta Saran Simulasi)"],
    ].filter(Boolean);

    return `
      ${LJ.pageHero(
        "Layanan Konsultasi Makassar",
        "Mari Bicarakan Rumah Impian Anda.",
        "Tim LinyJaya Property siap mendampingi Anda memilih kavling di Kota Makassar, menghitung simulasi Cash Keras, Cash Lunak, atau estimasi KPR, serta mengatur jadwal survei unit."
      )}
      <div class="container page-body">
        <div class="grid two align-start">
          <div class="stack">
            ${LJ.panel(
              "Kontak Layanan LinyJaya Property",
              `<div class="stack">
                ${[
                  [
                    "pin",
                    "Wilayah Layanan & Lokasi",
                    LJ.db.company.address || "Kota Makassar, Sulawesi Selatan (lokasi kantor menyesuaikan pengesahan perusahaan)",
                  ],
                  [
                    "phone",
                    "Telepon / WhatsApp",
                    LJ.db.company.phone || "Menunggu pengesahan kontak resmi perusahaan",
                  ],
                  [
                    "mail",
                    "Email Layanan",
                    LJ.db.company.email || "Menunggu pengesahan email resmi perusahaan",
                  ],
                  [
                    "clock",
                    "Jam Operasional",
                    LJ.db.company.hours || "Senin – Minggu: 08.30 – 17.30 WITA (Mengikuti jadwal janji temu)",
                  ],
                ]
                  .map(
                    ([i, t, d]) =>
                      `<div class="flex"><span class="icon-tile">${I(i)}</span><div><strong class="u-text-11">${t}</strong><p class="contact-detail-copy">${E(d)}</p></div></div>`,
                  )
                  .join("")}
              </div>
              <div class="u-mt-18 stack">
                <a href="${LJ.whatsappLink(waText)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full">
                  ${I("whatsapp")} Hubungi Tim Konsultasi
                </a>
                <a href="simulasi" class="btn secondary full">
                  ${I("calculator")} Buka Simulasi Cash Lunak & KPR
                </a>
              </div>`,
            )}

            <div class="contact-map" aria-label="Area Layanan LinyJaya Property Makassar">
              <div class="map-pin">
                ${I("pin", "lg")}
                <strong>${E(LJ.db.company.name || "LinyJaya Property")}</strong>
                <p>${E(LJ.db.company.address || "Kota Makassar · Sulawesi Selatan")}</p>
                <small class="muted">${E(LJ.db.company.hours || "Konsultasi dan survei unit sesuai jadwal konfirmasi")}</small>
              </div>
            </div>
          </div>

          ${LJ.panel(
            "Jadwalkan Konsultasi & Survei Unit",
            `<p class="contact-form-intro">${E(LJ.editorial.form)}</p>
            <form id="contact-form">
              <div class="form-error" role="alert"></div>
              <div class="form-grid">
                ${LJ.field({ name: "name", label: "Nama lengkap", required: true })}
                ${LJ.field({ name: "phone", label: "Nomor WhatsApp / Telepon", type: "tel", required: true })}
                ${LJ.field({ name: "email", label: "Alamat Email", type: "email", required: true })}
                ${LJ.field({
                  name: "project",
                  label: "Proyek hunian di Makassar yang diminati",
                  type: "select",
                  options: [["", "Belum menentukan / Semua Proyek"], ...LJ.db.projects.map((p) => [p.id, p.name + " (" + p.city + ")"])],
                })}
                ${LJ.field({
                  name: "payment",
                  label: "Rencana metode pembayaran",
                  type: "select",
                  options: methodOptions,
                })}
                ${LJ.field({ name: "date", label: "Rencana tanggal kunjungan / konsultasi", type: "date", min: LJ.today(), required: true })}
                ${LJ.field({
                  name: "interest",
                  label: "Topik utama",
                  type: "select",
                  options: ["Survei Unit & Lokasi Makassar", "Simulasi Cash Lunak ke Developer", "Estimasi Simulasi KPR Bank", "Informasi Promo Properti Aktif"],
                })}
                ${LJ.field({ name: "notes", label: "Catatan kebutuhan atau pertanyaan Anda", type: "textarea", wide: true, required: false })}
              </div>
              <label class="contact-form-consent">
                <input type="checkbox" required checked>
                Saya menyetujui tim LinyJaya Property menghubungi saya untuk konfirmasi jadwal konsultasi.
              </label>
              <button type="submit" class="btn primary full">
                ${I("message")} Jadwalkan Konsultasi Sekarang
              </button>
            </form>`
          )}
        </div>
      </div>
    `;
  };
})();
