(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;

  LJ.unitPaymentSection = (u, pm, role) => {
    const p = LJ.project(u.project);
    const cfg = LJ.paymentConfig();
    const activePromos = LJ.promosForUnit(u);
    const waBase = `Halo Tim LinyJaya Property Makassar, saya tertarik dengan Rumah ${u.block}-${u.number} (${u.type}) di ${p?.name || ""} seharga ${LJ.money(u.price)}.`;

    const simCashKeras = LJ.simulatePayment({ unit: u, method: "Cash Keras" });
    const simCashLunak = LJ.simulatePayment({ unit: u, method: "Cash Lunak" });
    const simKpr = LJ.simulatePayment({ unit: u, method: "KPR" });

    return `
      <section class="panel payment-panel">
        <div class="panel-head">
          <div>
            <span class="eyebrow">${I("wallet")}SKEMA PEMBAYARAN RESMI</span>
            <h3 class="u-mt-4">Pilihan Metode Pembayaran & Simulasi Unit</h3>
            <p>Konfigurasi di bawah mengikuti aturan pembayaran yang ditetapkan Administrator pada database sistem.</p>
          </div>
          ${A("Hitung Interaktif & Custom Tenor", "simulasi?unit=" + encodeURIComponent(u.id), "primary small", "calculator")}
        </div>

        ${
          activePromos.length
            ? `<div class="unit-promo-list u-mb-16">
                ${activePromos
                  .map((pr) => {
                    const disc = LJ.promoDiscount(u.price, pr);
                    const net = Math.max(0, u.price - disc);
                    return `<div class="notice sales-promo-bar u-mt-8">
                      ${I("spark")}
                      <div class="u-flex-fill">
                        <strong>${E(pr.name)}</strong> · Hemat <strong>${LJ.money(disc)}</strong> (Harga menjadi <strong>${LJ.money(net)}</strong>)
                        <div class="u-text-10">Berlaku s.d. ${LJ.date(pr.end)} · Metode: ${E(LJ.promoMethods(pr).join(", "))}</div>
                      </div>
                      ${A("Terapkan di Simulasi", `simulasi?unit=${encodeURIComponent(u.id)}&promo=${encodeURIComponent(pr.id)}&method=${encodeURIComponent(LJ.promoMethods(pr)[0] || "Cash Keras")}`, "secondary small", "calculator")}
                    </div>`;
                  })
                  .join("")}
              </div>`
            : ""
        }

        <div class="payment-methods-box">
          <div class="payment-method-nav" role="tablist" aria-label="Metode Pembayaran">
            <button type="button" class="pay-tab active" data-pay-tab="cash-keras" role="tab" aria-selected="true">
              ${I("spark", "sm")}
              <span><strong>${E(cfg.cashKeras.label)}</strong><small>DP ${cfg.cashKeras.dpPercent}% · Pelunasan ${cfg.cashKeras.settlementDays} Hr</small></span>
              <span class="pay-tab-badge">${cfg.cashKeras.enabled ? "Aktif" : "Nonaktif"}</span>
            </button>
            <button type="button" class="pay-tab" data-pay-tab="cash-bertahap" role="tab" aria-selected="false">
              ${I("layers", "sm")}
              <span><strong>${E(cfg.cashLunak.label)}</strong><small>Tenor s.d. ${cfg.cashLunak.maxTenorMonths} Bulan</small></span>
              <span class="pay-tab-badge green">${cfg.cashLunak.interestPercent}% p.a.</span>
            </button>
            <button type="button" class="pay-tab" data-pay-tab="kpr" role="tab" aria-selected="false">
              ${I("building", "sm")}
              <span><strong>${E(cfg.kpr.label)}</strong><small>Tenor ${cfg.kpr.minTenorYears}–${cfg.kpr.maxTenorYears} Tahun</small></span>
              <span class="pay-tab-badge blue">Est. ${cfg.kpr.interestRate}%</span>
            </button>
          </div>

          <div class="pay-panel active" data-pay-panel="cash-keras" role="tabpanel">
            <div class="pay-banner pay-banner--gold">
              <div>
                <h4>Skema Cash Keras</h4>
                <p>${E(cfg.cashKeras.description)}</p>
              </div>
              <div class="pay-banner-highlight">
                <small>Total Harga Katalog</small>
                <strong>${LJ.money(simCashKeras.finalPrice, true)}</strong>
              </div>
            </div>

            ${LJ.table(
              ["Tahapan Pembayaran", "Ketentuan", "Persentase", "Nominal"],
              [
                ["<strong>1. Uang Muka (DP)</strong>", "Jatuh tempo 7 hari setelah pemesanan", `${cfg.cashKeras.dpPercent}%`, LJ.money(simCashKeras.dpAmount)],
                ["<strong>2. Pelunasan</strong>", `Maksimal ${cfg.cashKeras.settlementDays} hari setelah verifikasi DP`, `${100 - cfg.cashKeras.dpPercent}%`, LJ.money(simCashKeras.settlementAmount)],
                ["<strong class='blue'>TOTAL PEMBAYARAN</strong>", "Harga dasar sebelum promo tambahan", "100%", `<strong class='blue'>${LJ.money(simCashKeras.totalPayment)}</strong>`],
              ],
            )}

            <div class="pay-action-bar u-mt-18">
              ${A("Buka Simulasi Cash Keras", `simulasi?unit=${encodeURIComponent(u.id)}&method=Cash+Keras`, "primary", "calculator")}
              ${B("Konsultasi Cash Keras", "consult-payment", u.id + ":cash-keras", "secondary", "message")}
            </div>
          </div>

          <div class="pay-panel" data-pay-panel="cash-bertahap" role="tabpanel">
            <div class="pay-banner pay-banner--blue">
              <div>
                <h4>Skema Cash Lunak (Bertahap Developer)</h4>
                <p>${E(cfg.cashLunak.description)}</p>
              </div>
              <div class="pay-banner-highlight">
                <small>Bunga Developer</small>
                <strong>${cfg.cashLunak.interestPercent}% / th</strong>
              </div>
            </div>

            <div class="grid three u-mb-16">
              <div class="pay-sim-card">
                <span class="pay-sim-label">Tenor 12 Bulan</span>
                <strong class="pay-sim-amount">${LJ.money(pm.cashLunak.tenor12x)}</strong>
                <small>per bulan (tgl ${cfg.cashLunak.dueDay})</small>
              </div>
              <div class="pay-sim-card highlight">
                <span class="pay-sim-badge">Tenor Default (${cfg.cashLunak.tenorMonths} bln)</span>
                <span class="pay-sim-label">DP ${cfg.cashLunak.dpPercent}% = ${LJ.money(simCashLunak.dpAmount, true)}</span>
                <strong class="pay-sim-amount">${LJ.money(simCashLunak.monthlyInstallment)}</strong>
                <small>per bulan</small>
              </div>
              <div class="pay-sim-card">
                <span class="pay-sim-label">Tenor Maks. ${cfg.cashLunak.maxTenorMonths} Bulan</span>
                <strong class="pay-sim-amount">${LJ.money(pm.cashLunak.tenorMax)}</strong>
                <small>per bulan (tgl ${cfg.cashLunak.dueDay})</small>
              </div>
            </div>

            <div class="pay-action-bar u-mt-18">
              ${A("Simulasi & Jadwal Jatuh Tempo", `simulasi?unit=${encodeURIComponent(u.id)}&method=Cash+Lunak`, "primary", "calculator")}
              ${B("Konsultasi Cash Lunak", "consult-payment", u.id + ":cash-bertahap", "secondary", "message")}
            </div>
          </div>

          <div class="pay-panel" data-pay-panel="kpr" role="tabpanel">
            <div class="pay-banner pay-banner--green">
              <div>
                <h4>Estimasi Pembiayaan KPR Bank</h4>
                <p>${E(cfg.kpr.description)}</p>
              </div>
              <div class="pay-banner-highlight">
                <small>Estimasi Tenor ${cfg.kpr.defaultTenorYears} Th (${cfg.kpr.interestRate}%)</small>
                <strong>${LJ.money(simKpr.monthlyInstallment, true)}/bln</strong>
              </div>
            </div>

            <div class="grid four u-mb-16">
              ${[10, 15, 20, 25]
                .filter((y) => y >= cfg.kpr.minTenorYears && y <= cfg.kpr.maxTenorYears)
                .map(
                  (y) => `<div class="pay-sim-card ${y === cfg.kpr.defaultTenorYears ? "highlight" : ""}">
                    ${y === cfg.kpr.defaultTenorYears ? '<span class="pay-sim-badge">Default Sistem</span>' : ""}
                    <span class="pay-sim-label">Tenor ${y} Tahun</span>
                    <strong class="pay-sim-amount">${LJ.money(LJ.calcKPR(u.price, y, cfg.kpr.dpPercent, cfg.kpr.interestRate))}</strong>
                    <small>per bulan</small>
                  </div>`,
                )
                .join("")}
            </div>

            ${LJ.table(
              ["Komponen KPR (Estimasi)", "Keterangan", "Nominal"],
              [
                ["Harga Katalog", "Sebelum promo", LJ.money(u.price)],
                [`Uang Muka / DP (${cfg.kpr.dpPercent}%)`, "Sesuai konfigurasi dasar", LJ.money(simKpr.dpAmount)],
                [`Plafon Pembiayaan (${100 - cfg.kpr.dpPercent}%)`, "Pokok kredit estimasi ke bank", LJ.money(simKpr.plafon)],
              ],
            )}

            <div class="notice u-mt-16">${I("info")}<span>Hasil simulasi KPR bersifat estimasi ilustratif berdasarkan suku bunga acuan ${cfg.kpr.interestRate}%/tahun dan bukan merupakan persetujuan kredit bank.</span></div>

            <div class="pay-action-bar u-mt-18">
              ${A("Hitung Suku Bunga & Tenor Kustom", `simulasi?unit=${encodeURIComponent(u.id)}&method=KPR`, "primary", "calculator")}
              ${B("Konsultasi KPR", "consult-payment", u.id + ":kpr", "secondary", "message")}
            </div>
          </div>
        </div>
      </section>
    `;
  };

  LJ.unitDetail = (u, role) => {
    const p = LJ.project(u.project);
    const pm = LJ.calcPaymentDetails(u.price, u);
    const best = LJ.bestPromoForUnit(u);
    const displayPrice = best.promo ? best.finalPrice : u.price;
    const waBase = `Halo Tim LinyJaya Property Makassar, saya tertarik dengan Rumah ${u.block}-${u.number} (${u.type}) di ${p?.name || ""} seharga ${LJ.money(displayPrice)}.`;

    return `
      ${LJ.publicationNotice(u.project, u.id)}
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
            <p class="publication-caption">Estimasi kesiapan unit: ${LJ.date(u.estimate)}. Dikerjakan oleh LinyJaya Property Makassar.</p>`,
          )}

          ${LJ.panel(
            "Konsep Denah Rumah",
            LJ.blueprint(u.type),
            "",
            "Konsep tata ruang ilustrasi untuk memahami pembagian area rumah.",
          )}

          ${LJ.panel(
            "Spesifikasi Teknis Bangunan",
            LJ.table(
              ["Komponen", "Spesifikasi Material"],
              [
                ["Pondasi", "Beton bertulang sesuai perencanaan struktur"],
                ["Dinding", "Bata ringan diplester, diaci halus, dan cat eksterior/interior"],
                ["Lantai Utama", "Homogeneous tile 60 × 60 cm"],
                ["Rangka Atap", "Baja ringan dengan penutup atap standar proyek"],
                ["Kusen & Jendela", "Aluminium powder coating dengan kaca bening"],
                ["Sanitasi", "Kloset duduk & perlengkapan kamar mandi standar proyek"],
                ["Utilitas", "Sambungan listrik & air bersih sesuai kesiapan kawasan Makassar"],
              ],
            ),
          )}
        </div>

        <aside class="panel detail-price">
          <div class="sales-price-header">
            ${best.promo ? `<span class="sales-promo-pill">${I("spark", "sm")} Promo ${E(best.promo.name)}</span>` : ""}
            <p class="u-text-11 u-mt-6">${best.promo ? "Harga Setelah Promo Terbaik" : "Harga Katalog Unit"}</p>
            ${best.promo ? `<del class="muted u-text-11">${LJ.money(u.price)}</del>` : ""}
            <h2 class="blue unit-detail-price">${LJ.money(displayPrice, true)}</h2>
            <div class="unit-price-sub">${LJ.money(displayPrice)}</div>
          </div>

          <div class="sales-kpr-highlight">
            <span class="u-text-10">Estimasi Cicilan KPR (${LJ.paymentConfig().kpr.defaultTenorYears} Th):</span>
            <strong>${LJ.money(LJ.calcKPR(displayPrice), true)} <small>/ bulan</small></strong>
            ${
              LJ.kprPartners().length
                ? `<div class="unit-kpr-banks">${LJ.kprPartners()
                    .map((bp) => `<span>${E(bp.name.replace(/\s*\([^)]*\)/, ""))}</span>`)
                    .join("")}</div>`
                : ""
            }
          </div>

          <div class="sales-perks-mini">
            <div>${I("check", "sm")} <span>Cash Keras: DP ${LJ.paymentConfig().cashKeras.dpPercent}%</span></div>
            <div>${I("check", "sm")} <span>Cash Lunak: s.d. ${LJ.paymentConfig().cashLunak.maxTenorMonths} bulan</span></div>
            <div>${I("check", "sm")} <span>KPR: estimasi bukan persetujuan bank</span></div>
          </div>

          <div class="divider"></div>

          <div class="sales-action-stack">
            ${
              u.sale === "Tersedia"
                ? `
                  ${role === "client" ? B("Ajukan Pemesanan Unit", "book", u.id, "primary full", "home") : ""}
                  ${A("Buka Simulasi Lengkap", "simulasi?unit=" + encodeURIComponent(u.id), role === "client" ? "secondary full u-mt-10" : "primary full", "calculator")}
                  ${B("Konsultasi Unit Ini", "consult", u.project + ":" + u.id, "secondary full u-mt-10", "message")}
                  <a href="${LJ.whatsappLink(waBase)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full u-mt-10">
                    ${I("whatsapp")} Chat via WhatsApp
                  </a>
                `
                : `<div class="u-mb-10">${LJ.badge(u.sale)}</div>
                  <p class="u-text-11 muted u-mb-10">Unit ini berstatus ${u.sale.toLowerCase()}. Anda tetap dapat menyimulasikan unit atau berkonsultasi unit lainnya.</p>
                  ${A("Simulasi Unit Ini", "simulasi?unit=" + encodeURIComponent(u.id), "primary full", "calculator")}
                  ${B("Konsultasi Unit Serupa", "consult", u.project + ":" + u.id, "secondary full u-mt-10", "message")}`
            }
          </div>

          <p class="legal-note u-mt-18">
            Harga akhir, diskon promo, dan syarat kredit KPR dikonfirmasi secara tertulis sebelum pemesanan disahkan.
          </p>
        </aside>
      </div>
    `;
  };
})();
