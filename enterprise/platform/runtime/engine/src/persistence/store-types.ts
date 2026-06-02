import type { AlertStore } from './db.js';
import type { MemoryAlertStore } from './memory-alert-store.js';

export type PersistenceStore = AlertStore | MemoryAlertStore;
