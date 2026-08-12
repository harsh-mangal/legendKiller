# Admin Deployment Checklist

1. Set `VITE_API_BASE_URL` to the exact backend environment, including `/api`.
2. Set `VITE_STOREFRONT_URL` to the matching customer storefront.
3. Run `npm run check` before deployment.
4. Deploy the `dist/` directory behind HTTPS with SPA fallback enabled.
5. Add `X-Robots-Tag: noindex, nofollow, noarchive` at the proxy/CDN.
6. Restrict the admin hostname with VPN, IP allowlisting or identity-aware proxy where possible.
7. Confirm backend CORS explicitly includes the admin origin.
8. Confirm `/health`, `/ready` and `/api/admin/dashboard` succeed from Operations.
9. Test product create/edit, stock update, coupon validation, order shipment, cancellation and return handling against a staging database.
10. Do not share administrator credentials or use a customer account for admin access.

## Nginx

Use `nginx.conf.example` as the starting point and replace `admin.example.com` and the document root.

## Environment safety

No API or storefront URL is silently defaulted in a production build. If either production environment variable is absent, the build fails instead of connecting to localhost or an unintended environment.
