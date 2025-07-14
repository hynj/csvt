import { Hono } from 'hono'
import { hc } from '@hono/rpc'

const app = new Hono()

// RPC routes
const routes = app
  .get('/api/hello', (c) => {
    return c.json({
      message: 'Hello from Hono RPC!',
      timestamp: new Date().toISOString(),
    })
  })
  .post('/api/echo', async (c) => {
    const body = await c.req.json()
    return c.json({
      echo: body,
      timestamp: new Date().toISOString(),
    })
  })
  .get('/api/user/:id', (c) => {
    const id = c.req.param('id')
    return c.json({
      id,
      name: `User ${id}`,
      timestamp: new Date().toISOString(),
    })
  })

export type AppType = typeof routes

export default app
