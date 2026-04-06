# SPESIFIKASI KEBUTUHAN PERANGKAT LUNAK
## Sistem Informasi Toko Pancing Online

---

## 3.1.5 DESKRIPSI FUNGSIONAL

Sistem Informasi Toko Pancing Online adalah platform e-commerce berbasis web yang dirancang untuk memfasilitasi transaksi jual-beli peralatan memancing antara penjual (admin) dan pembeli (pelanggan). Sistem ini mengintegrasikan frontend React dengan backend Laravel untuk memberikan pengalaman pengguna yang seamless dan manajemen inventory yang efisien.

### Komponen Utama Sistem:

**1. Modul Autentikasi dan Otorisasi**
- Pendaftaran akun baru untuk pelanggan
- Login dengan email dan password
- Manajemen role (admin/user)
- Logout dan sesi token
- Keamanan menggunakan Laravel Sanctum dengan JWT tokens

**2. Modul Produk**
- Katalog produk dengan kategori
- Filter produk (kategori, brand, lokasi, harga, stok)
- Pencarian produk
- Detail produk lengkap dengan spesifikasi
- Manajemen inventori

**3. Modul Keranjang dan Transaksi**
- Penambahan produk ke keranjang
- Update kuantitas barang
- Hapus barang dari keranjang
- Checkout dengan pengisian data pengiriman
- Pemilihan metode pembayaran

**4. Modul Pesanan**
- Lacak status pesanan real-time
- Timeline pengiriman
- Upload bukti pembayaran
- Pembatalan pesanan dengan pengembalian stok
- History pesanan

**5. Modul Admin**
- Dashboard dengan analytics penjualan
- Manajemen produk (CRUD lengkap)
- Manajemen kategori
- Manajemen pesanan (verifikasi pembayaran, update status)
- Chart penjualan harian/mingguan/bulanan
- Laporan keuangan

---

## 3.1.6 KEBUTUHAN FUNGSIONAL

### A. KEBUTUHAN FUNGSIONAL PELANGGAN

#### AF-001: Registrasi Akun Pelanggan
- **Deskripsi**: Pelanggan baru dapat membuat akun dengan mengisi nama, email, dan password
- **Aktor**: Calon Pelanggan
- **Pre-condition**: User belum memiliki akun
- **Main Flow**:
  1. User membuka halaman register
  2. User mengisi form (nama, email, password, konfirmasi password)
  3. User melihat indikator kekuatan password
  4. User melihat notifikasi kecocokan password
  5. User klik tombol "Buat Akun"
  6. Sistem validasi data
  7. Sistem menyimpan data ke database
  8. Sistem mengirimkan token autentikasi
  9. User diarahkan ke homepage
- **Post-condition**: Akun berhasil dibuat, user logged in
- **Validasi**: 
  - Email harus unik
  - Password minimal 8 karakter
  - Password dan konfirmasi harus sama
  - Semua field wajib diisi

#### AF-002: Login ke Sistem
- **Deskripsi**: Pelanggan dapat login dengan email dan password
- **Aktor**: Pelanggan terdaftar
- **Pre-condition**: User punya akun dan belum login
- **Main Flow**:
  1. User membuka halaman login
  2. User mengisi email dan password
  3. User dapat menggunakan tombol eye untuk melihat password
  4. User klik tombol "Masuk"
  5. Sistem validasi kredensial
  6. Sistem menghasilkan JWT token
  7. Sistem menyimpan token di localStorage
  8. User diarahkan ke homepage
- **Post-condition**: User berhasil login
- **Error Handling**: Email/password salah → tampilkan pesan error

#### AF-003: Lihat Katalog Produk
- **Deskripsi**: Pelanggan dapat melihat daftar produk dengan filter
- **Aktor**: Pengunjung/Pelanggan
- **Pre-condition**: Produk sudah ada di database
- **Main Flow**:
  1. User membuka halaman utama
  2. Sistem menampilkan list produk
  3. User dapat melihat: nama, harga, brand, lokasi stok
  4. User dapat menggunakan search bar
  5. User dapat membuka filter modal
- **Filter Tersedia**:
  - Kategori
  - Brand
  - Lokasi
  - Range harga (min-max)
  - Stok tersedia
  - Search query
- **Post-condition**: Daftar produk ditampilkan sesuai filter

#### AF-004: Lihat Detail Produk
- **Deskripsi**: Pelanggan dapat melihat detail lengkap suatu produk
- **Aktor**: Pengunjung/Pelanggan
- **Main Flow**:
  1. User klik produk di list
  2. Sistem menampilkan detail produk:
     - Nama lengkap
     - Harga
     - Deskripsi
     - Brand
     - Kategori
     - Lokasi stok
     - Spesifikasi teknis
     - Stok tersedia
     - Tombol "Tambah ke Keranjang"
- **Post-condition**: Detail produk ditampilkan

#### AF-005: Tambah Ke Keranjang
- **Deskripsi**: Pelanggan dapat menambahkan produk ke keranjang belanja
- **Aktor**: Pelanggan
- **Pre-condition**: User sudah login, produk dipilih
- **Main Flow**:
  1. User klik tombol "Tambah ke Keranjang"
  2. Sistem menampilkan konfirmasi
  3. Item ditambahkan ke keranjang
  4. Update badge jumlah item di navbar
  5. Tampilkan notifikasi sukses
- **Post-condition**: Item tersimpan di context cart

#### AF-006: Kelola Keranjang
- **Deskripsi**: Pelanggan dapat melihat dan mengelola isi keranjang
- **Aktor**: Pelanggan
- **Main Flow**:
  1. User klik ikon keranjang di navbar
  2. Drawer keranjang terbuka menampilkan:
     - Daftar item dengan gambar, nama, harga
     - Tombol +/- untuk update kuantitas
     - Tombol hapus item
     - Total harga
     - Tombol checkout
  3. User dapat ubah kuantitas atau hapus item
  4. Total harga diperbarui otomatis
- **Post-condition**: Keranjang diperbarui

#### AF-007: Checkout
- **Deskripsi**: Pelanggan melakukan checkout dan membuat pesanan
- **Aktor**: Pelanggan (harus login)
- **Pre-condition**: Ada item di keranjang
- **Main Flow**:
  1. User klik "Checkout" dari keranjang
  2. User diarahkan ke halaman checkout (protected)
  3. Form checkout ditampilkan dengan field:
     - Alamat pengiriman
     - Kota
     - Nomor telepon
     - Metode pembayaran (Transfer Bank/E-Wallet)
  4. User mengisi form
  5. User review pesanan
  6. User klik "Buat Pesanan"
  7. Sistem validasi data
  8. Sistem membuat order dan order items di database
  9. Sistem update stok produk
  10. Order dibuat dengan status "pending"
- **Post-condition**: Pesanan terbuat, user diarahkan ke halaman order tracking
- **Validasi**: Semua field wajib diisi

#### AF-008: Lacak Pesanan
- **Deskripsi**: Pelanggan dapat melacak status pesanan mereka
- **Aktor**: Pelanggan
- **Main Flow**:
  1. User klik menu "Pesanan Saya" atau dari link di checkout
  2. Sistem menampilkan list pesanan user
  3. User klik pesanan untuk detail
  4. Halaman tracking ditampilkan dengan:
     - ID pesanan
     - Status pesanan (timeline)
     - Total harga
     - Items dalam pesanan
     - Tanggal pemesanan
     - Alamat pengiriman
     - Metode pembayaran
  5. Jika status "pending", tampilkan upload bukti bayar
  6. User dapat upload bukti pembayaran
- **Status Timeline**:
  - Pending (menunggu pembayaran)
  - Processing (diproses admin)
  - Shipped (sedang dikirim)
  - Delivered (sudah diterima)
- **Post-condition**: User dapat melihat tracking pesanan

#### AF-009: Upload Bukti Pembayaran
- **Deskripsi**: Pelanggan upload bukti transfer/bayar
- **Aktor**: Pelanggan
- **Main Flow**:
  1. User di halaman tracking order dengan status "pending"
  2. User klik "Upload Bukti Pembayaran"
  3. File dialog terbuka
  4. User pilih gambar/file bukti bayar
  5. User klik "Upload"
  6. Sistem validasi file (format, ukuran)
  7. Sistem simpan file
  8. Sistem set status menjadi "payment_submitted"
  9. Tampilkan notifikasi sukses
- **Post-condition**: Bukti pembayaran tersimpan, menunggu verifikasi admin

#### AF-010: Batal Pesanan
- **Deskripsi**: Pelanggan dapat membatalkan pesanan dengan syarat tertentu
- **Aktor**: Pelanggan
- **Pre-condition**: Pesanan status "pending" atau "processing"
- **Main Flow**:
  1. User di halaman tracking dan klik "Batalkan Pesanan"
  2. Sistem tampilkan konfirmasi
  3. User konfirmasi pembatalan
  4. Sistem update status order menjadi "cancelled"
  5. Sistem restore stok produk
  6. Tampilkan notifikasi sukses
- **Post-condition**: Pesanan dibatalkan, stok dikembalikan

#### AF-011: Logout
- **Deskripsi**: Pelanggan dapat logout dari sistem
- **Aktor**: Pelanggan
- **Main Flow**:
  1. User klik tombol logout di navbar
  2. Sistem hapus token dari localStorage
  3. Sistem reset auth context
  4. User diarahkan ke halaman login
- **Post-condition**: User logout, session berakhir

---

### B. KEBUTUHAN FUNGSIONAL ADMIN

#### AF-012: Login Admin
- **Deskripsi**: Admin login ke sistem (sama seperti AF-002 tapi akun role "admin")
- **Validasi**: Hanya user dengan role "admin" yang bisa akses admin panel

#### AF-013: Lihat Dashboard Admin
- **Deskripsi**: Admin melihat dashboard dengan analytics penjualan
- **Aktor**: Admin
- **Main Flow**:
  1. Admin login dan klik tombol "Admin"
  2. Admin diarahkan ke dashboard
  3. Dashboard menampilkan:
     - Total penjualan (jumlah unit)
     - Total pesanan
     - Pesanan pending pembayaran
     - Total produk
     - Produk stok rendah
     - Chart penjualan harian/mingguan/bulanan
     - Tabel pesanan terbaru
  4. Admin dapat pilih period chart (daily/weekly/monthly)
- **Post-condition**: Dashboard ditampilkan dengan data real-time

#### AF-014: Kelola Produk - Lihat List
- **Deskripsi**: Admin melihat daftar semua produk
- **Aktor**: Admin
- **Main Flow**:
  1. Admin klik "Produk" di sidebar
  2. Halaman produk ditampilkan dengan:
     - Tabel daftar produk
     - Search bar
     - Pagination
     - Kolom: Nama, Brand, Harga, Stok, Lokasi
     - Tombol Edit dan Delete per item
     - Tombol "Tambah Produk"
- **Search**: Cari by nama atau brand
- **Post-condition**: List produk ditampilkan

#### AF-015: Kelola Produk - Tambah
- **Deskripsi**: Admin menambah produk baru
- **Aktor**: Admin
- **Main Flow**:
  1. Admin klik "Tambah Produk"
  2. Modal form ditampilkan
  3. Admin isi form:
     - Nama produk
     - Deskripsi
     - Category ID
     - Harga
     - Stok
     - Brand
     - Lokasi (dropdown)
     - Spesifikasi (JSON)
  4. Admin klik "Simpan"
  5. Sistem validasi
  6. Sistem simpan ke database
  7. List refresh
- **Post-condition**: Produk baru tersimpan

#### AF-016: Kelola Produk - Edit
- **Deskripsi**: Admin mengedit data produk
- **Aktor**: Admin
- **Main Flow**: Mirip AF-015 tapi untuk update, field pre-filled dengan data lama

#### AF-017: Kelola Produk - Hapus
- **Deskripsi**: Admin menghapus produk
- **Aktor**: Admin
- **Main Flow**:
  1. Admin klik tombol hapus di row produk
  2. Sistem tampilkan konfirmasi
  3. Admin konfirmasi
  4. Sistem hapus dari database
  5. List refresh
- **Post-condition**: Produk terhapus

#### AF-018: Kelola Kategori
- **Deskripsi**: Admin mengelola kategori produk (CRUD)
- **Aktor**: Admin
- **Main Flow**: Sama seperti kelola produk (AF-014 sampai AF-017)
- **Form Category**: Nama kategori, Deskripsi

#### AF-019: Kelola Pesanan - Lihat List
- **Deskripsi**: Admin melihat daftar pesanan
- **Aktor**: Admin
- **Main Flow**:
  1. Admin klik "Pesanan" di sidebar
  2. Halaman pesanan ditampilkan dengan:
     - Tabel pesanan
     - Filter by status
     - Search by ID atau nama pembeli
     - Kolom: ID, Pembeli, Total, Status, Pembayaran, Tanggal
     - Status badge dengan warna berbeda
     - Tombol view detail

#### AF-020: Kelola Pesanan - View Detail & Verifikasi Pembayaran
- **Deskripsi**: Admin melihat detail pesanan dan verifikasi pembayaran
- **Aktor**: Admin
- **Main Flow**:
  1. Admin klik view icon di pesanan
  2. Modal detail terbuka menampilkan:
     - Info pembeli
     - Total pesanan
     - Metode pembayaran
     - Status pembayaran
     - Tombol "Terima" / "Tolak" pembayaran (jika pending)
     - Dropdown update status pesanan
     - Input field nomor tracking
     - Tombol "Simpan"
  3. Admin klik "Terima" untuk verifikasi pembayaran
  4. Sistem update status pembayaran menjadi "verified"
  5. Status pesanan auto-update ke "processing"
  6. Notifikasi sukses

#### AF-021: Kelola Pesanan - Tolak Pembayaran
- **Deskripsi**: Admin menolak pembayaran pesanan
- **Aktor**: Admin
- **Main Flow**:
  1. Admin klik "Tolak" di modal detail pesanan
  2. Status pembayaran menjadi "rejected"
  3. Pesanan kembali ke status "pending"
  4. Pelanggan harus upload ulang bukti bayar
- **Post-condition**: Pembayaran ditolak

#### AF-022: Kelola Pesanan - Update Status
- **Deskripsi**: Admin update status pesanan
- **Aktor**: Admin
- **Status Options**: Pending, Processing, Shipped, Delivered
- **Main Flow**:
  1. Admin buka modal detail pesanan
  2. Admin pilih status baru dari dropdown
  3. Di status "shipped", admin wajib isi nomor tracking
  4. Admin klik "Simpan"
  5. Sistem update database
  6. Notifikasi sukses
- **Post-condition**: Status pesanan terupdate

---

## 3.2 KEBUTUHAN DATA

### 3.2.1 ENTITY RELATIONSHIP DIAGRAM (ERD)

```
┌─────────────────┐
│     USERS       │
├─────────────────┤
│ id (PK)         │◄──────────┐
│ name            │           │
│ email           │           │
│ password        │           │
│ role (enum)     │           │
│ created_at      │           │
│ updated_at      │           │
└─────────────────┘           │
                              │
                    ┌─────────┴──────────┐
                    │ (1) : (M)          │
                    │                    │
        ┌───────────────────────┐  ┌──────────────────┐
        │      ORDERS           │  │  ORDER_ITEMS     │
        ├───────────────────────┤  ├──────────────────┤
        │ id (PK)               │  │ id (PK)          │
        │ user_id (FK)          │◄─┤ order_id (FK)    │
        │ total_price           │  │ product_id (FK)  │
        │ status (enum)         │  │ quantity         │
        │ payment_method        │  │ price            │
        │ payment_proof         │  │ created_at       │
        │ payment_status (enum) │  │ updated_at       │
        │ shipping_address      │  └──────────────────┘
        │ shipping_city         │           │
        │ shipping_phone        │           │
        │ tracking_number       │           │
        │ shipped_at            │           │
        │ delivered_at          │           │
        │ created_at            │           │ (M) : (1)
        │ updated_at            │           │
        └───────────────────────┘           │
                                            │
        ┌───────────────────────────────────┘
        │
        │ (M) : (1)
        │
    ┌───────────────┐
    │   PRODUCTS    │
    ├───────────────┤
    │ id (PK)       │
    │ category_id   │◄────────┐
    │ name          │         │ (M) : (1)
    │ description   │         │
    │ price         │   ┌──────────────┐
    │ stock         │   │ CATEGORIES   │
    │ brand         │   ├──────────────┤
    │ location      │   │ id (PK)      │
    │ specifications│   │ name         │
    │ created_at    │   │ description  │
    │ updated_at    │   │ created_at   │
    └───────────────┘   │ updated_at   │
                        └──────────────┘
```

**Penjelasan Relasi:**
- **USERS (1) : (M) ORDERS** - Satu user dapat membuat banyak pesanan
- **ORDERS (1) : (M) ORDER_ITEMS** - Satu pesanan dapat memiliki banyak item
- **ORDER_ITEMS (M) : (1) PRODUCTS** - Banyak order items merujuk ke satu produk
- **PRODUCTS (M) : (1) CATEGORIES** - Banyak produk dalam satu kategori

---

### 3.2.2 RANCANGAN SIMPANAN DATA (DATABASE SCHEMA)

#### Tabel: USERS

```sql
CREATE TABLE users (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  email_verified_at TIMESTAMP NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('user', 'admin') DEFAULT 'user',
  remember_token VARCHAR(100) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  KEY idx_email (email),
  KEY idx_role (role)
);
```

**Penjelasan Field:**
- `id`: Primary key, auto increment
- `name`: Nama pengguna
- `email`: Email untuk login, unique
- `password`: Hash password bcrypt
- `role`: Role pengguna (user/admin)
- `created_at/updated_at`: Timestamp otomatis

---

#### Tabel: CATEGORIES

```sql
CREATE TABLE categories (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(255) NOT NULL,
  description TEXT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  KEY idx_name (name)
);
```

**Penjelasan Field:**
- `id`: Primary key
- `name`: Nama kategori (misal: "Rod Pancing", "Umpan")
- `description`: Deskripsi kategori
- `created_at/updated_at`: Timestamp

---

#### Tabel: PRODUCTS

```sql
CREATE TABLE products (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  category_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  description LONGTEXT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  brand VARCHAR(100) NOT NULL,
  location VARCHAR(100) NOT NULL,
  specifications JSON NULL,
  image_url VARCHAR(255) NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
  KEY idx_brand (brand),
  KEY idx_location (location),
  KEY idx_stock (stock),
  KEY idx_price (price)
);
```

**Penjelasan Field:**
- `id`: Primary key
- `category_id`: FK ke categories
- `name`: Nama produk
- `description`: Deskripsi panjang
- `price`: Harga produk (2 desimal)
- `stock`: Jumlah stok tersedia
- `brand`: Brand produk
- `location`: Lokasi stok (Jakarta, Surabaya, Bandung, Medan)
- `specifications`: JSON field untuk spesifikasi teknis (misal: {"berat": "50g", "panjang": "1m"})
- `image_url`: URL gambar produk

---

#### Tabel: ORDERS

```sql
CREATE TABLE orders (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  total_price DECIMAL(12, 2) NOT NULL,
  status ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled') DEFAULT 'pending',
  payment_method VARCHAR(50) NOT NULL,
  payment_proof VARCHAR(255) NULL,
  payment_status ENUM('pending', 'verified', 'rejected') DEFAULT 'pending',
  shipping_address TEXT NOT NULL,
  shipping_city VARCHAR(100) NOT NULL,
  shipping_phone VARCHAR(20) NOT NULL,
  tracking_number VARCHAR(100) NULL,
  shipped_at TIMESTAMP NULL,
  delivered_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  KEY idx_user_id (user_id),
  KEY idx_status (status),
  KEY idx_payment_status (payment_status),
  KEY idx_created_at (created_at)
);
```

**Penjelasan Field:**
- `id`: Primary key
- `user_id`: FK ke users
- `total_price`: Total harga pesanan
- `status`: Status pesanan (pending/processing/shipped/delivered/cancelled)
- `payment_method`: Metode pembayaran
- `payment_proof`: File path bukti pembayaran
- `payment_status`: Status pembayaran
- `shipping_address`: Alamat pengiriman
- `shipping_city`: Kota pengiriman
- `shipping_phone`: Nomor telepon penerima
- `tracking_number`: Nomor resi pengiriman
- `shipped_at/delivered_at`: Timestamp pengiriman

---

#### Tabel: ORDER_ITEMS

```sql
CREATE TABLE order_items (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  order_id BIGINT UNSIGNED NOT NULL,
  product_id BIGINT UNSIGNED NOT NULL,
  quantity INT NOT NULL,
  price DECIMAL(12, 2) NOT NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
  FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
  KEY idx_order_id (order_id),
  KEY idx_product_id (product_id)
);
```

**Penjelasan Field:**
- `id`: Primary key
- `order_id`: FK ke orders
- `product_id`: FK ke products
- `quantity`: Jumlah item yang dipesan
- `price`: Harga satuan pada saat pembelian

---

#### Tabel: PERSONAL_ACCESS_TOKENS (Sanctum)

```sql
CREATE TABLE personal_access_tokens (
  id BIGINT UNSIGNED PRIMARY KEY AUTO_INCREMENT,
  tokenable_type VARCHAR(255) NOT NULL,
  tokenable_id BIGINT UNSIGNED NOT NULL,
  name VARCHAR(255) NOT NULL,
  token VARCHAR(80) UNIQUE NOT NULL,
  abilities LONGTEXT NULL,
  last_used_at TIMESTAMP NULL,
  created_at TIMESTAMP NULL,
  updated_at TIMESTAMP NULL,
  INDEX idx_tokenable (tokenable_type, tokenable_id)
);
```

**Penjelasan**: Tabel untuk menyimpan API tokens (digunakan Laravel Sanctum untuk autentikasi)

---

### 3.3.3 RELASI ANTAR TABEL

#### 1. Relasi USERS - ORDERS (One-to-Many)
- **Jenis**: 1 User : Many Orders
- **Deskripsi**: Satu pengguna dapat membuat banyak pesanan
- **Foreign Key**: `orders.user_id` → `users.id`
- **Constraint**: ON DELETE CASCADE (jika user dihapus, semua ordernya ikut terhapus)

#### 2. Relasi ORDERS - ORDER_ITEMS (One-to-Many)
- **Jenis**: 1 Order : Many Order Items
- **Deskripsi**: Satu pesanan dapat memiliki banyak item pesanan
- **Foreign Key**: `order_items.order_id` → `orders.id`
- **Constraint**: ON DELETE CASCADE (jika order dihapus, itemnya ikut terhapus)

#### 3. Relasi ORDER_ITEMS - PRODUCTS (Many-to-One)
- **Jenis**: Many Order Items : 1 Product
- **Deskripsi**: Banyak item pesanan dapat merujuk ke produk yang sama
- **Foreign Key**: `order_items.product_id` → `products.id`
- **Constraint**: ON DELETE RESTRICT (produk tidak bisa dihapus jika ada order item yang merujuknya)

#### 4. Relasi PRODUCTS - CATEGORIES (Many-to-One)
- **Jenis**: Many Products : 1 Category
- **Deskripsi**: Banyak produk dapat berada dalam satu kategori
- **Foreign Key**: `products.category_id` → `categories.id`
- **Constraint**: ON DELETE RESTRICT (kategori tidak bisa dihapus jika ada produk didalamnya)

#### Integritas Data Referensial:
- **CASCADE**: Ketika data parent dihapus, data child otomatis terhapus
- **RESTRICT**: Ketika ada data child, parent tidak bisa dihapus
- **Indexed**: Semua foreign key di-index untuk performa query join

---

### 3.4 KEBUTUHAN NON-FUNGSIONAL

#### 3.4.1 KEAMANAN (Security)

**A. Authentikasi**
- Sistem menggunakan Laravel Sanctum dengan JWT tokens
- Password di-hash menggunakan bcrypt algorithm
- API endpoints dilindungi dengan bearer token authentication
- Session timeout: Token berlaku 24 jam
- Validasi: Email harus unik per sistem

**B. Otorisasi**
- Role-based access control (RBAC)
- Admin hanya bisa diakses oleh user dengan role 'admin'
- Middleware `IsAdmin` melindungi semua rute admin
- Protected routes memverifikasi token sebelum akses

**C. Data Protection**
- Password tidak pernah ditampilkan di response API
- Sensitive data (password, tokens) tidak di-log
- SQL Injection prevention: Menggunakan prepared statements (Laravel ORM)
- CSRF protection: Laravel CSRF middleware

**D. API Security**
- CORS policy dikonfigurasi untuk localhost:3002
- Rate limiting (opsional) untuk prevent brute force
- Input validation di semua endpoints
- Error messages tidak menampilkan stack trace di production

---

#### 3.4.2 PERFORMA (Performance)

**A. Database Optimization**
- Indexing pada frequently queried columns (email, role, status, created_at)
- Foreign key indexing untuk faster joins
- Query optimization menggunakan Laravel Eager Loading

**B. Caching (Future Enhancement)**
- Product list dapat di-cache 1 jam
- Category data dapat di-cache
- Dashboard stats dapat di-cache 30 menit

**C. Frontend Optimization**
- Code splitting dengan Vite/React
- Lazy loading images
- Pagination untuk product list (10 items per page)
- Pagination untuk order list administasi
- State management dengan React Context API

**D. Response Time**
- API response time target: < 500ms
- Page load time target: < 2 detik
- Initial load: < 3 detik

---

#### 3.4.3 SKALABILITAS (Scalability)

**A. Database**
- MySQL database dapat di-scale vertical (upgrade server)
- Query optimization untuk handle banyak user
- Soft deletes (opsional) untuk data archive

**B. Backend**
- Stateless API design memungkinkan horizontal scaling
- Dapat deploy di load balancer
- Session/token bersifat stateless

**C. Frontend**
- React SPA dapat di-host di CDN
- Static assets dapat di-compress

---

#### 3.4.4 RELIABILITAS (Reliability)

**A. Error Handling**
- API mengembalikan HTTP status code yang sesuai
- Error messages informatif dan user-friendly
- Validation errors detail (field-specific)
- Graceful error handling di frontend

**B. Data Consistency**
- Database transactions untuk checkout process
- Stock decrement atomically saat order dibuat
- Stock restore atomically saat order dibatalkan

**C. Availability**
- Backend dapat dijalankan di multiple instances
- Database backups regular (recommended)
- Fallback untuk error scenarios

---

#### 3.4.5 USABILITY (Kegunaan)

**A. User Interface**
- Responsive design (mobile, tablet, desktop)
- Consistent design language dengan TailwindCSS
- Clear navigation dan breadcrumbs
- Intuitive forms dengan validation feedback

**B. Accessibility**
- Semantic HTML structure
- ARIA labels untuk screen readers (future)
- Keyboard navigation support
- Color contrast compliance

**C. User Experience**
- Loading indicators untuk async operations
- Error messages jelas dan actionable
- Success notifications untuk user actions
- Undo capability untuk cancel order
- Search functionality tersedia

**D. Dokumentasi**
- Inline code comments
- README dengan setup instructions
- API endpoint documentation

---

#### 3.4.6 MAINTAINABILITY (Kemudahan Perawatan)

**A. Code Quality**
- Modular architecture (components, services, context)
- Separation of concerns (frontend/backend)
- DRY principle (Don't Repeat Yourself)
- Consistent coding style

**B. Version Control**
- Git dengan meaningful commit messages
- Branch strategy (main, develop, feature branches)

**C. Testing (Future Enhancement)**
- Unit tests untuk utility functions
- Integration tests untuk API endpoints
- E2E tests untuk critical flows

**D. Monitoring (Future Enhancement)**
- Error logging dengan Sentry/similar
- API performance monitoring
- User behavior analytics

---

#### 3.4.7 COMPATIBILITY (Kompatibilitas)

**A. Browser Support**
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers

**B. Platform**
- Linux (server)
- Windows (development)
- macOS (development)

**C. Technology Stack**
- Node.js 18+
- PHP 8.2+
- Laravel 11
- React 18
- MySQL 8.0+

---

#### 3.4.8 COMPLIANCE (Kepatuhan)

**A. Data Privacy**
- Menyimpan minimal data personal (name, email)
- Password tidak bisa di-retrieve
- User dapat lihat data mereka

**B. Business Rules**
- Email unik per user
- Stok tidak bisa negative
- Order tidak bisa diubah setelah konfirmasi pembayaran
- Admin hanya bisa verifikasi atau tolak pembayaran

**C. System Rules**
- Stock decrement saat order created
- Stock increment saat order cancelled
- Payment status auto-reject jika bukti tidak valid format

---

## RINGKASAN KEBUTUHAN SISTEM

### Tech Stack:
- **Frontend**: React 18, Vite, TailwindCSS, React Router v6, Axios, React Icons
- **Backend**: Laravel 11, PHP 8.2, Laravel Sanctum, MySQL 8.0
- **Authentication**: JWT tokens with Laravel Sanctum
- **Server**: Linux (production), development support Windows/Mac

### Database Tables: 6
- Users, Categories, Products, Orders, Order Items, Personal Access Tokens

### Total API Endpoints: 30+
- Auth: 4 endpoints
- Products: 5 endpoints
- Users Orders: 5 endpoints
- Admin: 16+ endpoints

### User Roles: 2
- User (pelanggan)
- Admin

### Key Features:
- Product catalog dengan advanced filtering
- Shopping cart management
- Complete checkout flow
- Order tracking dengan multiple statuses
- Payment verification
- Admin dashboard dengan analytics
- Full product & order management
- Real-time stock management

---

**Dokumen ini merupakan Spesifikasi Kebutuhan Perangkat Lunak untuk Sistem Informasi Toko Pancing Online.**

*Versi: 1.0*
*Tanggal: 6 April 2026*
*Status: FINAL*
