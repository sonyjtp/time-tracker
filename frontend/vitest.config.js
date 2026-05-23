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
        'src/main.jsx',
        'src/App.jsx',
        'src/pages/**',
        'src/components/**',
        'src/styles/**',
        'vite.config.js',
        'vitest.config.js',
        '**/check-coverage.js',
        '**/update-coverage.js',
      ],
      lines: 70,
      functions: 70,
      branches: 65,
      statements: 70,
    },
  },
})
