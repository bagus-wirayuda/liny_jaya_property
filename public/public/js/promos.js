(function () {
  const { icon: I, esc: E, link: A } = LJ;

  function promoUnits(promo) {
    return (LJ.db.units || []).filter((u) => {
      if (promo.unit) return u.id === promo.unit;
      if (promo.project) return u.project === promo.project;
      return true;
    });
  }

  function discountLabel(promo) {
    if (!Number(promo.discountValue)) return "Program Spesial";
    return promo.discountType === "Nominal"
      ? `Potongan ${LJ.money(promo.discountValue, true)}`
      : `Potongan ${promo.discountValue}%`;
  }

  function scopeText(promo) {
    if (promo.unit) {
      const u = LJ.unit(promo.unit);
      const p = LJ.project(u?.project || promo.project);
      return `Khusus Unit ${u ? `${u.block}-${u.number}` : promo.unit}${p ? " · " + p.name : ""}`;
    }
    if (promo.project) {
      return `Proyek ${LJ.project(promo.project)?.name || promo.project}`;
    }
    return "Seluruh Kawasan LinyJaya Property";
  }

  function promoCard(promo) {
    const units = promoUnits(promo);
    const availableUnits = units.filter((u) => u.sale === "Tersedia");
    const sample = availableUnits[0] || units[0] || null;
    const discount = sample ? LJ.promoDiscount(sample.price, promo) : 0;
    const netSample = sample ? Math.max(0, sample.price - discount) : 0;
    const methods = LJ.promoMethods(promo);
    const imgSrc = promo.promoImageData || LJ.image(promo.image || LJ.project(promo.project)?.image || "house-1");
    const propertyUrl = promo.unit
      ? LJ.propertyPage("units", promo.unit)
      : promo.project
        ? LJ.propertyPage("projects", promo.project)
        : "properti";
    const simUrl = sample
      ? `simulasi?unit=${encodeURIComponent(sample.id)}&promo=${encodeURIComponent(promo.id)}&method=${encodeURIComponent(methods[0] || "Cash Keras")}`
      : "simulasi";

    return `<article class="panel promo-card">
      <div class="promo-card-media">
        <img src="${imgSrc}" alt="${E(promo.name)}" loading="lazy">
        <span class="promo-discount-badge">${I("spark", "sm")} ${E(discountLabel(promo))}</span>
      </div>
      <div class="promo-card-body">
        <div class="promo-card-meta">
          <span class="tag blue">${E(scopeText(promo))}</span>
          <span class="tag green">Aktif s.d. ${LJ.date(promo.end)}</span>
        </div>
        <h3>${E(promo.name)}</h3>
        <p class="promo-card-desc">${E(promo.description)}</p>
        <div class="promo-methods-row">
          <small class="muted">Metode yang memenuhi syarat:</small>
          <div class="flex wrap gap-6 u-mt-6">
            ${methods.map((m) => `<span class="tag">${E(m)}</span>`).join("")}
          </div>
        </div>
        ${
          sample
            ? `<div class="promo-price-compare">
                <div class="promo-price-unit">${I("home", "sm")} Contoh pada <strong>${LJ.unitLabel(sample.id)}</strong></div>
                <div class="promo-price-values">
                  <div><small>Harga sebelum promo</small><del class="promo-price-old">${LJ.money(sample.price)}</del></div>
                  <div><small>Harga setelah promo</small><strong class="blue promo-price-new">${LJ.money(netSample)}</strong></div>
                </div>
              </div>`
            : ""
        }
        ${
          promo.terms
            ? `<div class="promo-terms"><strong>Syarat & Ketentuan:</strong> ${E(promo.terms)}</div>`
            : ""
        }
        <div class="promo-period-line">
          <span>${I("calendar", "sm")} Periode berlaku: ${LJ.date(promo.start)} – ${LJ.date(promo.end)}</span>
        </div>
        <div class="promo-card-actions">
          ${A("Lihat Properti", propertyUrl, "secondary small", "arrow")}
          ${A("Simulasi Pembayaran", simUrl, "primary small", "wallet")}
        </div>
      </div>
    </article>`;
  }

  LJ.renderPromoResults = () => {
    const projectFilter = document.getElementById("promo-filter-project")?.value || "";
    const methodFilter = document.getElementById("promo-filter-method")?.value || "";
    const activePromos = (LJ.db.promos || []).filter((p) => {
      if (!LJ.isPromoActive(p)) return false;
      if (projectFilter && p.project && p.project !== projectFilter) return false;
      if (methodFilter && !LJ.promoMethods(p).includes(methodFilter)) return false;
      return true;
    });

    const el = document.getElementById("promo-results");
    if (!el) return;
    el.innerHTML = activePromos.length
      ? `<div class="grid two">${activePromos.map(promoCard).join("")}</div>`
      : LJ.empty(
          "Belum ada promo aktif yang sesuai filter",
          "Promo kedaluwarsa atau nonaktif otomatis tidak ditampilkan dan tidak dapat diterapkan pada perhitungan.",
        );
  };

  LJ.pages.public.promos = function () {
    const activePromos = (LJ.db.promos || []).filter((p) => LJ.isPromoActive(p));

    return `
      ${LJ.pageHero(
        "Promo Properti Makassar",
        "Penawaran Hunian Aktif & Transparan.",
        "Jelajahi program potongan harga resmi yang masih berlaku di kawasan LinyJaya Property Kota Makassar. Hubungkan langsung ke detail unit dan simulasi pembayaran.",
      )}
      <div class="container page-body">
        <div class="notice sales-promo-bar">
          ${I("info")}
          <span>Hanya promo dengan status <strong>Aktif</strong> dan dalam periode tanggal berlaku (WITA) yang dapat dipilih pada Simulasi Pembayaran dan Pengajuan Pemesanan.</span>
        </div>

        <form id="promo-filter-form" class="filter-bar u-mt-18">
          <select id="promo-filter-project" class="form-control" aria-label="Filter proyek promo">
            <option value="">Semua Kawasan Makassar</option>
            ${(LJ.db.projects || []).map((p) => `<option value="${E(p.id)}">${E(p.name)}</option>`).join("")}
          </select>
          <select id="promo-filter-method" class="form-control" aria-label="Filter metode pembayaran">
            <option value="">Semua Metode Pembayaran</option>
            <option value="Cash Keras">Cash Keras</option>
            <option value="Cash Lunak">Cash Lunak</option>
            <option value="KPR">KPR</option>
          </select>
        </form>

        <div id="promo-results" class="u-mt-20">
          ${
            activePromos.length
              ? `<div class="grid two">${activePromos.map(promoCard).join("")}</div>`
              : LJ.empty(
                  "Belum ada promo aktif saat ini",
                  "Silakan periksa kembali secara berkala atau hubungi tim LinyJaya Property untuk jadwal penawaran terbaru.",
                )
          }
        </div>
      </div>
      ${LJ.cta()}
    `;
  };
})();
