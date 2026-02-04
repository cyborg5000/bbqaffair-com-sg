# Review submission 401 (Supabase Edge Function)

## Summary
The review form failed with `401 Unauthorized` because the `submit-review` Edge Function required a **valid JWT** by default. We were sending either no `Authorization` header or the **anon key** as the bearer token, which is **not a JWT**, so Supabase returned `Missing authorization header` or `Invalid JWT`.

## Root Cause
- Supabase Edge Functions enforce JWT by default (`verify_jwt = true`).
- The review form was hitting a new `submit-review` function without a valid user JWT.
- Attempts to fix it used:
  - no auth header (-> `Missing authorization header`), or
  - anon key as bearer token (-> `Invalid JWT`).
- Function config was also placed in the wrong location/format initially, so JWT enforcement stayed on.

## Fix Implemented
We **rerouted review submission through the existing `create-checkout-session` function** (already public and used by checkout) and added a `action: 'submit-review'` branch on the server.
- Client now POSTs to `functions/v1/create-checkout-session` with `action: submit-review`.
- Server handles the review: sends admin email + webhook.

## How to Avoid Next Time
If you want a **new public Edge Function**, do **one** of the following:

1. **Disable JWT on the function**
   - Use one of these approaches and then redeploy:
     - Deploy with `--no-verify-jwt`, or
     - Add to `supabase/config.toml`:
       ```toml
       [functions.submit-review]
       verify_jwt = false
       ```

2. **Require a real JWT**
   - Use `supabase.functions.invoke(...)` with a real **user session** JWT.
   - An anon key is **not** a JWT and will always fail.

## Files Touched
- Client: `src/components/ReviewForm.jsx`
- Server: `supabase/functions/create-checkout-session/index.ts`

