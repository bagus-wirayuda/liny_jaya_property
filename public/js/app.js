(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;
  const { role: currentRole, params } = LJ.currentPage;
  let renderedRole = null;
  let dashboardTab = params.get("tab");
  LJ.filters =
    LJ.currentPage.pageKey === "properti"
      ? Object.fromEntries(
          ["city", "type", "price"].map((key) => [key, params.get(key) || ""]),
        )
      : {};
  LJ.publicTab = "all";
  LJ.tableQuery = "";
  const compactNavigation = matchMedia("(max-width: 950px)");
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
  const revealObserver =
    typeof IntersectionObserver === "undefined"
      ? null
      : new IntersectionObserver(
          (entries) => {
            entries.forEach((entry) => {
              if (entry.isIntersecting) {
                entry.target.classList.add("is-visible");
                revealObserver.unobserve(entry.target);
              }
            });
          },
          { threshold: 0.06 },
        );
  function syncNavigation() {
    for (const menu of document.querySelectorAll(".sidebar, .nav-links")) {
      const hidden = compactNavigation.matches && !menu.classList.contains("open");
      menu.inert = hidden;
      menu.setAttribute("aria-hidden", String(hidden));
    }
    document.body.classList.toggle("navigation-open",
      compactNavigation.matches && !!document.querySelector(".sidebar.open, .nav-links.open"));
  }
  function setNavigationOpen(menu, open) {
    menu.classList.toggle("open", open);
    if (menu.id === "workspace-sidebar")
      document.querySelector(".sidebar-overlay").classList.toggle("open", open);
    const toggle = document.querySelector(`[aria-controls="${menu.id}"]`);
    toggle.setAttribute("aria-expanded", String(open));
    if (!open) toggle.focus({ preventScroll: true });
    syncNavigation();
    if (open) menu.querySelector("a[href]")?.focus({ preventScroll: true });
  }
  function syncSidebarSubmenu() {
    const submenu = document.getElementById("workspace-submenu");
    if (!submenu) return;
    const toggle = document.querySelector(".sidebar-submenu-toggle");
    const tabs = [
      ...document.querySelectorAll("#workspace-content > .reveal > .tabs > [data-tab]"),
    ];
    submenu.hidden = toggle.hidden = tabs.length === 0;
    if (!tabs.length) return;
    const links = submenu.firstElementChild;
    if (
      links.children.length !== tabs.length ||
      tabs.some((tab, index) => links.children[index].dataset.sidebarTab !== tab.dataset.tab)
    ) {
      links.innerHTML = tabs
        .map((tab) => `<button type="button" data-sidebar-tab="${E(tab.dataset.tab)}">${E(tab.textContent)}</button>`)
        .join("");
    }
    tabs.forEach((tab, index) =>
      links.children[index].setAttribute("aria-pressed", tab.getAttribute("aria-selected")),
    );
  }
  LJ.render = () => {
    const { file, page, role, menu, id, resource } = LJ.currentPage;
    const active = document.activeElement,
      inputId = active?.id,
      selection = active?.selectionStart;
    if (role && LJ.roles[role]) {
      if (renderedRole !== role || !document.querySelector(".workspace")) {
        document.getElementById("app").innerHTML = LJ.workspaceShell(
          role,
          menu,
        );
        renderedRole = role;
      }
      document.getElementById("workspace-content").innerHTML =
        page === "access"
          ? LJ.pages.client.access(file)
          : page === "property-detail"
            ? LJ.workspaceProperty(LJ.currentPage)
            : LJ.dashboardContent(role, menu, dashboardTab);
      const menuLabel = LJ.roles[role].menus.find(([key]) => key === menu)?.[1];
      document.getElementById("workspace-breadcrumb").textContent =
        page === "property-detail"
          ? resource === "units" ? "Detail Unit" : "Detail Proyek"
          : menuLabel || "Dashboard";
      syncSidebarSubmenu();
      document
        .querySelector(".sidebar .count")
        ?.replaceChildren(
          document.createTextNode(String(LJ.metrics().pending)),
        );
      const unreadDot = document.querySelector(".notification-dot");
      if (unreadDot) {
        unreadDot.hidden = !LJ.db.notifications.some((n) => n.status === "Baru");
      }
      document.title = `${menuLabel || "Dashboard"} · LinyJaya ${LJ.roles[role].name}`;
    } else {
      renderedRole = null;
      document.getElementById("app").innerHTML = page === "portal"
        ? `<main id="main">${LJ.pages.shared.portal()}</main>`
        : LJ.publicPage(file, id);
      LJ.mountArchitecture?.();
      document.title =
        file === "home"
          ? "LinyJaya Property Makassar — Ruang untuk hidup lebih baik."
          : (document
              .querySelector("h1")
              ?.textContent?.replace(/\s+/g, " ")
              .trim() || "LinyJaya Property") + " · LinyJaya Property";
    }
    if (inputId) {
      const el = document.getElementById(inputId);
      if (el) {
        el.focus({ preventScroll: true });
        try {
          el.setSelectionRange(selection, selection);
        } catch {}
      }
    }
    syncNavigation();
    revealObserver?.disconnect();
    if (!role && revealObserver && !reducedMotion.matches && !compactNavigation.matches) {
      document
        .querySelectorAll(
          "#main :is(.section-head, .benefits, .project-card, .article-card, .about-copy, .about-image, .lifestyle-card, .process-card, .partner-card, .stats-strip, .cta-band)",
        )
        .forEach((el) => {
          if (el.getBoundingClientRect().top > innerHeight) {
            el.classList.add("scroll-reveal");
            revealObserver.observe(el);
          }
        });
    }
  };
  function role() {
    return currentRole || "public";
  }
  function openPage(file) {
    location.assign(new URL(file, document.baseURI).href);
  }
  async function saveToast(text) {
    await LJ.save();
    LJ.toast(text);
  }
  async function saveConsultation(data, context = {}) {
    const values = Object.fromEntries(
      Object.entries(data).map(([key, value]) => [key, value.trim()]),
    );
    if (!values.name || !values.phone || !values.email)
      throw Error("Lengkapi nama dan kontak Anda.");
    if (!values.date || values.date < LJ.today())
      throw Error("Pilih tanggal hari ini atau sesudahnya.");
    values.notes = [
      values.notes || values.interest || "Konsultasi properti",
      values.payment ? "Metode: " + values.payment : "",
    ].filter(Boolean).join(" | ");
    delete values.payment;
    await LJ.consultation({
      ...values,
      ...context,
    });
    LJ.toast("Permintaan konsultasi tersimpan. Jadwal akan dikonfirmasi oleh tim.");
  }
  const numFields = [
    "price",
    "units",
    "land",
    "building",
    "beds",
    "baths",
    "floors",
    "amount",
    "score",
    "discountValue",
  ];
  function entityForm(key, id) {
    const cfg = LJ.entityConfig()[key];
    if (!cfg) throw Error("Jenis data tidak ditemukan.");
    const existing = LJ.db[key].find((x) => x.id === id);
    const values = existing ? { ...existing } : {};
    if (key === "projects" && existing)
      values.facilities = existing.facilities.join(", ");
    if (existing?.employeeId) values.employee = existing.employeeId;
    const fields = cfg.fields.map((field) =>
      field.name === "password" && key === "accounts"
        ? { ...field, required: !existing }
        : field,
    );
    LJ.formModal(
      (existing ? "Edit " : "Tambah ") + cfg.title,
      fields,
      values,
      async (data) => {
        for (const k of Object.keys(data)) {
          if (typeof data[k] === "string" && k !== "password") data[k] = data[k].trim();
          if (numFields.includes(k)) {
            data[k] = Number(data[k]);
            if (!Number.isFinite(data[k]))
              throw Error("Nilai angka tidak valid.");
          }
        }
        for (const f of fields) {
          if (f.required && String(data[f.name] ?? "").trim() === "")
            throw Error("Lengkapi " + f.label.toLowerCase() + ".");
        }
        if (data.start && data.end && data.end < data.start)
          throw Error("Tanggal selesai harus sesudah tanggal mulai.");
        if (
          key === "partners" &&
          data.website &&
          !/^https?:\/\//.test(data.website)
        )
          throw Error("Situs mitra harus menggunakan alamat HTTP atau HTTPS.");
        if (key === "projects") {
          data.facilities = data.facilities
            .split(",")
            .map((x) => x.trim())
            .filter(Boolean);
          if (!existing) data.tag = data.category;
        }
        if (key === "partners") {
          const file = data.logoFile;
          delete data.logoFile;
          if (file instanceof File && file.size > 0) {
            if (!file.type.startsWith("image/"))
              throw Error("Logo mitra harus berupa berkas JPG, PNG, atau WebP.");
            data.logoData = await LJ.fileData(file);
          }
          data.cooperationType =
            data.cooperationType ||
            (data.category === "Perbankan & pembiayaan"
              ? "Bank Rekanan KPR"
              : data.category === "Material & solusi bangunan"
                ? "Material & Bangunan"
                : data.category === "Arsitektur & perencanaan"
                  ? "Arsitektur & Konsultan"
                  : "Konstruksi & Kontraktor");
          data.status = data.status || "Aktif";
          data.kprRate =
            data.kprRate !== undefined && data.kprRate !== "" && data.kprRate !== null
              ? Math.round(Number(data.kprRate) * 100) / 100
              : null;
          data.kprTenorMax =
            data.kprTenorMax !== undefined && data.kprTenorMax !== "" && data.kprTenorMax !== null
              ? Math.round(Number(data.kprTenorMax))
              : null;
          if (data.kprRate !== null && (!Number.isFinite(data.kprRate) || data.kprRate < 0 || data.kprRate > 25))
            throw Error("Acuan bunga KPR harus di antara 0% hingga 25%.");
          if (data.kprTenorMax !== null && (!Number.isFinite(data.kprTenorMax) || data.kprTenorMax < 1 || data.kprTenorMax > 30))
            throw Error("Maksimal tenor KPR harus di antara 1 hingga 30 tahun.");
        }
        if (key === "promos") {
          delete data["eligibleMethods[]"];
          const file = data.promoImageFile;
          delete data.promoImageFile;
          if (file instanceof File && file.size > 0) {
            if (!file.type.startsWith("image/"))
              throw Error("Gambar promo harus berupa berkas JPG, PNG, atau WebP.");
            data.promoImageData = await LJ.fileData(file);
          }
          if (data.scope === "Semua Properti") {
            data.project = "";
            data.unit = "";
          } else if (data.scope === "Proyek") {
            data.unit = "";
            if (!data.project)
              throw Error("Pilih proyek untuk promo Proyek Tertentu.");
          } else if (data.scope === "Unit") {
            if (!data.unit)
              throw Error("Pilih unit rumah untuk promo Unit Tertentu.");
            const targetUnit = LJ.unit(data.unit);
            if (targetUnit) data.project = targetUnit.project;
          }
          data.discountValue = Math.round(Number(data.discountValue || 0));
          if (
            data.discountType === "Persentase" &&
            (data.discountValue < 1 || data.discountValue > 90)
          )
            throw Error("Potongan persentase harus antara 1% hingga 90%.");
          if (data.discountType === "Nominal" && data.discountValue < 1)
            throw Error("Nominal potongan promo harus lebih dari 0.");
        }
        if (key === "units") {
          if (
            LJ.db.units.some(
              (u) =>
                u.id !== id &&
                u.project === data.project &&
                u.block.toLowerCase() === data.block.toLowerCase() &&
                u.number.toLowerCase() === data.number.toLowerCase(),
            )
          )
            throw Error(
              "Nomor kavling sudah dipakai pada blok dan proyek ini.",
            );
          if (
            existing &&
            existing.sale !== "Tersedia" &&
            (existing.price !== data.price || existing.project !== data.project)
          )
            throw Error(
              "Harga dan proyek unit yang sudah dipesan tidak dapat diubah.",
            );
          if (data.building / data.floors > data.land)
            throw Error("Luas lantai dasar tidak boleh melebihi luas tanah.");
          if (!existing)
            Object.assign(data, {
              sale: "Tersedia",
              construction: "Belum dibangun",
              progress: 0,
              stage: "Persiapan",
            });
        }
        if (key === "expenses" && !existing)
          data.status = "Menunggu persetujuan";
        if (key === "messages")
          Object.assign(data, {
            name: LJ.roles[role()]?.person || "Administrator",
            date: LJ.today(),
            status: "Baru",
          });
        if (key === "notifications")
          Object.assign(data, { date: LJ.today(), status: "Baru" });
        if (existing) Object.assign(existing, data);
        else LJ.db[key].unshift({ id: LJ.uid(cfg.prefix), ...data });
        await saveToast(
          cfg.title[0].toUpperCase() +
            cfg.title.slice(1) +
            " berhasil disimpan.",
        );
      },
      existing ? "Simpan perubahan" : "Tambahkan data",
    );
  }
  function kprPresetForm(presetId = null) {
    const cfg = LJ.paymentConfig();
    const presets = [...(cfg.kpr.presets || [])];
    const existing = presetId ? presets.find((p) => p.id === presetId) : null;
    const bankPartners = LJ.db.partners.filter(
      (p) => p.category === "Perbankan & pembiayaan" || String(p.cooperationType || "").startsWith("Bank"),
    );
    const partnerOptions = [
      ["", "Umum / Tanpa tautan bank spesifik"],
      ...bankPartners.map((p) => [p.id, `${p.name} (${p.status || "Aktif"})`]),
    ];
    LJ.formModal(
      existing ? "Edit Program / Skema KPR" : "Tambah Program / Skema KPR",
      [
        { name: "name", label: "Nama Skema KPR", placeholder: "Contoh: KPR Bank BCA — Fix 3 Tahun", required: true, wide: true },
        { name: "partnerId", label: "Bank Rekanan (opsional)", type: "select", options: partnerOptions, required: false },
        { name: "bankName", label: "Label Bank / Penyalur", placeholder: "Contoh: Bank BCA", required: false },
        { name: "dpPercent", label: "Default DP (%)", type: "number", min: 5, max: 80, step: 1, required: true },
        { name: "tenorYears", label: "Default Tenor (Tahun)", type: "number", min: cfg.kpr.minTenorYears || 1, max: cfg.kpr.maxTenorYears || 30, step: 1, required: true },
        { name: "interestRate", label: "Suku Bunga (% / tahun)", type: "number", min: 0, max: 25, step: 0.05, required: true },
        { name: "badge", label: "Badge / Tag Singkat", placeholder: "Contoh: Bank Rekanan", required: false },
        { name: "note", label: "Keterangan Singkat", type: "textarea", required: false, wide: true },
        { name: "active", label: "Tampilkan skema ini pada kalkulator simulasi KPR publik", type: "checkbox", required: false, wide: true },
      ],
      existing
        ? { ...existing, active: existing.active !== false }
        : {
            partnerId: bankPartners.find((p) => p.id === "PT-005")?.id || "",
            bankName: "",
            dpPercent: cfg.kpr.dpPercent,
            tenorYears: cfg.kpr.defaultTenorYears,
            interestRate: cfg.kpr.interestRate,
            badge: "Bank Rekanan",
            note: "",
            active: true,
          },
      async (data) => {
        const linkedPartner = data.partnerId ? LJ.db.partners.find((p) => p.id === data.partnerId) : null;
        const dpPercent = Math.round(Number(data.dpPercent));
        const tenorYears = Math.round(Number(data.tenorYears));
        const interestRate = Math.round(Number(data.interestRate) * 100) / 100;
        if (dpPercent < 5 || dpPercent > 80) throw Error("DP KPR harus antara 5% hingga 80%.");
        if (tenorYears < 1 || tenorYears > 30) throw Error("Tenor KPR harus antara 1 hingga 30 tahun.");
        if (!Number.isFinite(interestRate) || interestRate < 0 || interestRate > 25) throw Error("Suku bunga harus antara 0% hingga 25%.");
        const entry = {
          id: existing?.id || LJ.uid("KPR"),
          name: String(data.name || "").trim(),
          partnerId: String(data.partnerId || "").trim(),
          bankName: String(data.bankName || "").trim() || (linkedPartner ? linkedPartner.name.replace(/\s*\([^)]*\)/, "") : "Bank Rekanan"),
          dpPercent,
          tenorYears,
          interestRate,
          badge: String(data.badge || "").trim(),
          note: String(data.note || "").trim(),
          active: Boolean(data.active),
        };
        if (!entry.name) throw Error("Nama skema KPR wajib diisi.");
        const nextPresets = existing
          ? presets.map((item) => (item.id === existing.id ? entry : item))
          : [...presets, entry];
        LJ.db.paymentConfig = {
          ...cfg,
          kpr: {
            ...cfg.kpr,
            presets: nextPresets,
          },
        };
        await saveToast(existing ? "Program simulasi KPR diperbarui." : "Program simulasi KPR baru ditambahkan.");
      },
      existing ? "Simpan Skema KPR" : "Tambah Skema KPR",
    );
  }
  function entityDelete(key, id) {
    const cfg = LJ.entityConfig()[key],
      record = LJ.db[key].find((x) => x.id === id);
    if (!record) return;
    LJ.confirm(
      "Hapus " + cfg.title + "?",
      `Catatan <strong>${E(record.name || record.title || record.subject || id)}</strong> akan dihapus dari daftar ini.`,
      async () => {
        if (
          key === "projects" &&
          ["units", "leads", "expenses", "promos"].some((k) =>
            LJ.db[k].some((x) => x.project === id),
          )
        )
          throw Error(
            "Proyek masih digunakan oleh unit, leads, promo, atau pengeluaran. Hapus relasinya terlebih dahulu.",
          );
        if (
          key === "units" &&
          ["bookings", "tasks", "reports", "schedules", "offers"].some((k) =>
            LJ.db[k].some((x) => x.unit === id),
          )
        )
          throw Error(
            "Unit memiliki pemesanan atau aktivitas terkait dan tidak dapat dihapus.",
          );
        if (
          key === "employees" &&
          (LJ.db.accounts.some((account) => account.employeeId === id) ||
            ["tasks", "reports", "attendance", "evaluations", "schedules"].some(
              (k) => LJ.db[k].some((x) => x.employee === record.name),
            ))
        )
          throw Error(
            "Identitas karyawan masih terhubung dengan profil atau penugasan. Gunakan status Nonaktif untuk pengarsipan.",
          );
        if (key === "expenses" && record.status === "Disetujui")
          throw Error(
            "Pengeluaran disetujui dipertahankan sebagai riwayat keuangan.",
          );
        LJ.db[key] = LJ.db[key].filter((x) => x.id !== id);
        await saveToast("Data berhasil dihapus.");
      },
    );
  }
  function invoice(id) {
    const p = LJ.db.payments.find((x) => x.id === id);
    if (!p) return;
    const b = LJ.book(p.booking),
      u = LJ.unit(b?.unit),
      project = LJ.project(u?.project);
    LJ.modal(
      p.status === "Terverifikasi"
        ? "Kuitansi pembayaran"
        : "Invoice pembayaran",
      `<div class="invoice"><div class="flex between">${LJ.brand()}<span class="tag blue">DRAF ADMINISTRASI</span></div><div class="divider"></div><div class="flex between"><h2>${p.status === "Terverifikasi" ? "DRAF KUITANSI" : "DRAF INVOICE"}</h2>${LJ.badge(p.status)}</div><div class="invoice-meta"><div><h4>Ditujukan kepada</h4><p>${E(p.client)}<br>${E(project?.name)}<br>${LJ.unitLabel(u?.id)}</p></div><div><h4>${E(p.id)}</h4><p>Pemesanan ${E(b?.id)}<br>Jatuh tempo: ${LJ.date(p.due)}<br>${p.date ? "Tanggal bukti: " + LJ.date(p.date) : ""}</p></div></div>${LJ.table(["Deskripsi", "Jumlah"], [[E(p.kind) + " · " + LJ.unitLabel(u?.id), `<strong>${LJ.money(p.amount)}</strong>`]])}<div class="flex between invoice-total"><strong>Total</strong><strong class="blue">${LJ.money(p.amount)}</strong></div><p class="legal-note u-mt-25">${E(LJ.editorial.draft)} Nominal, penerima, dan dokumen resmi memerlukan konfirmasi perusahaan.</p></div><div class="modal-footer">${B("Unduh ringkasan", "invoice-download", p.id, "secondary", "download")}${B("Cetak / simpan PDF", "print", "", "primary", "print")}</div>`,
      true,
    );
  }
  function paymentVerify(id) {
    const p = LJ.db.payments.find((p) => p.id === id);
    if (!p) return;
    const isAdmin = role() === "admin";
    LJ.modal(
      "Tinjau pembayaran",
      `<div class="notice">${I("info")}Periksa rincian dan lampiran sebelum mencatat hasil peninjauan. Tindakan ini tidak memvalidasi transaksi bank.</div>${LJ.table(
        ["Informasi", "Rincian"],
        [
          ["Klien", E(p.client)],
          ["Pemesanan", E(p.booking)],
          ["Jenis", E(p.kind)],
          ["Jumlah", LJ.money(p.amount)],
          ["Bukti", E(p.proof || "Belum tersedia")],
          ["Status", LJ.badge(p.status)],
        ],
      )}<div class="modal-footer">${p.proof ? B("Lihat bukti", "proof", p.id, "secondary", "eye") : ""}${isAdmin && p.status === "Menunggu verifikasi" ? B("Tolak", "payment-reject", p.id, "danger") + (p.proofData ? B("Catat verifikasi", "payment-approve", p.id, "primary", "check") : "") : ""}</div>`,
    );
  }
  function reportForm(existingId) {
    const existing = LJ.db.reports.find((r) => r.id === existingId),
      employee = LJ.employeeName(),
      us = LJ.db.units.filter(
        (u) =>
          LJ.db.tasks.some((t) => t.unit === u.id && t.employee === employee) &&
          u.sale === "DP terverifikasi" &&
          u.construction === "Dalam pembangunan",
      );
    if (!us.length) {
      LJ.modal(
        "Belum ada unit aktif",
        `<p>Belum ada unit pembangunan yang ditugaskan kepada Anda. Admin perlu memverifikasi DP, memulai pembangunan, dan memberikan penugasan.</p>`,
      );
      return;
    }
    const fields = [
      {
        name: "unit",
        label: "Unit yang dikerjakan",
        type: "select",
        options: us.map((u) => [u.id, LJ.unitLabel(u.id)]),
        required: true,
      },
      { name: "title", label: "Judul laporan", required: true },
      {
        name: "date",
        label: "Tanggal pekerjaan",
        type: "date",
        max: LJ.today(),
        required: true,
        value: LJ.today(),
      },
      {
        name: "stage",
        label: "Tahap pekerjaan",
        type: "select",
        options: [
          "Persiapan",
          "Pondasi",
          "Struktur & dinding",
          "Atap & instalasi",
          "Finishing",
        ],
        required: true,
      },
      {
        name: "progress",
        label: "Progres kumulatif (%)",
        type: "number",
        min: 0,
        max: 100,
        required: true,
      },
      {
        name: "photo",
        label: "Dokumentasi foto",
        type: "file",
        accept: "image/jpeg,image/png,image/webp",
        hint: "Opsional · maks. 2 MB",
      },
      {
        name: "description",
        label: "Hasil pekerjaan",
        type: "textarea",
        wide: true,
        required: true,
      },
      {
        name: "issue",
        label: "Kendala & tindak lanjut",
        type: "textarea",
        wide: true,
        required: true,
      },
    ];
    LJ.formModal(
      existing ? "Revisi laporan pekerjaan" : "Laporan pekerjaan baru",
      fields,
      existing || {
        unit: us[0].id,
        progress: us[0].progress,
        date: LJ.today(),
        stage: us[0].stage,
      },
      async (data) => {
        const u = LJ.unit(data.unit);
        if (!us.some((x) => x.id === u?.id))
          throw Error("Unit tidak termasuk penugasan Anda.");
        const progress = Number(data.progress);
        if (progress < u.progress)
          throw Error(
            "Progres kumulatif tidak boleh di bawah " + u.progress + "%.",
          );
        if (data.date > LJ.today())
          throw Error("Tanggal pekerjaan tidak boleh di masa depan.");
        if (progress === 100 && data.stage !== "Finishing")
          throw Error("Pilih tahap Finishing untuk progres 100%.");
        if (data.photo.size && !data.photo.type.startsWith("image/"))
          throw Error("Dokumentasi pekerjaan harus berupa gambar.");
        const photoData = await LJ.fileData(data.photo);
        delete data.photo;
        const record = {
          ...data,
          progress,
          employee,
          status: "Menunggu persetujuan",
          image: "construction",
          photoData: photoData || existing?.photoData || "",
        };
        if (existing) Object.assign(existing, record);
        else LJ.db.reports.unshift({ id: LJ.uid("RP"), ...record });
        await saveToast(
          "Laporan dicatat untuk peninjauan. Belum ada konfirmasi penerimaan dari penanggung jawab.",
        );
      },
      "Simpan laporan",
      `<div class="demo-note">Persentase kumulatif mengikuti laporan yang telah ditinjau. Lampirkan dokumentasi pekerjaan bila tersedia; gambar referensi tidak menggantikan bukti lapangan.</div>`,
    );
  }
  function reportView(id) {
    const r = LJ.db.reports.find((x) => x.id === id);
    if (!r) return;
    const review = ["admin", "director"].includes(role());
    LJ.modal(
      "Laporan pembangunan",
      `${r.photoDataMime?.startsWith("image/") ? `<img class="proof-preview" src="${r.photoData}" alt="Dokumentasi pekerjaan">` : `<img class="proof-preview" src="${LJ.image(r.image || "construction")}" alt="Referensi konstruksi — bukan dokumentasi unit">`}<div class="flex between u-mt-20">${LJ.badge(r.status)}<small class="muted">${LJ.date(r.date)}</small></div><h3 class="modal-detail-heading">${E(r.title)}</h3><p>${E(r.description)}</p>${LJ.progress(r.progress, LJ.unitLabel(r.unit), r.stage)}<div class="notice u-mt-20">${I("info")}<span><strong>Kendala / tindak lanjut</strong><br>${E(r.issue || "Tidak ada kendala.")}<br>PIC: ${E(r.employee)}</span></div><div class="modal-footer">${review && r.status === "Menunggu persetujuan" ? B("Minta revisi", "report-reject", r.id, "danger") + B("Setujui laporan", "report-approve", r.id, "primary", "check") : r.status === "Perlu revisi" && role() === "employee" ? B("Revisi laporan", "report-edit", r.id, "primary", "edit") : B("Tutup", "close", "", "secondary")}</div>`,
      true,
    );
  }
  const actions = {
    close: () => LJ.closeModal(),
    confirm: () => LJ.runModal(),
    "mobile-nav": () => {
      const nav = document.getElementById("site-navigation");
      setNavigationOpen(nav, !nav.classList.contains("open"));
    },
    sidebar: () => {
      const sidebar = document.getElementById("workspace-sidebar");
      setNavigationOpen(sidebar, !sidebar.classList.contains("open"));
    },
    "sidebar-submenu": (id, toggle) => {
      const submenu = document.getElementById("workspace-submenu");
      const open = submenu.classList.toggle("open");
      submenu.inert = !open;
      submenu.setAttribute("aria-hidden", String(!open));
      toggle.setAttribute("aria-expanded", String(open));
    },
    "brand-story": () =>
      LJ.modal(
        "Selamat datang di LinyJaya.",
        `<img src="${LJ.image("interior")}" alt="Ruang keluarga yang nyaman" class="brand-story-image"><h3>Lebih dari alamat. Tempat untuk bertumbuh.</h3><p class="u-mt-14">Jelajahi kawasan yang terencana, temukan tipe hunian yang sesuai, dan kenali setiap detail sebelum menentukan pilihan. Kami hadir untuk mendampingi langkah Anda menuju rumah.</p><div class="modal-footer">${A("Kenali kami lebih dekat", "tentang", "primary", "arrow")}</div>`,
      ),
    favorite: async (id, el) => {
      const index = LJ.db.favorites.indexOf(id);
      await LJ.setFavorite(id, index < 0);
      el.classList.toggle("active", index < 0);
      el.setAttribute("aria-pressed", index < 0);
      el.setAttribute(
        "aria-label",
        index < 0 ? "Hapus dari favorit" : "Tambahkan ke favorit",
      );
      LJ.toast(
        index < 0
          ? "Proyek disimpan ke favorit."
          : "Proyek dihapus dari favorit.",
      );
    },
    privacy: () =>
      LJ.modal(
        "Kebijakan Privasi",
        LJ.legalDocument("privacy") +
          '<div class="modal-footer">' +
          A(
            "Buka halaman kebijakan",
            "kebijakan-privasi",
            "secondary",
            "arrow",
          ) +
          "</div>",
        true,
      ),
    "contact-info": () =>
      LJ.modal(
        "Terhubung dengan LinyJaya",
        `<p>Diskusikan pilihan kawasan, kebutuhan ruang, dan rencana pembelian bersama tim pemasaran. Kunjungan lokasi tersedia melalui perjanjian.</p><div class="modal-footer">${A("Rencanakan konsultasi", "kontak", "primary", "message")}</div>`,
      ),
    gallery: (id) => {
      if (
        ![
          "hero",
          "house-1",
          "house-2",
          "house-3",
          "interior",
          "construction",
          "neighborhood",
        ].includes(id)
      )
        return;
      LJ.modal(
        "Galeri arsitektur LinyJaya",
        `<img class="gallery-modal-img" src="${LJ.image(id)}" alt="Kurasi visual arsitektur dan pembangunan"><p class="legal-note u-mt-15">Kurasi visual konsep arsitektur dan suasana hunian. Detail desain setiap unit mengikuti spesifikasi proyek.</p>`,
        true,
      );
    },
    "search-mode": (id, el) => {
      document.querySelectorAll(".search-tab").forEach((x) => {
        x.classList.toggle("active", x === el);
        x.setAttribute("aria-selected", x === el);
      });
      document.getElementById("hero-price").value =
        id === "investasi" ? "1000000000" : "";
      LJ.toast(
        id === "investasi"
          ? "Jelajahi properti sesuai anggaran investasi Anda."
          : "Pilih lokasi dan tipe hunian Anda.",
      );
    },
    "reset-filter": () => {
      LJ.filters = {};
      LJ.render();
    },
    "catalog-view": (id) => {
      LJ.catalogView = id;
      LJ.render();
    },
    "logo-upload": () =>
      LJ.formModal(
        "Perbarui logo perusahaan",
        [
          {
            name: "logo",
            label: "Gambar logo",
            type: "file",
            accept: "image/png,image/webp,image/jpeg",
            required: true,
            wide: true,
            hint: "Gunakan PNG transparan, WebP, atau JPG · maksimal 2 MB.",
          },
        ],
        {},
        async (data) => {
          if (!data.logo.type.startsWith("image/"))
            throw Error("Pilih berkas gambar untuk logo.");
          LJ.db.company.logoData = await LJ.fileData(data.logo);
          await saveToast("Logo perusahaan diperbarui.");
          renderedRole = null;
        },
        "Simpan logo",
      ),
    "select-plot": (id) => {
      const u = LJ.unit(id);
      if (!u) return;
      const pm = LJ.calcPaymentDetails(u.price, u);
      const best = LJ.bestPromoForUnit(u);
      const cfg = LJ.paymentConfig();
      LJ.modal(
        "Kavling " + u.block + "-" + u.number + " · Tipe " + u.type,
        `<p class="u-text-12">${E(LJ.project(u.project)?.name)} · ${E(LJ.project(u.project)?.location)}</p>
        <div class="detail-features">
          <div><small>Luas tanah</small><strong>${u.land} m²</strong></div>
          <div><small>Luas bangunan</small><strong>${u.building} m²</strong></div>
          <div><small>Harga jual</small><strong>${LJ.money(u.price, true)}</strong></div>
        </div>
        <div class="sales-kpr-highlight u-mb-12">
          <span class="u-text-10">Estimasi Cicilan KPR:</span>
          <strong>Mulai ${LJ.money(pm.kpr.tenor20th, true)} <small>/ bulan</small></strong>
          ${best.promo ? `<span class="tag green u-float-end">Promo: Hemat ${LJ.money(best.discount, true)}</span>` : cfg.cashLunak.enabled ? `<span class="tag green u-float-end">Cash Lunak s.d. ${cfg.cashLunak.maxTenorMonths} bln</span>` : ""}
        </div>
        <div class="grid two">
          <div><p>Penjualan</p>${LJ.badge(u.sale)}</div>
          <div><p>Pembangunan</p>${LJ.badge(u.construction)}</div>
        </div>
        ${LJ.progress(u.progress, u.stage)}
        <div class="modal-footer">
          ${A("Simulasi Pembayaran", "simulasi?unit=" + encodeURIComponent(id), "secondary", "calculator")}
          ${A("Detail unit", LJ.propertyPage("units", id, role() === "public" ? null : role()), "ghost", "eye")}
          ${u.sale === "Tersedia" ? B("Konsultasi Unit Ini", "consult", u.project + ":" + u.id, "primary", "message") : ""}
        </div>`,
      );
    },
    book: (id, prefill = {}) => {
      const u = LJ.unit(id);
      if (!u || role() !== "client") return;
      const cfg = LJ.paymentConfig();
      const methodOptions = [
        cfg.cashKeras.enabled && [
          "Cash Keras",
          `Cash Keras (DP ${cfg.cashKeras.dpPercent}%, lunas ${cfg.cashKeras.settlementDays} hari)`,
        ],
        cfg.cashLunak.enabled && [
          "Cash Lunak",
          `Cash Lunak (DP ${cfg.cashLunak.dpPercent}%, s.d. ${cfg.cashLunak.maxTenorMonths} bln)`,
        ],
        cfg.kpr.enabled && [
          "KPR",
          `KPR (Estimasi DP ${cfg.kpr.dpPercent}%, bukan persetujuan kredit)`,
        ],
      ].filter(Boolean);
      const initialMethod =
        prefill.method && methodOptions.some(([m]) => m === prefill.method)
          ? prefill.method
          : methodOptions[0]?.[0] || "KPR";
      const allUnitPromos = LJ.promosForUnit(u);
      const promoOptions = [
        [
          "",
          allUnitPromos.length
            ? "Tanpa promo (Harga katalog normal)"
            : "Tidak ada promo aktif untuk unit ini",
        ],
        ...allUnitPromos.map((pr) => [
          pr.id,
          `${pr.name} — Hemat ${LJ.money(LJ.promoDiscount(u.price, pr))} (${LJ.promoMethods(pr).join("/")})`,
        ]),
      ];
      const maxLunak = Math.max(1, Number(cfg.cashLunak.maxTenorMonths || 36));
      const tenorChoices = [6, 12, 18, 24, 30, 36]
        .filter((m) => m <= maxLunak)
        .concat(maxLunak > 36 ? [maxLunak] : []);
      if (!tenorChoices.includes(Number(cfg.cashLunak.tenorMonths))) {
        tenorChoices.push(Number(cfg.cashLunak.tenorMonths));
        tenorChoices.sort((a, b) => a - b);
      }
      const simPreview = LJ.simulatePayment({
        unit: u,
        method: initialMethod,
        promoId: prefill.promoId || "",
        tenorMonths: prefill.tenorMonths || cfg.cashLunak.tenorMonths,
      });

      LJ.formModal(
        "Konsultasi & Pemesanan Unit " + u.block + "-" + u.number,
        [
          {
            name: "payment",
            label: "Metode pembayaran",
            type: "select",
            options: methodOptions,
            required: true,
          },
          {
            name: "tenorMonths",
            label: "Tenor Cash Lunak (bulan, khusus Cash Lunak)",
            type: "select",
            options: tenorChoices.map((m) => [
              String(m),
              `${m} bulan angsuran ke developer`,
            ]),
            required: false,
          },
          {
            name: "promoId",
            label: "Promo aktif yang digunakan (opsional)",
            type: "select",
            options: promoOptions,
            required: false,
            wide: true,
          },
          {
            name: "note",
            label: "Catatan kebutuhan / waktu survei",
            type: "textarea",
            wide: true,
          },
          {
            name: "consent",
            label:
              "Saya mengajukan pemesanan unit ini di LinyJaya Property (simulasi KPR bersifat estimasi).",
            type: "checkbox",
            required: true,
            wide: true,
          },
        ],
        {
          payment: initialMethod,
          tenorMonths: String(prefill.tenorMonths || cfg.cashLunak.tenorMonths),
          promoId: prefill.promoId || "",
        },
        async (data) => {
          if (!data.consent)
            throw Error(
              "Konfirmasikan pengajuan Anda sebelum melanjutkan.",
            );
          await LJ.bookUnit(id, data.note, data.payment, data.consent, {
            promoId: data.promoId || undefined,
            tenorMonths:
              data.payment === "Cash Lunak"
                ? Number(data.tenorMonths || cfg.cashLunak.tenorMonths)
                : undefined,
          });
          LJ.toast(
            "Permohonan pemesanan berhasil dicatat. Jadwal DP dan rincian simulasi tersimpan di portal klien.",
          );
          openPage("client/bookings");
        },
        "Ajukan Pemesanan Unit",
        `<div class="notice">${I("home")}<span><strong>${E(LJ.project(u.project)?.name)} · ${LJ.unitLabel(id)}</strong><br>Klien: ${E(LJ.db.profile.name)}<br>Harga katalog: ${LJ.money(u.price)}${simPreview.discountAmount > 0 ? ` · Potongan promo: -${LJ.money(simPreview.discountAmount)}` : ""} · Perkiraan DP awal: ${LJ.money(simPreview.dpAmount)}. Ketentuan final mengikuti dokumen resmi perusahaan.</span></div>`,
      );
    },
    "book-from-sim": (id) => {
      const cur = LJ.currentSimulation;
      if (cur?.unit?.id === id && cur?.sim) {
        actions.book(id, {
          method: cur.sim.method,
          promoId: cur.sim.promo?.id || "",
          tenorMonths: cur.sim.tenorMonths,
        });
      } else {
        actions.book(id);
      }
    },
    "consult-from-sim": (id) => {
      const cur = LJ.currentSimulation;
      const suffix =
        cur?.sim?.method === "Cash Keras"
          ? ":cash-keras"
          : cur?.sim?.method === "Cash Lunak"
            ? ":cash-lunak"
            : ":kpr";
      actions.consult(id + suffix);
    },
    interest: (id) => {
      actions.consult(id);
    },
    "consult-payment": (id) => {
      actions.consult(id);
    },
    "consult-unit": (id) => {
      actions.consult(id);
    },
    "consult-survey": (id) => {
      actions.consult(id.includes(":survey") ? id : id + ":survey");
    },
    "consult-sales": () => {
      actions.consult("");
    },
    consult: (id, selectedUnit) => {
      let projectId = "";
      let unitId = "";
      let initialTopic = "Konsultasi Pembelian & Simulasi Angsuran";
      let initialPayment = "Cash Lunak";

      if (typeof id === "string" && id.includes(":")) {
        const parts = id.split(":");
        if (parts.length === 2 && parts[0].startsWith("P") && parts[1].startsWith("U")) {
          projectId = parts[0];
          unitId = parts[1];
        } else if (parts.length >= 3) {
          projectId = parts[0];
          unitId = parts[1];
          const mode = parts[2];
          if (mode === "survey") initialTopic = "Survei Lokasi & Unit Makassar";
          else if (mode === "cash-keras") initialPayment = "Cash Keras";
          else if (mode === "cash-lunak" || mode === "cash-bertahap") initialPayment = "Cash Lunak";
          else if (mode === "kpr") initialPayment = "KPR";
        } else if (parts[0].startsWith("U")) {
          unitId = parts[0];
          const uRecord = LJ.unit(unitId);
          if (uRecord) projectId = uRecord.project;
          if (parts[1] === "cash-keras") initialPayment = "Cash Keras";
          else if (parts[1] === "cash-lunak" || parts[1] === "cash-bertahap") initialPayment = "Cash Lunak";
          else if (parts[1] === "kpr") initialPayment = "KPR";
        }
      } else if (typeof id === "string" && id.startsWith("U")) {
        unitId = id;
        const uRecord = LJ.unit(unitId);
        if (uRecord) projectId = uRecord.project;
      } else if (typeof id === "string" && id.startsWith("P")) {
        projectId = id;
      }

      if (selectedUnit?.id) {
        unitId = selectedUnit.id;
        projectId = selectedUnit.project || projectId;
      }

      const p = projectId ? LJ.project(projectId) : null;
      const unit = unitId ? LJ.unit(unitId) : null;
      const cfg = LJ.paymentConfig();
      const paymentChoices = [
        cfg.cashKeras.enabled && ["Cash Keras", "Cash Keras (Pembayaran penuh)"],
        cfg.cashLunak.enabled && ["Cash Lunak", `Cash Lunak (Bertahap s.d. ${cfg.cashLunak.maxTenorMonths} bln ke Developer)`],
        cfg.kpr.enabled && ["KPR", "KPR (Pembiayaan bank, simulasi estimasi)"],
        ["Konsultasi & Simulasi Khusus", "Konsultasi & Simulasi Khusus (Minta saran tim)"],
      ].filter(Boolean);
      const waMsg = "Halo Tim LinyJaya Property Makassar, saya ingin konsultasi mengenai " +
        (unit ? "Rumah " + unit.block + "-" + unit.number + " (" + unit.type + ") di " : "") +
        (p ? p.name : "hunian LinyJaya Property") +
        (unit ? " dengan harga " + LJ.money(unit.price) : "") +
        ". Rencana metode bayar: " + initialPayment + ".";

      LJ.formModal(
        "Konsultasi Hunian & Simulasi Pembelian",
        [
          { name: "name", label: "Nama lengkap", required: true },
          {
            name: "phone",
            label: "Nomor WhatsApp / Telepon",
            type: "tel",
            required: true,
          },
          { name: "email", label: "Alamat Email", type: "email", required: true },
          {
            name: "payment",
            label: "Pilihan metode pembayaran yang diminati",
            type: "select",
            options: paymentChoices,
            required: true,
          },
          {
            name: "topic",
            label: "Topik utama konsultasi",
            type: "select",
            options: [
              "Konsultasi Pembelian & Simulasi Angsuran",
              "Survei Lokasi & Unit Makassar",
              "Pilihan Unit Kavling & Promo Aktif",
              "Konsultasi Estimasi KPR",
            ],
            required: true,
          },
          {
            name: "date",
            label: "Rencana tanggal konsultasi / survei",
            type: "date",
            min: LJ.today(),
            required: true,
          },
          {
            name: "notes",
            label: "Catatan kebutuhan atau pertanyaan",
            type: "textarea",
            wide: true,
            required: false,
          },
        ],
        role() === "client"
          ? {
              name: LJ.db.profile.name,
              email: LJ.db.profile.email,
              phone: LJ.db.profile.phone,
              payment: initialPayment,
              topic: initialTopic,
              date: LJ.today(),
            }
          : {
              payment: initialPayment,
              topic: initialTopic,
              date: LJ.today(),
            },
        async (data) => {
          await saveConsultation({
            name: data.name,
            phone: data.phone,
            email: data.email,
            date: data.date,
            notes: (data.notes ? data.notes + " | " : "") + "Metode: " + data.payment + " | Topik: " + data.topic,
          }, {
            project: p?.id || "",
            interest: unit
              ? "Minat Unit " + LJ.unitLabel(unit.id) + " (" + data.payment + ")"
              : "Konsultasi " + data.topic,
            unit: unit?.id || "",
          });
        },
        "Kirim Permohonan Konsultasi",
        `<div class="consult-sales-modal-header">
          <div class="consult-unit-badge">${I("home")} <strong>${unit ? "Unit " + unit.block + "-" + unit.number + " (" + unit.type + ")" : (p ? E(p.name) : "Konsultasi Hunian LinyJaya Property")}</strong> ${p && unit ? "· " + E(p.name) : ""} ${unit ? "· <span class='blue'>" + LJ.money(unit.price, true) + "</span>" : ""}</div>
          <p class="u-text-11 u-mt-6">Layanan konsultasi hunian Makassar dan simulasi pembayaran bersama tim LinyJaya Property.</p>
          <div class="u-mt-10 u-mb-14">
            <a href="${LJ.whatsappLink(waMsg)}" target="_blank" rel="noopener noreferrer" class="btn whatsapp small full">
              ${I("whatsapp")} Respon Cepat: Chat via WhatsApp
            </a>
          </div>
        </div>`,
      );
    },
    "entity-add": (key) => entityForm(key),
    "entity-edit": (id) => {
      const [key, recordId] = id.split(":");
      entityForm(key, recordId);
    },
    "entity-delete": (id) => {
      const [key, recordId] = id.split(":");
      entityDelete(key, recordId);
    },
    "kpr-preset-add": () => kprPresetForm(),
    "kpr-preset-edit": (id) => kprPresetForm(id),
    "kpr-preset-toggle": async (id) => {
      const cfg = LJ.paymentConfig();
      const presets = (cfg.kpr.presets || []).map((item) =>
        item.id === id ? { ...item, active: item.active === false } : item,
      );
      LJ.db.paymentConfig = { ...cfg, kpr: { ...cfg.kpr, presets } };
      await saveToast("Status skema simulasi KPR diperbarui.");
      LJ.render();
    },
    "kpr-preset-delete": (id) => {
      const cfg = LJ.paymentConfig();
      const target = (cfg.kpr.presets || []).find((item) => item.id === id);
      if (!target) return;
      LJ.confirm(
        "Hapus skema simulasi KPR?",
        `Skema <strong>${E(target.name)}</strong> akan dihapus dari pilihan kalkulator simulasi.`,
        async () => {
          LJ.db.paymentConfig = {
            ...cfg,
            kpr: {
              ...cfg.kpr,
              presets: (cfg.kpr.presets || []).filter((item) => item.id !== id),
            },
          };
          await saveToast("Skema simulasi KPR dihapus.");
        },
      );
    },
    "entity-view": (id) => {
      const [key, recordId] = id.split(":"),
        cfg = LJ.entityConfig()[key],
        x = LJ.db[key]?.find((x) => x.id === recordId);
      if (!x) return;
      LJ.modal(
        "Detail " + cfg.title,
        LJ.table(
          ["Informasi", "Rincian"],
          cfg.fields.map((f) => [
            f.label,
            E(Array.isArray(x[f.name]) ? x[f.name].join(", ") : x[f.name]),
          ]),
        ),
      );
    },
    "unit-view": (id) => {
      const u = LJ.unit(id);
      if (!u) return;
      LJ.modal(
        "Unit " + u.block + "-" + u.number,
        `${LJ.blueprint(u.type)}<div class="detail-features"><div><small>Tanah / bangunan</small><strong>${u.land} / ${u.building} m²</strong></div><div><small>Harga</small><strong>${LJ.money(u.price, true)}</strong></div></div><div class="flex wrap">${LJ.badge(u.sale)}${LJ.badge(u.construction)}</div>${LJ.progress(u.progress, u.stage)}<div class="modal-footer">${A("Buka detail lengkap", LJ.propertyPage("units", id, role() === "public" ? null : role()), "secondary", "arrow")}${u.sale === "Tersedia" ? B("Konsultasi Pembelian", "consult", u.project + ":" + u.id, "primary", "message") : ""}</div>`,
        true,
      );
    },
    "booking-view": (id) => {
      const b = LJ.book(id),
        u = LJ.unit(b?.unit);
      if (!b) return;
      const netPrice = Number(b.contractPrice ?? b.finalPrice ?? u?.price ?? 0);
      LJ.modal(
        "Detail pemesanan",
        LJ.table(
          ["Informasi", "Rincian"],
          [
            ["Pemesanan", E(b.id)],
            ["Klien", E(b.client)],
            ["Proyek", E(LJ.project(u?.project)?.name)],
            ["Unit", LJ.unitLabel(b.unit)],
            ["Harga katalog", LJ.money(u?.price || 0)],
            ...(b.promoName
              ? [
                  ["Promo diterapkan", `${E(b.promoName)} (-${LJ.money(b.discountAmount || 0)})`],
                ]
              : []),
            ["Harga bersih", `<strong>${LJ.money(netPrice)}</strong>`],
            ["Tanggal", LJ.date(b.date)],
            [
              "Metode pembayaran",
              E((b.paymentMethod || "Belum tercatat") + (b.tenorMonths ? ` (${b.tenorMonths} bulan)` : "")),
            ],
            ["Status", LJ.badge(b.status)],
            ["Catatan", E(b.note || "—")],
          ],
        ) +
          `<div class="divider"></div><h3 class="u-mb-15">Jadwal pembayaran</h3>${LJ.paymentTable(
            LJ.db.payments.filter((p) => p.booking === b.id),
            role(),
          )}`,
        true,
      );
    },
    "booking-cancel": (id) =>
      LJ.confirm(
        "Batalkan pemesanan?",
        "Unit akan tersedia kembali jika pembayaran belum diajukan atau diverifikasi.",
        async () => {
          if (await LJ.cancelBooking(id))
            LJ.toast(
              "Catatan pemesanan dibatalkan. Ketentuan perjanjian resmi tetap berlaku.",
            );
        },
      ),
    "construction-start": (id) =>
      LJ.confirm(
        "Mulai pembangunan?",
        "DP telah diverifikasi. Unit akan masuk tahap persiapan dengan progres awal 5%.",
        async () => {
          if (await LJ.startConstruction(id))
            LJ.toast(
              "Tahap persiapan dicatat. Jadwal pelaksanaan memerlukan konfirmasi penanggung jawab proyek.",
            );
        },
      ),
    handover: (id) =>
      LJ.confirm(
        "Konfirmasi serah terima",
        "Pembangunan harus 100% dan seluruh pembayaran terverifikasi. Draf berita acara akan tersedia untuk peninjauan.",
        async () => {
          if (await LJ.handover(id))
            LJ.toast(
              "Catatan serah terima diperbarui. Pengesahan tetap mengacu pada berita acara resmi.",
            );
        },
      ),
    invoice: invoice,
    print: () => window.print(),
    "invoice-download": (id) => {
      const p = LJ.db.payments.find((x) => x.id === id);
      LJ.download(
        "LinyJaya-" + id + ".txt",
        `DRAF ADMINISTRASI — UNTUK PENINJAUAN\nLinyJaya Property Makassar\n${p.id}\nKlien: ${p.client}\nJenis: ${p.kind}\nJumlah: ${LJ.money(p.amount)}\nJatuh tempo: ${LJ.date(p.due)}\nStatus: ${p.status}\nUnit: ${LJ.unitLabel(LJ.book(p.booking)?.unit)}`,
      );
      LJ.toast("Ringkasan pembayaran disiapkan untuk diunduh.");
    },
    proof: (id) => {
      const p = LJ.db.payments.find((x) => x.id === id);
      if (!p) return;
      LJ.modal(
        "Bukti pembayaran",
        `<div class="notice">${I("file")}<span>${E(p.proof || "Tidak ada bukti")}<br>Referensi: ${E(p.reference || "Belum dilengkapi")}</span></div>${p.proofDataMime?.startsWith("image/") ? `<img class="proof-preview" src="${p.proofData}" alt="Bukti pembayaran yang dipilih">` : p.proofDataMime === "application/pdf" ? `<object data="${p.proofData}" type="application/pdf" width="100%" height="350"><p>Tinjauan PDF tidak tersedia. Gunakan unduhan bukti.</p></object>` : `<div class="invoice"><h3>LAMPIRAN BELUM TERSEDIA</h3><p class="u-mt-20">${E(p.client)} · ${E(p.kind)}</p><h2 class="blue modal-detail-amount">${LJ.money(p.amount)}</h2><p>Nama lampiran tercantum dalam catatan, tetapi berkas aslinya belum tersedia untuk ditinjau.</p></div>`}${p.proofData ? `<div class="modal-footer">${B("Unduh lampiran", "proof-download", id, "secondary", "download")}</div>` : ""}`,
      );
    },
    "proof-download": (id) => {
      const p = LJ.db.payments.find((x) => x.id === id);
      if (!p?.proofData) return;
      const a = document.createElement("a");
      a.href = p.proofData;
      a.download = p.proof;
      a.click();
    },
    "pay-upload": (id) => {
      const p = LJ.db.payments.find((x) => x.id === id);
      if (!p) return;
      LJ.formModal(
        "Ajukan bukti pembayaran",
        [
          {
            name: "reference",
            label: "Referensi pembayaran",
            required: true,
            wide: true,
          },
          {
            name: "proof",
            label: "Berkas bukti",
            type: "file",
            required: true,
            wide: true,
            hint: "JPG, PNG, WebP, atau PDF · maksimal 2 MB",
          },
        ],
        {},
        async (data) => {
          const proofData = await LJ.fileData(data.proof);
          await LJ.submitPayment(id, data.proof.name, data.reference, proofData);
          LJ.toast(LJ.editorial.paymentResult);
        },
        "Tambahkan ke catatan",
        `<div class="notice">${I("wallet")}<span>${E(p.kind)} · ${LJ.money(p.amount)}<br>Pilih lampiran untuk catatan peninjauan. Tindakan ini bukan pembayaran dan tidak mengonfirmasi dana diterima.</span></div>`,
      );
    },
    "payment-verify": paymentVerify,
    "payment-approve": async (id) => {
      const saved = await LJ.verifyPayment(id, true);
      LJ.closeModal();
      LJ.render();
      if (saved)
        LJ.toast(
          "Hasil peninjauan dicatat. Status tagihan diperbarui. Konfirmasi penerimaan dana tetap mengikuti catatan bank dan perusahaan.",
        );
    },
    "payment-reject": async (id) => {
      const saved = await LJ.verifyPayment(id, false);
      LJ.closeModal();
      LJ.render();
      if (saved)
        LJ.toast(
          "Hasil peninjauan dicatat: perlu perbaikan bukti. Lampiran pengganti dapat ditambahkan.",
        );
    },
    "payment-new": () => {
      const bs = LJ.db.bookings.filter((b) => b.status === "DP terverifikasi");
      if (!bs.length) {
        LJ.toast("Belum ada pemesanan dengan DP terverifikasi.", "error");
        return;
      }
      LJ.formModal(
        "Tambah tagihan termin",
        [
          {
            name: "booking",
            label: "Pemesanan",
            type: "select",
            options: bs.map((b) => [
              b.id,
              b.client + " · " + LJ.unitLabel(b.unit),
            ]),
            required: true,
            wide: true,
          },
          {
            name: "kind",
            label: "Jenis tagihan",
            type: "select",
            options: ["Termin 2", "Termin 3", "Pelunasan"],
            required: true,
          },
          {
            name: "amount",
            label: "Jumlah (Rp)",
            type: "number",
            min: 1,
            required: true,
          },
          { name: "due", label: "Jatuh tempo", type: "date", required: true },
        ],
        {},
        async (data) => {
          const b = LJ.book(data.booking),
            u = LJ.unit(b?.unit);
          const contractTarget = Number(b.contractPrice ?? b.finalPrice ?? u.price);
          const billed = LJ.db.payments
            .filter((p) => p.booking === b.id && p.status !== "Dibatalkan")
            .reduce((s, p) => s + p.amount, 0);
          if (Number(data.amount) > contractTarget - billed)
            throw Error(
              "Sisa yang belum ditagihkan: " + LJ.money(Math.max(0, contractTarget - billed)),
            );
          LJ.db.payments.push({
            id: LJ.uid("PAY"),
            ...data,
            amount: Number(data.amount),
            client: b.client,
            status: "Belum dibayar",
            date: "",
            proof: "",
          });
          await saveToast("Tagihan termin dibuat.");
        },
        "Buat tagihan",
      );
    },
    "report-new": () => reportForm(),
    "report-edit": (id) => reportForm(id),
    "report-view": reportView,
    "report-approve": async (id) => {
      const saved = await LJ.approveReport(id, true);
      LJ.closeModal();
      LJ.render();
      if (saved)
        LJ.toast(
          "Hasil peninjauan dicatat. Ringkasan progres dan urutan tahapan diperbarui.",
        );
    },
    "report-reject": async (id) => {
      const saved = await LJ.approveReport(id, false);
      LJ.closeModal();
      LJ.render();
      if (saved) LJ.toast("Catatan peninjauan diperbarui: Perlu revisi.");
    },
    "task-view": (id) => {
      const t = LJ.db.tasks.find((t) => t.id === id);
      if (!t) return;
      LJ.modal(
        "Detail penugasan",
        `<div class="flex between">${LJ.badge(t.priority)}${LJ.badge(t.status)}</div><h3 class="modal-detail-heading">${E(t.title)}</h3><p>${E(t.description)}</p><div class="divider"></div>${LJ.table(
          ["Informasi", "Rincian"],
          [
            ["Unit", LJ.unitLabel(t.unit)],
            ["PIC", E(t.employee)],
            ["Deadline", LJ.date(t.deadline)],
          ],
        )}<div class="modal-footer">${t.status === "Baru" ? B("Mulai kerjakan", "task-start", id, "primary", "play") : t.status === "Dikerjakan" ? B("Tandai selesai", "task-finish", id, "primary", "check") : ""}${role() === "employee" ? B("Buat laporan", "report-new", "", "secondary", "file") : ""}</div>`,
      );
    },
    "task-start": async (id) => {
      await LJ.workflow("task-progress", { id, status: "Dikerjakan" });
      LJ.toast("Status tugas: Dikerjakan.");
      LJ.closeModal();
      LJ.render();
    },
    "task-finish": async (id) => {
      await LJ.workflow("task-progress", { id, status: "Selesai" });
      LJ.toast("Tugas selesai. Lengkapi laporan pekerjaan Anda.");
      LJ.closeModal();
      LJ.render();
    },
    "project-review": (id) => {
      const p = LJ.project(id);
      LJ.formModal(
        "Peninjauan proyek",
        [
          {
            name: "status",
            label: "Status proyek",
            type: "select",
            options: ["Perencanaan", "Pemasaran", "Pembangunan", "Selesai"],
            required: true,
          },
          {
            name: "evaluation",
            label: "Catatan evaluasi / persetujuan",
            type: "textarea",
            required: true,
            wide: true,
          },
        ],
        p,
        async (data) => {
          Object.assign(p, data);
          await saveToast("Proyek ditinjau dan evaluasi disimpan.");
        },
        "Simpan keputusan",
      );
    },
    "expense-review": (id) => {
      const e = LJ.db.expenses.find((x) => x.id === id);
      if (!e) return;
      LJ.modal(
        "Peninjauan anggaran",
        `<h3>${E(e.title)}</h3><h2 class="blue modal-detail-amount">${LJ.money(e.amount)}</h2><p>${E(e.description)}</p><p class="u-mt-15">${E(LJ.project(e.project)?.name)} · ${LJ.date(e.date)}</p><div class="u-mt-20">${LJ.badge(e.status)}</div><div class="modal-footer">${e.status === "Menunggu persetujuan" && role() === "director" ? B("Tolak", "expense-reject", id, "danger") + B("Setujui anggaran", "expense-approve", id, "primary", "check") : ""}</div>`,
      );
    },
    "expense-approve": async (id) => {
      const e = LJ.db.expenses.find((x) => x.id === id);
      if (e.status !== "Menunggu persetujuan")
        throw Error("Anggaran sudah diproses.");
      e.status = "Disetujui";
      await saveToast("Catatan keputusan anggaran diperbarui: Disetujui.");
      LJ.closeModal();
      LJ.render();
    },
    "expense-reject": async (id) => {
      const e = LJ.db.expenses.find((x) => x.id === id);
      e.status = "Ditolak";
      await saveToast("Catatan keputusan anggaran diperbarui: Ditolak.");
      LJ.closeModal();
      LJ.render();
    },
    document: (id) => {
      const doc = LJ.db.documents.find((x) => x.id === id),
        b = LJ.book(doc?.booking),
        u = LJ.unit(b?.unit);
      if (!doc) return;
      const preview = doc.fileDataMime?.startsWith("image/")
        ? `<img class="proof-preview" src="${doc.fileData}" alt="Dokumen yang diunggah">`
        : doc.fileDataMime === "application/pdf"
          ? `<object data="${doc.fileData}" type="application/pdf" width="100%" height="350"><p>Gunakan cetak atau berkas asli untuk melihat PDF.</p></object>`
          : doc.kind === "Teknis"
            ? LJ.blueprint(u.type)
            : `<p>Ringkasan ini menghubungkan identitas klien dengan unit dalam catatan pemesanan. Spesifikasi, pembayaran, hak, kewajiban, dan jadwal perlu dituangkan dalam dokumen resmi yang disepakati para pihak.</p>`;
      LJ.modal(
        "Preview dokumen",
        `<div class="invoice"><span class="tag blue">DRAF DOKUMEN</span><h2 class="invoice-document-title">${E(doc.title)}</h2><p>${E(doc.id)} · ${LJ.date(doc.date)}</p><div class="u-mt-12">${LJ.badge(doc.status)}</div><div class="divider"></div><p>Klien: ${E(doc.client)}<br>Proyek: ${E(LJ.project(u?.project)?.name)}<br>Unit: ${LJ.unitLabel(u?.id)}</p><div class="divider"></div>${preview}<p class="legal-note u-mt-25">Draf ini belum merupakan dokumen yang diterbitkan atau ditandatangani perusahaan. Status pencatatan tidak menggantikan pengesahan resmi.</p></div><div class="modal-footer">${role() === "director" && doc.status === "Menunggu persetujuan" ? B("Tolak", "document-reject", id, "danger") + B("Setujui dokumen", "document-approve", id, "primary", "check") : B("Cetak / simpan PDF", "print", "", "primary", "print")}</div>`,
        true,
      );
    },
    "document-new": () => {
      const bs = LJ.db.bookings.filter((b) => b.status !== "Dibatalkan");
      LJ.formModal(
        "Tambahkan dokumen client",
        [
          {
            name: "booking",
            label: "Pemesanan",
            type: "select",
            options: bs.map((b) => [
              b.id,
              b.client + " · " + LJ.unitLabel(b.unit),
            ]),
            required: true,
            wide: true,
          },
          { name: "title", label: "Judul dokumen", required: true },
          {
            name: "kind",
            label: "Jenis dokumen",
            type: "select",
            options: ["Perjanjian", "Administrasi", "Teknis", "Serah terima"],
            required: true,
          },
          {
            name: "file",
            label: "Berkas dokumen",
            type: "file",
            wide: true,
            hint: "Opsional · PDF, JPG, PNG, WebP · maksimal 2 MB.",
          },
        ],
        {},
        async (data) => {
          const fileData = await LJ.fileData(data.file);
          delete data.file;
          const b = LJ.book(data.booking);
          if (!b) throw Error("Pilih pemesanan aktif.");
          LJ.db.documents.unshift({
            id: LJ.uid("DOC"),
            ...data,
            client: b.client,
            date: LJ.today(),
            status: "Menunggu persetujuan",
            fileData,
          });
          await saveToast("Draf dokumen dicatat untuk peninjauan pimpinan.");
        },
        "Ajukan dokumen",
      );
    },
    "document-approve": async (id) => {
      const doc = LJ.db.documents.find((x) => x.id === id);
      doc.status = "Disetujui";
      await saveToast("Hasil peninjauan dokumen dicatat: Disetujui.");
      LJ.closeModal();
      LJ.render();
    },
    "document-reject": async (id) => {
      const doc = LJ.db.documents.find((x) => x.id === id);
      doc.status = "Ditolak";
      await saveToast("Hasil peninjauan dokumen dicatat: Ditolak.");
      LJ.closeModal();
      LJ.render();
    },
    "ticket-new": () =>
      LJ.formModal(
        "Permintaan layanan",
        [
          { name: "title", label: "Judul permintaan", required: true },
          {
            name: "category",
            label: "Kategori",
            type: "select",
            options: [
              "Konsultasi marketing",
              "Pertanyaan",
              "Komplain",
              "Perubahan desain",
            ],
            required: true,
          },
          {
            name: "message",
            label: "Detail permintaan",
            type: "textarea",
            wide: true,
            required: true,
          },
        ],
        {},
        async (data) => {
          LJ.db.tickets.unshift({
            id: LJ.uid("TK"),
            ...data,
            client: LJ.db.profile.name,
            date: LJ.today(),
            status: "Baru",
            reply: "",
          });
          await saveToast(
            "Draf permintaan dicatat. Belum ada konfirmasi penanganan dari tim.",
          );
        },
        "Buat permintaan",
      ),
    "ticket-reply": (id) => {
      const t = LJ.db.tickets.find((x) => x.id === id);
      LJ.formModal(
        "Tanggapi permintaan",
        [
          {
            name: "status",
            label: "Status keputusan",
            type: "select",
            options: ["Baru", "Diproses", "Disetujui", "Ditolak", "Selesai"],
            required: true,
          },
          {
            name: "reply",
            label: "Tanggapan untuk client",
            type: "textarea",
            wide: true,
            required: true,
          },
        ],
        t,
        async (data) => {
          Object.assign(t, data);
          await saveToast("Catatan tanggapan diperbarui pada rincian permintaan.");
        },
        "Simpan tanggapan",
      );
    },
    "message-reply": (id) => {
      const m = LJ.db.messages.find((x) => x.id === id);
      if (!m) return;
      LJ.formModal(
        "Tanggapi pesan internal",
        [
          {
            name: "status",
            label: "Status pesan",
            type: "select",
            options: ["Baru", "Diproses", "Selesai"],
            required: true,
          },
          {
            name: "reply",
            label: "Tanggapan",
            type: "textarea",
            wide: true,
            required: false,
          },
        ],
        m,
        async (data) => {
          Object.assign(m, data);
          await saveToast("Pesan internal diperbarui.");
        },
        "Simpan tanggapan",
      );
    },
    "client-view": (id) => {
      const profile = LJ.db.clients.find((client) => String(client.id) === id);
      if (!profile) return;
      const bs = LJ.db.bookings.filter((b) => b.clientId === profile.id);
      LJ.modal(
        "Profil client",
        `<h3>${E(profile.name)}</h3><p class="modal-client-contact">${E([profile.email, profile.phone].filter(Boolean).join(" · ") || "Kontak klien perlu dikonfirmasi")}</p>${LJ.bookingTable(bs, "admin")}`,
        true,
      );
    },
    attendance: async () => {
      const alreadyIn = LJ.db.attendance.some((record) => record.date === LJ.today());
      await LJ.workflow("attendance");
      LJ.toast(alreadyIn ? "Check-out dicatat." : "Check-in dicatat.");
      LJ.render();
    },
    "leave-new": () =>
      LJ.formModal(
        "Pengajuan izin / cuti",
        [
          {
            name: "date",
            label: "Tanggal",
            type: "date",
            min: LJ.today(),
            required: true,
          },
          {
            name: "kind",
            label: "Jenis",
            type: "select",
            options: ["Izin", "Cuti", "Sakit"],
            required: true,
          },
          {
            name: "reason",
            label: "Alasan",
            type: "textarea",
            wide: true,
            required: true,
          },
        ],
        {},
        async (data) => {
          LJ.db.leave.unshift({
            id: LJ.uid("LV"),
            ...data,
            employee: LJ.employeeName(),
            status: "Menunggu persetujuan",
          });
          await saveToast("Pengajuan izin disimpan.");
        },
        "Ajukan izin",
      ),
    "leave-review": (id) => {
      const leave = LJ.db.leave.find((x) => x.id === id);
      LJ.formModal(
        "Peninjauan izin / cuti",
        [
          {
            name: "status",
            label: "Keputusan",
            type: "select",
            options: ["Disetujui", "Ditolak"],
            required: true,
          },
        ],
        {},
        async (data) => {
          leave.status = data.status;
          await saveToast("Pengajuan izin " + data.status.toLowerCase() + ".");
        },
        "Simpan keputusan",
        `<div class="notice">${I("calendar")}<span>${E(leave.employee)} · ${LJ.date(leave.date)}<br>${E(leave.kind)}: ${E(leave.reason)}</span></div>`,
      );
    },
    notifications: () => {
      const roleName = LJ.roles[role()]?.name;
      const preferences =
        role() === "client"
          ? LJ.db.profile
          : role() === "employee"
            ? LJ.employee()
            : null;
      if (
        !LJ.db.settings.notifications ||
        preferences?.notifications === false
      ) {
        LJ.modal(
          "Notifikasi",
          `<p>Notifikasi dinonaktifkan. Aktifkan kembali melalui preferensi profil atau konfigurasi Administrator.</p>`,
          false,
          "notification",
        );
        return;
      }
      const ns = LJ.db.notifications.filter(
        (n) =>
          (!roleName || n.role === roleName) &&
          (role() !== "client" || !n.client || n.client === LJ.db.profile.name),
      );
      LJ.modal(
        "Notifikasi workspace",
        ns.length
          ? ns
              .map(
                (n) =>
                  `<div class="activity"><span class="icon-tile">${I("bell")}</span><div><strong>${E(n.title)}</strong><p>${E(n.message)}</p><p>${LJ.date(n.date)} · ${E(n.status)}</p></div></div>`,
              )
              .join("") +
              `<div class="modal-footer">${B("Tandai sudah dibaca", "notifications-read", "", "secondary", "check")}</div>`
          : LJ.empty(
              "Anda sudah mengikuti semuanya",
              "Pembaruan kegiatan akan tampil saat ada catatan baru.",
            ),
        false,
        "notification",
      );
    },
    "profile-dropdown": () => {
      const current = role();
      const r = LJ.roles[current] || {
        name: "Pengunjung",
        folder: "public",
        person: "Tamu",
      };
      const personName =
        current === "client" ? LJ.db.profile.name : r.person || "Pengguna";
      const initials = personName
        .split(" ")
        .map((s) => s[0])
        .slice(0, 2)
        .join("");
      const email = LJ.user?.email || "";
      const phone = LJ.db.profile.phone || "Belum dilengkapi";
      const html = `<div class="profile-popover-card">
        <div class="profile-popover-header">
          <span class="avatar avatar--large">${E(initials)}</span>
          <div class="profile-popover-meta">
            <span class="badge badge--role">${r.name.toUpperCase()}</span>
            <h4>${E(personName)}</h4>
            <small>${E(email)}</small>
          </div>
        </div>
        <div class="profile-popover-body">
          <div class="profile-popover-detail">
            <div><span class="muted">Telepon:</span> <strong>${E(phone)}</strong></div>
            <div><span class="muted">Status Akses:</span> <span class="status active">Aktif</span></div>
          </div>
          <div class="profile-popover-nav">
            ${
              current === "client"
                ? `<a href="client/profile" class="profile-nav-link">${I("user")}<span>Profil & Akun Klien</span></a>`
                : current === "employee"
                  ? `<a href="karyawan/profile" class="profile-nav-link">${I("user")}<span>Profil & Jam Kerja</span></a>`
                  : current === "admin"
                    ? `<a href="admin/settings" class="profile-nav-link">${I("settings")}<span>Pengaturan Ruang Kerja</span></a>`
                    : `<a href="pimpinan" class="profile-nav-link">${I("chart")}<span>Ringkasan Eksekutif</span></a>`
            }
            <button type="button" class="profile-nav-link" data-action="notifications">${I("bell")}<span>Notifikasi Sistem (${LJ.db.notifications.filter((n) => n.status === "Baru").length})</span></button>
            <button type="button" class="profile-nav-link" data-action="global-search">${I("search")}<span>Pencarian Cepat</span></button>
            <button type="button" class="profile-nav-link" data-action="theme-toggle">${I(LJ.getTheme?.() === "dark" ? "sun" : "moon")}<span>${LJ.getTheme?.() === "dark" ? "Beralih ke Mode Terang" : "Beralih ke Mode Gelap"}</span></button>
          </div>
        </div>
        <div class="profile-popover-footer">
          <a href="./" class="btn secondary small">${I("external")}Kembali ke website</a>
          <form id="logout-form" action="${LJ.endpoints.logout}" method="post"><input type="hidden" name="_token" value="${LJ.bootstrap.csrf}"><button class="btn danger small" type="submit">Keluar</button></form>
        </div>
      </div>`;
      LJ.modal("Profil Pengguna", html, false, "profile");
    },
    "theme-toggle": () => {
      LJ.toggleTheme();
    },
    "notifications-read": async () => {
      await LJ.workflow("notifications-read");
      LJ.toast("Notifikasi ditandai dibaca.");
      LJ.closeModal();
      LJ.render();
    },
    "global-search": () => {
      LJ.modal(
        "Cari di ruang kerja",
        `<label for="global-query" class="muted u-text-11">Proyek, unit, atau catatan ruang kerja</label><input class="form-control u-mt-10" id="global-query" type="search" placeholder="Ketik untuk mencari…"><div id="global-results" class="u-mt-18">${LJ.empty("Apa yang ingin Anda temukan?", "Cari nama proyek, nomor unit, tugas, atau artikel.")}</div>`,
      );
    },
    "export-report": (tab) => {
      let data =
        tab === "audit"
          ? LJ.db.audit
          : tab === "team"
            ? LJ.db.employees
            : tab === "marketing"
              ? LJ.db.leads
              : tab === "finance"
                ? LJ.db.payments
                : tab === "build"
                  ? LJ.db.units
                  : LJ.db.bookings;
      const keys = [...new Set(data.flatMap((x) => Object.keys(x)))].filter(
          (k) => !k.endsWith("Data"),
        ),
        cell = (x) =>
          '"' +
          String(x ?? "")
            .replace(/"/g, '""')
            .replace(/^[=+@-]/, "'$&") +
          '"';
      LJ.download(
        "LinyJaya-laporan-" + tab + ".csv",
        "\uFEFF" +
          [
            keys.join(","),
            ...data.map((r) => keys.map((k) => cell(r[k])).join(",")),
          ].join("\r\n"),
        "text/csv;charset=utf-8",
      );
      LJ.toast("Berkas laporan disiapkan untuk diunduh.");
    },
    backup: () =>
      LJ.download(
        "linyjaya-catatan-administrasi.json",
        JSON.stringify(LJ.db, null, 2),
        "application/json",
      ),
    "reload-data": () => location.reload(),
  };
  document.addEventListener("click", async (e) => {
    const triggerEl = e.target.closest("button, a, [data-action], input, .sidebar-account, .avatar, select");
    if (triggerEl) LJ._lastTrigger = triggerEl;
    if (compactNavigation.matches && !e.target.closest(".site-nav, .sidebar, [data-action='sidebar']")) {
      const openMenu = document.querySelector(".nav-links.open");
      if (openMenu) setNavigationOpen(openMenu, false);
    }
    if (e.target.closest(".skip-link")) {
      e.preventDefault();
      const main = document.getElementById("main");
      main?.setAttribute("tabindex", "-1");
      main?.focus();
      main?.scrollIntoView({ block: "start" });
      return;
    }
    const payTab = e.target.closest("[data-pay-tab]");
    if (payTab) {
      e.preventDefault();
      const box = payTab.closest(".payment-methods-box");
      if (box) {
        const key = payTab.dataset.payTab;
        box.querySelectorAll("[data-pay-tab]").forEach((btn) => {
          const active = btn.dataset.payTab === key;
          btn.classList.toggle("active", active);
          btn.setAttribute("aria-selected", String(active));
        });
        box.querySelectorAll("[data-pay-panel]").forEach((panel) => {
          panel.classList.toggle("active", panel.dataset.payPanel === key);
        });
      }
      return;
    }
    const simMethodBtn = e.target.closest("[data-sim-method]");
    if (simMethodBtn && !simMethodBtn.disabled) {
      e.preventDefault();
      LJ.setSimMethod?.(simMethodBtn.dataset.simMethod);
      return;
    }
    const simPresetBtn = e.target.closest("[data-sim-preset]");
    if (simPresetBtn) {
      e.preventDefault();
      LJ.setSimPreset?.(simPresetBtn.dataset.simPreset);
      return;
    }
    const simTenorBtn = e.target.closest("[data-sim-tenor]");
    if (simTenorBtn) {
      e.preventDefault();
      LJ.setSimTenor?.(Number(simTenorBtn.dataset.simTenor));
      return;
    }
    const tab = e.target.closest("[data-tab], [data-sidebar-tab]");
    if (tab) {
      if (currentRole) {
        LJ.tableQuery = "";
        dashboardTab = tab.dataset.tab || tab.dataset.sidebarTab;
        if (compactNavigation.matches && tab.dataset.sidebarTab) {
          setNavigationOpen(document.querySelector(".sidebar"), false);
        }
      } else {
        LJ.publicTab = tab.dataset.tab;
      }
      LJ.render();
      return;
    }
    const action = e.target.closest("[data-action]");
    if (action) {
      e.preventDefault();
      if (LJ.saving) return;
      try {
        await actions[action.dataset.action]?.(action.dataset.id, action);
      } catch (err) {
        LJ.toast(err.message, "error");
      }
      return;
    }
    if (e.target.closest(".modal-overlay") && !e.target.closest(".modal"))
      LJ.closeModal();
  });
  document.addEventListener("keydown", (e) => {
    const modal = document.querySelector(".modal-overlay:not(.is-closing) .modal");
    if (!modal) {
      const openSidebar = compactNavigation.matches && document.querySelector(".sidebar.open");
      if (e.key === "Tab" && openSidebar) {
        const links = [...openSidebar.querySelectorAll('a[href], button:not([hidden])')]
          .filter(el => el.offsetParent !== null);
        const first = links[0], last = links.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault(); last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault(); first?.focus();
        }
      }
      if (e.key === "Escape" && compactNavigation.matches) {
        const openMenu = document.querySelector(".sidebar.open, .nav-links.open");
        if (openMenu) setNavigationOpen(openMenu, false);
      }
      return;
    }
    if (e.key === "Escape") LJ.closeModal();
    if (e.key === "Tab") {
      const els = [
        ...modal.querySelectorAll(
          'a[href],button:not([disabled]),input,select,textarea,[tabindex="0"]',
        ),
      ].filter((el) => el.offsetParent !== null);
      const first = els[0],
        last = els[els.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  });
  document.addEventListener("submit", async (e) => {
    const form = e.target;
    if (form.id === "hero-search" || form.id === "logout-form") return;
    e.preventDefault();
    if (LJ.saving) return;
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    const data = Object.fromEntries(new FormData(form)),
      err = form.querySelector(".form-error");
    if (err) err.textContent = "";
    try {
      if (form.id === "modal-form") {
        await LJ.runModal(form);
        return;
      }
      if (form.id === "contact-form") {
        await saveConsultation(data);
        form.reset();
        return;
      }
      if (form.id === "company-form") {
        Object.assign(LJ.db.company, data);
        await saveToast("Informasi perusahaan diperbarui.");
        return;
      }
      if (form.id === "payment-config-form") {
        const fe = form.elements;
        const clTenor = Number(fe.cl_tenorMonths.value);
        const clMax = Number(fe.cl_maxTenorMonths.value);
        const kprDef = Number(fe.kpr_defaultTenorYears.value);
        const kprMin = Number(fe.kpr_minTenorYears.value);
        const kprMax = Number(fe.kpr_maxTenorYears.value);
        if (clTenor > clMax)
          throw Error("Tenor default Cash Lunak tidak boleh melebihi tenor maksimal.");
        if (kprMin > kprDef || kprDef > kprMax)
          throw Error("Tenor default KPR harus berada di antara tenor minimal dan maksimal.");
        LJ.db.paymentConfig = {
          cashKeras: {
            enabled: fe.ck_enabled.checked,
            label: "Cash Keras",
            dpPercent: Number(fe.ck_dpPercent.value),
            settlementDays: Number(fe.ck_settlementDays.value),
            description: fe.ck_description.value.trim(),
          },
          cashLunak: {
            enabled: fe.cl_enabled.checked,
            label: "Cash Lunak",
            dpPercent: Number(fe.cl_dpPercent.value),
            tenorMonths: clTenor,
            maxTenorMonths: clMax,
            interestPercent: Number(fe.cl_interestPercent.value),
            dueDay: Number(fe.cl_dueDay.value),
            description: fe.cl_description.value.trim(),
          },
          kpr: {
            enabled: fe.kpr_enabled.checked,
            label: "KPR",
            dpPercent: Number(fe.kpr_dpPercent.value),
            defaultTenorYears: kprDef,
            minTenorYears: kprMin,
            maxTenorYears: kprMax,
            interestRate: Number(fe.kpr_interestRate.value),
            description: fe.kpr_description.value.trim(),
            presets: [...(LJ.paymentConfig().kpr.presets || [])],
          },
        };
        await saveToast("Konfigurasi metode pembayaran diperbarui.");
        return;
      }
      if (form.id === "password-change-form") {
        const res = await LJ.changePassword(data);
        form.reset();
        LJ.toast(res.message || "Kata sandi berhasil diperbarui.");
        return;
      }
      if (form.id === "profile-form" || form.id === "register-form") {
        if (!data.currentPassword) delete data.currentPassword;
        Object.assign(LJ.db.profile, data);
        await saveToast("Profil berhasil diperbarui.");
        renderedRole = null;
        LJ.render();
      }
    } catch (error) {
      if (err) err.textContent = error.message;
      else LJ.toast(error.message, "error");
    }
  });
  document.addEventListener("change", async (e) => {
    const el = e.target;
    if (el.closest("#catalog-filter")) {
      LJ.filters = Object.fromEntries(new FormData(el.closest("form")));
      document.getElementById("catalog-results").innerHTML =
        LJ.catalogResults();
    }
    if (el.id === "progress-unit") {
      LJ.selectedUnit = el.value;
      LJ.render();
    }
    if (el.id === "article-cat") {
      LJ.articleCategory = el.value;
      LJ.render();
    }
    if (el.id === "promo-filter-project" || el.id === "promo-filter-method") {
      LJ.renderPromoResults?.();
      return;
    }
    if (el.closest("#sim-workspace")) {
      LJ.onSimInput?.(el);
      return;
    }
    if (!el.dataset.setting && !el.dataset.profileNotification) return;
    if (LJ.saving) {
      el.checked = !el.checked;
      return;
    }
    try {
      if (el.dataset.setting) {
        LJ.db.settings[el.dataset.setting] = el.checked;
        await saveToast("Konfigurasi disimpan.");
      } else {
        LJ.db.profile.notifications = el.checked;
        await saveToast("Preferensi notifikasi disimpan.");
      }
    } catch (error) {
      el.checked = !el.checked;
      LJ.toast(error.message, "error");
    }
  });
  document.addEventListener("input", (e) => {
    const el = e.target;
    if (el.name === "q" && el.closest("#catalog-filter")) {
      LJ.filters = Object.fromEntries(new FormData(el.closest("form")));
      document.getElementById("catalog-results").innerHTML =
        LJ.catalogResults();
    }
    if (el.closest("#sim-workspace")) {
      LJ.onSimInput?.(el);
    }
    if (el.id === "table-search") {
      LJ.tableQuery = el.value;
      LJ.render();
    }
    if (el.id === "global-query") {
      const q = el.value.toLowerCase().trim();
      let results = [];
      if (q) {
        LJ.db.projects
          .filter((p) => (p.name + " " + p.location).toLowerCase().includes(q))
          .forEach((p) =>
            results.push([
              p.name,
              LJ.propertyPage("projects", p.id, role()),
              "layers",
            ]),
          );
        LJ.db.units
          .filter((u) => LJ.unitLabel(u.id).toLowerCase().includes(q))
          .forEach((u) =>
            results.push([
              LJ.unitLabel(u.id),
              LJ.propertyPage("units", u.id, role()),
              "home",
            ]),
          );
        if (role() === "admin")
          LJ.db.articles
            .filter((a) => a.title.toLowerCase().includes(q))
            .forEach((a) =>
              results.push([a.title, "admin/settings?tab=content", "file"]),
            );
        if (["admin", "director", "employee"].includes(role()))
          LJ.db.tasks
            .filter(
              (t) =>
                t.title.toLowerCase().includes(q) &&
                (role() !== "employee" || t.employee === LJ.employeeName()),
            )
            .forEach((t) =>
              results.push([
                t.title,
                LJ.rolePage(
                  role(),
                  role() === "admin" ? "construction" : "tasks",
                ) + (role() === "admin" ? "?tab=tasks" : ""),
                "clipboard",
              ]),
            );
      }
      document.getElementById("global-results").innerHTML = results.length
        ? results
            .slice(0, 12)
            .map(
              ([title, url, icon]) =>
                `<a href="${url}" class="activity">${I(icon)}<strong>${E(title)}</strong>${I("arrow", "sm")}</a>`,
            )
            .join("")
        : LJ.empty(
            q ? "Tidak ada hasil" : "Mulai pencarian",
            q
              ? "Gunakan kata kunci yang lebih singkat."
              : "Cari proyek, unit, atau artikel.",
          );
    }
  });
  compactNavigation.addEventListener("change", () => {
    if (!compactNavigation.matches) {
      document.querySelectorAll(".sidebar.open, .nav-links.open, .sidebar-overlay.open")
        .forEach(menu => menu.classList.remove("open"));
      document.querySelectorAll('[aria-controls="workspace-sidebar"], [aria-controls="site-navigation"]')
        .forEach(toggle => toggle.setAttribute("aria-expanded", "false"));
    }
    syncNavigation();
  });
  function animatePageArrival() {
    const main = document.getElementById("main");
    if (!main) return;
    if (main.classList.contains("page-arriving")) {
      main.classList.remove("page-arriving");
      void main.offsetWidth;
    }
    main.classList.add("page-arriving");
  }

  window.addEventListener("pageshow", (event) => {
    if (event.persisted) animatePageArrival();
  });
  LJ.render();
  animatePageArrival();
})();
