import { defineConfig } from 'vite'
import legacy from '@vitejs/plugin-legacy'

export default defineConfig({
  plugins: [
    legacy({
      targets: ["since 2017-06, safari >= 10"]
    })
  ],
  root: '.',
  server: {
    port: 1781, // Use different port to avoid conflict with webpack dev server
    cors: true,
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})
