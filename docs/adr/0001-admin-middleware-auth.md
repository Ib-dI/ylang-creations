# Admin auth is checked in two independent places: middleware and withAdminAuth

`middleware.ts` gates every `/admin/:path*` page request server-side (redirecting unauthenticated users to `/sign-in` and non-admins to `/`), replacing the client-side `supabase.auth.getUser()` check that used to live in `app/admin/layout.tsx` and caused a full-screen loader flash on every admin navigation. `lib/auth/with-admin-auth.ts` still wraps every `/api/admin/*` route handler with the same check.

We deliberately did not remove `withAdminAuth` from the API routes: they're reachable independently of the page tree (direct fetch, curl, a future external consumer), so they must stay self-defending even though the middleware already covers all page navigation into `/admin`. The duplication is intentional — middleware buys UX (no auth-check flash), `withAdminAuth` buys defense-in-depth for the API surface — not an oversight to be consolidated later.
