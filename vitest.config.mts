import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    typecheck: {
      include: ['app/types/**/*.d.ts', 'test/**/*.test.ts'],
      tsconfig: './.nuxt/tsconfig.json'
    }
  }
})
