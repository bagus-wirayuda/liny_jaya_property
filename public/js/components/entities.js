(function () {
  const { icon: I, esc: E, btn: B } = LJ;
  const field = (LJ.entityField = (
    name,
    label,
    type = "text",
    options = [],
    extra = {},
  ) => ({
    name,
    label,
    type,
    options,
    required: true,
    ...extra,
  }));
  LJ.entityConfig = () => ({
    projects: {
      title: "proyek",
      prefix: "P",
      fields: [
        field("name", "Nama proyek"),
        field("city", "Kota"),
        field("location", "Lokasi lengkap"),
        field("category", "Konsep hunian"),
        field("price", "Harga mulai", "number", [], {
          min: 1000000,
          step: 1000000,
        }),
        field("units", "Rencana jumlah unit", "number", [], {
          min: 1,
          max: 999,
        }),
        field("status", "Status proyek", "select", [
          "Perencanaan",
          "Pemasaran",
          "Pembangunan",
          "Selesai",
        ]),
        field("image", "Visual arsitektur", "select", [
          "house-1",
          "house-2",
          "house-3",
          "neighborhood",
        ]),
        field("facilities", "Fasilitas (pisahkan dengan koma)", "text", [], {
          wide: true,
        }),
        field("description", "Deskripsi proyek", "textarea", [], {
          wide: true,
        }),
      ],
      headers: ["Proyek", "Lokasi", "Harga mulai", "Status"],
      cells: (p) => [
        `<strong>${E(p.name)}</strong><small>${p.units} unit direncanakan</small>`,
        E(p.location),
        LJ.money(p.price, true),
        LJ.badge(p.status),
      ],
    },
    units: {
      title: "unit",
      prefix: "U",
      fields: [
        field(
          "project",
          "Proyek",
          "select",
          LJ.db.projects.map((p) => [p.id, p.name]),
        ),
        field("block", "Blok"),
        field("number", "Nomor kavling"),
        field("type", "Tipe", "select", ["60/90", "72/105", "90/120"]),
        field("land", "Luas tanah (m²)", "number", [], { min: 20, max: 2000 }),
        field("building", "Luas bangunan (m²)", "number", [], {
          min: 20,
          max: 2000,
        }),
        field("beds", "Kamar tidur", "number", [], { min: 1, max: 10 }),
        field("baths", "Kamar mandi", "number", [], { min: 1, max: 10 }),
        field("floors", "Lantai", "number", [], { min: 1, max: 4 }),
        field("price", "Harga (Rp)", "number", [], {
          min: 1000000,
          step: 1000000,
        }),
        field("estimate", "Estimasi selesai", "date"),
        field("image", "Visual hunian", "select", [
          "house-1",
          "house-2",
          "house-3",
          "neighborhood",
        ]),
      ],
      headers: ["Unit / proyek", "Harga", "Penjualan", "Pembangunan"],
      cells: (u) => [
        `<strong>${LJ.unitLabel(u.id)}</strong><small>${E(LJ.project(u.project)?.name)}</small>`,
        LJ.money(u.price, true),
        LJ.badge(u.sale),
        `${LJ.badge(u.construction)}<small>${u.progress}% · ${E(u.stage)}</small>`,
      ],
    },
    services: {
      title: "layanan",
      prefix: "SV",
      fields: [
        field("name", "Nama layanan"),
        field("icon", "Ikon", "select", [
          "home",
          "tool",
          "layers",
          "message",
          "gem",
        ]),
        field("description", "Deskripsi", "textarea", [], { wide: true }),
      ],
      headers: ["Layanan", "Deskripsi"],
      cells: (s) => [
        `<strong>${I(s.icon, "sm")} ${E(s.name)}</strong>`,
        E(s.description.slice(0, 95)),
      ],
    },
    partners: {
      title: "mitra",
      prefix: "PT",
      fields: [
        field("name", "Nama mitra"),
        field("category", "Bidang", "select", [
          "Perbankan & pembiayaan",
          "Konstruksi & engineering",
          "Konstruksi & investasi",
          "Material & solusi bangunan",
          "Arsitektur & perencanaan",
        ]),
        field(
          "logo",
          "Logo perusahaan",
          "select",
          [
            ["", "Tanpa logo"],
            ["assets/partners/bsi.svg", "Bank Syariah Indonesia"],
            ["assets/partners/wika.png", "WIKA"],
            ["assets/partners/pp.webp", "PT PP"],
            ["assets/partners/sig.png", "SIG"],
          ],
          { required: false },
        ),
        field("website", "Situs resmi", "url", [], { required: false }),
        field("description", "Informasi kemitraan", "textarea", [], {
          wide: true,
        }),
      ],
      headers: ["Mitra", "Bidang", "Informasi"],
      cells: (p) => [
        `<strong>${E(p.name)}</strong>`,
        E(p.category),
        E(p.description.slice(0, 90)),
      ],
    },
    leads: {
      title: "lead",
      prefix: "LD",
      fields: [
        field("name", "Nama calon pembeli"),
        field("email", "Email", "email"),
        field("phone", "Nomor telepon", "tel"),
        field(
          "project",
          "Proyek",
          "select",
          LJ.db.projects.map((p) => [p.id, p.name]),
        ),
        field("interest", "Ketertarikan", "select", [
          "Survei lokasi",
          "Pilihan unit",
          "Konsultasi KPR",
          "Kemitraan",
        ]),
        field("date", "Tanggal tindak lanjut", "date"),
        field("status", "Status", "select", [
          "Baru",
          "Dihubungi",
          "Survei terjadwal",
          "Selesai",
        ]),
        field("notes", "Catatan", "textarea", [], { wide: true }),
      ],
      headers: ["Nama / kontak", "Ketertarikan", "Tindak lanjut", "Status"],
      cells: (l) => [
        `<strong>${E(l.name)}</strong><small>${E(l.phone)}</small>`,
        `${E(l.interest)}<small>${E(LJ.project(l.project)?.name || "Belum memilih")}</small>`,
        LJ.date(l.date),
        LJ.badge(l.status),
      ],
    },
    offers: {
      title: "penawaran",
      prefix: "OF",
      fields: [
        field("name", "Judul penawaran"),
        field("client", "Calon pembeli"),
        field(
          "unit",
          "Unit",
          "select",
          LJ.db.units.map((u) => [u.id, LJ.unitLabel(u.id)]),
        ),
        field("amount", "Nilai penawaran (Rp)", "number", [], { min: 1 }),
        field("date", "Berlaku sampai", "date"),
        field("status", "Status", "select", [
          "Draf",
          "Diajukan",
          "Diterima",
          "Ditolak",
        ]),
      ],
      headers: ["Penawaran", "Calon pembeli", "Nilai", "Status"],
      cells: (o) => [
        `<strong>${E(o.name)}</strong><small>${LJ.unitLabel(o.unit)}</small>`,
        E(o.client),
        LJ.money(o.amount, true),
        LJ.badge(o.status),
      ],
    },
    promos: {
      title: "promo",
      prefix: "PR",
      fields: [
        field("name", "Nama promo"),
        field(
          "project",
          "Proyek",
          "select",
          LJ.db.projects.map((p) => [p.id, p.name]),
        ),
        field("start", "Mulai", "date"),
        field("end", "Berakhir", "date"),
        field("status", "Status", "select", ["Draf", "Aktif", "Selesai"]),
        field("description", "Ketentuan", "textarea", [], { wide: true }),
      ],
      headers: ["Promo", "Proyek", "Periode", "Status"],
      cells: (p) => [
        `<strong>${E(p.name)}</strong>`,
        E(LJ.project(p.project)?.name),
        `${LJ.date(p.start)} – ${LJ.date(p.end)}`,
        LJ.badge(p.status),
      ],
    },
    communications: {
      title: "riwayat komunikasi",
      prefix: "CM",
      fields: [
        field("name", "Nama kontak"),
        field("date", "Tanggal", "date"),
        field("channel", "Kanal", "select", [
          "Telepon",
          "WhatsApp",
          "Email",
          "Kunjungan",
        ]),
        field("status", "Hasil", "select", ["Selesai", "Perlu tindak lanjut"]),
        field("notes", "Ringkasan komunikasi", "textarea", [], { wide: true }),
      ],
      headers: ["Kontak", "Kanal", "Tanggal", "Ringkasan"],
      cells: (c) => [
        `<strong>${E(c.name)}</strong>`,
        E(c.channel),
        LJ.date(c.date),
        E(c.notes),
      ],
    },
    expenses: {
      title: "pengeluaran",
      prefix: "EX",
      fields: [
        field("title", "Keperluan"),
        field(
          "project",
          "Proyek",
          "select",
          LJ.db.projects.map((p) => [p.id, p.name]),
        ),
        field("amount", "Jumlah (Rp)", "number", [], { min: 1 }),
        field("date", "Tanggal pengajuan", "date"),
        field("description", "Rincian anggaran", "textarea", [], {
          wide: true,
        }),
      ],
      headers: ["Pengeluaran", "Proyek", "Nilai", "Persetujuan"],
      cells: (e) => [
        `<strong>${E(e.title)}</strong><small>${LJ.date(e.date)}</small>`,
        E(LJ.project(e.project)?.name),
        LJ.money(e.amount, true),
        LJ.badge(e.status),
      ],
    },
    employees: {
      title: "karyawan",
      prefix: "EMP",
      fields: [
        field("name", "Nama lengkap"),
        field("email", "Email", "email"),
        field("division", "Divisi", "select", [
          "Konstruksi",
          "Teknik",
          "Pemasaran",
          "Keuangan",
          "Administrasi",
        ]),
        field("position", "Jabatan"),
        field("status", "Status", "select", ["Aktif", "Nonaktif"]),
      ],
      headers: ["Karyawan", "Divisi", "Jabatan", "Status"],
      cells: (e) => [
        `<strong>${E(e.name)}</strong><small>${E(e.email || "Kontak perlu dilengkapi")}</small>`,
        E(e.division),
        E(e.position),
        LJ.badge(e.status),
      ],
    },
    tasks: {
      title: "penugasan",
      prefix: "TS",
      fields: [
        field("title", "Judul tugas"),
        field(
          "unit",
          "Unit",
          "select",
          LJ.db.units.map((u) => [
            u.id,
            LJ.unitLabel(u.id) + " · " + (LJ.project(u.project)?.name || ""),
          ]),
        ),
        field(
          "employee",
          "Penanggung jawab",
          "select",
          LJ.db.employees
            .filter((e) => e.status === "Aktif")
            .map((e) => [e.id, e.name]),
        ),
        field("deadline", "Deadline", "date"),
        field("priority", "Prioritas", "select", [
          "Tinggi",
          "Sedang",
          "Rendah",
        ]),
        field("status", "Status", "select", ["Baru", "Dikerjakan", "Selesai"]),
        field("description", "Instruksi pekerjaan", "textarea", [], {
          wide: true,
        }),
      ],
      headers: ["Tugas / unit", "PIC", "Deadline", "Status"],
      cells: (t) => [
        `<strong>${E(t.title)}</strong><small>${LJ.unitLabel(t.unit)}</small>`,
        E(t.employee),
        `${LJ.date(t.deadline)}<small>${E(t.priority)}</small>`,
        LJ.badge(t.status),
      ],
    },
    schedules: {
      title: "jadwal pekerjaan",
      prefix: "SC",
      fields: [
        field(
          "unit",
          "Unit",
          "select",
          LJ.db.units.map((u) => [u.id, LJ.unitLabel(u.id)]),
        ),
        field("stage", "Tahap", "select", [
          "Persiapan",
          "Pondasi",
          "Struktur & dinding",
          "Atap & instalasi",
          "Finishing",
        ]),
        field("start", "Tanggal mulai", "date"),
        field("end", "Tanggal selesai", "date"),
        field(
          "employee",
          "PIC",
          "select",
          LJ.db.employees.map((e) => [e.id, e.name]),
        ),
        field("status", "Status", "select", [
          "Terjadwal",
          "Dikerjakan",
          "Selesai",
        ]),
      ],
      headers: ["Unit / tahap", "PIC", "Jadwal", "Status"],
      cells: (s) => [
        `<strong>${LJ.unitLabel(s.unit)}</strong><small>${E(s.stage)}</small>`,
        E(s.employee),
        `${LJ.date(s.start)} – ${LJ.date(s.end)}`,
        LJ.badge(s.status),
      ],
    },
    evaluations: {
      title: "evaluasi",
      prefix: "EV",
      fields: [
        field(
          "employee",
          "Karyawan",
          "select",
          LJ.db.employees.map((e) => [e.id, e.name]),
        ),
        field("period", "Periode"),
        field("score", "Nilai (0–100)", "number", [], { min: 0, max: 100 }),
        field("notes", "Catatan evaluasi", "textarea", [], { wide: true }),
      ],
      headers: ["Karyawan", "Periode", "Nilai", "Catatan"],
      cells: (e) => [
        `<strong>${E(e.employee)}</strong>`,
        E(e.period),
        `<strong>${e.score}/100</strong>`,
        E(e.notes),
      ],
    },
    announcements: {
      title: "pengumuman",
      prefix: "AN",
      fields: [
        field("title", "Judul"),
        field("audience", "Penerima", "select", [
          "Semua karyawan",
          "Konstruksi",
          "Teknik",
          "Pemasaran",
        ]),
        field("date", "Tanggal", "date"),
        field("message", "Isi pengumuman", "textarea", [], { wide: true }),
      ],
      headers: ["Pengumuman", "Penerima", "Tanggal"],
      cells: (a) => [
        `<strong>${E(a.title)}</strong><small>${E(a.message.slice(0, 100))}</small>`,
        E(a.audience),
        LJ.date(a.date),
      ],
    },
    messages: {
      title: "pesan internal",
      prefix: "MSG",
      fields: [
        field("subject", "Subjek"),
        field("message", "Pesan", "textarea", [], { wide: true }),
      ],
      headers: ["Pengirim", "Subjek & tanggapan", "Tanggal", "Status"],
      cells: (m) => [
        `<strong>${E(m.name)}</strong>${m.senderRole ? `<small>${E(m.senderRole)}</small>` : ""}`,
        `<strong>${E(m.subject)}</strong><small>${E(m.message.slice(0, 100))}</small>${m.reply ? `<small class="muted">Tanggapan: ${E(m.reply)}</small>` : ""}`,
        LJ.date(m.date),
        LJ.badge(m.status),
      ],
    },
    accounts: {
      title: "akun pengguna",
      prefix: "ACC",
      fields: [
        field("name", "Nama"),
        field("email", "Email", "email"),
        field(
          "role",
          "Role",
          "select",
          Object.values(LJ.roles).map((r) => r.name),
        ),
        field("status", "Status", "select", ["Aktif", "Nonaktif"]),
        field("employeeId", "Data karyawan (khusus role Karyawan)", "select", [
          ["", "Tidak ditautkan"],
          ...LJ.db.employees.map((employee) => [employee.id, employee.name]),
        ], { required: false }),
        field("password", "Kata sandi (minimal 12 karakter)", "password", [], { required: false, wide: true }),
      ],
      headers: ["Akun", "Role", "Status"],
      cells: (a) => [
        `<strong>${E(a.name)}</strong><small>${E(a.email || "Kontak perlu dilengkapi")}</small>`,
        E(a.role),
        LJ.badge(a.status),
      ],
    },
    articles: {
      title: "artikel",
      prefix: "AR",
      fields: [
        field("title", "Judul"),
        field("category", "Kategori", "select", [
          "Panduan Finansial",
          "Panduan membeli",
          "Konstruksi",
          "Inspirasi hunian",
          "Berita perusahaan",
        ]),
        field("date", "Tanggal publikasi", "date"),
        field("image", "Foto", "select", [
          "interior",
          "construction",
          "house-1",
          "house-2",
          "house-3",
        ]),
        field("summary", "Ringkasan", "textarea", [], { wide: true }),
        field("body", "Isi artikel", "textarea", [], {
          wide: true,
          maxlength: 15000,
        }),
      ],
      headers: ["Artikel", "Kategori", "Tanggal"],
      cells: (a) => [
        `<strong>${E(a.title)}</strong>`,
        E(a.category),
        LJ.date(a.date),
      ],
    },
    notifications: {
      title: "notifikasi",
      prefix: "NT",
      fields: [
        field("title", "Judul"),
        field(
          "role",
          "Penerima",
          "select",
          Object.values(LJ.roles).map((r) => r.name),
        ),
        field("message", "Isi notifikasi", "textarea", [], { wide: true }),
      ],
      headers: ["Notifikasi", "Penerima", "Status"],
      cells: (n) => [
        `<strong>${E(n.title)}</strong><small>${E(n.message)}</small>`,
        E(n.role),
        LJ.badge(n.status),
      ],
    },
  });
  LJ.manager = (key, opts = {}) => {
    const cfg = LJ.entityConfig()[key];
    if (!cfg)
      return LJ.empty(
        "Tampilan tidak ditemukan",
        "Pilih salah satu tab yang tersedia di halaman ini.",
      );
    let records = (LJ.db[key] || []).filter(opts.filter || (() => true));
    const search = LJ.tableQuery || "";
    if (search)
      records = records.filter((x) =>
        JSON.stringify(x).toLowerCase().includes(search.toLowerCase()),
      );
    let body = LJ.table(
      [...cfg.headers, "Aksi"],
      records.map((r) => [
        ...cfg.cells(r),
        `<div class="table-actions">${opts.readonly ? LJ.iBtn("eye", "entity-view", key + ":" + r.id, "Lihat detail") : `${LJ.iBtn("edit", "entity-edit", key + ":" + r.id, "Edit " + cfg.title)}${LJ.iBtn("trash", "entity-delete", key + ":" + r.id, "Hapus " + cfg.title)}`}${opts.extra ? opts.extra(r) : ""}</div>`,
      ]),
    );
    return `${opts.note ? `<div class="notice">${I("info")}${opts.note}</div>` : ""}<div class="panel"><div class="panel-head"><div><h3>${opts.title || "Daftar " + cfg.title}</h3><p>${records.length} catatan dalam daftar</p></div>${opts.readonly ? "" : B("Tambah " + cfg.title, "entity-add", key, "primary small", "plus")}</div><div class="filter-bar entity-filter"><input class="form-control" id="table-search" aria-label="Cari data" type="search" placeholder="Cari di daftar ini…" value="${E(search)}"></div><div id="table-results">${body}</div></div>`;
  };
})();
