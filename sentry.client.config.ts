import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || "",
  tracesSampleRate: 1,
  debug: false,
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  
  beforeSend(event, hint) {
    // Privacy Scrubbing: Strip all message content to preserve T&S isolation
    if (event.request && event.request.data) {
      try {
        const body = typeof event.request.data === "string" ? JSON.parse(event.request.data) : event.request.data;
        if (body.content) body.content = "[REDACTED_BY_SENTRY_CONFIG]";
        if (body.messages) body.messages = "[REDACTED_BY_SENTRY_CONFIG]";
        event.request.data = JSON.stringify(body);
      } catch (e) {
        event.request.data = "[REDACTED_BY_SENTRY_CONFIG]";
      }
    }
    return event;
  },
});
