import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    sourcemap: false, // Disable source maps to hide source code in DevTools
    minify: 'terser', // Use terser for better minification
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  server: {
    host: '0.0.0.0', // Listen on all local IPs
    //port: 5050,
    allowedHosts: ['localhost', 'ticket.tutelartechlabs.com', 'tutelartechlabs.com']
  }
})
