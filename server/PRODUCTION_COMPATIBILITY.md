# legendbornnutrition Backend — Production Compatibility

This server has been refactored to match the current legendbornnutrition customer frontend API contract and to remove the launch-blocking order, payment, stock and guest-checkout flaws found in the audit.

## Frontend-compatible customer endpoints

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/request-otp`
- `POST /api/auth/login-otp`
- `GET /api/auth/profile`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Catalogue and customer content
- `GET /api/products`
- `GET /api/products/:slug`
- `GET /api/products/:slug/related`
- `POST /api/products/:slug/reviews`
- `GET /api/categories`
- `GET /api/combos`
- `GET /api/combos/:slug`
- `GET /api/banners`
- `GET /api/testimonials`
- `POST /api/contact`

### Checkout and orders
- `POST /api/orders`
- `POST /api/orders/guest`
- `POST /api/orders/razorpay/verify`
- `POST /api/orders/razorpay/webhook`
- `GET /api/orders/my-orders`
- `GET /api/orders/:id`
- `POST /api/orders/track`
- `POST /api/orders/:id/retry-payment`
- `POST /api/orders/:id/cancel`
- `POST /api/orders/:id/returns`
- `GET /api/orders/:id/invoice`

### Addresses, promotions, delivery and coins
- `GET/POST /api/addresses`
- `PUT/DELETE /api/addresses/:id`
- `PUT /api/addresses/:id/default`
- `POST /api/promotions/validate`
- `GET /api/delivery/check`
- `GET /api/amyeka-coins/setting`
- `GET /api/amyeka-coins/wallet`

## Main reliability fixes

- Server-authoritative prices, stock, shipping, coupon and coin totals
- MongoDB transactions for order reservation, stock, coupon and coin operations
- Inventory reservation before online payment and timed release for abandoned payments
- Idempotent Razorpay payment verification and webhook processing
- Automatic refund path when a captured payment arrives after reservation expiry
- Safe full-refund calculation that accounts for amounts already refunded
- Genuine guest checkout without silently creating inaccessible accounts
- Guest tracking restricted to guest orders and matched checkout contact details
- Controlled order-status transitions, COD settlement, cancellation and return handling
- Saved addresses, account recovery, coupon validation and pincode delivery APIs
- Moderated verified-purchase reviews
- Public endpoints cannot expose inactive/admin data via query parameters
- Dummy blogs and testimonials removed
- Shared MongoDB rate limiting with in-memory availability fallback
- Request IDs, CORS allowlist, security headers, health/readiness and graceful shutdown
- Safer uploads, non-executable video extensions and private invoice generation
- Migration for legacy orders, empty Razorpay index values, old OTP fields and singleton settings

## Deployment requirements

1. Use MongoDB Atlas or another replica-set MongoDB deployment. Production transactions intentionally do not fall back to unsafe non-transactional writes.
2. Back up the existing database.
3. Set the real values in `.env` from `.env.example`.
4. Run `npm install` and `npm run check`.
5. Run `npm run migrate` once before starting the upgraded API.
6. Run `npm run create-admin` with strong admin credentials.
7. Configure Razorpay's webhook URL as `/api/orders/razorpay/webhook` and use the exact webhook secret in `.env`.
8. Configure SMTP before enabling OTP and password-reset journeys.
9. Use persistent storage or object storage for catalogue media before multi-instance deployment.
10. Enter GST, HSN, manufacturer and licence values only from approved business and packaging records.

## Verification boundary

Static module checks and pure commerce-rule tests are included and pass. Live MongoDB transaction, SMTP and Razorpay tests require your real staging credentials and therefore must be run in your staging environment before accepting live payments.
