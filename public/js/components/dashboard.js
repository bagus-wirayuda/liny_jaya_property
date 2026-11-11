(function () {
  const { icon: I, esc: E, btn: B, link: A } = LJ;
  const field = LJ.entityField;
  LJ.workspaceShell = (role, menu) => {
    const r = LJ.roles[role];
    const initials = E(r.person.split(" ").map((part) => part[0]).slice(0, 2).join(""));
    const links = r.menus.map(([id, label, icon]) => {
      const active = id === menu;
      const link = `<a class="sidebar-link${active ? " active" : ""}" data-menu="${id}" href="${LJ.rolePage(role, id)}"${active ? ' aria-current="page"' : ""}>${I(icon)}${label}${id === "approvals" ? `<span class="count">${LJ.metrics().pending}</span>` : ""}</a>`;
      if (!active) return link;
      return `<div class="sidebar-entry"><div class="sidebar-entry-line">${link}<button type="button" class="sidebar-submenu-toggle" data-action="sidebar-submenu" aria-label="Submenu ${E(label)}" aria-controls="workspace-submenu" aria-expanded="false" hidden>${I("chevron", "sm")}</button></div><div id="workspace-submenu" class="sidebar-submenu" inert aria-hidden="true" hidden><div class="sidebar-submenu-links"></div></div></div>`;
    }).join("");
    const unreadCount = LJ.db.notifications.filter((n) => n.status === "Baru").length;
    return `<div class="workspace workspace--${r.folder}"><div class="sidebar-overlay" data-action="sidebar"></div><aside id="workspace-sidebar" class="sidebar" aria-label="Menu ${r.name}"><div class="sidebar-brand">${LJ.brand(LJ.rolePage(role))}</div><div class="workspace-label">${r.name.toUpperCase()}</div><nav class="sidebar-scroll" aria-label="Navigasi ruang kerja">${links}<div class="workspace-label workspace-company-label">LINYJAYA DEVELOPMENT</div><a class="sidebar-link" href="./">${I("external")}Kembali ke website</a></nav><div class="sidebar-bottom"><button type="button" class="sidebar-account" data-action="profile-dropdown" aria-label="Menu profil ${E(r.person)}"><span class="avatar">${initials}</span><span><strong>${E(r.person)}</strong><small>${r.name}</small></span></button></div></aside><header class="topbar"><div class="flex"><button class="icon-btn menu-toggle" data-action="sidebar" aria-label="Menu ruang kerja" aria-controls="workspace-sidebar" aria-expanded="false">${I("menu")}</button><div class="topbar-title"><span>Ruang kerja ${I("chevron", "sm")}</span><strong id="workspace-breadcrumb"></strong></div></div><div class="topbar-actions"><span class="demo-indicator">LINYJAYA</span><button type="button" class="icon-btn theme-toggle-btn" data-action="theme-toggle" aria-label="${LJ.getTheme?.() === "dark" ? "Ganti ke mode terang" : "Ganti ke mode gelap"}" title="${LJ.getTheme?.() === "dark" ? "Mode Terang" : "Mode Gelap"}">${I(LJ.getTheme?.() === "dark" ? "sun" : "moon")}</button>${LJ.iBtn("search", "global-search", "", "Cari di ruang kerja")}<button class="icon-btn" data-action="notifications" aria-label="Lihat notifikasi">${I("bell")}<span class="notification-dot"${unreadCount ? "" : " hidden"}></span></button><button type="button" class="avatar topbar-avatar-btn" data-action="profile-dropdown" aria-label="Menu profil ${E(r.person)}" title="Profil ${E(r.person)}">${initials}</button></div></header><main class="workspace-main" id="main"><div id="workspace-content"></div><footer class="workspace-footer"><span>© LinyJaya Development · Ruang kerja ${r.name}</span><span>Informasi proyek dan catatan administrasi</span></footer></main></div>`;
  };
  const descriptions = {
    overview: "Semua yang perlu Anda ketahui, dalam satu pandangan.",
    company:
      "Kelola identitas dan informasi yang ditampilkan di website publik.",
    projects: "Rencanakan kawasan dan pantau unit dalam setiap proyek.",
    units: "Satu sumber informasi untuk kavling, spesifikasi, dan status unit.",
    marketing:
      "Kelola perjalanan calon pembeli dari ketertarikan hingga penawaran.",
    bookings: "Lacak pengajuan, pemesanan, dan verifikasi uang muka (DP).",
    finance: "Pembayaran, pengeluaran, dan dokumen keuangan yang terhubung.",
    construction:
      "Dari persiapan sampai serah terima. Setiap tahap terdokumentasi.",
    employees: "Tim, tanggung jawab, dan pencapaian pekerjaan.",
    clients: "Hubungkan profil klien dengan unit dan perjalanan pembeliannya.",
    analytics:
      "Tinjau catatan penjualan, pembangunan, dan aktivitas operasional.",
    settings: "Pengaturan ruang kerja, konten, dan riwayat perubahan.",
    search: "Temukan dan simpan hunian yang sesuai dengan rencana Anda.",
    payments: "Jadwal pembayaran, bukti transfer, dan invoice Anda.",
    progress: "Selangkah lebih dekat menuju rumah Anda.",
    documents: "Semua dokumen penting rumah, dalam satu tempat.",
    support: "Kami siap membantu perjalanan Anda.",
    profile: "Informasi pribadi dan preferensi akun pengguna.",
    tasks: "Prioritas yang jelas untuk pekerjaan yang terarah.",
    reports: "Bagikan hasil kerja dan dokumentasi langsung dari lapangan.",
    attendance: "Jadwal kerja, kehadiran, dan pengajuan izin.",
    communication: "Informasi terbaru dan koordinasi tim proyek.",
    approvals:
      "Tinjau kebutuhan bisnis dan ambil keputusan berdasarkan informasi.",
    announcements: "Bagikan arahan dan informasi kepada tim.",
  };
  LJ.dashboardContent = (role, menu, tab) => {
    const r = LJ.roles[role],
      entry = r.menus.find((m) => m[0] === menu);
    if (!entry)
      return LJ.empty(
        "Menu tidak ditemukan",
        "Pilih halaman dari menu ruang kerja.",
      );
    const name = role === "client" ? LJ.db.profile.name : r.person;
    let title =
      menu === "overview"
        ? role === "director"
          ? "Gambaran besar, keputusan tepat."
          : `Selamat datang, ${name.split(" ")[0]}.`
        : entry[1];
    let action =
      menu === "reports"
        ? B("Buat laporan", "report-new", "", "primary small", "plus")
        : menu === "support"
          ? B("Buat permintaan", "ticket-new", "", "primary small", "plus")
          : menu === "tasks" && role === "director"
            ? B(
                "Buat penugasan",
                "entity-add",
                "tasks",
                "primary small",
                "plus",
              )
            : `<span class="date-chip">${I("calendar", "sm")}${LJ.date(LJ.today())}</span>`;
    const heading = `<div class="workspace-heading"><div><h1>${E(title)}</h1><p>${descriptions[menu] || "Kelola informasi dan aktivitas proyek Anda."}</p></div>${action}</div>`;
    const body = LJ.pages[role][menu]?.(tab) ?? LJ.empty();
    return (
      heading +
      (menu === "overview"
        ? `<p class="record-caption">${E(LJ.editorial.record)}</p>`
        : "") +
      `<div class="reveal">${body}</div>`
    );
  };
  LJ.workspaceProperty = ({ role, menu, resource, id }) => {
    const record = resource === "projects" ? LJ.project(id) : LJ.unit(id);
    const back = A(
      "Kembali ke daftar",
      LJ.rolePage(role, menu),
      "secondary small",
      "arrow",
    );
    if (!record)
      return LJ.empty(
        "Rincian tidak ditemukan",
        "Pilih proyek atau unit dari ruang kerja Anda.",
        back,
      );
    const detail =
      resource === "projects"
        ? LJ.projectDetail(record, role)
        : LJ.unitDetail(record, role);
    return `<div class="breadcrumbs">${back}</div>${detail}`;
  };
  function managementOverview(role) {
    const d = LJ.db,
      m = LJ.metrics();
    return (
      LJ.kpis([
        [
          "Proyek perumahan",
          d.projects.length,
          "layers",
          d.units.length + " unit dalam katalog",
        ],
        [
          "Unit tersedia",
          m.available,
          "home",
          "Dari " + d.units.length + " unit dalam katalog",
        ],
        [
          "Penerimaan tercatat",
          LJ.money(m.revenue, true),
          "wallet",
          "Akumulasi pembayaran tercatat",
        ],
        [
          role === "director" ? "Menunggu keputusan" : "Dalam pembangunan",
          role === "director" ? m.pending : m.building,
          role === "director" ? "check" : "tool",
          role === "director"
            ? "Pembayaran, anggaran & laporan"
            : "Unit aktif dibangun",
        ],
      ]) +
      `<div class="dashboard-grid">${LJ.panel("Penerimaan per proyek", LJ.chart(), `<span class="tag blue">CATATAN ADMINISTRASI</span>`, "Dihitung dari pembayaran terverifikasi")}${LJ.panel(
        "Progres kawasan",
        d.projects
          .map((p) => {
            let us = d.units.filter((u) => u.project === p.id),
              v = us.length
                ? Math.round(us.reduce((s, u) => s + u.progress, 0) / us.length)
                : 0;
            return LJ.progress(
              v,
              p.name,
              us.filter((u) => u.construction === "Dalam pembangunan").length +
                " unit dalam pembangunan",
            );
          })
          .join(""),
        A("Lihat proyek", LJ.rolePage(role, "projects"), "ghost small"),
      )}</div><div class="dashboard-grid">${LJ.panel(role === "director" ? "Keputusan yang menunggu" : "Pemesanan terbaru", role === "director" ? approvalList() : bookingTable(d.bookings.slice(0, 4), role), A("Lihat semua", LJ.rolePage(role, role === "director" ? "approvals" : "bookings"), "ghost small"))}${LJ.panel("Aktivitas terkini", auditList(d.audit.slice(0, 4)))}</div>${LJ.panel(
        "Pekerjaan dalam perhatian",
        LJ.table(
          ["Tugas", "Penanggung jawab", "Deadline", "Status"],
          d.tasks.map((t) => [
            `<strong>${E(t.title)}</strong><small>${LJ.unitLabel(t.unit)}</small>`,
            E(t.employee),
            LJ.date(t.deadline),
            LJ.badge(t.status),
          ]),
        ),
        A(
          "Kelola penugasan",
          LJ.rolePage(role, role === "director" ? "tasks" : "construction"),
          "ghost small",
        ),
      )}`
    );
  }
  function homeSummary(u) {
    const p = LJ.project(u.project);
    return `<article class="home-summary"><img src="${LJ.image(u.image)}" alt="Visual rumah Anda"><div><span class="tag blue">RUMAH ANDA</span><h2>${E(p?.name)}</h2><p>${LJ.unitLabel(u.id)} · LT ${u.land} / LB ${u.building} m²</p><div class="flex wrap u-mt-12">${LJ.badge(u.sale)}${LJ.badge(u.construction)}</div></div></article>`;
  }
  function bookingTable(bs, role) {
    return LJ.table(
      ["Pemesanan / klien", "Unit", "Tanggal", "Status", "Aksi"],
      bs.map((b) => [
        `<strong>${E(b.id)}</strong><small>${E(b.client)}</small>`,
        `<strong>${LJ.unitLabel(b.unit)}</strong><small>${E(LJ.project(LJ.unit(b.unit)?.project)?.name)}</small>`,
        LJ.date(b.date),
        LJ.badge(b.status),
        `<div class="table-actions">${LJ.iBtn("eye", "booking-view", b.id, "Detail pemesanan")}${["admin", "client"].includes(role) && b.status === "Menunggu DP" ? LJ.iBtn("close", "booking-cancel", b.id, "Batalkan pemesanan") : ""}</div>`,
      ]),
    );
  }
  function paymentTable(ps, role) {
    return LJ.table(
      [
        "Pembayaran",
        "Unit / klien",
        "Jumlah",
        "Jatuh tempo",
        "Status pencatatan",
        "Aksi",
      ],
      ps.map((p) => [
        `<strong>${E(p.kind)}</strong><small>${E(p.id)}</small>`,
        `<strong>${LJ.unitLabel(LJ.book(p.booking)?.unit)}</strong><small>${E(p.client)}</small>`,
        LJ.money(p.amount),
        LJ.date(p.due),
        LJ.badge(p.status),
        `<div class="table-actions">${LJ.iBtn("file", "invoice", p.id, "Lihat invoice")}${role === "client" && ["Belum dibayar", "Ditolak"].includes(p.status) ? LJ.iBtn("upload", "pay-upload", p.id, "Unggah bukti") : ""}${p.proof ? LJ.iBtn("eye", "proof", p.id, "Lihat bukti") : ""}${role === "admin" && p.status === "Menunggu verifikasi" ? LJ.iBtn("check", "payment-verify", p.id, "Verifikasi pembayaran") : ""}</div>`,
      ]),
    );
  }
  function paymentCards(ps) {
    return ps.length
      ? ps
          .map(
            (p) =>
              `<div class="activity"><span class="icon-tile">${I("wallet")}</span><div class="u-flex-fill"><strong>${E(p.kind)} · ${LJ.money(p.amount, true)}</strong><p>Jatuh tempo ${LJ.date(p.due)}</p><div class="u-mt-8">${LJ.badge(p.status)}</div></div>${["Belum dibayar", "Ditolak"].includes(p.status) ? LJ.iBtn("upload", "pay-upload", p.id, "Unggah bukti pembayaran") : LJ.iBtn("file", "invoice", p.id, "Lihat invoice")}</div>`,
          )
          .join("")
      : LJ.empty(
          "Tidak ada tagihan aktif",
          "Tagihan baru akan muncul sesuai jadwal termin.",
        );
  }
  function auditList(logs) {
    return logs
      .map(
        (l) =>
          `<div class="activity"><span class="icon-tile">${I("clock")}</span><div><strong>${E(l.actor)}</strong><p>${E(l.action)}</p></div><time>${LJ.date(l.date)}</time></div>`,
      )
      .join("");
  }
  function announcementList(items) {
    return items.length
      ? items
          .map(
            (a) =>
              `<div class="activity"><span class="icon-tile">${I("message")}</span><div><strong>${E(a.title || a.subject)}</strong><p>${E(a.message)}</p><p>${E(a.audience || a.name || "")} · ${LJ.date(a.date)}</p></div></div>`,
          )
          .join("")
      : LJ.empty(
          "Belum ada pengumuman",
          "Informasi terbaru tim akan tampil di sini.",
        );
  }
  function taskCards(ts) {
    return ts.length
      ? ts
          .map(
            (t) =>
              `<article class="task-card"><div class="flex between">${LJ.badge(t.priority)}${LJ.badge(t.status)}</div><h3>${E(t.title)}</h3><p>${LJ.unitLabel(t.unit)} · ${E(LJ.project(LJ.unit(t.unit)?.project)?.name)}</p><div class="task-meta"><span>${I("calendar", "sm")} ${LJ.date(t.deadline)}</span>${B("Detail tugas", "task-view", t.id, "secondary small")}</div></article>`,
          )
          .join("")
      : LJ.empty(
          "Tidak ada tugas",
          "Tugas yang ditugaskan kepada Anda akan tampil di sini.",
        );
  }
  function reportCards(rs, review = false) {
    return rs.length
      ? `<div class="stack">${rs.map((r) => `<article class="panel report-card">${r.photoDataMime?.startsWith("image/") ? `<img src="${r.photoData}" alt="Dokumentasi ${E(r.title)}">` : `<img src="${LJ.image(r.image || "construction")}" alt="Dokumentasi ilustrasi pekerjaan">`}<div><div class="flex between"><small class="muted">${LJ.date(r.date)}</small>${LJ.badge(r.status)}</div><h3>${E(r.title)}</h3><p>${E(r.description)}</p>${LJ.progress(r.progress, LJ.unitLabel(r.unit), r.stage)}<div class="flex between u-mt-15"><small class="muted">${E(r.employee)}</small>${B(review && r.status === "Menunggu persetujuan" ? "Tinjau laporan" : "Detail", "report-view", r.id, "secondary small", "eye")}</div></div></article>`).join("")}</div>`
      : LJ.empty(
          "Belum ada laporan",
          "Dokumentasi pekerjaan akan muncul setelah tim mengirim laporan.",
        );
  }
  function approvalList() {
    const d = LJ.db;
    let rows = [
      ...d.payments
        .filter((p) => p.status === "Menunggu verifikasi")
        .map((p) => ({
          title: p.kind + " · " + p.client,
          desc: LJ.money(p.amount),
          action: "payment-verify",
          id: p.id,
          icon: "wallet",
        })),
      ...d.expenses
        .filter((e) => e.status === "Menunggu persetujuan")
        .map((e) => ({
          title: e.title,
          desc: LJ.money(e.amount),
          action: "expense-review",
          id: e.id,
          icon: "clipboard",
        })),
      ...d.reports
        .filter((r) => r.status === "Menunggu persetujuan")
        .map((r) => ({
          title: r.title,
          desc: r.progress + "% · " + LJ.unitLabel(r.unit),
          action: "report-view",
          id: r.id,
          icon: "tool",
        })),
      ...d.documents
        .filter((item) => item.status === "Menunggu persetujuan")
        .map((item) => ({ title: item.title, desc: item.kind, action: "document", id: item.id, icon: "file" })),
      ...d.tickets
        .filter((item) => item.category === "Perubahan desain" && ["Baru", "Diproses"].includes(item.status))
        .map((item) => ({ title: item.title, desc: item.client, action: "ticket-reply", id: item.id, icon: "message" })),
      ...d.leave
        .filter((item) => item.status === "Menunggu persetujuan")
        .map((item) => ({ title: item.employee, desc: item.kind + " · " + LJ.date(item.date), action: "leave-review", id: item.id, icon: "calendar" })),
    ];
    return rows.length
      ? rows
          .map(
            (r) =>
              `<div class="activity"><span class="icon-tile">${I(r.icon)}</span><div class="u-flex-fill"><strong>${E(r.title)}</strong><p>${E(r.desc)}</p></div>${B("Tinjau", r.action, r.id, "secondary small")}</div>`,
          )
          .join("")
      : LJ.empty(
          "Semua sudah ditinjau",
          "Keputusan baru akan muncul saat ada pengajuan.",
        );
  }
  function analytics(tab) {
    const d = LJ.db,
      m = LJ.metrics(),
      income = m.revenue,
      expense = d.expenses
        .filter((e) => e.status === "Disetujui")
        .reduce((s, e) => s + e.amount, 0);
    return (
      LJ.tabs(
        [
          ["sales", "Penjualan"],
          ["finance", "Keuangan"],
          ["build", "Pembangunan"],
          ["team", "Karyawan"],
          ["marketing", "Pemasaran"],
        ],
        tab || "sales",
      ) +
      LJ.kpis([
        [
          "Penerimaan",
          LJ.money(income, true),
          "wallet",
          "Pembayaran terverifikasi",
        ],
        [
          "Pengeluaran disetujui",
          LJ.money(expense, true),
          "clipboard",
          "Anggaran yang dicatat disetujui",
        ],
        [
          "Selisih tercatat",
          LJ.money(income - expense, true),
          "chart",
          "Penerimaan − pengeluaran",
        ],
        [
          "Pemesanan aktif",
          d.bookings.filter((b) => b.status !== "Dibatalkan").length,
          "home",
          "Dari semua klien",
        ],
      ]) +
      `<div class="dashboard-grid">${LJ.panel(tab === "build" ? "Progres per proyek" : "Penerimaan per proyek", LJ.chart(tab === "build" ? "progress" : "revenue"))}${LJ.panel("Komposisi unit", `<div class="mini-donut" style="--p:${Math.round((m.available / d.units.length) * 100)}%"><strong>${m.available}/${d.units.length}</strong></div><p class="chart-note">Unit tersedia dari seluruh unit dalam katalog</p>`)} </div>` +
      LJ.panel(
        "Rincian laporan",
        tab === "team"
          ? LJ.table(
              ["Karyawan", "Penugasan", "Selesai", "Laporan"],
              d.employees.map((e) => [
                E(e.name),
                d.tasks.filter((t) => t.employee === e.name).length,
                d.tasks.filter(
                  (t) => t.employee === e.name && t.status === "Selesai",
                ).length,
                d.reports.filter((r) => r.employee === e.name).length,
              ]),
            )
          : tab === "marketing"
            ? LJ.table(
                ["Proyek", "Leads", "Pemesanan", "Unit tersedia"],
                d.projects.map((p) => [
                  E(p.name),
                  d.leads.filter((l) => l.project === p.id).length,
                  d.bookings.filter(
                    (b) =>
                      LJ.unit(b.unit)?.project === p.id &&
                      b.status !== "Dibatalkan",
                  ).length,
                  d.units.filter(
                    (u) => u.project === p.id && u.sale === "Tersedia",
                  ).length,
                ]),
              )
            : tab === "finance"
              ? LJ.table(
                  ["Jenis", "Jumlah", "Keterangan"],
                  [
                    [
                      "Penerimaan",
                      LJ.money(income),
                      "Pembayaran terverifikasi",
                    ],
                    ["Pengeluaran", LJ.money(expense), "Pengeluaran disetujui"],
                    [
                      "Selisih tercatat",
                      LJ.money(income - expense),
                      "Bukan laporan akuntansi resmi",
                    ],
                  ],
                )
              : LJ.table(
                  [
                    "Proyek",
                    "Jumlah unit",
                    "Tersedia",
                    "Pembangunan",
                    "Penerimaan",
                  ],
                  d.projects.map((p) => [
                    E(p.name),
                    d.units.filter((u) => u.project === p.id).length,
                    d.units.filter(
                      (u) => u.project === p.id && u.sale === "Tersedia",
                    ).length,
                    d.units.filter(
                      (u) =>
                        u.project === p.id &&
                        u.construction === "Dalam pembangunan",
                    ).length,
                    LJ.money(
                      d.payments
                        .filter(
                          (x) =>
                            x.status === "Terverifikasi" &&
                            LJ.unit(LJ.book(x.booking)?.unit)?.project === p.id,
                        )
                        .reduce((s, x) => s + x.amount, 0),
                      true,
                    ),
                  ]),
                ),
        B(
          "Ekspor laporan",
          "export-report",
          tab || "sales",
          "secondary small",
          "download",
        ),
      )
    );
  }
  function constructionTable(us) {
    const activeBookingUnits = new Set(
      (LJ.db.bookings || [])
        .filter((b) => b.status === "DP terverifikasi")
        .map((b) => b.unit),
    );
    return LJ.table(
      ["Unit / proyek", "Penjualan", "Pembangunan", "Progres", "Aksi"],
      us.map((u) => [
        `<strong>${LJ.unitLabel(u.id)}</strong><small>${E(LJ.project(u.project)?.name)}</small>`,
        LJ.badge(u.sale),
        LJ.badge(u.construction),
        `<strong>${u.progress}%</strong><small>${E(u.stage)}</small>`,
        `<div class="table-actions">${LJ.iBtn("eye", "unit-view", u.id, "Detail unit")}${u.sale === "DP terverifikasi" && u.construction === "Belum dibangun" ? LJ.iBtn("play", "construction-start", u.id, "Mulai pembangunan") : ""}${u.construction === "Selesai" && activeBookingUnits.has(u.id) ? LJ.iBtn("check", "handover", u.id, "Serah terima") : ""}</div>`,
      ]),
    );
  }
  function permissions() {
    const perms = [
      ["Informasi publik", 1, 1, 1, 1],
      ["Pemesanan & pembayaran", 1, 1, 0, 0],
      ["Laporan pembangunan", 1, 0, 1, 1],
      ["Penugasan tim", 1, 0, 0, 1],
      ["Persetujuan anggaran", 0, 0, 0, 1],
      ["Konfigurasi sistem", 1, 0, 0, 0],
    ];
    return LJ.panel(
      "Pembagian akses peran",
      `<div class="notice">${I("info")}Akses mengikuti peran akun yang masuk. Catatan Klien dan penugasan Karyawan dibatasi sesuai pemilik serta penanggung jawabnya.</div>` +
        LJ.table(
          ["Akses", "Admin", "Klien", "Karyawan", "Pimpinan"],
          perms.map(([n, ...v]) => [
            n,
            ...v.map((x) => (x ? I("check", "permission-check") : "—")),
          ]),
        ),
    );
  }
  function taskBoard(ts) {
    return `<div class="task-columns">${["Baru", "Dikerjakan", "Selesai"].map((s) => `<section class="task-column"><h3>${s}<span>${ts.filter((t) => t.status === s).length}</span></h3>${taskCards(ts.filter((t) => t.status === s))}</section>`).join("")}</div>`;
  }
  function documentGrid(ds) {
    return ds.length
      ? `<div class="grid two">${ds.map((doc) => `<article class="document-card"><span class="icon-tile">${I("file")}</span><div><h3>${E(doc.title)}</h3><p>${E(doc.kind)} · ${LJ.date(doc.date)}</p><p>${E(doc.client)}</p><div class="u-mt-7">${LJ.badge(doc.status)}</div></div>${LJ.iBtn("eye", "document", doc.id, "Tinjau dokumen")}</article>`).join("")}</div>`
      : LJ.empty(
          "Belum ada dokumen",
          "Dokumen akan muncul setelah pemesanan diverifikasi.",
        );
  }
  function ticketList(ts, manage = false) {
    return ts.length
      ? `<div class="stack">${ts.map((t) => LJ.panel(E(t.title), `<div class="flex between">${LJ.badge(t.status)}<small class="muted">${LJ.date(t.date)} · ${E(t.category)}</small></div><p class="u-mt-18">${E(t.message)}</p>${t.reply ? `<div class="notice ticket-reply-note">${I("message")}<span><strong>Tanggapan tim</strong><br>${E(t.reply)}</span></div>` : ""}${manage ? `<div class="u-mt-18">${B("Tanggapi permintaan", "ticket-reply", t.id, "secondary small", "message")}</div>` : ""}`)).join("")}</div>`
      : LJ.empty(
          "Belum ada permintaan",
          "Konsultasi dan permintaan Anda akan tersimpan di sini.",
        );
  }
  function profileForm(role, tab) {
    const t = tab || "identity",
      p = LJ.db.profile,
      employee = role === "employee" ? LJ.employee() : null;
    return (
      LJ.tabs(
        [
          ["identity", "Identitas & kontak"],
          ["security", "Identitas & akses"],
          ["notifications", "Notifikasi"],
        ],
        t,
      ) +
      (t === "security"
        ? LJ.panel(
            "Ubah kata sandi akun",
            `<div class="notice">${I("lock")}Kewenangan akun ditetapkan Administrator. Gunakan kata sandi baru minimal 12 karakter untuk menjaga keamanan akun Anda.</div><form id="password-change-form"><div class="form-error" role="alert"></div><div class="form-grid">${[field("current_password", "Kata sandi saat ini", "password"), field("password", "Kata sandi baru", "password", [], { hint: "Minimal 12 karakter." }), field("password_confirmation", "Konfirmasi kata sandi baru", "password")].map((f) => LJ.field(f, "")).join("")}</div><div class="modal-footer">${role === "client" ? A("Lengkapi profil", "client/daftar", "secondary", "edit") : ""}${A("Lupa kata sandi", "forgot-password", "secondary", "user")}<button type="submit" class="btn primary">${I("lock")}Perbarui kata sandi</button></div></form>`,
          )
        : t === "notifications"
          ? LJ.panel(
              "Preferensi notifikasi",
              `<label class="toggle-line"><div><strong>Notifikasi aktivitas</strong><p>Tampilkan pembaruan kegiatan pada pusat notifikasi.</p></div><input type="checkbox" data-profile-notification="${role}" ${p.notifications !== false ? "checked" : ""}></label>`,
            )
          : LJ.panel(
              "Informasi pribadi",
              `<form id="profile-form" data-role="${role}"><div class="form-error" role="alert"></div>${employee ? `<p class="notice">${E(employee.division)} · ${E(employee.position)} · Dikelola Administrator</p>` : ""}<div class="form-grid">${[field("name", "Nama lengkap"), field("email", "Email", "email"), field("phone", "Nomor telepon", "tel", [], { required: false }), field("address", "Alamat", "textarea", [], { required: false, wide: true }), field("currentPassword", "Kata sandi saat ini", "password", [], { required: false, hint: "Diperlukan bila Anda mengubah email akun." })].map((f) => LJ.field(f, p[f.name])).join("")}</div><div class="modal-footer"><button type="submit" class="btn primary">${I("check")}Simpan profil</button></div></form>`,
            ))
    );
  }
  function attendanceTable(items) {
    return LJ.panel(
      "Riwayat kehadiran",
      LJ.table(
        ["Karyawan", "Tanggal", "Masuk", "Pulang", "Status"],
        items.map((a) => [
          E(a.employee),
          LJ.date(a.date),
          E(a.in || "—"),
          E(a.out || "—"),
          LJ.badge(a.status),
        ]),
      ),
    );
  }
  LJ.dashboardShared = {
    field,
    managementOverview,
    analytics,
    homeSummary,
    bookingTable,
    paymentTable,
    paymentCards,
    auditList,
    announcementList,
    taskCards,
    reportCards,
    approvalList,
    constructionTable,
    permissions,
    taskBoard,
    documentGrid,
    ticketList,
    profileForm,
    attendanceTable,
  };
  LJ.bookingTable = bookingTable;
  LJ.paymentTable = paymentTable;
  LJ.reportCards = reportCards;
})();
