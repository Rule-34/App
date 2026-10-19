import path from 'path'
import { configDefaults, defineConfig } from 'vitest/config'

const configuredMaxWorkers = Number.parseInt(process.env.VITEST_MAX_WORKERS ?? '', 10)
const maxWorkers = configuredMaxWorkers > 0 ? configuredMaxWorkers : 2

export default defineConfig({
  resolve: {
    alias: {
      '~': path.resolve(__dirname, './app'),
      '~~': path.resolve(__dirname, './')
    }
  },
  test: {
    maxWorkers,
    testTimeout: 60000,
    hookTimeout: 180000,
    exclude: [...configDefaults.exclude, 'API/**', 'R34-premium-ab-test/**', 'Universal-Booru-Wrapper/**'],
    typecheck: {
      include: ['app/types/**/*.d.ts', 'test/**/*.test.ts'],
      tsconfig: './.nuxt/tsconfig.json'
    }
  }
})
