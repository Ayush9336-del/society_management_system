# Society Subscription Management System

A full-stack web app to manage society flat subscriptions, payments, and residents — with separate Admin and Resident portals.

---

## Tech Stack

| Layer    | Tech                                  |
|----------|---------------------------------------|
| Backend  | Node.js, Express.js (ES Modules)      |
| Database | PostgreSQL                            |
| Auth     | Google OAuth + JWT                    |
| Frontend | Next.js 14 (App Router), Tailwind CSS |

---

## Features

### Admin Portal (`/admin`)

| Page | Path | What it does |
|------|------|--------------|
| Login | `/admin/login` | Google OAuth login for admins |
| Dashboard | `/admin/dashboard` | Stats (total flats, collected, pending) + bar chart (monthly trend) + pie charts (paid/unpaid, payment modes) |
| Flats | `/admin/flats` | Add, edit, vacate flats — searchable, paginated table |
| Subscriptions | `/admin/subscriptions` | View and update monthly rates per flat type (2BHK, 3BHK, etc.) |
| Monthly Records | `/admin/monthly-records` | Payment status for every flat in a selected month — mark as paid, download receipt (PDF) |
| Payment Entry | `/admin/payment-entry` | Manually record offline payments (Cash/UPI) |
| Reports | `/admin/reports` | Monthly/yearly financial summary + month-wise collection table + download full report as PDF |
| Notifications | `/admin/notifications` | Send notices to all residents or a specific resident, download any notification as `.txt` |
| Profile | `/admin/profile` | View and update admin profile |

### Resident Portal (`/`)

| Page | Path | What it does |
|------|------|--------------|
| Login | `/login` | Google sign-in (only pre-registered residents can log in) |
| Dashboard | `/dashboard` | Current month status, pending amount, recent notifications |
| Subscriptions | `/subscriptions` | Full payment history — amount, status, payment mode |
| Subscription Detail | `/subscriptions/[month]` | Breakdown for a specific month |
| Pay Now | `/pay-now` | Online payment via Razorpay/Stripe |
| Profile | `/profile` | Update phone number, log out |

---

## Project Structure

```
project/
├── backend/
│   ├── controllers/       # Business logic (admin, user, auth, flat, payment, subscription)
│   ├── routes/            # Thin Express route mappings
│   ├── middleware/        # verifyJWT, verifyAdmin, passport
│   ├── database/
│   │   ├── schema.sql     # Table definitions
│   │   ├── seed_flats.sql # 50 flats + 35 residents
│   │   └── make_admin.sql # Promote a user to admin
│   ├── db.js              # PostgreSQL pool
│   └── server.js          # Entry point
│
└── frontend/
    ├── app/
    │   ├── admin/         # Admin portal pages
    │   ├── (user)/        # Resident portal pages
    │   └── login/         # Login page
    ├── components/        # Shared UI components
    └── lib/               # api.js, auth.js, receipt.js
```

---

## Setup

### 1. Database

```bash
createdb sms
psql -U postgres -d sms -f backend/database/schema.sql
psql -U postgres -d sms -f backend/database/seed_flats.sql
```

### 2. Backend

```bash
cd backend && npm install
```

`backend/.env`:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:yourpassword@127.0.0.1:5432/sms
JWT_SECRET=your_secret
GOOGLE_CLIENT_ID=your_google_client_id
NODE_ENV=development
```

```bash
npm run dev
```

### 3. Frontend

```bash
cd frontend && npm install
```

`frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
```

```bash
npm run dev
```

### 4. Make yourself admin

Log in once with Google, then:
```bash
psql -U postgres -d sms -c "UPDATE users SET role = 'admin' WHERE email = 'you@gmail.com';"
```

---

## Auth Flow

Only residents pre-added by the admin can log in.

```
Admin adds resident (name + email + flat) → resident signs in with Google
→ backend checks email in users table
→ found: issue JWT → redirect by role (admin/user)
→ not found: 403 "You are not registered in this society"
```

---

## Database Schema

```
users              — id, name, email, phone, flat_id, role ('admin'|'user')
flats              — id, flat_number, owner_name, email, phone, flat_type
subscription_plans — id, flat_type, monthly_amount
payments           — id, flat_id, month (YYYY-MM), amount, payment_mode, status
notifications      — id, message, user_id (null = broadcast), created_at
```
