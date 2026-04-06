# SEQUENCE DIAGRAMS & DETAILED FLOWS
## Sistem Informasi Toko Pancing Online

---

## 1. SEQUENCE DIAGRAM: REGISTRASI DAN LOGIN

### Registrasi (UC-001)

```mermaid
sequenceDiagram
    actor User as Pelanggan
    participant Frontend as React App
    participant API as Axios API
    participant Backend as Laravel API
    participant DB as Database
    
    User->>Frontend: 1. Input nama, email, password
    User->>Frontend: 2. Klik "Buat Akun"
    
    Frontend->>Frontend: 3. Validasi form
    
    alt Validasi Gagal
        Frontend->>User: Show error messages
    else Validasi Sukses
        Frontend->>API: 4. POST /auth/register
        API->>Backend: 5. Request dengan data
        
        Backend->>Backend: 6. Validasi input
        Backend->>DB: 7. Check email unique
        
        alt Email sudah ada
            Backend->>API: Return error 422
            API->>Frontend: Show "Email already exists"
            Frontend->>User: Display error
        else Email baru
            Backend->>DB: 8. Hash password & create user
            Backend->>Backend: 9. Generate JWT token
            Backend->>API: 10. Return user + token
            
            API->>Frontend: 11. Success response
            Frontend->>Frontend: 12. Save token to localStorage
            Frontend->>Frontend: 13. Update AuthContext
            Frontend->>Frontend: 14. Navigate to homepage
            Frontend->>User: 15. Welcome & logged in
        end
    end
```

### Login (UC-002)

```mermaid
sequenceDiagram
    actor User as Pelanggan
    participant Frontend as React App
    participant API as Axios API
    participant Backend as Laravel API
    participant DB as Database
    
    User->>Frontend: 1. Input email & password
    User->>Frontend: 2. Klik "Masuk"
    
    Frontend->>API: 3. POST /auth/login
    API->>Backend: 4. Request credentials
    
    Backend->>DB: 5. Find user by email
    
    alt User tidak ditemukan
        Backend->>API: Return error 401
        API->>Frontend: Unauthorized
        Frontend->>User: Show "Email tidak terdaftar"
    else User ditemukan
        Backend->>Backend: 6. Verify password
        
        alt Password salah
            Backend->>API: Return error 401
            API->>Frontend: Unauthorized
            Frontend->>User: Show "Password salah"
        else Password benar
            Backend->>Backend: 7. Generate JWT token
            Backend->>API: 8. Return user + token
            
            API->>Frontend: 9. Success response
            Frontend->>Frontend: 10. Save token to localStorage
            Frontend->>Frontend: 11. Update AuthContext
            Frontend->>Frontend: 12. Navigate ke homepage
            Frontend->>User: 13. Welcome & logged in
        end
    end
```

---

## 2. SEQUENCE DIAGRAM: CHECKOUT FLOW

```mermaid
sequenceDiagram
    actor User as Pelanggan
    participant Cart as CartDrawer
    participant Frontend as CheckoutPage
    participant API as Axios API
    participant Backend as Laravel API
    participant DB as Database
    
    User->>Cart: 1. Review keranjang
    User->>Cart: 2. Klik "Checkout"
    
    Cart->>Frontend: 3. Navigate dengan cartItems
    Frontend->>Frontend: 4. Protected route check
    
    alt Tidak logged in
        Frontend->>Frontend: Redirect ke login
    else Logged in
        Frontend->>User: 5. Display checkout form
        User->>Frontend: 6. Isi alamat, kota, telepon
        User->>Frontend: 7. Pilih metode pembayaran
        User->>Frontend: 8. Review & submit
        
        Frontend->>Frontend: 9. Validasi form
        Frontend->>API: 10. POST /orders/checkout
        API->>Backend: 11. Send order data
        
        Backend->>Backend: 12. Validate input
        Backend->>DB: 13. START TRANSACTION
        
        Backend->>DB: 14. Create Order record
        
        loop Untuk setiap item di keranjang
            Backend->>DB: 15a. Find Product
            Backend->>Backend: 15b. Check stock availability
            
            alt Stock tidak cukup
                Backend->>Backend: ROLLBACK transaction
                Backend->>API: Return error 400
                API->>Frontend: "Stock tidak cukup"
                Frontend->>User: Show error message
            else Stock cukup
                Backend->>DB: 15c. Create OrderItem
                Backend->>DB: 15d. Decrement product stock
            end
        end
        
        Backend->>DB: 16. COMMIT TRANSACTION
        Backend->>API: 17. Return Order ID
        
        API->>Frontend: 18. Success response
        Frontend->>Frontend: 19. Clear cart
        Frontend->>Frontend: 20. Navigate to /orders/{id}
        Frontend->>User: 21. Show "Pesanan berhasil dibuat"
    end
```

---

## 3. SEQUENCE DIAGRAM: PAYMENT VERIFICATION ADMIN

```mermaid
sequenceDiagram
    actor Admin as Admin Toko
    participant Frontend as AdminOrders
    participant API as Axios API
    participant Backend as Laravel API
    participant DB as Database
    
    Admin->>Frontend: 1. Lihat daftar pesanan
    Frontend->>API: 2. GET /api/admin/orders
    API->>Backend: 3. Request orders list
    Backend->>DB: 4. Query orders dengan payment_status pending
    Backend->>API: 5. Return orders
    API->>Frontend: 6. Display orders table
    
    Frontend->>User: 7. Show orders dengan status badges
    Admin->>Frontend: 8. Klik view icon di pesanan
    
    Frontend->>API: 9. GET /api/admin/orders/{id}
    API->>Backend: 10. Request order detail
    Backend->>DB: 11. Query order + items
    Backend->>API: 12. Return detailed order
    API->>Frontend: 13. Display modal detail
    
    Frontend->>Admin: 14. Show payment proof button
    Admin->>Frontend: 15. Klik "Terima Pembayaran"
    
    Frontend->>API: 16. POST /api/admin/orders/{id}/verify-payment
    API->>Backend: 17. Verify payment request
    
    Backend->>Backend: 18. Check order status
    Backend->>DB: 19. Update payment_status = verified
    Backend->>DB: 20. Update order status = processing
    Backend->>API: 21. Return updated order
    
    API->>Frontend: 22. Success response
    Frontend->>Frontend: 23. Close modal
    Frontend->>Frontend: 24. Refresh orders list
    Frontend->>Admin: 25. Show "Pembayaran terverifikasi"
```

---

## 4. SEQUENCE DIAGRAM: UPDATE STATUS PESANAN

```mermaid
sequenceDiagram
    participant Admin as Admin
    participant Frontend as AdminOrders Modal
    participant API as Axios API
    participant Backend as Laravel API
    participant DB as Database
    
    Admin->>Frontend: 1. Open order detail modal
    Frontend->>Frontend: 2. Pre-fill current status
    
    Admin->>Frontend: 3. Select new status
    
    Alt Select "Shipped"
        Frontend->>Frontend: 4a. Enable tracking number field
        Admin->>Frontend: 4b. Input tracking number
    Else Other Status
        Frontend->>Frontend: 4c. No extra input needed
    End
    
    Admin->>Frontend: 5. Klik "Simpan"
    
    Frontend->>Frontend: 6. Validasi
    
    Alt Status Shipped tanpa tracking
        Frontend->>Admin: Show "Nomor tracking harus diisi"
    Else Validasi sukses
        Frontend->>API: 7. PUT /api/admin/orders/{id}/status
        API->>Backend: 8. Update status request
        
        Backend->>Backend: 9. Validate status enum
        Backend->>DB: 10. Begin transaction
        
        Alt Status = Cancelled
            Backend->>DB: 10a. Get order items
            Loop Untuk setiap item
                Backend->>DB: 10b. Increment product stock
            End
        End
        
        Backend->>DB: 11. Update order status & timestamps
        
        Alt Status = Shipped
            Backend->>DB: 12a. Set shipped_at = now()
            Backend->>DB: 12b. Save tracking_number
        Else Status = Delivered
            Backend->>DB: 12c. Set delivered_at = now()
        End
        
        Backend->>DB: 13. Commit transaction
        Backend->>API: 14. Return updated order
        
        API->>Frontend: 15. Success response
        Frontend->>Frontend: 16. Close modal
        Frontend->>Frontend: 17. Refresh orders list
        Frontend->>Admin: 18. Show "Status berhasil diperbarui"
    End
```

---

## 5. SEQUENCE DIAGRAM: UPLOAD BUKTI PEMBAYARAN

```mermaid
sequenceDiagram
    actor Customer as Pelanggan
    participant Frontend as OrderTrackingPage
    participant API as Axios API
    participant Backend as Laravel API
    participant Storage as File Storage
    participant DB as Database
    
    Customer->>Frontend: 1. View pesanan dengan status pending
    Frontend->>Frontend: 2. Display "Upload Bukti Pembayaran"
    
    Customer->>Frontend: 3. Click upload button
    Frontend->>Frontend: 4. Open file dialog
    
    Customer->>Frontend: 5. Select image file
    Frontend->>Frontend: 6. Show file preview
    
    Customer->>Frontend: 7. Click "Upload"
    Frontend->>Frontend: 8. Validasi file size & type
    
    Alt File invalid
        Frontend->>Customer: Show error "File terlalu besar atau format tidak didukung"
    Else File valid
        Frontend->>API: 9. POST /orders/{id}/payment-proof (FormData)
        API->>Backend: 10. Upload request dengan file
        
        Backend->>Backend: 11. Validate file
        Backend->>Storage: 12. Store file ke public/payment_proofs/
        
        Alt Storage failed
            Backend->>API: Return error 500
            API->>Frontend: Upload gagal
            Frontend->>Customer: Show error message
        Else Storage success
            Backend->>DB: 13. Update order.payment_proof = file_path
            Backend->>DB: 14. Update payment_status = pending (menunggu verifikasi)
            Backend->>API: 15. Return success response
            
            API->>Frontend: 16. Success response
            Frontend->>Frontend: 17. Refresh order data
            Frontend->>Frontend: 18. Update UI (remove upload button)
            Frontend->>Customer: 19. Show "Bukti pembayaran berhasil diupload"
            Frontend->>Customer: 20. Show "Menunggu verifikasi admin"
        End
    End
```

---

## 6. ACTIVITY DIAGRAM: ADMIN DASHBOARD REFRESH

```mermaid
graph TB
    A[Admin buka Dashboard] --> B[Check Token Valid?]
    B -->|Invalid| C[Redirect ke Login]
    B -->|Valid| D{Check Role = Admin?}
    D -->|No| E[Redirect ke Homepage]
    D -->|Yes| F[Load Dashboard]
    F --> G[Fetch Stats API]
    G --> H[Fetch Chart API]
    H --> I{API Response OK?}
    I -->|Error| J[Show Error Message]
    I -->|Success| K[Render Stats Cards]
    K --> L[Render Charts]
    L --> M[Render Orders Table]
    M --> N[Dashboard Ready]
    J --> O[Retry Available]
    O --> G
    
    style A fill:#e1f5ff
    style B fill:#e1f5ff
    style D fill:#fff9c4
    style F fill:#c8e6c9
    style K fill:#c8e6c9
    style L fill:#c8e6c9
    style N fill:#a5d6a7
    style J fill:#ffccbc
```

---

## 7. STATE MACHINE: ORDER STATUS FLOW

```mermaid
stateDiagram-v2
    [*] --> Pending: Create Order
    
    Pending --> Pending: Upload Bukti Bayar
    Pending --> Pending: Admin Reject Payment
    Pending --> Processing: Admin Verify Payment
    Pending --> Cancelled: Customer Cancel
    
    Processing --> Shipped: Admin Input Tracking
    Processing --> Cancelled: Admin Cancel
    
    Shipped --> Delivered: Delivery Complete
    Shipped --> Processing: Return to Processing
    
    Delivered --> [*]: Order Complete
    Cancelled --> [*]: Order Cancelled
    
    note right of Pending
        Menunggu pembayaran
        atau verifikasi admin
    end note
    
    note right of Processing
        Pembayaran sudah
        diverifikasi
    end note
    
    note right of Shipped
        Pesanan dalam
        perjalanan
    end note
    
    note right of Delivered
        Pesanan sudah
        diterima
    end note
    
    note right of Cancelled
        Pesanan dibatalkan
        & stok dikembalikan
    end note
```

---

## 8. DATA FLOW DIAGRAM: CHECKOUT PROCESS

```
PELANGGAN
    |
    ├─> Add Products to Cart (Local State)
    |       ├─> Save to CartContext
    |       └─> Update Cart Badge
    |
    ├─> Click Checkout
    |       └─> Verify Auth Token
    |           ├─> Token Valid? → Continue
    |           └─> Token Invalid? → Redirect Login
    |
    ├─> Fill Checkout Form
    |       ├─> Address
    |       ├─> City
    |       ├─> Phone
    |       └─> Payment Method
    |
    └─> Submit Order
            |
            ├─> Frontend Validation
            |   └─> All Fields Required?
            |       ├─> Yes → Send to Backend
            |       └─> No → Show Error
            |
            ├─> Backend Validation
            |   └─> Valid Input?
            |       ├─> Yes → Check Stock
            |       └─> No → Return 422
            |
            ├─> Stock Verification
            |   └─> All Items Available?
            |       ├─> Yes → Create Order
            |       └─> No → Return 400
            |
            ├─> Database Operations (TRANSACTION)
            |   ├─> Insert ORDERS record
            |   ├─> Insert ORDER_ITEMS records
            |   ├─> Decrement PRODUCTS.stock
            |   └─> COMMIT/ROLLBACK
            |
            ├─> Return Order ID
            |
            └─> Redirect to Order Tracking Page
                    └─> Local State: Clear Cart
                    └─> Display Order Status: PENDING
```

---

## 9. FLOW: ADMIN PRODUCT MANAGEMENT (CRUD)

### Create (Tambah Produk)

```
Admin
  ├─> Click "Tambah Produk"
  ├─> Modal Form Opens
  │   ├─ nama_produk (text)
  │   ├─ kategori_id (select)
  │   ├─ harga (number)
  │   ├─ stok (number)
  │   ├─ brand (text)
  │   ├─ lokasi (select: Jakarta, Surabaya, Bandung, Medan)
  │   ├─ deskripsi (textarea)
  │   └─ spesifikasi (JSON/text)
  ├─> Fill Form
  ├─> Click "Simpan"
  ├─> Frontend Validation
  ├─> POST /api/admin/products
  ├─> Backend Validation
  ├─> Insert into PRODUCTS table
  ├─> Return 201 Created
  ├─> Refresh Products List
  └─> Show Success Toast
```

### Read (Lihat List)

```
Admin
  ├─> Click "Produk" Menu
  ├─> GET /api/admin/products
  ├─> Backend Query Products
  ├─> Return paginated data (10 per page)
  ├─> Display Table
  │   ├─ ID | Nama | Brand | Harga | Stok | Lokasi | Actions
  │   └─ Edit / Delete Buttons
  ├─> Display Search Bar
  ├─> Display Pagination Controls
  └─> Display "Tambah Produk" Button
```

### Update (Edit Produk)

```
Admin
  ├─> Click Edit Button on Product Row
  ├─> GET /api/admin/products/{id}
  ├─> Backend Query Product by ID
  ├─> Modal Form Opens with Pre-filled Data
  ├─> Admin Modify Fields
  ├─> Click "Simpan"
  ├─> Frontend Validation
  ├─> PUT /api/admin/products/{id}
  ├─> Backend Validation
  ├─> Update PRODUCTS table
  ├─> Return 200 OK with updated data
  ├─> Refresh Products List
  └─> Show Success Toast
```

### Delete (Hapus Produk)

```
Admin
  ├─> Click Delete Button
  ├─> Confirmation Dialog: "Hapus produk ini?"
  ├─> Click "Ya"
  ├─> DELETE /api/admin/products/{id}
  ├─> Backend Check
  │   └─ Ada order_items yang referensi product ini?
  │       ├─> Yes → Return 400 "Tidak bisa dihapus, ada pesanan"
  │       └─> No → Continue
  ├─> Delete from PRODUCTS table
  ├─> Return 200 OK
  ├─> Refresh Products List
  └─> Show Success Toast
```

---

## 10. RINGKASAN FLOWS

| Flow | Aktor | API Calls | Database Changes | Storage |
|------|-------|-----------|------------------|---------|
| Register | Pelanggan | POST /auth/register | INSERT users | - |
| Login | Pelanggan | POST /auth/login | UPDATE personal_access_tokens | - |
| Browse Products | Anonimous | GET /products | SELECT products | - |
| Filter Products | Anonimous | GET /products?filters | SELECT products | - |
| Add to Cart | Pelanggan | - | - | - (Local State) |
| Checkout | Pelanggan | POST /orders/checkout | INSERT orders,order_items; UPDATE products.stock | - |
| Upload Payment | Pelanggan | POST /orders/{id}/payment-proof | UPDATE orders.payment_proof | File Storage |
| Verify Payment | Admin | POST /admin/orders/{id}/verify-payment | UPDATE orders.payment_status,status | - |
| Update Status | Admin | PUT /admin/orders/{id}/status | UPDATE orders.status + timestamps; UPDATE products.stock (if cancelled) | - |
| Create Product | Admin | POST /admin/products | INSERT products | - |
| Update Product | Admin | PUT /admin/products/{id} | UPDATE products | - |
| Delete Product | Admin | DELETE /admin/products/{id} | DELETE products | - |
| View Dashboard | Admin | GET /admin/dashboard/stats | SELECT (aggregates) | - |

---

**Versi: 1.0**
*Tanggal: 6 April 2026*
*Format: Mermaid Diagrams + ASCII Flow*
