import { defineConfig } from 'vitest/config'

const configuredMaxWorkers = Number.parseInt(process.env.VITEST_MAX_WORKERS ?? '', 10)
const maxWorkers = configuredMaxWorkers > 0 ? configuredMaxWorkers : 3

export default defineConfig({
  test: {
    // Nuxt browser-mode suites each spin up an app. With the expanded locale route set,
    // this machine is stable at 3 workers and starts timing out at 4.
    maxWorkers,
    typecheck: {
      include: ['app/types/**/*.d.ts', 'test/**/*.test.ts'],
      tsconfig: './.nuxt/tsconfig.json'
    }
  }
})
