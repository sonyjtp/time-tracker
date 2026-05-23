import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: [],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.test.js',
        '**/index.js',
        'vite.config.js',
        'vitest.config.js',
      ],
      lines: 80,
      functions: 80,
      branches: 75,
      statements: 80,
    },
  },
})
