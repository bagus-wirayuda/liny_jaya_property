(function () {
  const { icon: I, esc: E } = LJ;

  LJ.pages.public.contact = function () {
    const waText = "Halo Tim Sales LinyJaya Development, saya ingin jadwalkan konsultasi hunian dan survei show unit.";

    return `
      ${LJ.pageHero(
        "Sales Gallery & Konsultasi",
        "Mari Bicarakan Rumah Impian Anda.",
        "Tim Property Advisor LinyJaya siap mendampingi Anda memilih kavling terbaik, menghitung simulasi angsuran, serta mengatur kunjungan show unit."
      )}
      <div class="container page-body">
        <div class="grid two align-start">
          <div class="stack">
            ${LJ.panel(
              "Sales Gallery LinyJaya",
              `<div class="stack">
                ${[
                  [
                    "pin",
                    "Alamat Sales Gallery",
                    LJ.db.company.address || "Jl. Raya Utama Residence No. 88, Bandung, Jawa Barat",
                  ],
                  [
                    "phone",
                    "Hotline & WhatsApp Sales",
                    (LJ.db.company.phone || "0812-3456-7890") + " (Fast response siap melayani)",
                  ],
                  [
                    "mail",
                    "Email Resmi",
                    LJ.db.company.email || "sales@linyjaya.com",
                  ],
                  [
                    "clock",
                    "Jam Operasional",
                    LJ.db.company.hours || "Buka Setiap Hari: 08.30 – 18.00 WIB (Termasuk Hari Libur)",
                  ],
                ]
                  .map(
                    ([i, t, d]) =>
                      `<div class="flex"><span class="icon-tile">${I(i)}</span><div><strong class="u-text-11">${t}</strong><p class="contact-detail-copy">${E(d)}</p></div></div>`,
                  )
                  .join("")}
              </div>
              <div class="u-mt-18">
                <a href="${LJ.whatsappLink(waText)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full">
                  ${I("whatsapp")} Chat Langsung via WhatsApp Sales
                </a>
              </div>`,
            )}

            <div class="contact-map" aria-label="Lokasi Sales Gallery LinyJaya">
              <div class="map-pin">
                ${I("pin", "lg")}
                <strong>Sales Gallery ${LJ.esc(LJ.db.company.name || "LinyJaya")}</strong>
                <p>${LJ.esc(LJ.db.company.address || "Bandung Selatan · Jawa Barat")}</p>
                <small class="muted">${LJ.esc(LJ.db.company.hours || "Show Unit Siap Dikunjungi Setiap Hari")}</small>
              </div>
            </div>
          </div>

          ${LJ.panel(
            "Jadwalkan Konsultasi & Survei Show Unit",
            `<p class="contact-form-intro">${E(LJ.editorial.form)}</p>
            <form id="contact-form">
              <div class="form-error" role="alert"></div>
              <div class="form-grid">
                ${LJ.field({ name: "name", label: "Nama lengkap", required: true })}
                ${LJ.field({ name: "phone", label: "Nomor WhatsApp / Telepon", type: "tel", required: true })}
                ${LJ.field({ name: "email", label: "Alamat Email", type: "email", required: true })}
                ${LJ.field({
                  name: "project",
                  label: "Proyek hunian yang diminati",
                  type: "select",
                  options: [["", "Belum menentukan / Semua Proyek"], ...LJ.db.projects.map((p) => [p.id, p.name + " (" + p.city + ")"])],
                })}
                ${LJ.field({
                  name: "payment",
                  label: "Rencana metode pembayaran",
                  type: "select",
                  options: [
                    ["Cash Keras", "Cash Keras (Diskon 5% & Free Biaya Legalitas)"],
                    ["Cash Bertahap", "Cash Bertahap (Bunga 0% s.d. 36 Bulan)"],
                    ["KPR Bank", "KPR Bank Rekanan (DP Ringan 10%)"],
                    ["Belum Menentukan", "Belum Menentukan (Minta Saran Sales)"],
                  ],
                })}
                ${LJ.field({ name: "date", label: "Rencana tanggal kunjungan / konsultasi", type: "date", min: LJ.today(), required: true })}
                ${LJ.field({
                  name: "interest",
                  label: "Topik utama",
                  type: "select",
                  options: ["Survei Show Unit Langsung", "Simulasi Angsuran KPR & Bank", "Skema Cash Bertahap Developer 0%", "Konsultasi Pilihan Kavling & Promo"],
                })}
                ${LJ.field({ name: "notes", label: "Catatan kebutuhan atau pertanyaan Anda", type: "textarea", wide: true, required: false })}
              </div>
              <label class="contact-form-consent">
                <input type="checkbox" required checked>
                Saya menyetujui Property Advisor LinyJaya menghubungi saya untuk konfirmasi jadwal konsultasi.
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
