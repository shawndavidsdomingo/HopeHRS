import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'  // add this

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),  // add this
  ],

  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/tests/setup.js',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src//*.{js,jsx}'],
      exclude: ['src/tests/', 'src/main.jsx'],
    },
  },
})