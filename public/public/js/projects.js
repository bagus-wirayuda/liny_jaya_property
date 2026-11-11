(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;
  LJ.projectDetail = (p, role) => {
    const units = LJ.db.units.filter((u) => u.project === p.id);
    const price = units.length
      ? Math.min(...units.map((u) => u.price))
      : p.price;
    const kprStart = LJ.calcKPR(price);
    const activePromos = (LJ.db.promos || []).filter(
      (pr) => LJ.isPromoActive(pr) && (!pr.project || pr.project === p.id),
    );
    const waText = `Halo Tim LinyJaya Property Makassar, saya tertarik dengan kawasan ${p.name} (${p.location}). Mohon informasi ketersediaan unit dan simulasi cara bayar.`;

    return `${LJ.publicationNotice(p.id)}<div class="detail-hero"><img src="${LJ.image(p.image)}" alt="Referensi arsitektur untuk ${E(p.name)}"><span class="card-label">${I("pin")}${E(p.location)}</span></div><div class="detail-layout"><div class="stack"><div><div class="flex between"><span class="eyebrow">${E(p.category)}</span>${LJ.badge(p.status)}</div><h1 class="u-mt-16">${E(p.name)}</h1><p class="project-detail-intro">${E(p.description)}</p></div>${
      activePromos.length
        ? LJ.panel(
            "Promo Aktif di Kawasan Ini",
            activePromos
              .map((pr) => {
                const label = pr.discountType === "Nominal" ? `Potongan ${LJ.money(pr.discountValue)}` : `Potongan ${pr.discountValue}%`;
                return `<div class="activity"><span class="icon-tile">${I("spark")}</span><div class="u-flex-fill"><strong>${E(pr.name)} · ${E(label)}</strong><p>${E(pr.description)}</p><small class="muted">Berlaku ${LJ.date(pr.start)} – ${LJ.date(pr.end)} · Metode: ${E(LJ.promoMethods(pr).join(", "))}</small></div>${A("Detail Promo", "promo", "secondary small", "arrow")}</div>`;
              })
              .join(""),
          )
        : ""
    }${LJ.panel("Keunggulan Kawasan & Fasilitas", `<div class="facility-list"><div>${I("pin")}${E(p.location)}</div><div>${I("home")}${p.units} unit direncanakan</div><div>${I("layers")}${E(p.category)}</div><div>${I("calendar")}${E(LJ.db.company.hours || "Senin – Sabtu, 08.30 – 17.00 WITA")}</div></div><div class="u-mt-14 facility-list">${p.facilities.map((f) => `<div>${I("check")}${E(f)}</div>`).join("")}</div>`)}${LJ.panel("Pilih Kavling & Denah Kawasan", LJ.sitePlan(p.id), "", "Klik kavling untuk melihat tipe hunian, ketersediaan, dan tautan simulasi pembayaran.")}${LJ.panel(
      "Daftar Unit di Kawasan Ini",
      LJ.table(
        ["Unit / Tipe", "Harga", "Est. KPR", "Status", ""],
        units.map((u) => {
          const best = LJ.bestPromoForUnit(u);
          const net = best.promo ? best.finalPrice : u.price;
          return [
            `<strong>${LJ.unitLabel(u.id)}</strong><small>LT ${u.land} / LB ${u.building} m²</small>`,
            best.promo ? `<del class="muted">${LJ.money(u.price, true)}</del><br><strong class="blue">${LJ.money(net, true)}</strong>` : LJ.money(u.price, true),
            `<span class="tag blue">Mulai ${LJ.money(LJ.calcKPR(net), true)}/bln</span>`,
            LJ.badge(u.sale),
            `<div class="flex gap-6">${A("Simulasi", "simulasi?unit=" + encodeURIComponent(u.id), "secondary small", "calculator")}${A("Detail", LJ.propertyPage("units", u.id, role), "primary small", "arrow")}</div>`,
          ];
        }),
      ),
    )}${LJ.panel("Galeri Suasana Hunian", `<div class="grid two">${[p.image, "interior"].map((i) => `<button data-action="gallery" data-id="${i}" class="icon-btn project-gallery-button"><img src="${LJ.image(i)}" alt="Galeri ${E(p.name)}" class="project-gallery-photo"></button>`).join("")}</div>`)}</div><aside class="panel detail-price"><div class="sales-price-header">${activePromos.length ? `<span class="sales-promo-pill">${I("spark", "sm")} ${activePromos.length} Promo Aktif</span>` : ""}<p class="u-text-11 u-mt-6">Harga katalog mulai dari</p><h2 class="blue project-detail-price">${LJ.money(price, true)}</h2><div class="unit-price-sub">Est. KPR mulai ${LJ.money(kprStart, true)}/bulan (ilustratif)</div></div><div class="sales-perks-mini u-mt-14"><div>${I("check", "sm")} <span>Pembayaran <strong>Cash Keras</strong> (DP ${LJ.paymentConfig().cashKeras.dpPercent}%)</span></div><div>${I("check", "sm")} <span>Cicilan developer <strong>Cash Lunak</strong> (s.d. ${LJ.paymentConfig().cashLunak.maxTenorMonths} bln)</span></div><div>${I("check", "sm")} <span>Pembiayaan <strong>KPR</strong> (estimasi anuitas)</span></div></div><div class="divider"></div><div class="flex between u-text-11"><span>Kavling tersedia</span><strong>${units.filter((u) => u.sale === "Tersedia").length} unit siap dipesan</strong></div><div class="sales-action-stack u-mt-18">${!role || role === "client" ? `${A("Simulasi Pembayaran", units[0] ? "simulasi?unit=" + encodeURIComponent(units[0].id) : "simulasi", "primary full", "calculator")}${B("Konsultasi Proyek", "consult", p.id, "secondary full u-mt-10", "message")}<a href="${LJ.whatsappLink(waText)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full u-mt-10">${I("whatsapp")} Chat via WhatsApp</a>` : ""}</div><p class="legal-note u-mt-16">Simulasi KPR di platform merupakan estimasi, bukan persetujuan kredit bank.</p></aside></div>`;
  };
})();
