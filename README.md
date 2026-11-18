# ARTISAN BREW CO. ☕🐰

> Every Cup, A Little Happiness.

A full-stack 3D coffee-shop ecosystem: immersive storefront, online ordering, real payment-gateway integration architecture, a professional POS, kitchen display, inventory, and a data-driven admin dashboard.

Built with **Next.js 15 (App Router), TypeScript, Tailwind CSS, React Three Fiber / Three.js, GSAP, Framer Motion, Lenis, Prisma + PostgreSQL, Auth.js, Zustand, React Hook Form, Zod and Recharts.**

---

## Quick start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp .env.example .env
#   - generate AUTH_SECRET: node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
#   - point DATABASE_URL at your PostgreSQL instance

# 3. Create the schema and seed realistic demo data
npx prisma db push
npm run db:seed

# 4. Run
npm run dev
```

Open <http://localhost:3000>.

### Demo accounts (seeded — change these in production!)

| Role | Email | Password |
| --- | --- | --- |
| SUPER_ADMIN | `owner@artisanbrew.co` | `password123` |
| ADMIN | `admin@artisanbrew.co` | `password123` |
| CASHIER | `cashier@artisanbrew.co` | `password123` |
| BARISTA | `barista@artisanbrew.co` | `password123` |
| CUSTOMER | `customer@example.com` | `password123` |

---

## What is implemented

### Storefront
- Immersive 3D hero with a **procedurally modelled bunny barista** (no emoji mascot), coffee shop counter, espresso machine, shelves, lamps, plants, floating cups, pastries, instanced coffee beans and animated steam.
- Mouse-following camera, scroll-driven camera transitions, pose changes, float/hover motion, GSAP entrance, Lenis smooth scrolling, reduced-motion support, dynamic import + static loading fallback.
- Best sellers, 10-category signature menu, brand story, promotions, testimonials, locations and newsletter.
- Product catalog with search, category filters, sorting, per-product 3D viewer (drag to rotate, scroll to zoom) and full customization (size, temperature, sugar, ice, shots, milk, toppings, notes).
- Cart drawer + full cart page with persistent Zustand storage.
- Checkout with order type, table selection, vouchers, loyalty redemption, live recalculated totals and server-side re-pricing.
- Order tracking timeline with live polling (and a documented Supabase Realtime hook point).

### Payments
- **QRIS and bank virtual accounts** use the official Midtrans REST API (`/v2/charge`, Snap-compatible), SHA512 webhook signature verification, idempotent event handling via a unique event ID, amount re-checking, and secure server-side status transitions.
- **No fake QR codes and no simulated successes.** When gateway credentials are absent the payment page explicitly explains that no QR was generated and shows the exact configuration needed.
- **Manual bank transfer** with static account details, proof upload (validated type/size), and **admin-only verification** — never auto-marked paid.
- Cash / pay-at-counter flow with cashier verification.
- Webhook: `POST /api/payments/webhook`.

### POS
- Dedicated `/admin/pos` with touch-friendly grid, category tabs, search, SKU/barcode entry, product customization, customer/table selection, discounts, tax, service charge, cash/QRIS/transfer, automatic change calculation, and thermal receipts (58 mm / 80 mm) with browser print CSS.
- Every POS sale creates an `Order` + `Transaction` + `Payment` and deducts recipe ingredients inside one database transaction.

### Operations
- Admin dashboard with **real Prisma/PostgreSQL queries**: revenue, today's revenue, order count, AOV, units sold, best sellers, recent transactions, daily/weekly/monthly charts and payment-method mix (Recharts).
- Product/category CRUD via server actions, inventory with stock movements and recipe-based deduction, customers, transactions with printable receipts, payments, employee/role management, reports with audit log, and store settings.
- Kitchen display with one-click status updates and a live feed.
- RBAC enforced server-side (`requireRole` / `guardPage`, API route guards and middleware). Roles: SUPER_ADMIN, ADMIN, CASHIER, BARISTA, CUSTOMER.
- Customer accounts, order history, profile, loyalty tiers, vouchers, wishlist and reviews.

### Database
25 tables in `prisma/schema.prisma` (users, roles, employees, customers, products, categories, product variants/addons, ingredients, recipes, inventory, inventory movements, orders, order items, payments, payment webhooks, transactions, tables, vouchers, loyalty points, reviews, newsletter subscribers, wishlist items, store settings, audit logs) with indexes, foreign keys, timestamps and transactional integrity.

---

## Environment variables

See `.env.example`. Key ones:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | PostgreSQL connection string |
| `AUTH_SECRET` | Auth.js JWT signing secret |
| `PAYMENT_MODE` | `sandbox`, `live` or `disabled` |
| `MIDTRANS_SERVER_KEY` / `MIDTRANS_CLIENT_KEY` | Midtrans API credentials (server-side only) |
| `MIDTRANS_IS_PRODUCTION` | `false` for sandbox |
| `MIDTRANS_WEBHOOK_SECRET` | Optional shared secret checked on webhooks |
| `NEXT_PUBLIC_SUPABASE_URL` / anon key / service role | Optional Supabase Storage + Realtime |
| `STORAGE_DRIVER` | `local` (filesystem proof uploads) or `supabase` |

Secret keys are only read in server modules (`src/lib/payments/*`) and are never sent to the browser.

### Enabling real QRIS
1. Create a Midtrans account and get sandbox server/client keys.
2. Set `PAYMENT_MODE=sandbox`, `MIDTRANS_SERVER_KEY`, `MIDTRANS_CLIENT_KEY`, `MIDTRANS_IS_PRODUCTION=false`.
3. In the Midtrans dashboard set the webhook URL to `https://<your-domain>/api/payments/webhook` and, if used, the same `MIDTRANS_WEBHOOK_SECRET`.
4. Restart the app. QRIS charges and virtual accounts now come from Midtrans; status updates arrive via verified webhooks.
5. Use official Midtrans test cards / QRIS sandbox flows. **Never use production credentials until sandbox tests pass.**

---

## Known deliberate deviations from the brief

These are honest architecture decisions, not missing features:

1. **Mascot / 3D assets** — the bunny, café, cups and props are real 3D meshes generated procedurally with Three.js/R3F (`src/components/three/`), not downloaded GLB files. This keeps the project self-contained and avoids shipping unlicensed assets. To swap in authored GLB/GLTF models, load them with `useGLTF` in those components and keep the same pose-driven animation interface; Draco compression can then be enabled.
2. **Supabase Realtime** — when Supabase credentials are provided, the intended integration point is `src/hooks/use-order-stream.ts` (subscribe to the `orders` table). Without them, the app uses an authenticated polling feed that behaves equivalently for a single instance. Supabase Storage is likewise optional; proof uploads default to validated local filesystem storage.
3. **Payment credentials** — none were supplied, so QRIS stays in an explicit "not configured" state rather than displaying a fabricated QR or a fake success. The full official integration path is implemented and documented above.

---

## Verification performed

- `npm run typecheck` and `npm run build` pass (31 routes).
- Browser-checked: 3D homepage, catalog/filtering, product customization, cart, checkout order creation, payment-page unconfigured state, POS cash sale + receipt + change, admin dashboard charts, RBAC redirects, manual bank verification and recipe-based inventory deduction.
- Webhooks reject unsigned/invalid requests and are idempotent.

## Scripts

```bash
npm run dev        # development
npm run build      # production build
npm run start      # production server
npm run typecheck  # TypeScript check
npm run db:push    # sync Prisma schema
npm run db:seed    # seed demo data
npm run db:studio  # Prisma Studio
```
