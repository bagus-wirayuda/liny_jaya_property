(function () {
  LJ.pages.client.access = () => {
    const profile = LJ.db.profile;
    return `<section class="section soft"><div class="container"><div class="panel auth-box client-access-panel"><h1>Lengkapi profil klien.</h1><p>Identitas dan kontak untuk catatan kebutuhan hunian.</p><form id="profile-form"><div class="form-error" role="alert"></div><div class="stack">${LJ.field({ name: "name", label: "Nama lengkap", required: true }, profile.name)}${LJ.field({ name: "email", label: "Alamat email", type: "email", required: true }, profile.email)}${LJ.field({ name: "phone", label: "Nomor telepon", type: "tel" }, profile.phone)}${LJ.field({ name: "currentPassword", label: "Kata sandi saat ini", type: "password", hint: "Diperlukan bila Anda mengubah email akun." })}<button type="submit" class="btn primary full">Simpan profil</button><a class="text-link" href="client/profile">Kembali ke profil</a></div></form></div></div></section>`;
  };
})();
