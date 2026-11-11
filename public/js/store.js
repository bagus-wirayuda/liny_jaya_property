(function () {
  const bootstrap = LJ.bootstrap;
  const db = LJ.db = bootstrap.data;
  let baseline = structuredClone(db);
  let revision = bootstrap.revision;
  LJ.user = bootstrap.user;
  LJ.endpoints = bootstrap.endpoints;
  LJ.saving = false;

  function syncIdentity() {
    if (!bootstrap.workspace || !LJ.user) return;
    LJ.user.name = db.account.name;
    LJ.user.email = db.account.email;
    LJ.roles[LJ.user.role].person = LJ.user.name;
  }
  syncIdentity();

  async function request(url, payload) {
    if (LJ.saving) throw Error("Tunggu hingga penyimpanan sebelumnya selesai.");
    LJ.saving = true;
    try {
      const response = await fetch(url, {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json", Accept: "application/json", "X-CSRF-TOKEN": bootstrap.csrf },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok) {
        if (response.status === 401 || response.status === 419) {
          throw Error("Sesi telah berakhir. Masuk kembali sebelum menyimpan.");
        }
        throw Error(Object.values(result.errors || {}).flat()[0] || result.message || "Perubahan belum tersimpan.");
      }
      if (result.data) {
        Object.assign(db, result.data);
        baseline = structuredClone(db);
        revision = result.revision;
        syncIdentity();
      }
      return result;
    } catch (error) {
      Object.assign(db, structuredClone(baseline));
      syncIdentity();
      throw error;
    } finally {
      LJ.saving = false;
    }
  }

  const operationalFields = {
    reports: ["unit", "title", "date", "stage", "progress", "description", "issue", "photoData"],
    payments: ["booking", "kind", "amount", "due"],
    leave: ["date", "kind", "reason"],
    documents: ["booking", "title", "kind", "fileData"],
    tickets: ["title", "category", "message"],
    messages: ["subject", "message"],
    company: ["name", "tagline", "email", "phone", "address", "hours", "vision", "mission", "logoData"],
    settings: ["notifications"],
    profile: ["name", "email", "phone", "address", "notifications", "currentPassword"],
  };

  function editableFields(group, operation) {
    const role = LJ.user?.role;
    if (group === "leads" && (!bootstrap.workspace || role === "client")) return ["name", "email", "phone", "project", "unit", "interest", "date", "notes"];
    if (group === "projects" && role === "director") return ["status", "evaluation"];
    if (group === "projects" && role === "admin") return [...LJ.entityConfig().projects.fields.map((field) => field.name), "evaluation"];
    if (group === "expenses" && role === "director") return ["status"];
    if (operation === "update") {
      if (group === "tickets") return ["status", "reply"];
      if (group === "messages") return ["status", "reply"];
      if (group === "leave" || group === "documents") return ["status"];
    }
    return operationalFields[group] || LJ.entityConfig?.()[group]?.fields.map((field) => field.name) || [];
  }

  function edits(group, operation, after, before = {}) {
    return Object.fromEntries(editableFields(group, operation)
      .filter((key) => Object.hasOwn(after, key) && JSON.stringify(after[key]) !== JSON.stringify(before[key]))
      .map((key) => [key, after[key]]));
  }

  LJ.save = async () => {
    const changes = [];
    for (const group of Object.keys(db)) {
      if (["favorites", "audit", "clients", "account", "bookings", "attendance"].includes(group)) continue;
      if (Array.isArray(db[group])) {
        const existing = new Map(baseline[group].map((record) => [record.id, record]));
        for (const record of db[group]) {
          const before = existing.get(record.id);
          existing.delete(record.id);
          if (before && JSON.stringify(record) === JSON.stringify(before)) continue;
          const operation = before ? "update" : "create";
          changes.push({ resource: group, id: String(record.id), operation, fields: edits(group, operation, record, before) });
        }
        for (const id of existing.keys()) changes.push({ resource: group, id: String(id), operation: "delete" });
      } else {
        const fields = edits(group, "update", db[group], baseline[group]);
        if (Object.keys(fields).length) changes.push({ resource: group, id: group === "profile" ? "self" : group, operation: "update", fields });
      }
    }
    if (changes.length) await request(bootstrap.endpoints.update, { revision, workspace: bootstrap.workspace, changes });
    return true;
  };

  LJ.setFavorite = async (id, selected) => {
    await request(bootstrap.endpoints.favorite, { id, selected });
    db.favorites = [...db.favorites.filter((value) => value !== id), ...(selected ? [id] : [])];
    baseline.favorites = [...db.favorites];
  };
  LJ.workflow = async (action, input = {}) => {
    await request(bootstrap.endpoints.workflow.replace(/ACTION$/, action), { revision, input });
    return true;
  };
  LJ.changePassword = (payload) => request(bootstrap.endpoints.passwordUpdate, payload);
  LJ.consultation = (fields) => request(bootstrap.endpoints.update, {
    revision,
    workspace: bootstrap.workspace,
    changes: [{ resource: "leads", id: LJ.uid("LD"), operation: "create", fields }],
  });
  LJ.uid = (prefix) => prefix + "-" + Array.from(crypto.getRandomValues(new Uint8Array(16)), (byte) => byte.toString(16).padStart(2, "0")).join("");
  LJ.today = () => new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Jakarta" });
  LJ.project = (id) => db.projects.find((project) => project.id === id);
  LJ.unit = (id) => db.units.find((unit) => unit.id === id);
  LJ.book = (id) => db.bookings.find((booking) => booking.id === id);
  LJ.employee = () => db.employees.find((employee) => employee.id === LJ.user?.employeeId);
  LJ.employeeName = () => LJ.employee()?.name || "";
  LJ.unitLabel = (id) => {
    const unit = LJ.unit(id);
    return unit ? `${unit.block}-${unit.number} · Tipe ${unit.type}` : "Unit diarsipkan";
  };
  LJ.clientBookings = () => db.bookings;
  LJ.clientPayments = () => db.payments;
  LJ.bookUnit = (id, note, method, consent) => LJ.workflow("book", { id, note, method, consent });
  LJ.cancelBooking = (id) => LJ.workflow("booking-cancel", { id });
  LJ.submitPayment = (id, proof, reference, proofData) => LJ.workflow("payment-submit", { id, proof, reference, proofData });
  LJ.verifyPayment = (id, approved) => LJ.workflow("payment-review", { id, approved });
  LJ.startConstruction = (id) => LJ.workflow("construction-start", { id });
  LJ.approveReport = (id, approved) => LJ.workflow("report-review", { id, approved });
  LJ.handover = (id) => LJ.workflow("handover", { id });
  LJ.metrics = () => ({
    available: db.units.filter((u) => u.sale === "Tersedia").length,
    building: db.units.filter((u) => u.construction === "Dalam pembangunan").length,
    revenue: db.payments.filter((p) => p.status === "Terverifikasi").reduce((sum, p) => sum + p.amount, 0),
    pending: db.payments.filter((p) => p.status === "Menunggu verifikasi").length +
      db.reports.filter((r) => r.status === "Menunggu persetujuan").length +
      db.expenses.filter((e) => e.status === "Menunggu persetujuan").length +
      db.documents.filter((d) => d.status === "Menunggu persetujuan").length +
      db.leave.filter((l) => l.status === "Menunggu persetujuan").length +
      db.tickets.filter((t) => t.category === "Perubahan desain" && ["Baru", "Diproses"].includes(t.status)).length,
  });
})();
