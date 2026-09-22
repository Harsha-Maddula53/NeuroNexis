# Project State

## Phase 0: Non-negotiable Secrets Rotation
- [x] Uninstalled unused `@google/generative-ai` dependency.
- [x] Regenerated `NEXTAUTH_SECRET` in local `.env` securely.
- [x] Re-created `.env.example` with comprehensive placeholders for Redis, Sentry, Groq, etc.
- [x] Added `pre-commit` hook via shell script to block `.env` file staging.

## Phase 1: Infrastructure
- [x] **Rate Limiting**: Replaced in-memory Map with Upstash Redis implementation using `fail-closed` logic and Sentry alerting for failures.
- [x] **Middleware**: Created `src/middleware.ts` for centralized auth gating (except public routes) and added security headers (CSP, HSTS, X-Frame-Options, etc.).
- [x] **Real-time Messaging**: Configured an SSE `ReadableStream` at `GET /api/chat/stream` backed by an in-memory `EventEmitter` (since target is a persistent Node host like Railway), replacing manual polling.
- [x] **Database Optimization**: Seeding script created at `prisma/seed.ts` (Phase 3 task started early to verify data structure), verified Prisma indexes on `Conversation`, `Message`, `AIIdentity`, and `User` align perfectly with query patterns.

## Phase 2: Trust & Safety (Priority 2)
- [x] **Schema Updates**: Added `Report`, `Block`, and `ModerationLog` models.
- [x] **Content Moderation**: Integrated Llama Guard 3. Input is checked synchronously before generation. Output is checked asynchronously post-stream to catch hallucinations.
- [x] **Enforcement**: Block list enforced on chat and AI endpoints. Retracted messages dynamically scrubbed via client polling.
- [x] **Disclosure**: Enforced strictly via UI badge and export transform; DB string kept raw.
- [x] **Admin Review UI**: Built minimal admin-gated route (`/admin/reports`) with role checks (`isAdmin: Boolean` on `User`) and basic action forms.

## Phase 3: Product Completeness & Observability
- [x] **Observability**: Configured Sentry with privacy scrubbing rules via `beforeSend` (scrubs message content, IP addresses; retains internal UUIDs for impact tracking).
- [x] **Test Coverage**: Added Playwright E2E tests for auth flows (registration, login, protected routes) and API ownership integration tests verifying unauthorized callers get 403s on AI endpoints.
- [x] **Mobile Responsiveness**: Migrated main AppShell layout to an off-canvas drawer pattern (hamburger menu) on mobile to prevent the sidebar from crushing content.
- [x] **Infrastructure**: Created a Supabase heartbeat GitHub Action workflow to keep the free tier DB active. Connection string masking and DB reachability formally verified in cloud runner (Run #14).

## Phase 4: Deployment & Production Readiness
- [x] **Deployment Pipeline**: Created `railway.toml` leveraging the `releaseCommand` hook to run `npx prisma migrate deploy` safely isolated from local builds.
- [x] **Infrastructure Topology**: Documented use of two separate Supabase free-tier projects (Staging and Production) for complete data isolation.
- [x] **Tech Debt (Rate Limiting)**: Refactored Upstash Redis rate limiter to use pure Dependency Injection. Test suites explicitly pass mock clients, removing ambient environment branching from security code.
- [x] **Pre-launch Security Pass**: Ran `npm audit fix`, resolving a critical authentication bypass in NextAuth and multiple cross-site scripting risks in Next.js. Confirmed `middleware.ts` enforces CSP, HSTS, X-Frame-Options, and other critical headers locally.

## Current Focus
Project implementation complete! Next steps rely on human action (deployment, secret rotation, testing heartbeat).

## Tech Debt & Known Gaps
- **Password reset in production requires Resend**: Local/dev verification uses Ethereal, a disposable catch-all that does **not** deliver to real user inboxes. Forgot-password will not work for real users in any deployed environment until `RESEND_API_KEY` is actually set (and `EMAIL_FROM` is a verified sender). Ethereal is only a local preview inbox; the persisted-account fix is scoped to local single-process dev testing and will not hold up under multiple workers/instances or a real deploy.

- **AI Disclosure Legal Review**: `AI_DISCLOSURE_REQUIREMENTS.md` needs formal legal review before launch.
- **Real-time Scaling**: SSE uses in-memory EventEmitter. If scaling to multiple server instances, must migrate to Redis pub/sub.
- **Model Deprecation**: Llama 3.1 8B and Llama Guard 3 8B (and Llama Guard 4 12B) were deprecated by provider (Groq), not a bug we introduced. Replaced with openai/gpt-oss-20b and openai/gpt-oss-safeguard-20b.
- **RSC Rendering Crash**: Fixed createMotionComponent server/client error by migrating a client-side Card component to standard HTML tags inside the server-rendered Admin Reports page.
- **Ubuntu 26 Runner Migration**: GitHub has flagged that the ubuntu-latest runner label migrates to Ubuntu 26 starting October 19, 2026. The Supabase heartbeat workflow (and any other future CI) should be revisited around that date to ensure nothing breaks.
