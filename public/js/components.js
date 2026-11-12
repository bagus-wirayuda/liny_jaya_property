(function () {
  const paths = {
    home: "M3 10 12 3l9 7M5 9v12h5v-7h4v7h5V9",
    arrow: "M4 12h16m-6-6 6 6-6 6",
    chevron: "m9 5 7 7-7 7",
    down: "m6 9 6 6 6-6",
    search: "m21 21-5-5M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0",
    play: "m9 5 11 7-11 7Z",
    pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 0 1 16 0ZM15 10a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    shield: "m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6l9-4Zm-5 10 3 3 7-7",
    gem: "m3 8 4-5h10l4 5-9 13L3 8Zm0 0h18M7 3l5 18 5-18",
    chart: "M4 20h17M6 16v-5h4v5m3 0V7h4v9m-7-9 8-5m-4 0h4v4",
    calculator: "M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm3 4h8v3H8V7Zm0 6h2v2H8v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2Zm-6 4h2v2H8v-2Zm3 0h2v2h-2v-2Zm3 0h2v2h-2v-2",
    layers: "m12 3 10 5-10 5L2 8l10-5Zm-10 9 10 5 10-5M2 16l10 5 10-5",
    bed: "M3 18v-8m18 8v-8M3 14h18M5 10V6h14v4M3 20v-2h18v2M8 10V8m8 2V8",
    bath: "M3 12h18v3a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5v-3Zm2 0V5a3 3 0 0 1 6 0M7 22v-2m10 2v-2",
    area: "M3 8V3h5m8 0h5v5m0 8v5h-5m-8 0H3v-5M8 16l8-8m-8 0h8v8",
    heart:
      "M20.8 4.6a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z",
    check: "m5 12 4 4L19 6",
    close: "m6 6 12 12M6 18 18 6",
    plus: "M12 5v14M5 12h14",
    minus: "M5 12h14",
    menu: "M4 6h16M4 12h16M4 18h16",
    phone:
      "M6 3h4l2 5-3 2a15 15 0 0 0 5 5l2-3 5 2v4c0 2-2 3-4 3C9 20 4 15 3 7c0-2 1-4 3-4Z",
    mail: "M3 5h18v14H3V5Zm0 1 9 7 9-7",
    message: "M21 11a9 9 0 0 1-9 9H3l1.6-5A9 9 0 1 1 21 11ZM8 10h8m-8 4h5",
    building:
      "M4 22V5l9-3v20M13 9h7v13M2 22h20M7 6v1m3-2v1M7 10v1m3-2v1m-3 3v1m3-2v1m-3 3v1m3-2v1m6-5v1m0 3v1",
    tool: "m14 6 4 4m-4-4 1-3 6 6-3 1M4 20l-1-1 9-9 3 3-9 9-2-2Z",
    users:
      "M16 21v-3a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v3M13 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM22 21v-3a4 4 0 0 0-3-4M16 2a4 4 0 0 1 0 8",
    user: "M20 21v-3a5 5 0 0 0-5-5H9a5 5 0 0 0-5 5v3M16 6a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    grid: "M3 3h7v7H3V3Zm11 0h7v7h-7V3ZM3 14h7v7H3v-7Zm11 0h7v7h-7v-7",
    target: "M21 12a9 9 0 1 1-9-9m5 9a5 5 0 1 1-5-5m0 5 9-9m-5 0h5v5",
    clipboard: "M9 3H5v18h14V3h-4M9 2h6v4H9V2Zm-1 9h8m-8 4h5",
    wallet: "M21 8V5H4a2 2 0 0 1 0-4h14v4M3 5v15h18V8H5M16 12h6v5h-6v-5",
    settings:
      "m9 3 1-2h4l1 2 3 2 2 1v4l-1 2 1 2v4l-2 1-3 2-1 2h-4l-1-2-3-2-2-1v-4l1-2-1-2V6l2-1 3-2ZM16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0",
    file: "M14 2H4v20h16V8l-6-6Zm0 0v6h6M8 13h8m-8 4h6",
    calendar: "M4 4h16v18H4V4ZM8 2v5m8-5v5M4 10h16M8 14h2m4 0h2m-8 4h2",
    bell: "M18 8a6 6 0 0 0-12 0v7l-2 3h16l-2-3V8Zm-8 13h4",
    logout: "M9 3H3v18h6m6-14 5 5-5 5m-6-5h11",
    edit: "m15 4 5 5M4 20l5-1L21 7l-5-5L4 14v6Z",
    trash: "M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7m4-7v7",
    eye: "M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12ZM15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0",
    download: "M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5",
    upload: "M12 16V4m-5 5 5-5 5 5M4 16v5h16v-5",
    clock: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 6v6l4 2",
    leaf: "M21 3C7 1 2 6 3 13s12 11 18-10ZM4 20 15 9M8 16v-5m0 5h5",
    star: "m12 2 3 6 7 1-5 5 1 7-6-3-6 3 1-7-5-5 7-1 3-6",
    info: "M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM12 11v6m0-10v.1",
    external: "M14 3h7v7m-9 2 9-9M10 3H3v18h18v-7",
    image: "M3 3h18v18H3V3Zm0 14 6-6 4 4 3-3 5 5M9 7v.1",
    print: "M6 9V2h12v7M6 17H3V9h18v8h-3M6 14h12v8H6v-8",
    filter: "M3 4h18l-7 8v7l-4 2v-9L3 4",
    refresh:
      "M20 7V2m0 5h-5M4 17v5m0-5h5M20 7a9 9 0 0 0-16 2m0 8a9 9 0 0 0 16-2",
    lock: "M5 10h14v12H5V10Zm3 0V6a4 4 0 0 1 8 0v4M12 15v3",
    spark: "m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2",
    flag: "M4 22V3m0 0h14l-3 5 3 5H4",
    moon: "M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z",
    sun: "M12 3v2m0 14v2M3 12h2m14 0h2m-3.5-6.5-1.4 1.4M6.9 17.1l-1.4 1.4m0-11.4 1.4 1.4m10.2 10.2 1.4 1.4M12 7a5 5 0 1 0 0 10 5 5 0 0 0 0-10Z",
    whatsapp:
      "M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.16-.17.2-.35.22-.64.08-.3-.15-1.26-.46-2.39-1.48-.88-.78-1.48-1.76-1.65-2.06-.18-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.38-.03-.52-.07-.15-.67-1.62-.91-2.21-.25-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.8.37-.26.3-1.03 1.02-1.03 2.48s1.06 2.88 1.21 3.08c.15.2 2.1 3.2 5.08 4.48.7.31 1.26.49 1.7.63.7.23 1.35.2 1.86.12.57-.09 1.76-.72 2.01-1.42.25-.69.25-1.28.17-1.41-.07-.12-.27-.2-.57-.35m-5.42 7.4h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.86 9.86 0 0 1-1.5-5.26c0-5.45 4.43-9.89 9.88-9.89 2.64 0 5.12 1.03 6.99 2.9a9.83 9.83 0 0 1 2.89 6.99c0 5.45-4.43 9.89-9.88 9.89m8.41-18.3A11.82 11.82 0 0 0 12.05 0C5.5 0 .16 5.34.16 11.89c0 2.1.55 4.14 1.59 5.95L0 24l6.34-1.66A11.85 11.85 0 0 0 12.06 24h0c6.55 0 11.89-5.34 11.89-11.89a11.82 11.82 0 0 0-3.48-8.41",
  };
  LJ.getTheme = () => {
    try {
      const saved = localStorage.getItem("linyjaya_theme");
      if (saved === "dark" || saved === "light") return saved;
      return typeof window !== "undefined" &&
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    } catch (e) {
      return "light";
    }
  };
  LJ.setTheme = (theme) => {
    const t = theme === "dark" ? "dark" : "light";
    const isDark = t === "dark";
    if (typeof document !== "undefined") {
      if (document.documentElement) {
        document.documentElement.setAttribute("data-theme", t);
        if (isDark) document.documentElement.classList.add("theme-dark");
        else document.documentElement.classList.remove("theme-dark");
      }
      if (document.body) {
        document.body.setAttribute("data-theme", t);
        if (isDark) document.body.classList.add("theme-dark");
        else document.body.classList.remove("theme-dark");
      }
      document.querySelectorAll(".theme-toggle-btn").forEach((btn) => {
        btn.setAttribute(
          "aria-label",
          isDark ? "Ganti ke mode terang" : "Ganti ke mode gelap",
        );
        btn.setAttribute("title", isDark ? "Mode Terang" : "Mode Gelap");
        const icon = btn.querySelector(".icon");
        if (icon) {
          icon.innerHTML = `<path d="${paths[isDark ? "sun" : "moon"]}"/>`;
        }
      });
    }
    try {
      if (typeof localStorage !== "undefined") {
        localStorage.setItem("linyjaya_theme", t);
      }
    } catch (e) {}
    if (LJ.db && LJ.db.settings) LJ.db.settings.theme = t;
  };
  LJ.toggleTheme = () => {
    const next = LJ.getTheme() === "dark" ? "light" : "dark";
    LJ.setTheme(next);
    LJ.toast?.(
      next === "dark" ? "Mode gelap diaktifkan." : "Mode terang diaktifkan.",
    );
  };
  if (typeof document !== "undefined") {
    LJ.setTheme(LJ.getTheme());
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        LJ.setTheme(LJ.getTheme()),
      );
    }
  }
  LJ.icon = (name, cls = "") =>
    `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true"><path d="${paths[name] || paths.home}"/></svg>`;
  LJ.esc = (value) =>
    String(value ?? "").replace(
      /[&<>"']/g,
      (c) =>
        ({
          "&": "&amp;",
          "<": "&lt;",
          ">": "&gt;",
          '"': "&quot;",
          "'": "&#39;",
        })[c],
    );
  LJ.money = (value, short = false) =>
    short
      ? value >= 1e9
        ? "Rp " +
          (value / 1e9).toLocaleString("id-ID", { maximumFractionDigits: 2 }) +
          " M"
        : "Rp " +
          (value / 1e6).toLocaleString("id-ID", { maximumFractionDigits: 1 }) +
          " Jt"
      : new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
          maximumFractionDigits: 0,
        }).format(value || 0);
  LJ.date = (value) =>
    value
      ? new Date(
          value.length === 10 ? value + "T12:00:00" : value,
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "short",
          year: "numeric",
          timeZone: "Asia/Makassar",
        })
      : "—";
  LJ.image = (name) => "assets/images/" + name +
    (matchMedia("(max-width: 950px)").matches ? "-mobile.webp" : ".jpg");
  const DEFAULT_KPR_PRESETS = [
    {
      id: "KPR-BCA-FIX",
      name: "KPR Bank BCA — Fix Promo",
      partnerId: "PT-005",
      bankName: "Bank BCA",
      dpPercent: 20,
      tenorYears: 15,
      interestRate: 4.75,
      badge: "Bank Rekanan",
      note: "Simulasi bunga fix promo kerja sama Bank BCA selama masa awal kredit.",
      active: true,
    },
    {
      id: "KPR-DP-RINGAN",
      name: "KPR DP Ringan 10%",
      partnerId: "",
      bankName: "Bank Rekanan",
      dpPercent: 10,
      tenorYears: 20,
      interestRate: 7.25,
      badge: "DP Rendah",
      note: "Pilihan uang muka ringan 10% dengan tenor panjang agar cicilan lebih terjangkau.",
      active: true,
    },
    {
      id: "KPR-REGULER",
      name: "KPR Reguler Fleksibel",
      partnerId: "",
      bankName: "Bank Umum / Syariah",
      dpPercent: 20,
      tenorYears: 15,
      interestRate: 7.5,
      badge: "Standar",
      note: "Acuan simulasi anuitas standar dengan DP 20% dan pilihan tenor fleksibel.",
      active: true,
    },
  ];
  LJ.paymentConfig = () => {
    const rawKpr = LJ.db?.paymentConfig?.kpr || {};
    return {
      cashKeras: {
        enabled: true,
        label: "Cash Keras",
        dpPercent: 20,
        settlementDays: 14,
        description: "Pembayaran tunai penuh atau tanda jadi diikuti pelunasan dalam batas waktu kesepakatan developer.",
        ...(LJ.db?.paymentConfig?.cashKeras || {}),
      },
      cashLunak: {
        enabled: true,
        label: "Cash Lunak",
        dpPercent: 20,
        tenorMonths: 12,
        maxTenorMonths: 36,
        interestPercent: 0,
        dueDay: 10,
        description: "Pembayaran bertahap langsung ke developer dengan DP dan cicilan bulanan terjadwal.",
        ...(LJ.db?.paymentConfig?.cashLunak || {}),
      },
      kpr: {
        enabled: true,
        label: "KPR",
        dpPercent: 20,
        defaultTenorYears: 15,
        minTenorYears: 5,
        maxTenorYears: 25,
        interestRate: 7.5,
        description: "Pembiayaan KPR melalui bank rekanan; hasil simulasi bersifat estimasi, bukan persetujuan kredit bank.",
        ...rawKpr,
        presets: Array.isArray(rawKpr.presets) ? rawKpr.presets : structuredClone(DEFAULT_KPR_PRESETS),
      },
    };
  };
  LJ.partnerLogo = (p) => p?.logoData || p?.logo || "";
  LJ.kprPartners = () =>
    (LJ.db?.partners || []).filter(
      (p) =>
        (p.status || "Aktif") === "Aktif" &&
        (p.category === "Perbankan & pembiayaan" || String(p.cooperationType || "").startsWith("Bank")),
    );
  LJ.normalizeMethod = (method) => {
    if (method === "Cash Bertahap" || method === "Cash Lunak") return "Cash Lunak";
    if (method === "KPR Bank" || method === "KPR") return "KPR";
    return "Cash Keras";
  };
  LJ.isPromoActive = (promo, onDate = LJ.today()) => {
    if (!promo || promo.status !== "Aktif") return false;
    return Boolean(promo.start && promo.end && onDate >= promo.start && onDate <= promo.end);
  };
  LJ.promoMethods = (promo) =>
    Array.isArray(promo?.eligibleMethods) && promo.eligibleMethods.length
      ? promo.eligibleMethods
      : ["Cash Keras", "Cash Lunak", "KPR"];
  LJ.promoAppliesToUnit = (promo, unit, method = null) => {
    if (!unit || !LJ.isPromoActive(promo)) return false;
    if (promo.unit) {
      if (promo.unit !== unit.id) return false;
    } else if (promo.project) {
      if (promo.project !== unit.project) return false;
    }
    if (method) {
      const canonical = LJ.normalizeMethod(method);
      if (!LJ.promoMethods(promo).includes(canonical)) return false;
    }
    return true;
  };
  LJ.promosForUnit = (unit, method = null) =>
    (LJ.db?.promos || []).filter((promo) => LJ.promoAppliesToUnit(promo, unit, method));
  LJ.promoDiscount = (basePrice, promo) => {
    if (!promo || !Number(promo.discountValue)) return 0;
    const raw =
      promo.discountType === "Nominal"
        ? Math.round(Number(promo.discountValue))
        : Math.round(basePrice * (Number(promo.discountValue) / 100));
    return Math.max(0, Math.min(basePrice, raw));
  };
  LJ.bestPromoForUnit = (unit, method = null) => {
    const promos = LJ.promosForUnit(unit, method);
    let best = null;
    let bestDiscount = 0;
    promos.forEach((promo) => {
      const discount = LJ.promoDiscount(unit.price, promo);
      if (!best || discount > bestDiscount) {
        best = promo;
        bestDiscount = discount;
      }
    });
    return { promo: best, discount: bestDiscount, finalPrice: Math.max(0, unit.price - bestDiscount) };
  };
  LJ.calcKPR = (price, years, dpPercent, annualRatePercent) => {
    const cfg = LJ.paymentConfig().kpr;
    const y = Number(years ?? cfg.defaultTenorYears ?? 15);
    const dpPct = Number(dpPercent ?? cfg.dpPercent ?? 20);
    const ratePct = Number(annualRatePercent ?? cfg.interestRate ?? 7.5);
    const dp = Math.round(price * (dpPct / 100));
    const plafon = Math.max(0, price - dp);
    const months = Math.max(1, y * 12);
    const monthlyRate = ratePct > 1 ? ratePct / 100 / 12 : ratePct / 12;
    if (plafon === 0) return 0;
    if (monthlyRate <= 0) return Math.round(plafon / months);
    const pvif = Math.pow(1 + monthlyRate, months);
    return Math.round((plafon * (monthlyRate * pvif)) / (pvif - 1));
  };
  LJ.simulatePayment = ({
    price,
    unit = null,
    method = "KPR",
    promoId = "",
    presetId = "",
    dpPercent = null,
    tenorMonths = null,
    tenorYears = null,
    interestRate = null,
  }) => {
    const cfg = LJ.paymentConfig();
    const canonical = LJ.normalizeMethod(method);
    const basePrice = Number(unit?.price ?? price ?? 0);
    const promo =
      promoId && unit
        ? LJ.promosForUnit(unit, canonical).find((x) => x.id === promoId) || null
        : promoId
          ? (LJ.db?.promos || []).find((x) => x.id === promoId && LJ.isPromoActive(x) && LJ.promoMethods(x).includes(canonical)) || null
          : null;
    const discountAmount = promo ? LJ.promoDiscount(basePrice, promo) : 0;
    const finalPrice = Math.max(0, basePrice - discountAmount);

    if (canonical === "Cash Keras") {
      const mCfg = cfg.cashKeras;
      const dpPct = Math.max(0, Math.min(100, Number(dpPercent ?? mCfg.dpPercent)));
      const dpAmount = Math.round(finalPrice * (dpPct / 100));
      const settlementAmount = Math.max(0, finalPrice - dpAmount);
      return {
        method: canonical,
        originalPrice: basePrice,
        discountAmount,
        finalPrice,
        promo,
        dpPercent: dpPct,
        dpAmount,
        settlementAmount,
        settlementDays: Number(mCfg.settlementDays || 14),
        totalPayment: finalPrice,
        assumptions: [
          `DP / tanda jadi ${dpPct}% dibayar saat pemesanan (jatuh tempo 7 hari).`,
          `Sisa pelunasan sebesar ${100 - dpPct}% jatuh tempo maksimal ${mCfg.settlementDays} hari setelah verifikasi DP.`,
          "Harga bersih sudah memperhitungkan promo aktif apabila memenuhi syarat.",
        ],
      };
    }

    if (canonical === "Cash Lunak") {
      const mCfg = cfg.cashLunak;
      const maxTenor = Math.max(1, Number(mCfg.maxTenorMonths || 36));
      const dpPct = Math.max(5, Math.min(90, Number(dpPercent ?? mCfg.dpPercent)));
      const months = Math.max(1, Math.min(maxTenor, Math.round(Number(tenorMonths ?? mCfg.tenorMonths))));
      const interestPct = Math.max(0, Number(interestRate ?? mCfg.interestPercent ?? 0));
      const dueDay = Math.max(1, Math.min(28, Number(mCfg.dueDay || 10)));
      const dpAmount = Math.round(finalPrice * (dpPct / 100));
      const principal = Math.max(0, finalPrice - dpAmount);
      const totalInterest = interestPct > 0 ? Math.round(principal * (interestPct / 100) * (months / 12)) : 0;
      const totalInstallments = principal + totalInterest;
      const baseInstallment = Math.floor(totalInstallments / months);
      const remainder = totalInstallments - baseInstallment * months;
      const monthlyInstallment = Math.round(totalInstallments / months);
      const anchor = new Date(LJ.today() + "T12:00:00+08:00");
      const schedule = Array.from({ length: months }, (_, idx) => {
        const d = new Date(anchor.getFullYear(), anchor.getMonth() + idx + 1, dueDay, 12);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        const dd = String(d.getDate()).padStart(2, "0");
        return {
          kind: `Angsuran ${idx + 1}/${months}`,
          amount: baseInstallment + (idx === months - 1 ? remainder : 0),
          due: `${yyyy}-${mm}-${dd}`,
        };
      });
      return {
        method: canonical,
        originalPrice: basePrice,
        discountAmount,
        finalPrice,
        promo,
        dpPercent: dpPct,
        dpAmount,
        principal,
        tenorMonths: months,
        interestPercent: interestPct,
        totalInterest,
        monthlyInstallment,
        dueDay,
        totalPayment: dpAmount + totalInstallments,
        schedule,
        assumptions: [
          `Uang muka (DP) ${dpPct}% dari harga bersih, dibayar saat pemesanan.`,
          `Sisa pokok dicicil langsung ke developer selama ${months} bulan dengan jatuh tempo tanggal ${dueDay} setiap bulan.`,
          interestPct > 0
            ? `Menggunakan bunga/margin flat ${interestPct}% per tahun sesuai ketentuan developer.`
            : "Skema cicilan bertahap 0% bunga langsung kepada developer (tanpa bunga bank).",
        ],
      };
    }

    const mCfg = cfg.kpr;
    const preset = presetId
      ? (mCfg.presets || []).find((item) => item.id === presetId) || null
      : null;
    const minY = Math.max(1, Number(mCfg.minTenorYears || 5));
    const maxY = Math.max(minY, Number(mCfg.maxTenorYears || 25));
    const dpPct = Math.max(5, Math.min(80, Number(dpPercent ?? preset?.dpPercent ?? mCfg.dpPercent)));
    const years = Math.max(minY, Math.min(maxY, Math.round(Number(tenorYears ?? preset?.tenorYears ?? mCfg.defaultTenorYears))));
    const ratePct = Math.max(0, Number(interestRate ?? preset?.interestRate ?? mCfg.interestRate ?? 7.5));
    const dpAmount = Math.round(finalPrice * (dpPct / 100));
    const plafon = Math.max(0, finalPrice - dpAmount);
    const months = years * 12;
    const r = ratePct / 100 / 12;
    let monthlyInstallment = 0;
    if (plafon > 0) {
      if (r > 0) {
        const f = Math.pow(1 + r, months);
        monthlyInstallment = Math.round((plafon * (r * f)) / (f - 1));
      } else {
        monthlyInstallment = Math.round(plafon / months);
      }
    }
    const totalInstallments = monthlyInstallment * months;
    return {
      method: "KPR",
      presetId: preset?.id || null,
      presetName: preset?.name || null,
      bankName: preset?.bankName || null,
      originalPrice: basePrice,
      discountAmount,
      finalPrice,
      promo,
      dpPercent: dpPct,
      dpAmount,
      plafon,
      tenorYears: years,
      tenorMonths: months,
      interestRate: ratePct,
      monthlyInstallment,
      totalInstallments,
      totalInterest: Math.max(0, totalInstallments - plafon),
      totalPayment: dpAmount + totalInstallments,
      disclaimer:
        "Hasil simulasi KPR ini merupakan estimasi perhitungan anuitas dan bukan persetujuan kredit (SP3K) dari bank.",
      assumptions: [
        `Plafon pembiayaan bank dihitung dari Harga Bersih dikurangi DP (${dpPct}%).`,
        `Angsuran per bulan dihitung dengan rumus anuitas efektif: P × r × (1+r)^n / ((1+r)^n - 1) selama ${months} bulan.`,
        `Asumsi suku bunga efektif ${ratePct}% per tahun; suku bunga riil mengikuti kebijakan bank penyalur.`,
        "Estimasi belum termasuk biaya akad, notaris, pajak (BPHTB), provisi, maupun asuransi bank.",
      ],
    };
  };
  LJ.calcPaymentDetails = (price, unit = null) => {
    const cfg = LJ.paymentConfig();
    const cashKeras = LJ.simulatePayment({ price, unit, method: "Cash Keras" });
    const cashLunak = LJ.simulatePayment({ price, unit, method: "Cash Lunak" });
    const kprDefault = LJ.simulatePayment({ price, unit, method: "KPR" });
    const tenor12x = LJ.simulatePayment({ price, unit, method: "Cash Lunak", tenorMonths: Math.min(12, cfg.cashLunak.maxTenorMonths) }).monthlyInstallment;
    const tenor24x = LJ.simulatePayment({ price, unit, method: "Cash Lunak", tenorMonths: Math.min(24, cfg.cashLunak.maxTenorMonths) }).monthlyInstallment;
    const maxLunak = LJ.simulatePayment({ price, unit, method: "Cash Lunak", tenorMonths: cfg.cashLunak.maxTenorMonths }).monthlyInstallment;
    return {
      price,
      cashKeras: {
        ...cashKeras,
        nett: cashKeras.finalPrice,
        dp: cashKeras.dpAmount,
        pelunasan: cashKeras.settlementAmount,
        tenor: `Maks. ${cashKeras.settlementDays} Hari`,
      },
      cashLunak: {
        ...cashLunak,
        dpTotal: cashLunak.dpAmount,
        sisa: cashLunak.principal,
        tenor12x,
        tenor24x,
        tenorMax: maxLunak,
        maxTenorMonths: cfg.cashLunak.maxTenorMonths,
      },
      kpr: {
        ...kprDefault,
        dp: kprDefault.dpAmount,
        tenor10th: LJ.calcKPR(kprDefault.finalPrice, Math.min(10, cfg.kpr.maxTenorYears), cfg.kpr.dpPercent, cfg.kpr.interestRate),
        tenor15th: LJ.calcKPR(kprDefault.finalPrice, Math.min(15, cfg.kpr.maxTenorYears), cfg.kpr.dpPercent, cfg.kpr.interestRate),
        tenor20th: LJ.calcKPR(kprDefault.finalPrice, Math.min(20, cfg.kpr.maxTenorYears), cfg.kpr.dpPercent, cfg.kpr.interestRate),
        tenor25th: LJ.calcKPR(kprDefault.finalPrice, Math.min(25, cfg.kpr.maxTenorYears), cfg.kpr.dpPercent, cfg.kpr.interestRate),
      },
    };
  };
  LJ.whatsappLink = (message) => {
    const phone = (LJ.db?.company?.whatsapp || "6281122334455").replace(/\D/g, "");
    return "https://wa.me/" + phone + "?text=" + encodeURIComponent(message || "Halo Tim LinyJaya Property Makassar, saya ingin konsultasi mengenai hunian dan simulasi pembayaran.");
  };
  LJ.brand = (path = LJ.currentPage.role ? LJ.rolePage(LJ.currentPage.role) : "./") =>
    `<a class="brand" href="${path}" aria-label="LinyJaya Property — Beranda">${LJ.db.company.logoData ? `<img src="${LJ.db.company.logoData}" alt="Logo LinyJaya Property"><span><strong>LinyJaya</strong><small>PROPERTY</small></span>` : '<img class="brand-lockup brand-lockup--light" src="assets/brand/linyjaya-logo.svg" alt="LinyJaya Property"><img class="brand-lockup brand-lockup--dark" src="assets/brand/linyjaya-logo-dark.svg" alt="LinyJaya Property">'}</a>`;
  LJ.btn = (text, action = "", id = "", style = "primary", icon = "") =>
    `<button type="button" class="btn ${style}" ${action ? `data-action="${action}" data-id="${LJ.esc(id)}"` : ""}>${icon ? LJ.icon(icon) : ""}${text}</button>`;
  LJ.link = (text, href, style = "primary", icon = "") =>
    `<a class="btn ${style}" href="${href}">${icon ? LJ.icon(icon) : ""}${text}</a>`;
  LJ.iBtn = (icon, action, id, label) =>
    `<button type="button" class="icon-btn" data-action="${action}" data-id="${LJ.esc(id)}" aria-label="${LJ.esc(label)}" title="${LJ.esc(label)}">${LJ.icon(icon)}</button>`;
  LJ.badge = (status) => {
    let color = [
      "Tersedia",
      "Terverifikasi",
      "DP terverifikasi",
      "Selesai",
      "Disetujui",
      "Hadir",
      "Aktif",
      "Terjual",
      "Diserahterimakan",
    ].includes(status)
      ? "green"
      : ["Ditolak", "Dibatalkan", "Perlu revisi", "Tinggi"].includes(status)
        ? "red"
        : [
              "Dipesan",
              "Menunggu DP",
              "Menunggu verifikasi",
              "Menunggu persetujuan",
              "Belum dibayar",
              "Sedang",
            ].includes(status)
          ? "orange"
          : [
                "Dalam pembangunan",
                "Dikerjakan",
                "Diproses",
                "Pembangunan",
                "Dihubungi",
              ].includes(status)
            ? "blue"
            : "gray";
    return `<span class="tag ${color}"><span class="dot"></span>${LJ.esc(status)}</span>`;
  };
  LJ.empty = (
    title = "Belum ada data",
    desc = "Data baru akan muncul di sini setelah ditambahkan.",
    link = "",
  ) =>
    `<div class="empty-state">${LJ.icon("layers")}<h3>${title}</h3><p>${desc}</p>${link}</div>`;
  LJ.panel = (title, body, action = "", desc = "") =>
    `<section class="panel"><div class="panel-head"><div><h3>${title}</h3>${desc ? `<p>${desc}</p>` : ""}</div>${action}</div>${body}</section>`;
  LJ.table = (headers, rows) =>
    rows.length
      ? `<div class="table-wrap" tabindex="0" role="region" aria-label="Tabel data, geser untuk melihat kolom lainnya"><table class="data-table"><thead><tr>${headers.map((h) => `<th scope="col">${h}</th>`).join("")}</tr></thead><tbody>${rows.map((cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`
      : LJ.empty(
          "Tidak ada hasil",
          "Coba ubah pencarian atau tambahkan data baru.",
        );
  LJ.tabs = (items, active) =>
    `<div class="tabs" role="tablist" aria-label="Pilihan tampilan">${items.map(([id, label]) => `<button type="button" role="tab" aria-selected="${id === active}" class="${id === active ? "active" : ""}" data-tab="${id}">${label}</button>`).join("")}</div>`;
  LJ.progress = (value, label = "", sub = "", color = "") =>
    `<div class="progress-row"><div class="flex between"><strong>${LJ.esc(label)}</strong><span>${value}%</span></div><div class="progress-track ${color}" role="progressbar" aria-valuenow="${value}" aria-valuemin="0" aria-valuemax="100" aria-label="${LJ.esc(label || "Progres pembangunan")}"><span style="--progress-width:${value}%"></span></div>${sub ? `<p class="progress-caption">${LJ.esc(sub)}</p>` : ""}</div>`;
  LJ.kpi = (label, value, icon, detail) =>
    `<article class="kpi"><div class="kpi-top">${label}<span class="icon-tile">${LJ.icon(icon)}</span></div><div class="kpi-value">${value}</div><div class="kpi-bottom">${detail}</div></article>`;
  LJ.kpis = (items) =>
    `<div class="kpi-grid">${items.map((x) => LJ.kpi(...x)).join("")}</div>`;
  LJ.chart = (kind = "revenue") => {
    const ps = LJ.db.projects;
    let values =
      kind === "progress"
        ? ps.map((p) => {
            const us = LJ.db.units.filter((u) => u.project === p.id);
            return us.length
              ? Math.round(us.reduce((s, u) => s + u.progress, 0) / us.length)
              : 0;
          })
        : ps.map((p) =>
            LJ.db.payments
              .filter(
                (x) =>
                  x.status === "Terverifikasi" &&
                  LJ.unit(LJ.book(x.booking)?.unit)?.project === p.id,
              )
              .reduce((s, x) => s + x.amount / 1e6, 0),
          );
    const max = Math.max(...values, 1),
      labels = ps.map((p) => p.name.split(" ").slice(0, 2).join(" "));
    return `<div class="chart-caption"><span><i></i>${kind === "progress" ? "Rata-rata progres unit (%)" : "Pembayaran terverifikasi (Rp juta)"}</span></div><div class="bar-chart">${values.map((v, i) => `<div style="--h:${(v / max) * 85 + 3}%"><span>${v.toLocaleString("id-ID")}</span><small>${LJ.esc(labels[i])}</small></div>`).join("")}</div>`;
  };
  LJ.field = (f, value = "") => {
    const attr = `name="${f.name}" id="f-${f.name}" ${f.required ? "required" : ""} ${f.min !== undefined ? `min="${f.min}"` : ""} ${f.max !== undefined ? `max="${f.max}"` : ""} ${f.step ? `step="${f.step}"` : ""} ${f.type === "file" ? `accept="${f.accept || "image/*,.pdf"}"` : ""}`;
    const placeholders = {
      name: "Nama lengkap",
      email: "Alamat email aktif",
      phone: "Nomor yang dapat dihubungi",
      notes: "Tuliskan kebutuhan atau catatan",
    };
    const placeholder = f.placeholder || placeholders[f.name];
    const placeholderAttr = placeholder
      ? `placeholder="${LJ.esc(placeholder)}"`
      : "";
    let input;
    if (f.type === "select")
      input = `<select class="form-control" ${attr}>${f.options
        .map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          return `<option value="${LJ.esc(v)}" ${String(value) === String(v) ? "selected" : ""}>${LJ.esc(l)}</option>`;
        })
        .join("")}</select>`;
    else if (f.type === "textarea")
      input = `<textarea class="form-control" ${attr} maxlength="${f.maxlength || 3000}" ${placeholderAttr}>${LJ.esc(value)}</textarea>`;
    else if (f.type === "checkbox")
      input = `<input type="checkbox" ${attr} ${value ? "checked" : ""}>`;
    else if (f.type === "checkboxes") {
      const selected = Array.isArray(value) ? value : f.defaultValue || [];
      input = `<div class="checkbox-group" id="f-${f.name}" data-field="${f.name}">${f.options
        .map((o) => {
          const [v, l] = Array.isArray(o) ? o : [o, o];
          const checked = selected.includes(v) ? "checked" : "";
          return `<label class="checkbox-chip"><input type="checkbox" name="${f.name}[]" value="${LJ.esc(v)}" ${checked}><span>${LJ.esc(l)}</span></label>`;
        })
        .join("")}</div>`;
    } else
      input = `<input class="form-control" type="${f.type || "text"}" ${attr} ${f.type !== "file" ? `value="${LJ.esc(value)}"` : ""} ${placeholderAttr} ${!["number", "date", "file"].includes(f.type) ? `maxlength="${f.maxlength || 240}"` : ""}>`;
    return `<div class="field ${f.wide ? "wide" : ""}"><label for="f-${f.name}">${f.label}${f.required ? ' <span class="blue">*</span>' : ""}</label>${input}${f.hint ? `<small>${f.hint}</small>` : ""}</div>`;
  };
  let previousFocus = null,
    modalHandler = null;
  LJ.modal = (title, body, large = false, variant = "") => {
    const root = document.getElementById("modal-root");
    if (!root.contains(document.activeElement)) previousFocus = document.activeElement;
    document.body.classList.add("modal-open");
    if (!variant) {
      if (typeof title === "string" && title.toLowerCase().includes("notifikasi")) {
        variant = "notification";
      } else if (typeof title === "string" && title.toLowerCase().includes("profil")) {
        variant = "profile";
      }
    }
    const trigger = LJ._lastTrigger || (previousFocus && previousFocus !== document.body ? previousFocus : null);
    let anchorClass = "";
    let tRect = null;
    if (trigger && typeof trigger.getBoundingClientRect === "function") {
      tRect = trigger.getBoundingClientRect();
      if ((variant === "profile" || variant === "notification") && tRect.width > 0) {
        anchorClass = tRect.left < window.innerWidth / 2 ? " modal-overlay--anchored-left" : " modal-overlay--anchored-right";
      }
    }
    const modalClass = `modal ${large ? "large " : ""}${variant ? "modal--" + variant : ""}`.trim();
    root.innerHTML =
      `<div class="modal-overlay${variant ? " modal-overlay--" + variant : ""}${anchorClass}"><section role="dialog" aria-modal="true" aria-labelledby="modal-title" class="${modalClass}"><header class="modal-header"><h2 id="modal-title">${title}</h2>${LJ.iBtn("close", "close", "", "Tutup dialog")}</header><div class="modal-body">${body}</div></section></div>`;
    const overlay = root.firstElementChild;
    const modal = overlay.querySelector(".modal");
    if (tRect && tRect.width > 0 && tRect.height > 0) {
      const mRect = modal.getBoundingClientRect();
      const triggerCenterX = tRect.left + tRect.width / 2;
      const triggerCenterY = tRect.top + tRect.height / 2;
      const relX = Math.round(triggerCenterX - mRect.left);
      const relY = Math.round(triggerCenterY - mRect.top);
      modal.style.transformOrigin = `${relX}px ${relY}px`;
      modal.style.setProperty("--morph-x", `${relX}px`);
      modal.style.setProperty("--morph-y", `${relY}px`);
    } else {
      modal.style.transformOrigin = "50% 50%";
    }
    requestAnimationFrame(() =>
      overlay.isConnected && !overlay.inert &&
      overlay.querySelector(".modal-body :is(input, select, textarea), .modal button")?.focus(),
    );
  };
  LJ.closeModal = () => {
    const overlay = document.querySelector("#modal-root > .modal-overlay:not(.is-closing)");
    if (!overlay) return;
    const modal = overlay.querySelector(".modal");
    document.body.classList.remove("modal-open");
    modalHandler = null;
    if (overlay.contains(document.activeElement)) document.activeElement.blur();
    previousFocus?.focus({ preventScroll: true });
    previousFocus = null;
    overlay.inert = true;
    overlay.setAttribute("aria-hidden", "true");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) {
      overlay.remove();
      return;
    }
    overlay.classList.add("is-closing");
    let removed = false;
    const finish = () => {
      if (removed) return;
      removed = true;
      if (overlay.parentNode) overlay.remove();
    };
    overlay.addEventListener("animationend", (event) => {
      if (event.target === overlay || event.target === modal) finish();
    });
    setTimeout(finish, 320);
  };
  LJ.formModal = (
    title,
    fields,
    values,
    callback,
    submit = "Simpan perubahan",
    extra = "",
  ) => {
    LJ.modal(
      title,
      `${extra}<form id="modal-form"><div class="form-error" role="alert"></div><div class="form-grid">${fields.map((f) => LJ.field(f, values?.[f.name] ?? f.value ?? "")).join("")}</div><div class="modal-footer">${LJ.btn("Batal", "close", "", "ghost")}<button class="btn primary" type="submit">${LJ.icon("check")}${submit}</button></div></form>`,
    );
    modalHandler = callback;
  };
  LJ.confirm = (title, text, callback) => {
    LJ.modal(
      title,
      `<p>${text}</p><div class="modal-footer">${LJ.btn("Batal", "close", "", "ghost")}${LJ.btn("Ya, lanjutkan", "confirm", "", "primary", "check")}</div>`,
    );
    modalHandler = callback;
  };
  LJ.runModal = async (form) => {
    const callback = modalHandler;
    if (!callback) return;
    const err = form?.querySelector(".form-error");
    try {
      let data = {};
      if (form) {
        data = Object.fromEntries(new FormData(form));
        form
          .querySelectorAll("input[type=checkbox]:not(.checkbox-group input)")
          .forEach((e) => (data[e.name] = e.checked));
        form
          .querySelectorAll(".checkbox-group[data-field]")
          .forEach((group) => {
            data[group.dataset.field] = [
              ...group.querySelectorAll("input[type=checkbox]:checked"),
            ].map((cb) => cb.value);
          });
      }
      const button = form?.querySelector("[type=submit]");
      if (button) button.disabled = true;
      await callback(data, form);
      LJ.closeModal();
      LJ.render();
    } catch (e) {
      if (err) err.textContent = e.message;
      else LJ.toast(e.message, "error");
      const button = form?.querySelector("[type=submit]");
      if (button) button.disabled = false;
    }
  };
  let toastTimer;
  LJ.toast = (message, type = "success") => {
    clearTimeout(toastTimer);
    document.getElementById("toast-root").innerHTML =
      `<div class="toast ${type === "error" ? "error" : ""}">${LJ.icon(type === "error" ? "info" : "check")}<span>${LJ.esc(message)}</span></div>`;
    toastTimer = setTimeout(
      () => (document.getElementById("toast-root").innerHTML = ""),
      5000,
    );
  };
  LJ.fileData = (file) =>
    new Promise((resolve, reject) => {
      if (!file?.size) return resolve("");
      if (file.size > 2 * 1024 * 1024)
        return reject(Error("Ukuran berkas maksimal 2 MB."));
      if (!/^(image\/(jpeg|png|webp)|application\/pdf)$/.test(file.type))
        return reject(Error("Gunakan berkas JPG, PNG, WebP, atau PDF."));
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = () => reject(Error("Berkas tidak dapat dibaca."));
      reader.readAsDataURL(file);
    });
  LJ.download = (name, content, type = "text/plain") => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([content], { type }));
    a.download = name;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };
  LJ.blueprint = (type) =>
    `<svg class="blueprint" viewBox="0 0 480 350" role="img" aria-label="Denah ilustrasi rumah tipe ${LJ.esc(type)}"><defs><pattern id="bp-grid" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M20 0H0V20" stroke="#e1ebf7" stroke-width=".5" fill="none"/></pattern></defs><rect width="480" height="350" fill="url(#bp-grid)"/><path class="dim" d="M85 25h310M85 20v10m310-10v10M65 45v260m-5-260h10m-10 260h10"/><text x="210" y="20">6.00 m</text><text transform="translate(50 200) rotate(-90)">9.00 m</text><path class="wall" d="M90 45h300v260H90V45Zm0 115h300m-150 0v145M90 235h150m75-190v115M210 45v115"/><path class="room" d="M106 60h85v80h-85Zm123 0h68v80h-68Zm104 0h40v80h-40ZM106 177h115v40H106Zm151 0h115v100H257Z"/><path d="M243 307h65m-65 0v-45a45 45 0 0 1 45 45M90 160h55m-55 0v45a45 45 0 0 0 45-45" fill="none" stroke="#4d739d" stroke-width="1.3"/><text x="115" y="105">Kamar 1</text><text x="231" y="105">Kamar 2</text><text x="337" y="105">KM</text><text x="118" y="200">Dapur</text><text x="269" y="225">R. keluarga</text><text x="117" y="279">Taman</text><text x="158" y="335">Denah ilustrasi · ${LJ.esc(type)} · bukan gambar kerja</text></svg>`;
  LJ.sitePlan = (project, selected = "") =>
    `<div class="site-plan"><h4>SITE PLAN · ${LJ.esc(LJ.project(project)?.name || "")}</h4><div class="plan-units">${LJ.db.units
      .filter((u) => u.project === project)
      .map(
        (u) =>
          `<button class="plot ${u.sale === "Tersedia" ? "" : u.sale === "Dipesan" ? "booked" : "sold"} ${selected === u.id ? "selected" : ""}" data-action="select-plot" data-id="${u.id}" title="${LJ.unitLabel(u.id)} · ${u.sale}" aria-label="${LJ.unitLabel(u.id)}: ${u.sale}">${LJ.icon("home")}<span>${u.block}-${u.number}</span><small>${u.type}</small></button>`,
      )
      .join(
        "",
      )}</div><div class="plan-road">JALAN UTAMA · AKSES KAWASAN</div><div class="plan-green-space">${LJ.icon("leaf")} RUANG TERBUKA HIJAU</div><div class="plan-legend"><span><i class="legend-dot"></i>Tersedia</span><span><i class="legend-dot orange"></i>Dipesan</span><span><i class="legend-dot gray"></i>DP / terjual</span></div><p class="plan-instructions">Pilih kavling untuk melihat tipe hunian, harga, dan status ketersediaannya.</p></div>`;
  LJ.timeline = (u) => {
    const stages = [
      ["Persiapan", 5],
      ["Pondasi", 20],
      ["Struktur & dinding", 50],
      ["Atap & instalasi", 75],
      ["Finishing", 100],
      ["Serah terima", 101],
    ];
    let idx = stages.findIndex((x) => x[0] === u.stage);
    if (u.construction === "Diserahterimakan") idx = 6;
    return `<div class="timeline">${stages.map(([s, n], i) => `<div class="timeline-item ${i < idx ? "done" : i === idx ? "current" : ""}"><span class="timeline-dot">${LJ.icon(i < idx ? "check" : i === idx ? "tool" : "clock")}</span><div class="timeline-content"><h4>${s}</h4><p>${i < idx ? "Tahap telah selesai" : i === idx ? "Tahap pekerjaan saat ini" : "Tahap berikutnya"}</p></div><small>${i < idx ? "Selesai" : i === idx ? u.progress + "%" : "Terjadwal"}</small></div>`).join("")}</div>`;
  };
})();
