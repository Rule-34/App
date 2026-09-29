import { Agent, interceptors, setGlobalDispatcher } from 'undici'

const API_DNS_TTL_MS = 5 * 60 * 1000

export default defineNitroPlugin((nitroApp) => {
  const dispatcher = new Agent().compose(interceptors.dns({ maxTTL: API_DNS_TTL_MS, maxItems: 32 }))

  setGlobalDispatcher(dispatcher)

  nitroApp.hooks.hook('close', () => dispatcher.close())
})
