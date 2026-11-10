# LinyJaya Development

Aplikasi Laravel untuk website properti serta ruang kerja Administrator, Klien, Karyawan, dan Pimpinan. Desain HTML/CSS/JavaScript asal dipakai melalui Blade dan aset lokal. Data operasional disimpan di database, dengan validasi, sesi login, pembatasan role, dan transaksi pada server.

## Menjalankan secara lokal

PHP 8.5 dan Composer digunakan pada lingkungan yang sudah diuji. Proyek yang telah disiapkan dapat dijalankan dari folder ini.

```sh
php artisan serve --host=127.0.0.1 --port=8000
```

Buka http://localhost:8000/login. Halaman publik ada di http://localhost:8000/. Sesudah login, akun diarahkan ke dashboard sesuai role. Seluruh menu HTML yang sudah ada tetap tersedia melalui Laravel. Aset desain tersedia di public/ dan proses build frontend tidak diperlukan.

Untuk instalasi baru, jalankan composer install, salin .env.example menjadi .env, lalu php artisan key:generate. Proyek menggunakan MySQL dengan database lokal linyjaya_development pada Laragon. Isi host, port, nama database, nama pengguna, dan password MySQL pada .env. Untuk database baru tanpa data, jalankan php artisan migrate --seed.

## Impor database ke server

Ekspor schema dan data tersedia pada database/linyjaya_development.sql. File ini telah diuji dengan impor ulang ke MySQL. Akun, password yang telah di-hash, relasi, serta catatan transaksi ikut diekspor.

1. Buat dan pilih database kosong di server, misalnya melalui phpMyAdmin.
2. Gunakan menu Import untuk mengimpor linyjaya_development.sql. File mengikuti database yang dipilih sehingga nama database server boleh berbeda.
3. Sesuaikan DB_CONNECTION=mysql, DB_HOST, DB_PORT, DB_DATABASE, DB_USERNAME, dan DB_PASSWORD pada .env server.
4. Jalankan php artisan config:clear dan php artisan migrate:status untuk memastikan koneksi serta migrasinya terbaca.

Ekspor sudah berisi tabel migrations. Saat memakai file SQL ini, tidak perlu mengisi data awal kembali. Hindari migrate:fresh pada database yang sudah diimpor karena perintah tersebut menghapus tabel.

Data dari SQLite sebelumnya telah disalin dan dibandingkan isinya dengan MySQL. Salinan database-before-mysql-*.sqlite disimpan di folder database sebagai cadangan sebelum perpindahan.

## Akun dan akses

Seeder membuat akun pengujian hanya pada APP_ENV=local atau testing. Kata sandi awal ditentukan melalui LINYJAYA_SEED_PASSWORD di .env sebelum seeding pertama. Seeder tidak mengganti password akun yang sudah ada.

| Peran | Email awal |
| --- | --- |
| Administrator | admin@linyjaya.example |
| Klien | maya@example.com |
| Karyawan | rafi@example.com |
| Pimpinan | aditya@example.com |

Akun Andi di andi@linyjaya.example tersedia untuk menguji isolasi data antar-Klien. Administrator dapat membuat akun tambahan, menautkan akun Karyawan ke data pegawai, menetapkan role, menonaktifkan, dan mengarsipkan akun melalui Pengaturan Sistem.

Untuk membuat Administrator pada instalasi baru atau lingkungan produksi, gunakan perintah interaktif berikut.

```sh
php artisan linyjaya:admin email-perusahaan@example.com
```

Password dimasukkan secara tersembunyi. Setelah itu, kelola akun lain dari ruang kerja Administrator.

## Modul yang terhubung

- Website publik mengambil proyek, unit, layanan, mitra, artikel, kontak, dan identitas perusahaan dari database. Form konsultasi masuk ke leads Administrator. Favorit tersimpan per akun, atau dalam sesi pengunjung.
- Administrator mengelola proyek, unit, perusahaan, layanan, mitra, leads, penawaran, promo, komunikasi, karyawan, penugasan, jadwal, evaluasi, pengeluaran, artikel, notifikasi, dan akun pengguna. Pembayaran, dokumen, dan permintaan layanan ditangani melalui alur khusus.
- Klien hanya menerima pemesanan, tagihan, dokumen yang tersedia atau disetujui, laporan progres yang disetujui, dan permintaan layanan miliknya.
- Karyawan menerima proyek/unit, tugas, jadwal, laporan, absensi, dan izin yang terkait dengan pegawainya. Pengumuman mengikuti divisi penerima.
- Pimpinan memantau catatan operasional, mengelola penugasan/evaluasi/pengumuman, serta meninjau anggaran, proyek, laporan pembangunan, perubahan desain, dokumen, dan izin.

Pemesanan mengikat satu unit aktif dengan satu Klien. Server membuat tagihan DP 20% dari harga katalog dan menyimpan pilihan metode pembayaran serta persetujuan pengajuan. Metode pembayaran adalah rencana yang dipilih Klien. Simulasi pemasaran pada website tidak mengganti nominal tagihan atau menerapkan persetujuan bank secara otomatis.

DP yang disetujui menghasilkan konfirmasi pemesanan dan tagihan Termin 1 sebesar 30%. Administrator memulai pembangunan dan memberi penugasan. Karyawan mengirim progres. Progres unit diperbarui setelah laporan disetujui. Serah terima memerlukan progres 100% dan total pembayaran terverifikasi yang mencukupi harga unit.

## Penyimpanan dan konsistensi

Setiap kelompok data memiliki tabel dengan payload JSON untuk atribut presentasi. Hubungan proyek, unit, pemesanan, pegawai, dan pemilik akun disimpan dalam kolom foreign key. Kavling dan kehadiran harian memakai indeks unik. Pemesanan aktif memiliki pengunci unit yang unik.

Perubahan dibungkus dalam transaksi database dan diperiksa terhadap revisi server. Halaman yang tertinggal dari data terbaru menerima pesan untuk memuat ulang sebelum menyimpan. Kegagalan validasi membatalkan seluruh perubahan dalam permintaan tersebut.

Lampiran PDF/JPG/PNG/WebP hingga 2 MB disimpan dalam tabel lampiran dengan pemeriksaan isi MIME. Foto laporan dan logo harus berupa gambar. URL lampiran memeriksa hak akses saat dibuka. Klien hanya dapat melihat dokumen miliknya yang telah tersedia atau disetujui. Bukti DP harus tersedia sebelum dapat disetujui.

## Email dan penggunaan operasional

MAIL_MAILER=log digunakan pada lingkungan lokal. Alur lupa kata sandi membuat token dan mencatat pesan email di storage/logs. Untuk pengiriman ke penerima sungguhan, isi konfigurasi SMTP dan MAIL_FROM_ADDRESS pada .env.

Seeder berisi contoh catatan dari desain statis. Alamat, nomor layanan, promosi, rekening penerima, syarat pembayaran, dan legalitas proyek memerlukan data resmi perusahaan sebelum dipublikasikan. Verifikasi pembayaran dilakukan oleh Administrator setelah pemeriksaan bukti dan rekening. Integrasi otomatis dengan bank atau payment gateway memerlukan layanan dan kredensial tersendiri.

Untuk hosting, arahkan document root ke public/, isi APP_URL, gunakan APP_ENV=production dan APP_DEBUG=false, serta atur database, HTTPS, dan SMTP. Siapkan pencadangan database yang menyertakan tabel lampiran.

## Pemeriksaan

```sh
php artisan test --compact
php vendor/bin/pint --dirty --format agent
```

Pengujian mencakup akses role, CRUD, validasi, data antar-Klien, unggahan, transaksi pemesanan sampai serah terima, kehadiran, notifikasi, pendaftaran, dan reset password.

