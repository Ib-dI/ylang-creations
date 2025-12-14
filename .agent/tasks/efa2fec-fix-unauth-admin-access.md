# Task: efa2fec-Fix-Unauth-Admin-Access

## Status
Completed

## Description
Fixed an issue where unauthenticated users (or expired sessions) accessing admin pages would trigger API calls to `/api/admin/*`, resulting in `401 Unauthorized` errors spamming the logs.

## Changes
- Modified `app/admin/layout.tsx` to include a client-side authentication check using `authClient.useSession()`.
- Added a redirect to `/sign-in` if the user is not authenticated.
- This prevents the Admin Dashboard and sub-pages from rendering and fetching data if the user is not logged in.

## Verification
- Verified that `app/admin/products/page.tsx`, `app/admin/orders/page.tsx`, and `app/admin/users/page.tsx` are all children of this layout and will be protected.
- This ensures that calls to `/api/admin/products`, `/api/admin/orders`, etc. are only made by authenticated users.
