import { hc } from 'hono/client'
import type { AppType } from '../../backend/index'

// Create RPC client with /api base path
export const client = hc<AppType>('/api')