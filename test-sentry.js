const Sentry = require("@sentry/node");

Sentry.init({
  dsn: "https://fake@sentry.io/123",
  beforeSend(event, hint) {
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
    console.log("Captured Sentry Event Payload:");
    console.log(JSON.stringify({ request: event.request }, null, 2));
    return null;
  }
});

Sentry.withScope((scope) => {
  scope.addEventProcessor((event) => {
    event.request = {
      method: "POST",
      url: "/api/chat",
      data: JSON.stringify({
        messages: [{ role: "user", content: "My credit card is 4111-1111-1111-1111" }],
        content: "Some other sensitive text",
        userId: "user_123"
      })
    };
    return event;
  });
  Sentry.captureException(new Error("Simulated Crash during AI Response"));
});

setTimeout(() => {}, 1000);
