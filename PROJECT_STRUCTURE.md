# Struktur Project - Toko Alat Pancing Online

## Direktori Layout

```
proyek-rpl/
├── frontend-user/                 # React - UI untuk pembeli
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── frontend-admin/                # React - Admin Dashboard
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
└── backend/                       # Laravel + MySQL
    ├── app/
    ├── routes/
    ├── database/
    │   ├── migrations/
    │   └── seeders/
    └── .env
```

## Database Schema

### Users (Admin & Customer)
- id, name, email, password, role (admin/customer), created_at

### Categories
- id, name, description, created_at

### Products
- id, category_id, name, description, price, stock, image, type_ikan, location, merk, created_at

### Orders
- id, user_id, total_price, status, shipping_address, created_at

### Order Details
- id, order_id, product_id, quantity, price, created_at

### Payments
- id, order_id, amount, status, bukti_transfer, created_at

## API Endpoints

### Admin Routes (Authenticated)
- GET/POST/PUT/DELETE /api/products
- GET/POST /api/orders
- PUT /api/orders/{id}/status
- PUT /api/orders/{id}/resi
- GET /api/reports/sales
- GET /api/reports/revenue

## Status Implementation
- [ ] Database setup & migrations
- [ ] Models & relationships
- [ ] Admin authentication
- [ ] CRUD products API
- [ ] Order management API
- [ ] Financial reports API
- [ ] Admin dashboard React components
