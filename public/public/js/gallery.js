(function () {
  const { icon: I, esc: E } = LJ;
  LJ.pages.public.gallery = function () {
    const category = LJ.publicTab || "all";
    const items = [
      ...LJ.db.projects.map((project) => ({ image: project.image, title: project.name, type: "desain", label: project.city })),
      {
        image: "house-1",
        title: "Konsep hunian modern tropis",
        type: "desain",
        label: "Desain arsitektur",
      },
      {
        image: "construction",
        title: "Referensi tahap struktur dan dinding",
        type: "progres",
        label: "Dokumentasi progres",
      },
      {
        image: "house-3",
        title: "Referensi fasad hunian kontemporer",
        type: "selesai",
        label: "Referensi hunian",
      },
      {
        image: "interior",
        title: "Ruang keluarga · cahaya alami",
        type: "desain",
        label: "Interior",
      },
      {
        image: "neighborhood",
        title: "Referensi lanskap dan ruang hijau",
        type: "desain",
        label: "Desain kawasan",
      },
      {
        image: "house-2",
        title: "Referensi tata ruang bersama",
        type: "selesai",
        label: "Visual arsitektur",
      },
    ];
    return `${LJ.pageHero("Galeri proyek", "Setiap tahap punya cerita.", "Kenali karakter arsitektur, kenyamanan ruang, dan tahapan pekerjaan yang membentuk sebuah hunian.")}<div class="container page-body">${LJ.tabs(
      [
        ["all", "Semua galeri"],
        ["desain", "Desain & interior"],
        ["progres", "Pembangunan"],
        ["selesai", "Selesai"],
      ],
      category,
    )}<div class="gallery-grid">${items
      .filter((x) => category === "all" || x.type === category)
      .map(
        (x) =>
          `<button data-action="gallery" data-id="${x.image}"><img src="${LJ.image(x.image)}" alt="${E(x.title)}" loading="lazy"><h3>${E(x.title)}</h3><p>${E(x.label)} ${I("external", "sm")}</p></button>`,
      )
      .join(
        "",
      )}</div><div class="section">${LJ.panel("Dari struktur menuju ruang yang hidup", `<div class="grid two"><div><img src="${LJ.image("construction")}" alt="Ilustrasi tahap konstruksi" class="gallery-highlight-image"><p class="u-mt-12">Ketelitian di setiap tahap konstruksi</p></div><div><img src="${LJ.image("house-3")}" alt="Ilustrasi rumah selesai" class="gallery-highlight-image"><p class="u-mt-12">Arsitektur yang mengutamakan kenyamanan</p></div></div><p class="legal-note u-mt-14">Kurasi visual arsitektur dan konstruksi untuk memperkenalkan pendekatan perencanaan hunian LinyJaya.</p>`)}</div></div>`;
  };
})();
