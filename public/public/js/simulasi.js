(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;

  const state = {
    unitId: "",
    method: "KPR",
    promoId: "",
    dpPercent: null,
    tenorMonths: null,
    tenorYears: null,
    interestRate: null,
  };

  function enabledMethods() {
    const cfg = LJ.paymentConfig();
    const list = [];
    if (cfg.cashKeras.enabled) list.push("Cash Keras");
    if (cfg.cashLunak.enabled) list.push("Cash Lunak");
    if (cfg.kpr.enabled) list.push("KPR");
    return list;
  }

  function initFromParams(routeUnitId) {
    const params = new URLSearchParams(location.search);
    const units = LJ.db.units || [];
    const targetUnit =
      units.find((u) => u.id === (routeUnitId || params.get("unit"))) ||
      units.find((u) => u.sale === "Tersedia") ||
      units[0];

    state.unitId = targetUnit?.id || "";

    const allowed = enabledMethods();
    const reqMethod = params.get("method") ? LJ.normalizeMethod(params.get("method")) : "KPR";
    state.method = allowed.includes(reqMethod) ? reqMethod : allowed[0] || "KPR";

    const cfg = LJ.paymentConfig();
    resetMethodParams(state.method, cfg);

    const reqPromo = params.get("promo") || "";
    if (reqPromo && targetUnit && LJ.promosForUnit(targetUnit, state.method).some((p) => p.id === reqPromo)) {
      state.promoId = reqPromo;
    } else {
      state.promoId = "";
    }
  }

  function resetMethodParams(method, cfg = LJ.paymentConfig()) {
    if (method === "Cash Keras") {
      state.dpPercent = Number(cfg.cashKeras.dpPercent);
      state.tenorMonths = null;
      state.tenorYears = null;
      state.interestRate = null;
    } else if (method === "Cash Lunak") {
      state.dpPercent = Number(cfg.cashLunak.dpPercent);
      state.tenorMonths = Number(cfg.cashLunak.tenorMonths);
      state.tenorYears = null;
      state.interestRate = Number(cfg.cashLunak.interestPercent || 0);
    } else {
      state.dpPercent = Number(cfg.kpr.dpPercent);
      state.tenorMonths = null;
      state.tenorYears = Number(cfg.kpr.defaultTenorYears);
      state.interestRate = Number(cfg.kpr.interestRate);
    }
  }

  function unitSpecHtml(unit) {
    if (!unit) return "";
    const p = LJ.project(unit.project);
    return `
      <div class="sim-unit-summary">
        <div>
          <span class="tag blue">${E(p?.name || "Kawasan Makassar")}</span>
          <span class="u-ml-6">${LJ.badge(unit.sale)}</span>
          <h4 class="u-mt-8">Rumah ${E(unit.block + "-" + unit.number)} · Tipe ${E(unit.type)}</h4>
          <p class="muted u-text-11">${I("pin", "sm")} ${E(p?.location || "Kota Makassar, Sulawesi Selatan")} · LT ${unit.land} m² / LB ${unit.building} m²</p>
        </div>
        <div class="sim-unit-price-box">
          <small>Harga Katalog</small>
          <strong>${LJ.money(unit.price)}</strong>
        </div>
      </div>
    `;
  }

  function controlsHtml(unit) {
    const cfg = LJ.paymentConfig();
    if (state.method === "Cash Keras") {
      return `
        <div class="form-grid">
          <div class="field">
            <label for="sim-dp">DP / Tanda Jadi (%)</label>
            <input id="sim-dp" class="form-control" type="number" min="0" max="100" step="1" value="${state.dpPercent}">
            <small>Standar developer: ${cfg.cashKeras.dpPercent}%</small>
          </div>
          <div class="field">
            <label>Batas Waktu Pelunasan</label>
            <input class="form-control" type="text" readonly value="${cfg.cashKeras.settlementDays} hari setelah DP terverifikasi">
            <small>Dikonfigurasi Admin pada aturan Cash Keras</small>
          </div>
        </div>
      `;
    }

    if (state.method === "Cash Lunak") {
      const mCfg = cfg.cashLunak;
      return `
        <div class="form-grid">
          <div class="field">
            <label for="sim-dp">Uang Muka / DP (%)</label>
            <input id="sim-dp" class="form-control" type="number" min="5" max="90" step="1" value="${state.dpPercent}">
            <small>Minimal 5% – Maksimal 90%</small>
          </div>
          <div class="field">
            <label for="sim-tenor-months">Tenor Angsuran (Bulan)</label>
            <input id="sim-tenor-months" class="form-control" type="number" min="1" max="${mCfg.maxTenorMonths}" step="1" value="${state.tenorMonths}">
            <small>Maksimal ${mCfg.maxTenorMonths} bulan · Jatuh tempo tiap tanggal ${mCfg.dueDay}</small>
          </div>
          <div class="field">
            <label for="sim-lunak-rate">Bunga / Margin Developer (% / th)</label>
            <input id="sim-lunak-rate" class="form-control" type="number" min="0" max="30" step="0.1" value="${state.interestRate}">
            <small>Konfigurasi developer saat ini: ${mCfg.interestPercent}% per tahun</small>
          </div>
        </div>
      `;
    }

    const kCfg = cfg.kpr;
    return `
      <div class="form-grid">
        <div class="field">
          <label for="sim-dp">Uang Muka / DP (%)</label>
          <input id="sim-dp" class="form-control" type="number" min="5" max="80" step="1" value="${state.dpPercent}">
          <small>Minimal 5% (standar konfigurasi ${kCfg.dpPercent}%)</small>
        </div>
        <div class="field">
          <label for="sim-tenor-years">Tenor KPR (Tahun)</label>
          <input id="sim-tenor-years" class="form-control" type="number" min="${kCfg.minTenorYears}" max="${kCfg.maxTenorYears}" step="1" value="${state.tenorYears}">
          <small>Rentang tersedia: ${kCfg.minTenorYears} – ${kCfg.maxTenorYears} tahun</small>
        </div>
        <div class="field">
          <label for="sim-interest">Estimasi Suku Bunga (% / tahun)</label>
          <input id="sim-interest" class="form-control" type="number" min="0" max="25" step="0.1" value="${state.interestRate}">
          <small>Asumsi default ${kCfg.interestRate}% efektif p.a.</small>
        </div>
      </div>
    `;
  }

  function renderPromoSelect(unit) {
    const sel = document.getElementById("sim-promo");
    if (!sel || !unit) return;
    const eligible = LJ.promosForUnit(unit, state.method);
    if (!eligible.some((p) => p.id === state.promoId)) {
      state.promoId = "";
    }
    sel.innerHTML =
      `<option value="">${eligible.length ? "Tidak menggunakan promo (Harga Normal)" : "Tidak ada promo aktif untuk unit & metode ini"}</option>` +
      eligible
        .map((p) => {
          const disc = LJ.promoDiscount(unit.price, p);
          const lbl = p.discountType === "Nominal" ? LJ.money(p.discountValue, true) : `${p.discountValue}%`;
          return `<option value="${E(p.id)}" ${state.promoId === p.id ? "selected" : ""}>${E(p.name)} — Hemat ${LJ.money(disc)} (${lbl})</option>`;
        })
        .join("");
  }

  function resultsHtml(unit, sim) {
    const p = LJ.project(unit.project);
    const waMessage =
      `Halo Tim LinyJaya Property Makassar, saya baru melakukan simulasi ${sim.method} untuk Rumah ${unit.block}-${unit.number} (${p?.name || ""}). ` +
      `Harga bersih ${LJ.money(sim.finalPrice)}, DP ${sim.dpPercent}% (${LJ.money(sim.dpAmount)})` +
      (sim.method === "Cash Lunak" ? `, tenor ${sim.tenorMonths} bulan (±${LJ.money(sim.monthlyInstallment)}/bln)` : "") +
      (sim.method === "KPR" ? `, plafon ${LJ.money(sim.plafon)}, tenor ${sim.tenorYears} tahun (±${LJ.money(sim.monthlyInstallment)}/bln)` : "") +
      ". Mohon informasi lebih lanjut.";

    const rows = [
      ["Harga Katalog Unit", LJ.money(sim.originalPrice)],
      ...(sim.discountAmount > 0
        ? [
            [`Potongan Promo (${E(sim.promo?.name || "")})`, `<strong class="green">- ${LJ.money(sim.discountAmount)}</strong>`],
            ["Harga Bersih Setelah Promo", `<strong class="blue">${LJ.money(sim.finalPrice)}</strong>`],
          ]
        : []),
      [`Uang Muka / DP (${sim.dpPercent}%)`, `<strong>${LJ.money(sim.dpAmount)}</strong>`],
    ];

    let highlightTitle = "Total Pembayaran Cash Keras";
    let highlightValue = LJ.money(sim.totalPayment);
    let highlightSub = `Pelunasan sisa ${LJ.money(sim.settlementAmount)} maksimal ${sim.settlementDays} hari setelah verifikasi DP`;

    if (sim.method === "Cash Keras") {
      rows.push([`Sisa Pelunasan (Batas ${sim.settlementDays} Hari)`, LJ.money(sim.settlementAmount)]);
      rows.push(["Total Kewajiban Pembelian", `<strong>${LJ.money(sim.totalPayment)}</strong>`]);
    } else if (sim.method === "Cash Lunak") {
      rows.push(["Sisa Pokok Dicicil ke Developer", LJ.money(sim.principal)]);
      if (sim.totalInterest > 0) {
        rows.push([`Total Margin/Bunga Flat (${sim.interestPercent}% p.a.)`, LJ.money(sim.totalInterest)]);
      }
      rows.push([`Estimasi Angsuran (${sim.tenorMonths}x, Tgl ${sim.dueDay})`, `<strong class="blue">${LJ.money(sim.monthlyInstallment)} / bulan</strong>`]);
      rows.push(["Total Pembayaran Bertahap", `<strong>${LJ.money(sim.totalPayment)}</strong>`]);
      highlightTitle = `Angsuran Cash Lunak (${sim.tenorMonths} Bulan)`;
      highlightValue = `${LJ.money(sim.monthlyInstallment)} <small>/ bulan</small>`;
      highlightSub = `Jatuh tempo setiap tanggal ${sim.dueDay} · ${sim.interestPercent > 0 ? `Bunga flat ${sim.interestPercent}%` : "Tanpa bunga bank (0%)"}`;
    } else {
      rows.push(["Plafon Pembiayaan KPR (Pokok)", LJ.money(sim.plafon)]);
      rows.push([`Tenor & Suku Bunga Asumsi`, `${sim.tenorYears} Tahun (${sim.tenorMonths} bln) · ${sim.interestRate}% / th`]);
      rows.push(["Estimasi Cicilan Bulanan KPR", `<strong class="blue">${LJ.money(sim.monthlyInstallment)} / bulan</strong>`]);
      rows.push(["Estimasi Total Bunga KPR", LJ.money(sim.totalInterest)]);
      rows.push(["Estimasi Total Pembayaran (DP + Cicilan)", `<strong>${LJ.money(sim.totalPayment)}</strong>`]);
      highlightTitle = `Estimasi Cicilan KPR (${sim.tenorYears} Tahun)`;
      highlightValue = `${LJ.money(sim.monthlyInstallment)} <small>/ bulan</small>`;
      highlightSub = `Plafon ${LJ.money(sim.plafon)} · Estimasi anuitas ${sim.interestRate}% p.a.`;
    }

    const scheduleSection =
      sim.method === "Cash Lunak" && sim.schedule?.length
        ? `<div class="sim-schedule u-mt-20">
            <h4>Pratinjau Jadwal Jatuh Tempo Cash Lunak (${sim.schedule.length} Bulan)</h4>
            <div class="sim-schedule-scroll">
              ${LJ.table(
                ["Angsuran", "Jatuh Tempo", "Nominal"],
                sim.schedule.map((item) => [E(item.kind), LJ.date(item.due), LJ.money(item.amount)]),
              )}
            </div>
          </div>`
        : "";

    const disclaimerBanner =
      sim.method === "KPR"
        ? `<div class="notice sim-disclaimer u-mt-18">${I("info")}<div><strong>Catatan Penting Estimasi KPR</strong><p>${E(sim.disclaimer)}</p></div></div>`
        : `<div class="notice u-mt-18">${I("info")}<span>Hasil perhitungan merupakan simulasi berbasis konfigurasi sistem LinyJaya Property Makassar. Rincian final mengacu pada dokumen pemesanan resmi.</span></div>`;

    const actionCta =
      unit.sale === "Tersedia"
        ? `${
            LJ.user?.role === "client"
              ? B("Ajukan Pemesanan Sekarang", "book-from-sim", unit.id, "primary full", "home")
              : `${B("Konsultasi Hasil Simulasi", "consult-from-sim", unit.id, "primary full", "message")}${
                  !LJ.user
                    ? A("Masuk sebagai Klien untuk Memesan", LJ.endpoints.login, "secondary full u-mt-10", "arrow")
                    : ""
                }`
          }`
        : `${B("Konsultasi Unit Sejenis", "consult-from-sim", unit.id, "primary full", "message")}`;

    return `
      <div class="sim-highlight-card">
        <span class="eyebrow">${E(sim.method)}</span>
        <p class="u-mt-8">${highlightTitle}</p>
        <div class="sim-highlight-amount">${highlightValue}</div>
        <small>${highlightSub}</small>
      </div>

      <div class="u-mt-18">
        ${LJ.table(["Komponen Perhitungan", "Rincian Rupiah"], rows)}
      </div>

      ${scheduleSection}

      <div class="sim-assumptions u-mt-20">
        <h4>Asumsi & Rumus Perhitungan</h4>
        <ul>
          ${sim.assumptions.map((text) => `<li>${E(text)}</li>`).join("")}
        </ul>
      </div>

      ${disclaimerBanner}

      <div class="sim-cta-stack u-mt-20">
        ${actionCta}
        <a href="${LJ.whatsappLink(waMessage)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full u-mt-10">
          ${I("whatsapp")} Kirim Hasil Simulasi via WhatsApp
        </a>
        ${A("Lihat Detail Unit", LJ.propertyPage("units", unit.id), "ghost full u-mt-10", "eye")}
      </div>
    `;
  }

  LJ.refreshSimulasi = (rebuildControls = false) => {
    const unit = LJ.unit(state.unitId);
    if (!unit) return;
    const summaryEl = document.getElementById("sim-unit-summary");
    if (summaryEl) summaryEl.innerHTML = unitSpecHtml(unit);

    document.querySelectorAll("[data-sim-method]").forEach((btn) => {
      const active = btn.dataset.simMethod === state.method;
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", String(active));
    });

    if (rebuildControls) {
      const ctrlEl = document.getElementById("sim-method-controls");
      if (ctrlEl) ctrlEl.innerHTML = controlsHtml(unit);
    }

    renderPromoSelect(unit);

    const sim = LJ.simulatePayment({
      unit,
      method: state.method,
      promoId: state.promoId,
      dpPercent: state.dpPercent,
      tenorMonths: state.tenorMonths,
      tenorYears: state.tenorYears,
      interestRate: state.interestRate,
    });

    LJ.currentSimulation = { unit, sim };

    const resultsEl = document.getElementById("sim-results-panel");
    if (resultsEl) resultsEl.innerHTML = resultsHtml(unit, sim);
  };

  LJ.setSimMethod = (method) => {
    const allowed = enabledMethods();
    if (!allowed.includes(method)) return;
    state.method = method;
    resetMethodParams(method);
    LJ.refreshSimulasi(true);
  };

  LJ.onSimInput = (el) => {
    if (el.id === "sim-unit") {
      state.unitId = el.value;
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-promo") {
      state.promoId = el.value;
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-dp") {
      state.dpPercent = Number(el.value || 0);
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-tenor-months") {
      state.tenorMonths = Number(el.value || 1);
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-tenor-years") {
      state.tenorYears = Number(el.value || 1);
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-interest" || el.id === "sim-lunak-rate") {
      state.interestRate = Number(el.value || 0);
      LJ.refreshSimulasi(false);
    }
  };

  LJ.pages.public.simulasi = function (routeUnitId) {
    initFromParams(routeUnitId);
    const units = LJ.db.units || [];
    const cfg = LJ.paymentConfig();
    const methods = [
      ["Cash Keras", "Tunai / Pelunasan Cepat", cfg.cashKeras.enabled],
      ["Cash Lunak", "Cicilan Langsung Developer", cfg.cashLunak.enabled],
      ["KPR", "Pembiayaan KPR Bank (Estimasi)", cfg.kpr.enabled],
    ];

    const selectedUnit = LJ.unit(state.unitId);
    const initialSim = selectedUnit
      ? LJ.simulatePayment({
          unit: selectedUnit,
          method: state.method,
          promoId: state.promoId,
          dpPercent: state.dpPercent,
          tenorMonths: state.tenorMonths,
          tenorYears: state.tenorYears,
          interestRate: state.interestRate,
        })
      : null;

    if (selectedUnit && initialSim) {
      LJ.currentSimulation = { unit: selectedUnit, sim: initialSim };
    }

    const eligiblePromos = selectedUnit ? LJ.promosForUnit(selectedUnit, state.method) : [];

    return `
      ${LJ.pageHero(
        "Simulasi Pembayaran Properti",
        "Hitung Skema Cash Keras, Cash Lunak & Estimasi KPR.",
        "Pilih unit rumah LinyJaya Property di Kota Makassar untuk menyimulasikan uang muka, tenor cicilan, promo aktif, dan estimasi angsuran dalam Rupiah.",
      )}
      <div class="container page-body" id="sim-workspace">
        ${
          !units.length
            ? LJ.empty("Belum ada data unit", "Silakan tambahkan unit terlebih dahulu dari dashboard Admin.")
            : `<div class="sim-layout">
                <section class="panel sim-controls-card">
                  <div class="panel-head">
                    <div>
                      <span class="eyebrow">${I("calculator")}PARAMETER SIMULASI</span>
                      <h3 class="u-mt-4">1. Pilih Unit & Metode Pembayaran</h3>
                    </div>
                  </div>

                  <div class="field">
                    <label for="sim-unit">Unit Rumah (${units.length} unit tersedia di database)</label>
                    <select id="sim-unit" class="form-control">
                      ${units
                        .map((u) => {
                          const pr = LJ.project(u.project);
                          return `<option value="${E(u.id)}" ${u.id === state.unitId ? "selected" : ""}>${E(pr?.name || "")} · Blok ${E(u.block + "-" + u.number)} (${E(u.type)}) — ${LJ.money(u.price)} [${E(u.sale)}]</option>`;
                        })
                        .join("")}
                    </select>
                  </div>

                  <div id="sim-unit-summary" class="u-mt-16">${unitSpecHtml(selectedUnit)}</div>

                  <div class="u-mt-20">
                    <span class="field-section-label">2. Metode Pembayaran</span>
                    <div class="sim-method-tabs" role="tablist" aria-label="Pilih metode pembayaran">
                      ${methods
                        .map(
                          ([key, subtitle, enabled]) =>
                            `<button type="button" class="sim-method-btn ${state.method === key ? "active" : ""}" data-sim-method="${key}" role="tab" aria-selected="${state.method === key}" ${enabled ? "" : "disabled"}>
                              <strong>${key}</strong>
                              <small>${enabled ? subtitle : "Dinonaktifkan Admin"}</small>
                            </button>`,
                        )
                        .join("")}
                    </div>
                  </div>

                  <div class="field u-mt-20">
                    <label for="sim-promo">3. Promo Aktif yang Berlaku</label>
                    <select id="sim-promo" class="form-control">
                      <option value="">${eligiblePromos.length ? "Tidak menggunakan promo (Harga Normal)" : "Tidak ada promo aktif untuk unit & metode ini"}</option>
                      ${eligiblePromos
                        .map((p) => {
                          const disc = LJ.promoDiscount(selectedUnit.price, p);
                          const lbl = p.discountType === "Nominal" ? LJ.money(p.discountValue, true) : `${p.discountValue}%`;
                          return `<option value="${E(p.id)}" ${state.promoId === p.id ? "selected" : ""}>${E(p.name)} — Hemat ${LJ.money(disc)} (${lbl})</option>`;
                        })
                        .join("")}
                    </select>
                    <small>Hanya promo berstatus Aktif dalam masa berlaku dan sesuai metode pembayaran yang ditampilkan.</small>
                  </div>

                  <div class="u-mt-20">
                    <span class="field-section-label">4. Rincian DP, Tenor & Suku Bunga</span>
                    <div id="sim-method-controls" class="u-mt-10">${controlsHtml(selectedUnit)}</div>
                  </div>
                </section>

                <aside class="panel sim-results-card" id="sim-results-panel">
                  ${selectedUnit && initialSim ? resultsHtml(selectedUnit, initialSim) : ""}
                </aside>
              </div>`
        }
      </div>
      ${LJ.cta()}
    `;
  };
})();
