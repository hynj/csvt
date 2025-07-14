import { Hono } from 'hono'

const app = new Hono()

// API routes for RPC
const api = new Hono()
  .get('/hello', (c) => {
    return c.json({
      message: 'Hello from Hono RPC!',
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

// Mount API routes under /api
app.route('/api', api)

export type AppType = typeof api

export default app
