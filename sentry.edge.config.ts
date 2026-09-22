import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  tracesSampleRate: 1,
  debug: false,
  
  beforeSend(event, hint) {
    if (event.request) {
       if (event.request.headers) {
         if (event.request.headers["x-forwarded-for"]) event.request.headers["x-forwarded-for"] = "[REDACTED]";
         if (event.request.headers["x-real-ip"]) event.request.headers["x-real-ip"] = "[REDACTED]";
       }
    }
    return event;
  },
});
