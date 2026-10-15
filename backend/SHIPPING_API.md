# API ongkir RajaOngkir/Komerce

## Konfigurasi

Isi `.env` dengan Shipping Cost API key dan lokasi asal toko:

```env
RAJAONGKIR_API_KEY=
RAJAONGKIR_BASE_URL=https://rajaongkir.komerce.id/api/v1
RAJAONGKIR_ORIGIN_ID=
RAJAONGKIR_COURIERS=jne
```

Lokasi asal yang sudah diverifikasi untuk instalasi lokal: ID `70289`,
TELLANG (TELANG), KAMAL, BANGKALAN, JAWA TIMUR, 69162.
Setelah mengubah konfigurasi jalankan `php artisan config:clear`.
Jalankan `php artisan migrate` untuk menambahkan berat produk serta metadata
pengiriman pesanan. Migration tidak memberikan berat perkiraan untuk produk lama.

Semua endpoint berikut memerlukan header `Authorization: Bearer <token-login>`
dan `Accept: application/json`. API key penyedia hanya digunakan backend.

## Kurir

`GET /api/shipping/couriers`

```json
{"data":["jne"]}
```

Kurir awal default adalah JNE. Konfigurasi lokal juga sudah mengaktifkan kurir
berikut setelah API mengembalikan tarif pada uji Telang–Gubeng, Surabaya, 1 kg:

```env
RAJAONGKIR_COURIERS=jne,anteraja,tiki,spx,pos,ide,sap,lion,sicepat
```

Ketersediaan layanan berbeda menurut rute dan berat. J&T tidak mengembalikan
tarif pada rute uji tersebut sehingga belum diaktifkan. Tambahkan kode kurir
lain hanya jika didukung akun dan mengembalikan layanan yang sesuai.

## Pencarian tujuan

`GET /api/shipping/destinations?search=Gubeng`

Minimal tiga karakter; maksimal 10 hasil per pencarian. Respons `data` memuat
`id`, `label`, `city_name`, `district_name`, `subdistrict_name`, dan `zip_code`.
Gunakan ID hasil pencarian, bukan ID kota dari API atau penyedia lain.
Hasil pencarian disimpan dalam cache selama satu jam. Batas 60 request/menit.

## Tarif

`POST /api/shipping/rates`

```json
{
  "destination_id": 69243,
  "courier": "jne",
  "items": [{"product_id": 6, "quantity": 2}]
}
```

ID tujuan di atas adalah GUBENG, GUBENG, SURABAYA, 60281. ID produk hanya contoh;
gunakan produk yang tersedia di database dengan `weight_grams` sudah diisi.

Berat dihitung server dari `products.weight_grams * quantity`. Client tidak
menentukan berat. Maksimal total 100 kg, 100 baris berbeda, jumlah 1–1000 per baris.
Stok dan berat divalidasi sebelum permintaan ke penyedia. Batas 30 request/menit.

Contoh struktur respons (nominal dan estimasi bergantung hasil API saat diminta):

```json
{
  "origin_id": 70289,
  "destination_id": 69243,
  "weight_grams": 1000,
  "rates": [
    {"courier":"jne","name":"JNE","service":"REG","description":"Layanan Reguler","cost":9000,"estimate":"3 day"}
  ]
}
```

`rates: []` berarti tidak ada pilihan yang dapat digunakan. Kegagalan penyedia
menghasilkan HTTP 502; konfigurasi belum lengkap HTTP 503. Tidak ada fallback ke
ongkir nol atau tarif statis. Layanan angkutan kendaraan dengan kode `<`/`>`
tidak ditawarkan untuk barang toko.

## Checkout

`POST /api/orders/checkout` tetap memakai data penerima dan `items`, dengan:

```json
{
  "shipping_destination_id": 69243,
  "shipping_courier": "jne",
  "shipping_service": "REG",
  "shipping_cost": 9000
}
```

Backend mengambil ulang tarif dan menolak HTTP 422 jika layanan atau nominal
berubah/tidak cocok. Frontend harus memperbarui daftar tarif dan meminta pengguna
memilih layanan kembali. Nama kurir, layanan, estimasi, dan biaya yang disimpan
berasal dari respons server. Pesanan menyimpan `shipping_destination_id` dan
`shipping_weight_grams`. Total Snap = subtotal harga produk dari database + ongkir.

## Berat produk

Input admin `weight_grams` berupa integer positif dalam gram (maksimal 100000),
berisi berat per unit termasuk kemasan. Produk baru wajib memiliki berat; produk
lama tetap boleh ada di katalog tetapi tidak dapat dihitung ongkirnya sampai
berat diisi. Admin dapat memperbaruinya melalui halaman produk atau API update
produk yang sudah tersedia. Jangan menetapkan berat arbitrer agar checkout lolos.
Perhitungan saat ini menggunakan berat yang dikirim ke Shipping Cost API;
pengepakan dan biaya khusus joran berdimensi panjang perlu diverifikasi dengan kurir.

## Pengujian

`php artisan test --filter=ShippingTest`

Tes memakai database SQLite in-memory dan respons HTTP yang dimock, sehingga
tidak menggunakan kuota RajaOngkir atau membuat pembayaran nyata.
