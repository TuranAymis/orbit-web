export interface KeyValueStore {
  get<T>(key: string): Promise<T | undefined>;
  put<T>(key: string, value: T): Promise<void>;
  delete(key: string): Promise<void>;
  clear(): Promise<void>;
  keys(): Promise<string[]>;
}

export class MemoryKeyValueStore implements KeyValueStore {
  private readonly values = new Map<string, unknown>();

  async get<T>(key: string): Promise<T | undefined> {
    return this.values.get(key) as T | undefined;
  }

  async put<T>(key: string, value: T): Promise<void> {
    this.values.set(key, value);
  }

  async delete(key: string): Promise<void> {
    this.values.delete(key);
  }

  async clear(): Promise<void> {
    this.values.clear();
  }

  async keys(): Promise<string[]> {
    return [...this.values.keys()];
  }
}

const DB_NAME = "orbit-offline";
const DB_SCHEMA_VERSION = 1;
const STORE_NAME = "data";

export class IndexedDbKeyValueStore implements KeyValueStore {
  private readonly fallback = new MemoryKeyValueStore();
  private dbPromise?: Promise<IDBDatabase>;

  private open(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_SCHEMA_VERSION);
        request.onupgradeneeded = (event) => {
          const db = request.result;
          if (event.oldVersion < 1) db.createObjectStore(STORE_NAME);
          // Add future migrations with event.oldVersion guards when DB_SCHEMA_VERSION rises.
        };
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
        request.onblocked = () => reject(new Error("IndexedDB upgrade blocked"));
      });
    }
    return this.dbPromise;
  }

  private async run<T>(mode: IDBTransactionMode, action: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    const db = await this.open();
    return new Promise<T>((resolve, reject) => {
      const transaction = db.transaction(STORE_NAME, mode);
      const request = action(transaction.objectStore(STORE_NAME));
      let result: T;
      request.onsuccess = () => { result = request.result; };
      request.onerror = () => reject(request.error);
      transaction.oncomplete = () => resolve(result);
      transaction.onabort = () => reject(transaction.error);
      transaction.onerror = () => reject(transaction.error);
    });
  }

  async get<T>(key: string): Promise<T | undefined> {
    try { return await this.run<T | undefined>("readonly", (store) => store.get(key)); }
    catch { return this.fallback.get<T>(key); }
  }

  async put<T>(key: string, value: T): Promise<void> {
    try { await this.run("readwrite", (store) => store.put(value, key)); }
    catch { await this.fallback.put(key, value); }
  }

  async delete(key: string): Promise<void> {
    try { await this.run("readwrite", (store) => store.delete(key)); }
    catch { /* Private mode may refuse writes. */ }
    await this.fallback.delete(key);
  }

  async clear(): Promise<void> {
    try { await this.run("readwrite", (store) => store.clear()); }
    catch { /* Private mode may refuse writes. */ }
    await this.fallback.clear();
  }

  async keys(): Promise<string[]> {
    try { return await this.run("readonly", (store) => store.getAllKeys()).then((keys) => keys.map(String)); }
    catch { return this.fallback.keys(); }
  }
}

export const offlineStore: KeyValueStore = typeof indexedDB === "undefined"
  ? new MemoryKeyValueStore()
  : new IndexedDbKeyValueStore();
