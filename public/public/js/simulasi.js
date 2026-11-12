(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;

  const state = {
    unitId: "",
    method: "KPR",
    promoId: "",
    presetId: "",
    dpPercent: 20,
    tenorMonths: 12,
    tenorYears: 15,
    interestRate: 7.5,
  };

  function activeKprPresets() {
    return (LJ.paymentConfig().kpr.presets || []).filter((p) => p && p.active !== false);
  }

  function enabledMethods() {
    const cfg = LJ.paymentConfig();
    return [
      ["Cash Keras", cfg.cashKeras.enabled],
      ["Cash Lunak", cfg.cashLunak.enabled],
      ["KPR", cfg.kpr.enabled],
    ]
      .filter(([, enabled]) => enabled)
      .map(([name]) => name);
  }

  function resetMethodParams(method, preferredPresetId = "") {
    const cfg = LJ.paymentConfig();
    if (method === "Cash Keras") {
      state.presetId = "";
      state.dpPercent = cfg.cashKeras.dpPercent;
      state.interestRate = 0;
    } else if (method === "Cash Lunak") {
      state.presetId = "";
      state.dpPercent = cfg.cashLunak.dpPercent;
      state.tenorMonths = cfg.cashLunak.tenorMonths;
      state.interestRate = cfg.cashLunak.interestPercent;
    } else {
      const presets = activeKprPresets();
      const matched =
        (preferredPresetId && presets.find((p) => p.id === preferredPresetId)) ||
        presets[0] ||
        null;
      if (matched) {
        state.presetId = matched.id;
        state.dpPercent = Number(matched.dpPercent);
        state.tenorYears = Number(matched.tenorYears);
        state.interestRate = Number(matched.interestRate);
      } else {
        state.presetId = "";
        state.dpPercent = cfg.kpr.dpPercent;
        state.tenorYears = cfg.kpr.defaultTenorYears;
        state.interestRate = cfg.kpr.interestRate;
      }
    }
  }

  function initFromParams(routeUnitId) {
    const params = new URLSearchParams(location.search);
    const units = LJ.db.units || [];
    const reqUnit = routeUnitId || params.get("unit") || "";
    const foundUnit = LJ.unit(reqUnit) || units.find((u) => u.sale === "Tersedia") || units[0];
    state.unitId = foundUnit?.id || "";

    const allowed = enabledMethods();
    const rawMethod = params.get("method");
    const reqMethod = rawMethod ? LJ.normalizeMethod(rawMethod) : null;
    state.method =
      reqMethod && allowed.includes(reqMethod)
        ? reqMethod
        : allowed.includes("KPR")
          ? "KPR"
          : allowed[0] || "Cash Keras";

    const reqPreset = params.get("preset") || "";
    resetMethodParams(state.method, reqPreset);

    const reqPromo = params.get("promo") || "";
    if (foundUnit) {
      const validPromo = LJ.promosForUnit(foundUnit, state.method).find((p) => p.id === reqPromo);
      state.promoId = validPromo ? validPromo.id : "";
    } else {
      state.promoId = "";
    }
  }

  function activePromoForState(unit) {
    if (!unit || !state.promoId) return null;
    return LJ.promosForUnit(unit, state.method).find((p) => p.id === state.promoId) || null;
  }

  function currentNetPrice(unit) {
    if (!unit) return 0;
    const promo = activePromoForState(unit);
    return Math.max(0, unit.price - (promo ? LJ.promoDiscount(unit.price, promo) : 0));
  }

  function unitSpecHtml(unit) {
    if (!unit) return "";
    const project = LJ.project(unit.project);
    const promo = activePromoForState(unit);
    const discount = promo ? LJ.promoDiscount(unit.price, promo) : 0;
    const netPrice = Math.max(0, unit.price - discount);
    return `
      <div class="sim-unit-summary">
        <div class="flex between wrap gap-12">
          <div>
            <strong>${E(project?.name || "LinyJaya Property")} · Blok ${E(unit.block + "-" + unit.number)}</strong>
            <p class="muted u-text-11">Tipe ${E(unit.type)} · LT ${unit.land} m² / LB ${unit.building} m² · ${E(project?.city || "Makassar")}</p>
          </div>
          ${LJ.badge(unit.sale)}
        </div>
        <div class="sim-unit-price-box">
          <div>
            <small>Harga Katalog</small>
            <strong>${LJ.money(unit.price)}</strong>
          </div>
          <div>
            <small>${discount > 0 ? "Harga Setelah Promo" : "Dasar Hitungan"}</small>
            <strong class="blue">${LJ.money(netPrice)}</strong>
          </div>
        </div>
      </div>
    `;
  }

  function presetPartner(preset) {
    if (!preset?.partnerId) return null;
    return (LJ.db?.partners || []).find((p) => p.id === preset.partnerId && (p.status || "Aktif") === "Aktif") || null;
  }

  function kprControlsHtml(unit) {
    const cfg = LJ.paymentConfig();
    const minY = Math.max(1, Number(cfg.kpr.minTenorYears || 5));
    const maxY = Math.max(minY, Number(cfg.kpr.maxTenorYears || 25));
    const presets = activeKprPresets();
    const netPrice = currentNetPrice(unit);
    const dpRp = Math.round(netPrice * (Number(state.dpPercent) / 100));
    const tenorChips = [5, 10, 15, 20, 25, 30].filter((y) => y >= minY && y <= maxY);

    return `
      ${
        presets.length
          ? `<div class="sim-preset-section">
              <div class="sim-label-row">
                <span class="field-section-label">Program & Bank KPR</span>
                <small class="muted">Klik untuk terapkan parameter</small>
              </div>
              <div class="sim-preset-grid">
                ${presets
                  .map((p) => {
                    const partner = presetPartner(p);
                    const logo = partner ? LJ.partnerLogo(partner) : "";
                    const active = state.presetId === p.id;
                    return `
                      <button type="button" class="sim-preset-card ${active ? "active" : ""}" data-sim-preset="${E(p.id)}">
                        <div class="sim-preset-top">
                          ${logo ? `<img class="sim-preset-logo" src="${E(logo)}" alt="${E(p.bankName || p.name)}">` : `<span class="sim-preset-bank-dot">${E(p.bankName || "KPR")}</span>`}
                          ${p.badge ? `<span class="tag blue">${E(p.badge)}</span>` : ""}
                        </div>
                        <strong>${E(p.name)}</strong>
                        <small>DP ${Number(p.dpPercent)}% · ${Number(p.tenorYears)} Thn · Bunga ${Number(p.interestRate)}%</small>
                      </button>
                    `;
                  })
                  .join("")}
              </div>
            </div>`
          : ""
      }

      <div class="sim-slider-stack">
        <div class="sim-slider-field">
          <div class="sim-slider-head">
            <label for="sim-dp">Uang Muka (DP)</label>
            <span class="sim-slider-val"><strong id="sim-dp-rp">${LJ.money(dpRp, true)}</strong> · <input id="sim-dp" type="number" class="sim-mini-num" min="5" max="80" step="1" value="${state.dpPercent}" aria-label="Persentase DP KPR"><span>%</span></span>
          </div>
          <input id="sim-dp-range" type="range" class="sim-range" min="5" max="80" step="1" value="${state.dpPercent}" aria-label="Slider persentase DP KPR">
          <div class="sim-range-bounds"><span>5%</span><span>20% standar</span><span>80%</span></div>
        </div>

        <div class="sim-slider-field">
          <div class="sim-slider-head">
            <label for="sim-tenor-years">Jangka Waktu (Tenor)</label>
            <span class="sim-slider-val"><input id="sim-tenor-years" type="number" class="sim-mini-num" min="${minY}" max="${maxY}" step="1" value="${state.tenorYears}" aria-label="Tenor KPR dalam tahun"><span>Tahun</span></span>
          </div>
          <input id="sim-tenor-range" type="range" class="sim-range" min="${minY}" max="${maxY}" step="1" value="${state.tenorYears}" aria-label="Slider tenor KPR">
          ${
            tenorChips.length
              ? `<div class="sim-tenor-chips">${tenorChips
                  .map(
                    (y) =>
                      `<button type="button" class="sim-chip ${Number(state.tenorYears) === y ? "active" : ""}" data-sim-tenor="${y}">${y} Th</button>`,
                  )
                  .join("")}</div>`
              : ""
          }
        </div>

        <div class="sim-slider-field">
          <div class="sim-slider-head">
            <label for="sim-interest">Asumsi Suku Bunga Efektif</label>
            <span class="sim-slider-val"><input id="sim-interest" type="number" class="sim-mini-num" min="0" max="25" step="0.05" value="${state.interestRate}" aria-label="Asumsi bunga KPR"><span>% / thn</span></span>
          </div>
          <input id="sim-interest-range" type="range" class="sim-range" min="0" max="18" step="0.25" value="${Math.min(18, Number(state.interestRate))}" aria-label="Slider bunga KPR">
          <div class="sim-range-bounds"><span>0%</span><span>4.75% promo</span><span>18%</span></div>
        </div>
      </div>
    `;
  }

  function controlsHtml(unit) {
    const cfg = LJ.paymentConfig();
    if (state.method === "Cash Keras") {
      return `
        <div class="sim-slider-stack">
          <div class="sim-slider-field">
            <div class="sim-slider-head">
              <label for="sim-dp">DP / Tanda Jadi Cash Keras</label>
              <span class="sim-slider-val"><input id="sim-dp" type="number" class="sim-mini-num" min="0" max="100" step="1" value="${state.dpPercent}"><span>%</span></span>
            </div>
            <input id="sim-dp-range" type="range" class="sim-range" min="0" max="100" step="5" value="${state.dpPercent}" aria-label="Slider DP Cash Keras">
          </div>
        </div>
        <div class="notice u-mt-12">${I("clock")}<span>Pelunasan akhir diselesaikan maksimal <strong>${cfg.cashKeras.settlementDays} hari</strong> setelah verifikasi DP.</span></div>
      `;
    }

    if (state.method === "Cash Lunak") {
      const maxM = Math.max(1, Number(cfg.cashLunak.maxTenorMonths || 36));
      return `
        <div class="sim-slider-stack">
          <div class="sim-slider-field">
            <div class="sim-slider-head">
              <label for="sim-dp">Uang Muka (DP) Minimal</label>
              <span class="sim-slider-val"><input id="sim-dp" type="number" class="sim-mini-num" min="5" max="90" step="1" value="${state.dpPercent}"><span>%</span></span>
            </div>
            <input id="sim-dp-range" type="range" class="sim-range" min="5" max="90" step="5" value="${state.dpPercent}" aria-label="Slider DP Cash Lunak">
          </div>
          <div class="sim-slider-field">
            <div class="sim-slider-head">
              <label for="sim-tenor-months">Tenor Cicilan Developer</label>
              <span class="sim-slider-val"><input id="sim-tenor-months" type="number" class="sim-mini-num" min="1" max="${maxM}" step="1" value="${state.tenorMonths}"><span>Bulan</span></span>
            </div>
            <input id="sim-tenor-months-range" type="range" class="sim-range" min="1" max="${maxM}" step="1" value="${state.tenorMonths}" aria-label="Slider tenor Cash Lunak">
          </div>
        </div>
        <div class="notice u-mt-12">${I("calendar")}<span>Jatuh tempo tanggal <strong>${cfg.cashLunak.dueDay}</strong> tiap bulan · Margin developer <strong>${cfg.cashLunak.interestPercent}%/tahun</strong>.</span></div>
      `;
    }

    return kprControlsHtml(unit);
  }

  function renderPromoSelect(unit) {
    const select = document.getElementById("sim-promo");
    if (!select || !unit) return;
    const promos = LJ.promosForUnit(unit, state.method);
    if (!promos.some((p) => p.id === state.promoId)) {
      state.promoId = "";
    }
    select.innerHTML =
      `<option value="">${promos.length ? "Tanpa promo (Harga Normal)" : "Belum ada promo aktif untuk metode ini"}</option>` +
      promos
        .map((p) => {
          const disc = LJ.promoDiscount(unit.price, p);
          const lbl = p.discountType === "Nominal" ? LJ.money(p.discountValue, true) : `${p.discountValue}%`;
          return `<option value="${E(p.id)}" ${p.id === state.promoId ? "selected" : ""}>${E(p.name)} — Hemat ${LJ.money(disc)} (${lbl})</option>`;
        })
        .join("");
  }

  function syncSliderActiveStates() {
    document.querySelectorAll("[data-sim-preset]").forEach((btn) => {
      btn.classList.toggle("active", btn.dataset.simPreset === state.presetId);
    });
    document.querySelectorAll("[data-sim-tenor]").forEach((btn) => {
      btn.classList.toggle("active", Number(btn.dataset.simTenor) === Number(state.tenorYears));
    });
  }

  function syncInputPair(id, value) {
    const el = document.getElementById(id);
    if (el && Number(el.value) !== Number(value)) el.value = value;
  }

  function kprResultsHtml(unit, sim) {
    const project = LJ.project(unit.project);
    const totalPay = Math.max(1, sim.totalPayment);
    const dpPctShare = Math.round((sim.dpAmount / totalPay) * 100);
    const principalPctShare = Math.round((sim.plafon / totalPay) * 100);
    const interestPctShare = Math.max(0, 100 - dpPctShare - principalPctShare);
    const bankPartners = LJ.kprPartners();
    const activePreset = activeKprPresets().find((p) => p.id === state.presetId);
    const subtitleLabel = activePreset
      ? `${activePreset.name} · Bunga ${sim.interestRate}%/thn`
      : `Estimasi Anuitas ${sim.tenorYears} Tahun · Bunga ${sim.interestRate}%/thn`;

    const waText = `Halo Admin LinyJaya Property, saya ingin berkonsultasi mengenai simulasi KPR untuk unit ${project?.name || ""} Blok ${unit.block}-${unit.number} (estimasi DP ${LJ.money(sim.dpAmount)}, cicilan ~${LJ.money(sim.monthlyInstallment)}/bln tenor ${sim.tenorYears} thn).`;

    const ctaButtons =
      unit.sale === "Tersedia"
        ? LJ.user?.role === "client"
          ? B("Ajukan Pemesanan Unit", "book-from-sim", unit.id, "primary full", "home")
          : `${B("Konsultasi KPR Unit Ini", "consult-from-sim", unit.id, "primary full", "message")}
             ${!LJ.user ? A("Masuk Klien untuk Memesan", LJ.endpoints.login, "secondary full", "arrow") : ""}`
        : B("Konsultasi Unit Sejenis", "consult-from-sim", unit.id, "primary full", "message");

    return `
      <div class="sim-hero-kpr">
        <div class="sim-hero-top">
          <span class="eyebrow">${I("calculator")} ${E(activePreset?.bankName || "ESTIMASI KPR")}</span>
          <span class="badge blue">${sim.tenorYears} Thn (${sim.tenorMonths} Bln)</span>
        </div>
        <p class="sim-hero-caption">Estimasi Cicilan per Bulan</p>
        <div class="sim-highlight-amount">${LJ.money(sim.monthlyInstallment)}<span> / bln</span></div>
        <p class="sim-hero-sub">${E(subtitleLabel)}</p>
        <div class="sim-hero-kpis">
          <div><small>Uang Muka (${sim.dpPercent}%)</small><strong>${LJ.money(sim.dpAmount, true)}</strong></div>
          <div><small>Plafon Kredit</small><strong>${LJ.money(sim.plafon, true)}</strong></div>
          <div><small>Harga Bersih</small><strong>${LJ.money(sim.finalPrice, true)}</strong></div>
        </div>
      </div>

      <div class="sim-breakdown-bar-box u-mt-18">
        <div class="sim-label-row">
          <strong class="u-text-12">Komposisi Estimasi Total Pembiayaan</strong>
          <strong class="blue u-text-12">${LJ.money(sim.totalPayment)}</strong>
        </div>
        <div class="sim-stack-bar" role="img" aria-label="Proporsi DP, Pokok Pinjaman, dan Total Bunga KPR">
          <span class="seg-dp" style="width:${dpPctShare}%"></span>
          <span class="seg-plafon" style="width:${principalPctShare}%"></span>
          <span class="seg-interest" style="width:${interestPctShare}%"></span>
        </div>
        <div class="sim-bar-legend">
          <span><i class="dot-dp"></i>DP ${LJ.money(sim.dpAmount, true)}</span>
          <span><i class="dot-plafon"></i>Pokok ${LJ.money(sim.plafon, true)}</span>
          <span><i class="dot-interest"></i>Est. Bunga ${LJ.money(sim.totalInterest, true)}</span>
        </div>
      </div>

      <div class="sim-summary-cards u-mt-16">
        <div class="sim-stat-tile"><small>Harga Katalog</small><strong>${LJ.money(sim.originalPrice)}</strong></div>
        <div class="sim-stat-tile"><small>Potongan Promo</small><strong class="${sim.discountAmount > 0 ? "green" : ""}">${sim.discountAmount > 0 ? "-" + LJ.money(sim.discountAmount) : "Rp 0"}</strong></div>
        <div class="sim-stat-tile"><small>Plafon Pembiayaan Bank</small><strong>${LJ.money(sim.plafon)}</strong></div>
        <div class="sim-stat-tile"><small>Total Angsuran (${sim.tenorMonths}x)</small><strong>${LJ.money(sim.totalInstallments)}</strong></div>
      </div>

      ${
        bankPartners.length
          ? `<div class="sim-bank-coop u-mt-16">
              <div class="sim-label-row">
                <span class="eyebrow">${I("building", "sm")} KERJA SAMA BANK KPR</span>
                <a href="mitra" class="text-link">Lihat mitra ${I("arrow", "sm")}</a>
              </div>
              <div class="sim-bank-list">
                ${bankPartners
                  .map((bp) => {
                    const logoUrl = LJ.partnerLogo(bp);
                    return `<div class="sim-bank-item">
                      ${logoUrl ? `<img src="${E(logoUrl)}" alt="${E(bp.name)}">` : `<span class="sim-preset-bank-dot">${E(bp.name)}</span>`}
                      <div>
                        <strong>${E(bp.name)}</strong>
                        <small>${E(bp.cooperationType || "Bank Rekanan KPR")}${bp.kprRate !== null && bp.kprRate !== undefined ? ` · Acuan ${Number(bp.kprRate)}%` : ""}${bp.kprTenorMax ? ` · s.d. ${bp.kprTenorMax} Th` : ""}</small>
                      </div>
                      <span class="status active">${E(bp.status || "Aktif")}</span>
                    </div>`;
                  })
                  .join("")}
              </div>
            </div>`
          : ""
      }

      <details class="sim-details-box u-mt-14">
        <summary>Lihat Rumus & Asumsi Perhitungan KPR</summary>
        <ul>
          ${sim.assumptions.map((text) => `<li>${E(text)}</li>`).join("")}
        </ul>
      </details>

      <div class="notice warning sim-disclaimer u-mt-14">
        ${I("info")}
        <div>
          <strong>Disclaimer Estimasi KPR</strong>
          <p>${E(sim.disclaimer)} Biaya akad, BPHTB, provisi, dan asuransi mengikuti ketentuan bank terkait.</p>
        </div>
      </div>

      <div class="sim-cta-stack u-mt-18">
        ${ctaButtons}
        <a href="${LJ.whatsappLink(waText)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full">
          ${I("whatsapp")} Konsultasi Simulasi via WhatsApp
        </a>
        ${A("Lihat Detail Lengkap Unit", LJ.propertyPage("units", unit.id), "ghost full", "eye")}
      </div>
    `;
  }

  function nonKprResultsHtml(unit, sim) {
    const project = LJ.project(unit.project);
    const isLunak = sim.method === "Cash Lunak";
    const highlightTitle = isLunak ? "Estimasi Angsuran per Bulan" : "Sisa Pelunasan Tunai";
    const highlightValue = isLunak ? LJ.money(sim.monthlyInstallment) : LJ.money(sim.settlementAmount);
    const highlightSub = isLunak
      ? `Tenor ${sim.tenorMonths} bulan · Jatuh tempo tgl ${sim.dueDay} tiap bulan`
      : `Setelah DP ${sim.dpPercent}% (${LJ.money(sim.dpAmount)}) · Tempo ${sim.settlementDays} hari`;

    const rows = [
      ["Harga Katalog", LJ.money(sim.originalPrice)],
      ["Potongan Promo", sim.discountAmount > 0 ? "-" + LJ.money(sim.discountAmount) : "Rp 0"],
      ["Harga Bersih Unit", `<strong>${LJ.money(sim.finalPrice)}</strong>`],
      [`Uang Muka / DP (${sim.dpPercent}%)`, LJ.money(sim.dpAmount)],
      isLunak
        ? ["Sisa Pokok Cicilan", LJ.money(sim.principal)]
        : ["Sisa Pelunasan", `<strong>${LJ.money(sim.settlementAmount)}</strong>`],
      ["Total Pembayaran", `<strong>${LJ.money(sim.totalPayment)}</strong>`],
    ];

    const scheduleSection =
      isLunak && sim.schedule?.length
        ? `<div class="u-mt-18">
            <h4 class="u-mb-10">Simulasi Jadwal Angsuran Bulanan (${sim.schedule.length} Termin)</h4>
            <div class="sim-schedule-scroll">
              ${LJ.table(
                ["Termin", "Jatuh Tempo", "Nominal"],
                sim.schedule.map((item) => [E(item.kind), LJ.date(item.due), LJ.money(item.amount)]),
              )}
            </div>
          </div>`
        : "";

    const waText = `Halo Admin LinyJaya Property, saya tertarik simulasi metode ${sim.method} untuk unit ${project?.name || ""} Blok ${unit.block}-${unit.number} (Harga bersih ${LJ.money(sim.finalPrice)}).`;
    const ctaButtons =
      unit.sale === "Tersedia"
        ? LJ.user?.role === "client"
          ? B("Ajukan Pemesanan Unit", "book-from-sim", unit.id, "primary full", "home")
          : `${B("Konsultasi Unit Ini", "consult-from-sim", unit.id, "primary full", "message")}
             ${!LJ.user ? A("Masuk Klien untuk Memesan", LJ.endpoints.login, "secondary full", "arrow") : ""}`
        : B("Konsultasi Unit Sejenis", "consult-from-sim", unit.id, "primary full", "message");

    return `
      <div class="sim-highlight-card">
        <span class="eyebrow">${E(sim.method)}</span>
        <p class="u-mt-8">${highlightTitle}</p>
        <div class="sim-highlight-amount">${highlightValue}</div>
        <small>${E(highlightSub)}</small>
      </div>

      <div class="u-mt-16">
        ${LJ.table(["Komponen", "Rincian Rupiah"], rows)}
      </div>

      ${scheduleSection}

      <details class="sim-details-box u-mt-14">
        <summary>Asumsi Perhitungan ${E(sim.method)}</summary>
        <ul>${sim.assumptions.map((text) => `<li>${E(text)}</li>`).join("")}</ul>
      </details>

      <div class="sim-cta-stack u-mt-18">
        ${ctaButtons}
        <a href="${LJ.whatsappLink(waText)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full">
          ${I("whatsapp")} Kirim Hasil Simulasi via WhatsApp
        </a>
        ${A("Lihat Detail Unit", LJ.propertyPage("units", unit.id), "ghost full", "eye")}
      </div>
    `;
  }

  function resultsHtml(unit, sim) {
    return sim.method === "KPR" ? kprResultsHtml(unit, sim) : nonKprResultsHtml(unit, sim);
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

    const dpRpEl = document.getElementById("sim-dp-rp");
    if (dpRpEl) dpRpEl.textContent = LJ.money(sim.dpAmount, true);
    syncSliderActiveStates();

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

  LJ.setSimPreset = (presetId) => {
    const preset = activeKprPresets().find((p) => p.id === presetId);
    if (!preset) return;
    state.method = "KPR";
    state.presetId = preset.id;
    state.dpPercent = Number(preset.dpPercent);
    state.tenorYears = Number(preset.tenorYears);
    state.interestRate = Number(preset.interestRate);
    LJ.refreshSimulasi(true);
  };

  LJ.setSimTenor = (years) => {
    const cfg = LJ.paymentConfig();
    const minY = Math.max(1, Number(cfg.kpr.minTenorYears || 5));
    const maxY = Math.max(minY, Number(cfg.kpr.maxTenorYears || 25));
    state.tenorYears = Math.max(minY, Math.min(maxY, Math.round(Number(years || 15))));
    syncInputPair("sim-tenor-years", state.tenorYears);
    syncInputPair("sim-tenor-range", state.tenorYears);
    LJ.refreshSimulasi(false);
  };

  LJ.onSimInput = (el) => {
    if (el.id === "sim-unit") {
      state.unitId = el.value;
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-promo") {
      state.promoId = el.value;
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-dp" || el.id === "sim-dp-range") {
      state.dpPercent = Math.max(0, Math.min(100, Number(el.value || 0)));
      state.presetId = "";
      syncInputPair("sim-dp", state.dpPercent);
      syncInputPair("sim-dp-range", state.dpPercent);
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-tenor-months" || el.id === "sim-tenor-months-range") {
      state.tenorMonths = Math.max(1, Number(el.value || 1));
      syncInputPair("sim-tenor-months", state.tenorMonths);
      syncInputPair("sim-tenor-months-range", state.tenorMonths);
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-tenor-years" || el.id === "sim-tenor-range") {
      state.tenorYears = Math.max(1, Number(el.value || 1));
      state.presetId = "";
      syncInputPair("sim-tenor-years", state.tenorYears);
      syncInputPair("sim-tenor-range", state.tenorYears);
      LJ.refreshSimulasi(false);
    } else if (el.id === "sim-interest" || el.id === "sim-interest-range") {
      state.interestRate = Math.max(0, Math.min(25, Number(el.value || 0)));
      state.presetId = "";
      syncInputPair("sim-interest", state.interestRate);
      syncInputPair("sim-interest-range", Math.min(18, state.interestRate));
      LJ.refreshSimulasi(false);
    }
  };

  LJ.pages.public.simulasi = function (routeUnitId) {
    initFromParams(routeUnitId);
    const units = LJ.db.units || [];
    const cfg = LJ.paymentConfig();
    const methods = [
      ["Cash Keras", "Tunai / Cepat", cfg.cashKeras.enabled],
      ["Cash Lunak", "Cicilan Developer", cfg.cashLunak.enabled],
      ["KPR", "KPR Bank Rekanan", cfg.kpr.enabled],
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
        "Hitung Cicilan Rumah dengan Cepat & Transparan.",
        "Pilih unit LinyJaya Property Makassar, tentukan skema atau program KPR bank rekanan seperti Bank BCA, dan atur DP serta tenor sesuai rencana Anda.",
      )}
      <div class="container page-body" id="sim-workspace">
        ${
          !units.length
            ? LJ.empty("Belum ada data unit", "Silakan tambahkan unit terlebih dahulu dari dashboard Admin.")
            : `<div class="sim-layout">
                <section class="panel sim-controls-card">
                  <div class="field">
                    <label for="sim-unit">1. Pilih Unit Rumah (${units.length} unit tersedia)</label>
                    <select id="sim-unit" class="form-control">
                      ${units
                        .map((u) => {
                          const pr = LJ.project(u.project);
                          return `<option value="${E(u.id)}" ${u.id === state.unitId ? "selected" : ""}>${E(pr?.name || "")} · Blok ${E(u.block + "-" + u.number)} (${E(u.type)}) — ${LJ.money(u.price)}</option>`;
                        })
                        .join("")}
                    </select>
                  </div>

                  <div id="sim-unit-summary" class="u-mt-14">${unitSpecHtml(selectedUnit)}</div>

                  <div class="u-mt-18">
                    <span class="field-section-label">2. Metode Pembayaran</span>
                    <div class="sim-method-tabs" role="tablist" aria-label="Pilih metode pembayaran">
                      ${methods
                        .map(
                          ([key, subtitle, enabled]) =>
                            `<button type="button" class="sim-method-btn ${state.method === key ? "active" : ""}" data-sim-method="${key}" role="tab" aria-selected="${state.method === key}" ${enabled ? "" : "disabled"}>
                              <strong>${key}</strong>
                              <small>${enabled ? subtitle : "Nonaktif"}</small>
                            </button>`,
                        )
                        .join("")}
                    </div>
                  </div>

                  <div class="field u-mt-18">
                    <label for="sim-promo">3. Promo Aktif</label>
                    <select id="sim-promo" class="form-control">
                      <option value="">${eligiblePromos.length ? "Tanpa promo (Harga Normal)" : "Belum ada promo aktif untuk metode ini"}</option>
                      ${eligiblePromos
                        .map((p) => {
                          const disc = LJ.promoDiscount(selectedUnit.price, p);
                          const lbl = p.discountType === "Nominal" ? LJ.money(p.discountValue, true) : `${p.discountValue}%`;
                          return `<option value="${E(p.id)}" ${state.promoId === p.id ? "selected" : ""}>${E(p.name)} — Hemat ${LJ.money(disc)} (${lbl})</option>`;
                        })
                        .join("")}
                    </select>
                  </div>

                  <div class="u-mt-18">
                    <div id="sim-method-controls">${controlsHtml(selectedUnit)}</div>
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
