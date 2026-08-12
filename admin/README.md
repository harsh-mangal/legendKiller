# Ameyka Veda Commerce Admin

Private React/Vite operations dashboard for the Ameyka Veda ecommerce platform. It is designed against the current customer storefront and production-compatible Express/MongoDB backend contracts.

## What it manages

- Live dashboard: paid revenue, orders, customers, low stock and new enquiries
- Products: pricing, inventory, content, images, HSN/GST, licences, warnings and SEO
- Inventory: stock, thresholds and storefront availability
- Categories and product combos
- Orders: payment state, fulfilment, tracking, cancellations, returns and invoice preview
- Customers: purchase value, carts, coin balance and account blocking
- Coupons, delivery rules, COD/online payment availability and Ameyka Coins
- Reviews, enquiries, banners, testimonials and optional articles
- API/database readiness and environment verification

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

The admin runs on `http://localhost:5174` by default.

Required environment values:

```env
VITE_API_BASE_URL=https://api.legendbornnutrition.com/api
VITE_STOREFRONT_URL=https://legendbornnutrition.com
VITE_API_TIMEOUT_MS=20000
```

`VITE_API_BASE_URL` must include `/api`. Both the API and storefront URLs are required for production builds, preventing accidental connections to localhost or an unrelated environment.

## Validation and build

```bash
npm run validate
npm test
npm run build
# or all checks together:
npm run check
```

The source validator checks relative imports, brand spelling, protected endpoint usage, route coverage and the admin/backend API contract strings.

## Administrator access

Use a backend account with `role: "ADMIN"`. The admin validates the JWT against `/api/auth/profile`; storing any random token in local storage does not grant access.

Create the first administrator from the backend project:

```bash
npm run create-admin
```

## Production deployment

Build output is generated in `dist/`. Configure SPA fallback to `index.html`. Examples are included for Netlify/static hosts (`public/_redirects`), Vercel (`vercel.json`) and Nginx (`nginx.conf.example`).

Host the admin on a separate private subdomain, enforce HTTPS, keep it out of search indexes and restrict access at the proxy/VPN layer where possible.

See `ADMIN_COMPATIBILITY.md` and `DEPLOYMENT.md` before launch.
