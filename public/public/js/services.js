(function () {
  const { icon: I, esc: E, btn: B } = LJ;
  LJ.pages.public.services = function () {
    return `${LJ.pageHero("Layanan kami", "Dari rencana, menjadi ruang nyata.", "Pendampingan menyeluruh dalam merencanakan, membangun, dan memiliki hunian.")}<div class="container page-body"><div class="grid two">${LJ.db.services.map((s) => `<article class="panel"><span class="icon-tile">${I(s.icon)}</span><h3 class="service-card-heading">${E(s.name)}</h3><p class="service-card-copy">${E(s.description)}</p><div class="check-list"><div>${I("check")}Kebutuhan dan lingkup kerja terencana</div><div>${I("check")}Tahapan dan dokumentasi transparan</div></div>${B("Konsultasi Layanan", "consult", s.id, "primary small", "message")}</article>`).join("")}</div><div class="section">${LJ.panel(
      "Bagaimana kami mendampingi Anda?",
      `<div class="grid three">${[
        [
          "01",
          "Konsultasi awal",
          "Pahami kebutuhan, lokasi, anggaran, dan target waktu.",
        ],
        [
          "02",
          "Perencanaan bersama",
          "Tinjau desain, spesifikasi, dan tahapan pekerjaan.",
        ],
        [
          "03",
          "Pelaksanaan terpantau",
          "Ikuti progres dengan laporan dan dokumentasi yang jelas.",
        ],
      ]
        .map(
          ([n, t, d]) =>
            `<div><span class="process-num">${n}</span><h3 class="service-step-heading">${t}</h3><p class="u-text-11">${d}</p></div>`,
        )
        .join("")}</div>`,
    )}</div></div>${LJ.cta()}`;
  };
})();
