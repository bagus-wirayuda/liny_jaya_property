(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;
  LJ.projectDetail = (p, role) => {
    const units = LJ.db.units.filter((u) => u.project === p.id);
    const price = units.length
      ? Math.min(...units.map((u) => u.price))
      : p.price;
    const kprStart = LJ.calcKPR(price, 20);
    const waText = "Halo Tim Sales LinyJaya, saya tertarik dengan kawasan " + p.name + " di " + p.location + ". Mohon informasi ketersediaan unit, promo diskon, dan jadwal survei lokasi.";

    return `${LJ.publicationNotice()}<div class="detail-hero"><img src="${LJ.image(p.image)}" alt="Referensi arsitektur untuk ${E(p.name)}"><span class="card-label">${I("pin")}${E(p.location)}</span></div><div class="detail-layout"><div class="stack"><div><div class="flex between"><span class="eyebrow">${E(p.category)}</span>${LJ.badge(p.status)}</div><h1 class="u-mt-16">${E(p.name)}</h1><p class="project-detail-intro">${E(p.description)}</p></div>${LJ.panel("Keunggulan Kawasan & Fasilitas", `<div class="facility-list"><div>${I("pin")}${E(p.location)}</div><div>${I("home")}${p.units} unit hunian</div><div>${I("layers")}${E(p.category)}</div><div>${I("calendar")}Show unit buka setiap hari (08.30–18.00)</div></div><div class="u-mt-14 facility-list">${p.facilities.map((f) => `<div>${I("check")}${E(f)}</div>`).join("")}</div>`)}${LJ.panel("Pilih Kavling & Denah Anda", LJ.sitePlan(p.id), "", "Klik kavling untuk melihat tipe hunian, harga, dan simulasi pembayaran.")}${LJ.panel(
      "Pilihan Unit Tersedia di Kawasan Ini",
      LJ.table(
        ["Unit / Tipe", "Harga Resmi", "Simulasi KPR", "Status", ""],
        units.map((u) => [
          `<strong>${LJ.unitLabel(u.id)}</strong><small>LT ${u.land} / LB ${u.building} m²</small>`,
          LJ.money(u.price, true),
          `<span class="tag blue">Mulai ${LJ.money(LJ.calcKPR(u.price, 20), true)}/bln</span>`,
          LJ.badge(u.sale),
          `<div class="flex gap-6">${B("Konsultasi", "consult", p.id + ":" + u.id, "primary small", "message")}${A("Detail", LJ.propertyPage("units", u.id, role), "secondary small", "arrow")}</div>`,
        ]),
      ),
    )}${LJ.panel("Galeri Suasana Hunian", `<div class="grid two">${[p.image, "interior"].map((i) => `<button data-action="gallery" data-id="${i}" class="icon-btn project-gallery-button"><img src="${LJ.image(i)}" alt="Galeri ${E(p.name)}" class="project-gallery-photo"></button>`).join("")}</div>`)}</div><aside class="panel detail-price"><div class="sales-price-header"><span class="sales-promo-pill">${I("spark", "sm")} Promo Kawasan Aktif</span><p class="u-text-11 u-mt-6">Harga mulai dari</p><h2 class="blue project-detail-price">${LJ.money(price, true)}</h2><div class="unit-price-sub">KPR mulai ${LJ.money(kprStart, true)}/bulan</div></div><div class="sales-perks-mini u-mt-14"><div>${I("check", "sm")} <span>Tersedia <strong>Cash Keras (Diskon 5%)</strong></span></div><div>${I("check", "sm")} <span>Tersedia <strong>Cash Bertahap (Bunga 0%)</strong></span></div><div>${I("check", "sm")} <span>Tersedia <strong>KPR Bank Rekanan</strong></span></div><div>${I("check", "sm")} <span>Free BPHTB, Notaris & Biaya AJB</span></div></div><div class="divider"></div><div class="flex between u-text-11"><span>Kavling tersedia</span><strong>${units.filter((u) => u.sale === "Tersedia").length} unit siap dipesan</strong></div><div class="sales-action-stack u-mt-18">${!role || role === "client" ? `${B("Konsultasi Proyek & Promo", "consult", p.id, "primary full", "message")}<a href="${LJ.whatsappLink(waText)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp full u-mt-10">${I("whatsapp")} Konsultasi via WhatsApp</a><button type="button" class="btn secondary full u-mt-10" data-action="consult" data-id="${p.id}:survey">${I("calendar")} Jadwalkan Survei Lokasi</button>` : ""}</div><p class="legal-note u-mt-16">Dapatkan pendampingan langsung oleh Property Advisor kami untuk pemilihan unit kavling terbaik dan simulasi skema pembayaran.</p></aside></div>`;
  };
})();
