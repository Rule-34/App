import path from 'path'
import { configDefaults, defineConfig } from 'vitest/config'

const configuredMaxWorkers = Number.parseInt(process.env.VITEST_MAX_WORKERS ?? '', 10)
const maxWorkers = configuredMaxWorkers > 0 ? configuredMaxWorkers : 2

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(import.meta.dirname, './app'),
      '~~': path.resolve(import.meta.dirname, './')
    }
  },
  test: {
    maxWorkers,
    testTimeout: 60000,
    hookTimeout: 180000,
    exclude: [...configDefaults.exclude, 'API/**', 'R34-premium-ab-test/**', 'Universal-Booru-Wrapper/**'],
    typecheck: {
      // Vitest 5 treats every included file as a test suite; app types are covered by `nuxt typecheck`.
      include: ['test/**/*.test.ts'],
      tsconfig: './.nuxt/tsconfig.json'
    }
  }
})
