import { EventEmitter } from 'events';

// Singleton instance untuk menangani event di seluruh aplikasi
// Karena di VPS, proses Node.js akan tetap hidup (persistent)
declare global {
  var eventBus: EventEmitter | undefined;
}

export const eventBus = globalThis.eventBus ?? new EventEmitter();

if (process.env.NODE_ENV !== 'production') {
  globalThis.eventBus = eventBus;
}

// Daftar nama event agar konsisten
export const EVENTS = {
  NOTIFICATION_NEW: 'notification:new',
  TICKET_UPDATED: 'ticket:updated',
  COMMENT_ADDED: 'comment:added',
};
