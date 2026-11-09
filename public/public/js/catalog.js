(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;
  LJ.projectCard = (p) => {
    const units = LJ.db.units.filter((u) => u.project === p.id),
      min = units.length ? Math.min(...units.map((u) => u.price)) : p.price;
    const range = (key) => {
      const values = units.map((unit) => unit[key]);
      const low = Math.min(...values),
        high = Math.max(...values);
      return !values.length
        ? "—"
        : low === high
          ? String(low)
          : `${low}–${high}`;
    };
    const kprStart = LJ.calcKPR(min, 20);
    return `<article class="project-card"><div class="card-image"><a href="${LJ.propertyPage("projects", p.id, LJ.currentPage.role)}" aria-label="Lihat ${E(p.name)}"><img loading="lazy" src="${LJ.image(p.image)}" alt="Arsitektur hunian ${E(p.name)}"></a><span class="card-label">${I(p.id === "P3" ? "leaf" : "spark")}${E(p.tag || p.category)}</span><button class="favorite ${LJ.db.favorites.includes(p.id) ? "active" : ""}" data-action="favorite" data-id="${p.id}" aria-label="${LJ.db.favorites.includes(p.id) ? "Hapus dari" : "Tambahkan ke"} favorit" aria-pressed="${LJ.db.favorites.includes(p.id)}">${I("heart", "sm")}</button></div><div class="card-body"><div class="card-location">${I("pin")}${E(p.location)}</div><a href="${LJ.propertyPage("projects", p.id, LJ.currentPage.role)}"><h3>${E(p.name)}</h3></a><div class="card-amenities"><span>${I("bed")}${range("beds")} kamar</span><span>${I("bath")}${range("baths")} kamar mandi</span><span>${I("area")}${range("building")} m²</span></div><div class="card-sales-pill"><span class="tag green">Bunga 0% Bertahap</span><span class="tag blue">KPR DP 10%</span></div><div class="card-price"><div><p>Harga mulai</p><strong>${LJ.money(min, true)}</strong><small class="card-kpr-sub">KPR mulai ${LJ.money(kprStart, true)}/bln</small></div><div class="card-actions-group">${B("Konsultasi", "consult", p.id, "primary small", "message")}<a class="card-arrow" href="${LJ.propertyPage("projects", p.id, LJ.currentPage.role)}" aria-label="Detail ${E(p.name)}">${I("arrow", "sm")}</a></div></div></div></article>`;
  };
  LJ.unitCard = (u) => {
    const p = LJ.project(u.project);
    const attrs = `href="${LJ.propertyPage("units", u.id, LJ.currentPage.role)}"`;
    const kprPerMonth = LJ.calcKPR(u.price, 20);
    return `<article class="project-card unit-card"><div class="card-image"><a ${attrs} aria-label="Lihat unit ${E(u.block + "-" + u.number)}"><img loading="lazy" src="${LJ.image(u.image)}" alt="Desain rumah tipe ${E(u.type)}"></a><span class="card-label">${I("home")}TIPE ${E(u.type)}</span><button class="favorite ${LJ.db.favorites.includes(u.id) ? "active" : ""}" data-action="favorite" data-id="${u.id}" aria-label="Favorit unit ${E(u.block + "-" + u.number)}" aria-pressed="${LJ.db.favorites.includes(u.id)}">${I("heart", "sm")}</button></div><div class="card-body"><div class="card-location">${I("pin")}${E(p?.name)} · ${E(p?.city)}</div><a ${attrs}><h3>Rumah ${E(u.block + "-" + u.number)}</h3></a><div class="card-amenities"><span>${I("bed")}${u.beds} kamar</span><span>${I("area")}LT ${u.land} m²</span><span>${I("home")}LB ${u.building} m²</span></div><div class="unit-status">${LJ.badge(u.sale)}${LJ.badge(u.construction)}</div><div class="card-sales-pill"><span class="tag green">Diskon Cash 5%</span><span class="tag blue">Cicilan: ${LJ.money(kprPerMonth, true)}/bln</span></div><div class="card-price"><div><p>Harga resmi unit</p><strong>${LJ.money(u.price, true)}</strong></div><div class="card-actions-group">${B("Konsultasi Unit", "consult", u.project + ":" + u.id, "primary small", "message")}<a class="card-arrow" ${attrs} aria-label="Detail unit ${E(u.block + "-" + u.number)}">${I("arrow", "sm")}</a></div></div></div></article>`;
  };
  LJ.latestUnits = () =>
    `<section class="section catalog-section-flush"><div class="container"><div class="section-head"><div><span class="eyebrow">${I("home")}UNIT PILIHAN</span><h2>Ruang baru, kemungkinan baru.</h2><p>Pilih kavling dan kenali rumah Anda sebelum mulai dibangun.</p></div>${A("Lihat katalog unit", "properti.html", "secondary", "arrow")}</div><div class="grid three">${
      LJ.db.units
        .filter((u) => u.sale === "Tersedia")
        .slice(0, 3)
        .map(LJ.unitCard)
        .join("") ||
      LJ.empty(
        "Semua unit telah dipesan",
        "Hubungi tim untuk mengetahui pilihan berikutnya.",
      )
    }</div></div></section>`;
  LJ.catalog = (dashboard = false) =>
    `<div class="catalog-toggle" role="group" aria-label="Jenis katalog"><button data-action="catalog-view" data-id="projects" class="${LJ.catalogView !== "units" ? "active" : ""}" aria-pressed="${LJ.catalogView !== "units"}">${I("layers", "sm")}Proyek perumahan</button><button data-action="catalog-view" data-id="units" class="${LJ.catalogView === "units" ? "active" : ""}" aria-pressed="${LJ.catalogView === "units"}">${I("home", "sm")}Unit rumah</button></div><form class="filter-bar" id="catalog-filter"><input class="form-control" name="q" type="search" placeholder="Cari nama proyek atau lokasi…" aria-label="Cari properti" value="${E(LJ.filters?.q || "")}"><select class="form-control" name="city" aria-label="Lokasi"><option value="">Semua lokasi</option>${[...new Set(LJ.db.projects.map((p) => p.city))].map((c) => `<option ${LJ.filters?.city === c ? "selected" : ""}>${E(c)}</option>`).join("")}</select><select class="form-control" name="type" aria-label="Tipe"><option value="">Semua tipe</option>${["60/90", "72/105", "90/120"].map((c) => `<option ${LJ.filters?.type === c ? "selected" : ""}>${c}</option>`).join("")}</select><select class="form-control" name="price" aria-label="Harga"><option value="">Semua harga</option>${[
      ["750000000", "< Rp 750 juta"],
      ["900000000", "< Rp 900 juta"],
      ["1000000000", "< Rp 1 miliar"],
    ]
      .map(
        ([v, t]) =>
          `<option value="${v}" ${LJ.filters?.price === v ? "selected" : ""}>${t}</option>`,
      )
      .join(
        "",
      )}</select><select class="form-control" name="sort" aria-label="Urutkan"><option value="default">Pilihan utama</option><option value="low" ${LJ.filters?.sort === "low" ? "selected" : ""}>Harga terendah</option><option value="high" ${LJ.filters?.sort === "high" ? "selected" : ""}>Harga tertinggi</option><option value="favorite" ${LJ.filters?.sort === "favorite" ? "selected" : ""}>Favorit saya</option></select>${B("Reset", "reset-filter", "", "ghost small", "refresh")}</form><div id="catalog-results">${LJ.catalogResults()}</div>`;
  LJ.catalogResults = () => {
    const f = LJ.filters || {},
      unitView = LJ.catalogView === "units";
    let rows;
    if (unitView)
      rows = LJ.db.units.filter((u) => {
        const p = LJ.project(u.project);
        return (
          p &&
          (!f.q ||
            (p.name + " " + p.location + " " + u.block + "-" + u.number)
              .toLowerCase()
              .includes(f.q.toLowerCase())) &&
          (!f.city || p.city === f.city) &&
          (!f.type || u.type === f.type) &&
          (!f.price || u.price < Number(f.price)) &&
          (f.sort !== "favorite" || LJ.db.favorites.includes(u.id))
        );
      });
    else
      rows = LJ.db.projects.filter(
        (p) =>
          (!f.q ||
            (p.name + " " + p.location)
              .toLowerCase()
              .includes(f.q.toLowerCase())) &&
          (!f.city || p.city === f.city) &&
          (f.sort !== "favorite" || LJ.db.favorites.includes(p.id)) &&
          LJ.db.units.some(
            (u) =>
              u.project === p.id &&
              (!f.type || u.type === f.type) &&
              (!f.price || u.price < Number(f.price)),
          ),
      );
    if (f.sort === "low" || f.sort === "high")
      rows.sort((a, b) =>
        f.sort === "low" ? a.price - b.price : b.price - a.price,
      );
    return `<p class="filter-results">${rows.length} ${unitView ? "unit" : "proyek"} ditemukan <span class="u-float-end">Hunian pilihan LinyJaya</span></p>${rows.length ? `<div class="grid three">${rows.map(unitView ? LJ.unitCard : LJ.projectCard).join("")}</div>` : LJ.empty("Belum menemukan yang sesuai?", "Coba perluas lokasi, tipe, atau rentang harga.", B("Reset pencarian", "reset-filter", "", "secondary", "refresh"))}`;
  };
})();
