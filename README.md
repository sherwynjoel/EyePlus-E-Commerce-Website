# EyePlus — TV & Electronics E-Commerce Platform

A full-stack e-commerce platform for TVs, panels, kiosks, signage, tablets, laptops, and desktops — supporting direct retail customers, authorized dealers with tiered pricing, and ERPNext-backed inventory. Built with Next.js (App Router), PostgreSQL/Prisma, Razorpay, and MSG91.

Three portals in one codebase:
- **Storefront** — public site for retail customers
- **Dealer portal** (`/dealer`) — tier-priced catalog, bulk ordering, dealer reports
- **Admin dashboard** (`/admin`) — catalog, orders, dealers, coupons, delivery, reports, ERP sync

See [REQUIREMENTS.md](./REQUIREMENTS.md) for the original product requirements this was built against.

## Status

The core commerce roadmap is complete and verified end-to-end in a real browser (not just type-checked). See [Known limitations](#known-limitations--roadmap) for what's still open.

## Features

### Storefront
- Phone + OTP login (no passwords), role-aware navigation
- Product catalog with category filtering, variant selection (size/color/etc.), live stock status
- Cart, coupon codes at checkout, PIN-code delivery serviceability check
- Razorpay checkout — automatically falls back to a labeled test-mode "simulate payment" button when no gateway keys are configured, so the full flow works before you have a merchant account
- Order history with a live status timeline, wishlist, saved addresses, return requests

### Dealer portal
- Public "become a dealer" application → admin approval queue → SMS notification on approval
- Tier-based pricing (Bronze / Silver / Gold), resolved automatically per dealer
- Bulk order builder: add multiple SKUs with quantities, review, place directly on account terms (no online payment step — dealer orders go straight to Confirmed)
- Dealer-specific order history and spend reports

### Admin dashboard
- **Catalog**: create/edit categories, products, and variants — including per-price-list pricing (Retail + all 3 dealer tiers) and stock on hand, with an optional image URL per variant
- **Orders**: full lifecycle management — Pending → Confirmed → Packed → Shipped → Out for delivery → Delivered (each transition sends the matching SMS), delivery assignment (staff/courier/tracking), return approval/rejection/refund
- **Dealers**: approval queue with approve/reject
- **Coupons**: percent/flat discounts, min order value, max discount cap, usage limits (total and per-user), active window
- **Reports**: revenue/order/customer KPIs, a 14-day revenue trend chart, orders-by-status breakdown, top products, inventory summary with low/out-of-stock alerts
- **ERP Sync log**: visibility into every (currently mocked) ERPNext sync call

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, TypeScript, React Server Components + Server Actions) |
| UI | Tailwind CSS v4 + shadcn/ui (Base UI primitives) |
| Database | PostgreSQL, via Prisma ORM 7 with the `@prisma/adapter-pg` driver adapter |
| Auth | Phone + OTP, no passwords — custom session via signed JWT cookie (`jose`) |
| Payments | Razorpay (test-mode fallback built in when keys aren't configured) |
| SMS | MSG91 (console-log fallback in dev) |
| ERP | ERPNext — abstracted behind an adapter interface; mocked today, swappable via one env var |
| Local DB | Docker Compose (Postgres 16) |

## Project structure

```
app/
  (storefront)/         # public site — route group, no URL prefix
    products/[slug]/      # PDP
    cart/, checkout/, checkout/pay/[orderId]/, checkout/success/
    account/               # profile, orders/[id], wishlist, addresses, returns/[orderItemId]
    auth/login/, auth/verify/
    dealer-signup/
  dealer/                # dealer portal (role-guarded)
    catalog/, orders/, orders/new/, reports/
  admin/                 # admin dashboard (role-guarded)
    products/, products/[id]/, products/new/
    categories/, coupons/, orders/, orders/[id]/
    customers/, dealers/, delivery/, reports/, erp-sync/, settings/staff/
  api/webhooks/          # (reserved) Razorpay webhook, ERP inbound sync

components/
  ui/            # shadcn primitives
  storefront/    # ProductCard, ProductDetail, CheckoutPayment, AddressForm, ...
  dealer/        # DealerShell
  admin/         # AdminShell, ProductForm, VariantForm, CategoryForm, CouponForm
  shared/        # Logo, EmptyState, TrendChart, BarList

lib/
  db/client.ts           # Prisma client singleton (pg driver adapter)
  auth/                  # otp.ts, session.ts, rbac.ts (requireUser/requireRole)
  erp/                   # contract.ts (interface), mock/, frappe/ (placeholder), index.ts (factory)
  payments/razorpay.ts   # order creation, signature verification, mock-mode fallback
  sms/                   # msg91.ts, templates.ts, notification-service.ts
  services/              # ALL business logic — product, pricing, cart, order, address,
                          # delivery, coupon, return, dealer, catalog, report
  validation/, utils/

actions/                 # thin "use server" wrappers over lib/services
  auth-actions.ts, storefront-actions.ts, dealer-actions.ts,
  admin-actions.ts, catalog-actions.ts

prisma/
  schema.prisma, seed.ts, migrations/

middleware.ts / proxy.ts  # route-level guard: redirects unauthenticated/wrong-role
                           # requests away from /admin, /dealer, /account
docker-compose.yml        # local Postgres
```

**Design principle:** all business logic lives in `lib/services`, called by `actions/*` today and importable by any future public API (mobile app, etc.) without change. Route middleware (`proxy.ts`) is a UX-level redirect only — the real enforcement is `requireRole()`/`requireUser()` called at the top of every service-backed action.

## Data model

Key Prisma models, grouped by concern:

- **Identity**: `User` (role: Customer/Dealer/Admin/Staff), `OtpChallenge`, `CustomerProfile`, `DealerProfile` (tier, approval status, credit limit), `StaffProfile`, `Address`
- **Catalog**: `Category`, `Product`, `ProductVariant` (SKU, attributes, image URLs)
- **Pricing & stock**: `PriceList` (Retail / Dealer Bronze / Silver / Gold), `Price`, `Inventory`
- **Cart & orders**: `Cart`, `CartItem`, `Order`, `OrderItem`, `OrderStatusHistory`, `Payment`
- **Merchandising**: `Coupon`, `CouponRedemption`, `Wishlist`
- **Delivery**: `PincodeServiceability`, `DeliveryAssignment`, `ReturnRequest`
- **ERP**: `ErpSyncLog` (records every mocked/real ERP call for the admin sync viewer)

Run `npx prisma studio` to browse the live schema and data.

## Getting started

### Prerequisites
- Node.js 22+
- Docker Desktop (for local Postgres)

### Setup

```bash
# 1. Install dependencies
npm install

# 2. Copy env template and fill in values (defaults work for local dev as-is)
cp .env.example .env

# 3. Start Postgres
docker compose up -d

# 4. Run migrations
npx prisma migrate dev

# 5. Seed sample data (categories, products, price lists, one user per role, pincodes)
npm run db:seed

# 6. Start the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Logging in

Auth is phone + OTP — no passwords. Enter any 10-digit number starting with 6–9. Since `SMS_SENDER=console` by default, the 6-digit code is printed to the terminal running `npm run dev` instead of being texted.

Seeded test accounts (all log in the same way):

| Phone | Role |
|---|---|
| 9000000001 | Customer |
| 9000000002 | Dealer (approved, Silver tier) |
| 9000000003 | Dealer (pending approval) |
| 9000000004 | Admin |
| 9000000005 | Staff |

OTP requests are rate-limited to 5/hour per number — use a fresh number if you hit the limit.

### Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start the dev server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint |
| `npm run db:seed` | Re-run the seed script |
| `npx prisma migrate dev` | Apply schema changes |
| `npx prisma studio` | Browse the database |
| `docker compose up -d` | Start local Postgres |

## Environment variables

See `.env.example` for the full list with defaults. The important ones:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | Postgres connection string |
| `ERP_ADAPTER` | `mock` (default) or `frappe` — swaps the ERPNext integration with no other code changes |
| `RAZORPAY_KEY_ID` / `RAZORPAY_KEY_SECRET` | Leave blank to use the built-in test-mode payment flow |
| `MSG91_AUTH_KEY` / `MSG91_SENDER_ID` | Leave blank (with `SMS_SENDER=console`) to log OTP/notifications to the console instead of sending real SMS |
| `SESSION_SECRET` | Signs the session cookie — change this for anything beyond local dev |

## Known limitations / roadmap

Everything below is a known gap, not an oversight:

- **WhatsApp integration** — listed in the original requirements, not yet built
- **Multi-language support** — not started (English only)
- **AI features** (recommendations, chatbot, demand prediction) — explicitly deferred, future workstream
- **Native mobile apps** — explicitly deferred; the services layer is structured so a future public API can reuse the same business logic
- **Staff permission granularity** — `StaffProfile.permissions` exists in the schema but isn't enforced yet; Staff and Admin currently have identical access
- **Dealer credit limit enforcement** — `DealerProfile.creditLimit` is modeled but not checked against bulk order totals
- **Profile editing** — customers can't yet edit their name/email after signup
- **Customer management actions** — admin can view customers but not edit/block them yet
- **Real credentials needed for production**: MSG91, Razorpay, and a real ERPNext instance are all mocked/console-based until you provide keys — no code changes required to switch, just environment variables

## License

Private project — not licensed for external use.
