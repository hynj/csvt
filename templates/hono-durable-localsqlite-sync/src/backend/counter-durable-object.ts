import { DurableObject } from "cloudflare:workers"

type Env = {
  COUNTER_DURABLE_OBJECT: DurableObjectNamespace<CounterDurableObject>
}

interface WebSocketMessage {
  type: 'set' | 'delete' | 'sync' | 'sync_request' | 'sync_changes'
  key?: string
  value?: string
  timestamp: number
  sessionId: string
  since?: number // For sync_request to get changes since timestamp
}

interface StoredValue {
  value: string
  timestamp: number
  sessionId: string
}

export class CounterDurableObject extends DurableObject {
  private sql: SqlStorage

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
    this.sql = ctx.storage.sql
    
    // Initialize the database schema
    this.initializeSchema()
  }

  private initializeSchema() {
    // Create the kv table if it doesn't exist - matches client schema
    this.sql.exec(`
      CREATE TABLE IF NOT EXISTS kv (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at INTEGER NOT NULL
      )
    `)
    
    // Create index on updated_at for efficient time-based queries
    this.sql.exec(`
      CREATE INDEX IF NOT EXISTS idx_kv_updated_at ON kv(updated_at)
    `)
  }

  // Handle incoming requests and WebSocket upgrades
  async fetch(request: Request): Promise<Response> {
    if (request.headers.get("Upgrade") === "websocket") {
      return this.handleWebSocketUpgrade(request)
    }
    
    return new Response("Not found", { status: 404 })
  }

  private async handleWebSocketUpgrade(request: Request): Promise<Response> {
    const [client, server] = Object.values(new WebSocketPair())
    
    // Use hibernatable WebSocket - this allows the DO to hibernate while maintaining connections
    this.ctx.acceptWebSocket(server)
    console.log(`[DurableObject] Hibernatable WebSocket connected`)
    
    return new Response(null, { status: 101, webSocket: client })
  }

  // Hibernatable WebSocket message handler - DO wakes up automatically when messages arrive
  async webSocketMessage(ws: WebSocket, message: string | ArrayBuffer) {
    try {
      const data: WebSocketMessage = JSON.parse(message as string)
      console.log(`[DurableObject] Received WebSocket message:`, data.type, data.key)
      
      await this.handleMessage(data, ws)
    } catch (error) {
      console.error('[DurableObject] Error handling WebSocket message:', error)
      ws.send(JSON.stringify({ 
        type: 'error', 
        message: 'Invalid message format',
        timestamp: Date.now()
      }))
    }
  }

  // Hibernatable WebSocket close handler
  async webSocketClose(ws: WebSocket, code: number, reason: string, wasClean: boolean) {
    console.log(`[DurableObject] WebSocket closed: code=${code}, reason=${reason}, clean=${wasClean}`)
  }

  // Hibernatable WebSocket error handler
  async webSocketError(ws: WebSocket, error: Error) {
    console.error('[DurableObject] WebSocket error:', error)
  }

  private async handleMessage(message: WebSocketMessage, sender: WebSocket) {
    switch (message.type) {
      case 'set':
        if (message.key && message.value !== undefined) {
          await this.kvSet(message.key, message.value, message.timestamp)
          console.log(`[DurableObject] Set ${message.key}, broadcasting to others`)
          // Broadcast to all other connected WebSockets
          this.broadcast(message, sender)
        }
        break
      
      case 'delete':
        if (message.key) {
          await this.kvDelete(message.key)
          console.log(`[DurableObject] Deleted ${message.key}, broadcasting to others`)
          // Broadcast to all other connected WebSockets
          this.broadcast(message, sender)
        }
        break
      
      case 'sync':
        // Send current state to requesting client
        const allData = await this.kvGetAll()
        sender.send(JSON.stringify({
          type: 'sync_response',
          data: allData,
          timestamp: Date.now()
        }))
        console.log(`[DurableObject] Sent sync response with ${Object.keys(allData).length} keys`)
        break
        
      case 'sync_request':
        // Send only changes since the requested timestamp
        const since = message.since || 0
        const changes = await this.kvGetChangesSince(since)
        sender.send(JSON.stringify({
          type: 'sync_changes',
          changes: changes,
          timestamp: Date.now()
        }))
        console.log(`[DurableObject] Sent ${changes.length} changes since ${since}`)
        break
    }
  }

  private broadcast(message: WebSocketMessage, sender: WebSocket) {
    const messageStr = JSON.stringify(message)
    
    // Get all hibernatable WebSocket connections
    const webSockets = this.ctx.getWebSockets()
    console.log(`[DurableObject] Broadcasting to ${webSockets.length} total connections`)
    
    let broadcastCount = 0
    for (const ws of webSockets) {
      // Don't send back to sender
      if (ws !== sender) {
        try {
          ws.send(messageStr)
          broadcastCount++
        } catch (error) {
          console.error('[DurableObject] Error broadcasting to WebSocket:', error)
          // The hibernatable WebSocket system will handle cleanup of broken connections
        }
      }
    }
    
    console.log(`[DurableObject] Broadcasted to ${broadcastCount} other connections`)
  }

  // Original counter methods (preserved for backward compatibility)
  async increment(): Promise<number> {
    const currentValue = await this.ctx.storage.get<number>("counter") ?? 0
    const newValue = currentValue + 1
    await this.ctx.storage.put("counter", newValue)
    return newValue
  }

  async decrement(): Promise<number> {
    const currentValue = await this.ctx.storage.get<number>("counter") ?? 0
    const newValue = currentValue - 1
    await this.ctx.storage.put("counter", newValue)
    return newValue
  }

  async getValue(): Promise<number> {
    return await this.ctx.storage.get<number>("counter") ?? 0
  }

  async reset(): Promise<number> {
    await this.ctx.storage.put("counter", 0)
    return 0
  }

  // New generic KV methods using SQL
  async kvGet(key: string): Promise<string | null> {
    const [row] = this.sql.exec("SELECT value FROM kv WHERE key = ?", key).toArray()
    return row ? row.value as string : null
  }

  async kvSet(key: string, value: string, timestamp?: number): Promise<void> {
    const updatedAt = timestamp || Date.now()
    
    // Use INSERT OR REPLACE for upsert behavior
    this.sql.exec(
      "INSERT OR REPLACE INTO kv (key, value, updated_at) VALUES (?, ?, ?)",
      key, value, updatedAt
    )
  }

  async kvDelete(key: string): Promise<void> {
    this.sql.exec("DELETE FROM kv WHERE key = ?", key)
  }

  async kvList(): Promise<string[]> {
    const result = this.sql.exec("SELECT key FROM kv").toArray()
    return result.map(row => row.key as string)
  }

  async kvGetAll(): Promise<Record<string, string>> {
    const result = this.sql.exec("SELECT key, value FROM kv").toArray()
    const data: Record<string, string> = {}
    for (const row of result) {
      data[row.key as string] = row.value as string
    }
    return data
  }

  async kvGetChangesSince(timestamp: number): Promise<Array<{key: string, value: string, updated_at: number}>> {
    const result = this.sql.exec(
      "SELECT key, value, updated_at FROM kv WHERE updated_at > ? ORDER BY updated_at",
      timestamp
    ).toArray()
    
    return result.map(row => ({
      key: row.key as string,
      value: row.value as string,
      updated_at: row.updated_at as number
    }))
  }

  async kvClear(): Promise<void> {
    this.sql.exec("DELETE FROM kv")
  }
}