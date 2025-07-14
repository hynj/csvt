import { Hono } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'
import { CounterDurableObject } from './counter-durable-object'

type Env = {
  COUNTER_DURABLE_OBJECT: DurableObjectNamespace<CounterDurableObject>
}

const app = new Hono<{ Bindings: Env }>()

// Helper function to get or create session ID
function getOrCreateSessionId(c: any): string {
  const existingSessionId = getCookie(c, 'do_id')
  if (existingSessionId) {
    return existingSessionId
  }
  
  // Generate new session ID
  const newSessionId = crypto.randomUUID()
  setCookie(c, 'do_id', newSessionId, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    maxAge: 60 * 60 * 24 * 30 // 30 days
  })
  
  return newSessionId
}

// API routes for RPC
const api = new Hono<{ Bindings: Env }>()
  .get('/hello', (c) => {
    return c.json({
      message: 'Hello from Hono + Durable Objects!',
      timestamp: new Date().toISOString(),
    })
  })
  .post('/echo', async (c) => {
    const body = await c.req.json()
    return c.json({
      echo: body,
      timestamp: new Date().toISOString(),
    })
  })
  .get('/user/:id', (c) => {
    const id = c.req.param('id')
    return c.json({
      id,
      name: `User ${id}`,
      timestamp: new Date().toISOString(),
    })
  })
  // Durable Object counter routes
  .get('/counter', async (c) => {
    const sessionId = getOrCreateSessionId(c)
    const durableObjectId = c.env.COUNTER_DURABLE_OBJECT.idFromName(sessionId)
    const durableObjectStub = c.env.COUNTER_DURABLE_OBJECT.get(durableObjectId)
    
    const value = await durableObjectStub.getValue()
    
    return c.json({
      value,
      sessionId,
      timestamp: new Date().toISOString(),
    })
  })
  .post('/counter/increment', async (c) => {
    const sessionId = getOrCreateSessionId(c)
    const durableObjectId = c.env.COUNTER_DURABLE_OBJECT.idFromName(sessionId)
    const durableObjectStub = c.env.COUNTER_DURABLE_OBJECT.get(durableObjectId)
    
    const value = await durableObjectStub.increment()
    
    return c.json({
      value,
      sessionId,
      timestamp: new Date().toISOString(),
    })
  })
  .post('/counter/decrement', async (c) => {
    const sessionId = getOrCreateSessionId(c)
    const durableObjectId = c.env.COUNTER_DURABLE_OBJECT.idFromName(sessionId)
    const durableObjectStub = c.env.COUNTER_DURABLE_OBJECT.get(durableObjectId)
    
    const value = await durableObjectStub.decrement()
    
    return c.json({
      value,
      sessionId,
      timestamp: new Date().toISOString(),
    })
  })
  .post('/counter/reset', async (c) => {
    const sessionId = getOrCreateSessionId(c)
    const durableObjectId = c.env.COUNTER_DURABLE_OBJECT.idFromName(sessionId)
    const durableObjectStub = c.env.COUNTER_DURABLE_OBJECT.get(durableObjectId)
    
    const value = await durableObjectStub.reset()
    
    return c.json({
      value,
      sessionId,
      timestamp: new Date().toISOString(),
    })
  })

// Mount API routes under /api
app.route('/api', api)

export type AppType = typeof api
export { CounterDurableObject }

export default app
