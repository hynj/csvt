import { DurableObject } from "cloudflare:workers"

type Env = {
  COUNTER_DURABLE_OBJECT: DurableObjectNamespace<CounterDurableObject>
}

export class CounterDurableObject extends DurableObject {
  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env)
  }

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
}