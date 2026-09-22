const Sentry = require("@sentry/nextjs");
let beforeSendFn = null;

const originalInit = Sentry.init;
Sentry.init = (config) => {
    beforeSendFn = config.beforeSend;
    originalInit.call(Sentry, {
        ...config,
        dsn: "https://fake@sentry.io/123",
        // Setup a custom transport so it doesn't actually send to the network
        transport: () => ({
            send: async (event) => {
                // The event sent to the transport has ALREADY passed through beforeSend
                return { status: "success" };
            },
            flush: async () => true
        })
    });
};

require("./sentry.server.config.ts");

if (!beforeSendFn) {
    console.error("beforeSend function was not captured!");
    process.exit(1);
}

// Now we trigger a real captured exception
Sentry.withScope((scope) => {
    scope.addEventProcessor((event) => {
        // Mocking the Next.js request context that Sentry typically extracts
        event.request = {
            method: "POST",
            url: "/api/chat",
            headers: {
                "x-forwarded-for": "192.168.1.1",
                "x-real-ip": "192.168.1.1",
            },
            data: JSON.stringify({
                messages: [{ role: "user", content: "My credit card is 4111-1111-1111-1111" }],
                content: "Some other sensitive text",
                userId: "user_123"
            })
        };
        return event;
    });

    // Instead of capturing, we generate an event and manually pass it to the REAL beforeSend
    // Sentry.captureException creates the event and runs processors. But we want to see the event BEFORE it's sent.
    // To do this reliably, we can just run beforeSend on the processed event.

    const mockEvent = {
        exception: { values: [{ type: "Error", value: "Real crash" }] },
        request: {
            method: "POST",
            url: "/api/chat",
            headers: {
                "x-forwarded-for": "192.168.1.1",
                "x-real-ip": "192.168.1.1",
            },
            data: JSON.stringify({
                messages: [{ role: "user", content: "My credit card is 4111-1111-1111-1111" }],
                content: "Some other sensitive text",
                userId: "user_123" // Intentionally unredacted (internal ID only)
            })
        }
    };
    
    const scrubbedEvent = beforeSendFn(mockEvent, {});
    console.log("Scrubbed Event:");
    console.log(JSON.stringify(scrubbedEvent, null, 2));
});
