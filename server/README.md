# Ameyka Veda Ecommerce Backend

Production-focused Express/MongoDB API compatible with the current Ameyka Veda client.

## Included customer flows

- Registration, password login, secure email OTP login, forgot/reset password
- Public products, categories, combos, banners and moderated testimonials/reviews
- Saved addresses
- Guest and authenticated checkout
- Server-authoritative product price, stock, shipping, coupon and Ameyka Coin calculation
- COD and Razorpay payments
- Razorpay signature verification, webhook idempotency and payment reconciliation foundations
- Inventory reservation for pending online payments with automatic expiry and restoration
- Guest order tracking, order details and payment retry
- Cancellation requests, controlled status transitions, returns and refunds
- HTML invoice generation
- Contact/lead management and admin summary APIs
- Health/readiness endpoints, request IDs, security headers, CORS controls and shared MongoDB rate limiting

## Required deployment steps

1. Use MongoDB Atlas or another replica-set deployment. Production order operations use transactions.
2. Copy `.env.example` to `.env` and set real secrets.
3. Run `npm install`.
4. Run `npm run check`.
5. Back up the database, then run `npm run migrate` once.
6. Create/update the admin account with `npm run create-admin`.
7. Configure Razorpay webhook URL as `https://your-api-domain/api/orders/razorpay/webhook`.
8. Use a persistent volume or replace local `/uploads` storage with object storage before multi-instance deployment.
9. Put the service behind HTTPS and a reverse proxy/CDN with response compression enabled.

## Compatibility endpoints added

`/api/auth/forgot-password`, `/api/auth/reset-password`, `/api/addresses`, `/api/orders/:id`, `/api/orders/track`, `/api/orders/:id/retry-payment`, `/api/orders/:id/cancel`, `/api/orders/:id/returns`, `/api/orders/:id/invoice`, `/api/promotions/validate`, and `/api/delivery/check`.

## Important business configuration

Configure delivery fees and serviceability using `/api/delivery/admin/settings`, coupons using `/api/promotions/admin`, and Ameyka Coins using `/api/amyeka-coins/setting`.

Product GST/HSN/licence/manufacturer fields were added, but their values must be entered only from approved packaging and business records.

Product description media supports up to 8 infographic images and 2 videos per product. `MAX_UPLOAD_MB` controls the maximum size of each uploaded file; use persistent storage or object storage for production media.
