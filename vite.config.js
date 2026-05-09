import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],

  // M5 – Sprint 1 R-01: Vitest configuration
  test: {
    environment: 'jsdom',          // simulate browser DOM
    globals: true,                 // allow describe/it/expect without imports
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{js,jsx}'],
      exclude: ['src/tests/**', 'src/main.jsx'],
    },
  },
})