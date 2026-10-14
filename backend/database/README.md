# Migration database

Migration aktif berada di `migrations/` dan mengikuti model Laravel saat ini:
`users`, `categories`, `products`, `orders`, `order_items`, `ratings`,
`personal_access_tokens`, `product_images`, `promos`, dan `product_promo`.

File pembentuk tabel aktif dipulihkan memakai nama yang sudah tercatat pada
database `toko_pancing`. Database yang memiliki riwayat tersebut tidak akan
membuat ulang tabelnya.

## Instalasi baru

Atur koneksi ke database kosong di `backend/.env`, kemudian dari folder backend:

```powershell
php artisan config:clear
php artisan migrate --seed
php artisan storage:link
```

MySQL digunakan aplikasi lokal. SQLite juga didukung untuk pengujian migration.
Migration perubahan enum khusus MySQL dilewati di SQLite; migration dasar sudah
menyediakan semua nilai enum yang digunakan aplikasi.

Seeder utama bisa dijalankan ulang tanpa menduplikasi akun, kategori, promo,
atau relasi promo. Akun yang sudah ada tidak diganti nama atau password-nya.
Akun contoh instalasi baru: `admin@example.com` dan `test@example.com`, password
`password`. Seeder ini untuk pengembangan, bukan pembuatan akun production.

## Database yang sudah dipakai

```powershell
php artisan migrate:status
php artisan migrate
```

Perintah `migrate` tidak menghapus data. Jangan menjalankan `migrate:fresh`,
`migrate:reset`, atau rollback pada database berisi data yang ingin dipertahankan.
Pengujian reset dilakukan hanya pada database pengujian terpisah.

## Arsip skema lama

`legacy-migrations/` menyimpan 13 migration skema Indonesia dari rancangan lama,
seperti `pelanggan`, `produk`, dan `detail_orders`. Folder ini tidak dimuat oleh
`php artisan migrate`. File arsip dipertahankan untuk referensi desain; jangan
menjalankannya pada skema aktif karena tabel `orders` memiliki definisi berbeda.
Tabel lama dan catatan migration yang sudah ada di database tidak dihapus.

## Verifikasi

```powershell
php artisan test --filter=MigrationSetupTest
```

Tes menggunakan SQLite in-memory dan memeriksa instalasi kosong, seeding berulang,
relasi pesanan, serta reset dan pemasangan ulang migration.
