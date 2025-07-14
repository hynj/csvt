import { SQLocal } from 'sqlocal';
import type { StorageAdapter } from './types';

/**
 * SQLite storage adapter for persisted state
 * 
 * Uses SQLocal to store data in a local SQLite database with Origin Private File System.
 * Only enabled when a Durable Object session cookie is present, gracefully falls back
 * to no-op when running without a backend.
 */
export class SQLiteStorageAdapter implements StorageAdapter {
  private db: SQLocal | null = null;
  private dbInitialized = false;
  private durableObjectId: string | null = null;
  private readonly enabled: boolean;

  constructor(private sessionId: string) {
    // Check if we have a durable object session
    const cookies = document.cookie.split(';');
    const doCookie = cookies.find(c => c.trim().startsWith('do_id='));
    
    if (doCookie) {
      this.durableObjectId = doCookie.split('=')[1].trim();
      this.enabled = true;
    } else {
      // No session cookie - storage will be disabled
      this.enabled = false;
      console.log('[PersistedState] No session cookie found - local storage disabled');
    }
  }

  private async initializeDB(): Promise<void> {
    if (!this.enabled || this.dbInitialized) return;

    console.log('[PersistedState] Initializing SQLite database for session:', this.durableObjectId);
    
    // Use session-specific database name
    this.db = new SQLocal(`persisted-state-${this.durableObjectId}.sqlite3`);
    
    // Create table for key-value storage with optimized schema
    await this.db.sql`
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `;

    // Create index for timestamp-based queries
    await this.db.sql`
      CREATE INDEX IF NOT EXISTS idx_kv_updated_at ON kv(updated_at)
    `;

    this.dbInitialized = true;
  }

  async getItem(key: string): Promise<string | null> {
    if (!this.enabled) return null;
    if (!this.db) await this.initializeDB();
    
    try {
      const result = await this.db!.sql`
        SELECT value FROM kv WHERE key = ${key}
      `;
      return result.length > 0 ? result[0].value as string : null;
    } catch (error) {
      console.error(`[PersistedState] SQLite get error for ${key}:`, error);
      return null;
    }
  }

  async setItem(key: string, value: string, timestamp?: number): Promise<number> {
    const updatedAt = timestamp || Date.now();
    
    if (!this.enabled) {
      // Return timestamp even if not storing
      return updatedAt;
    }
    
    if (!this.db) await this.initializeDB();
    
    try {
      await this.db!.sql`
        INSERT OR REPLACE INTO kv (key, value, updated_at)
        VALUES (${key}, ${value}, ${updatedAt})
      `;
      return updatedAt;
    } catch (error) {
      console.error(`[PersistedState] SQLite set error for ${key}:`, error);
      throw error;
    }
  }

  async removeItem(key: string): Promise<void> {
    if (!this.enabled) return;
    if (!this.db) await this.initializeDB();
    
    try {
      await this.db!.sql`DELETE FROM kv WHERE key = ${key}`;
    } catch (error) {
      console.error(`[PersistedState] SQLite delete error for ${key}:`, error);
      throw error;
    }
  }

  async getWithTimestamp(key: string): Promise<{ value: string; updated_at: number } | null> {
    if (!this.enabled) return null;
    if (!this.db) await this.initializeDB();
    
    try {
      const result = await this.db!.sql`
        SELECT value, updated_at FROM kv WHERE key = ${key}
      `;
      return result.length > 0 ? {
        value: result[0].value as string,
        updated_at: result[0].updated_at as number
      } : null;
    } catch (error) {
      console.error(`[PersistedState] SQLite get error for ${key}:`, error);
      return null;
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }
}