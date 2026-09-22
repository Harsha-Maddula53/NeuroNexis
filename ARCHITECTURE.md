# NeuroNexis (PersonaSphere) Architecture

## Overview
NeuroNexis is built with Next.js 15, React 18, Tailwind CSS, Prisma (PostgreSQL), and NextAuth.

## Real-Time Messaging (SSE)
The application handles real-time message delivery to the browser using Server-Sent Events (SSE). 

**Known Limitation:** 
Currently, the SSE implementation relies on an in-memory `EventEmitter` at `src/lib/events.ts`. This works perfectly for a single-instance persistent Node host (like a single Railway container). However, **it is limited to a single instance**. If you scale this service horizontally to multiple containers, messages emitted on Instance A will not reach a user's SSE connection held by Instance B.

**Path Forward for Horizontal Scaling:**
Before scaling to multiple instances, the in-memory `EventEmitter` must be replaced with a distributed pub/sub system. Since Upstash Redis is already in the stack for rate limiting, migrating to **Redis Pub/Sub** (using `ioredis` or Upstash's messaging APIs) is the recommended approach to broadcast messages across all server instances.

## Rate Limiting
Rate limiting uses Upstash Redis via `src/lib/rate-limit.ts`. It is configured to **fail-closed** for security, meaning if Redis is unavailable, requests are blocked. Connection failures log directly to Sentry as high-priority alerts.
## Deployment Topology
The application is deployed on **Railway** as a persistent Node host. 

### Environment Split (Staging vs Production)
To prevent accidental mutation of production data or schema during testing:
1. **Supabase Isolation**: We maintain two entirely separate Supabase projects (one for Staging, one for Production). They do not share databases, meaning migrations can be tested safely on Staging.
2. **Release Hook**: We leverage Railway's explicit `releaseCommand` (configured in `railway.toml`) to execute `npx prisma migrate deploy`. This guarantees migrations only execute during actual Railway deployments and never leak into local `npm run build` executions.
