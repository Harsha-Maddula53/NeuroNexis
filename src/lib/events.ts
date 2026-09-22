import { EventEmitter } from 'events';

// In Next.js dev mode, we need to prevent multiple instances of EventEmitter
// across hot reloads. In production, this will just be a single instance.
const globalForEvents = global as unknown as { eventBus: EventEmitter };

export const eventBus = globalForEvents.eventBus || new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalForEvents.eventBus = eventBus;
}

// Increase max listeners since many clients might connect
eventBus.setMaxListeners(1000);
