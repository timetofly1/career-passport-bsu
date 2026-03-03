
Issue diagnosis (exact issue)

1) Google SSO itself is succeeding in the backend, but the frontend session handoff/redirect is inconsistent.
- I checked auth logs: Google token exchange/login requests are returning success (200), which means the identity provider step is working.
- The failure happens after returning to your app, where session hydration + route redirect timing is not deterministic.

2) Why you see “it pops back to main page”
- Your Google sign-in currently uses `redirect_uri: window.location.origin`, which returns users to `/` (landing page), not a dedicated auth callback page.
- From there, the app depends on async auth state restoration to redirect away.
- When that restoration lags or misses timing, users remain on the landing page and appear logged out.
- When timing is favorable, it works — hence the “sometimes works, sometimes doesn’t” behavior.

3) Secondary (not root cause)
- There is a React ref warning in `Auth.tsx` (AnimatePresence/motion tree). This is noisy but not the primary cause of SSO reliability issues.

Implementation plan (for approval)

Phase 1: Stabilize OAuth return path
- Update Google sign-in redirect target in `src/pages/Auth.tsx` from origin (`/`) to a deterministic auth route (`/auth`).
- Keep users on auth flow state instead of landing page bounce.

Phase 2: Harden session initialization
- Improve `src/context/AuthContext.tsx` to make auth initialization resilient:
  - Add explicit try/catch/finally around initial session load.
  - Add a short reconciliation re-check for delayed token persistence after OAuth return.
  - Ensure loading state cannot get stuck or resolve too early.

Phase 3: Make post-OAuth routing deterministic
- In `src/pages/Auth.tsx`, add explicit post-return handling:
  - If auth session appears, redirect immediately to onboarding/dashboard as intended.
  - If not, show a clear retryable error state instead of silently leaving user on landing behavior.

Phase 4: Verify reliability on published site
- Test matrix:
  - Google SSO on published URL in fresh session/incognito
  - Repeat login/logout cycles (at least 5 consecutive attempts)
  - Existing user with onboarding complete vs incomplete
  - Cancelled Google flow recovery
- Success criteria: no random return-to-landing without authenticated redirect.

Technical change scope
- `src/pages/Auth.tsx`
- `src/context/AuthContext.tsx`
- (Optional) small route-guard polish in `src/pages/Index.tsx` if needed after testing

Expected outcome
- No more intermittent “back to main page” behavior after successful Google auth.
- Consistent, predictable redirect into the product every time.
