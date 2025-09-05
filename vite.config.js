import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // For GitHub Pages project site: https://<user>.github.io/ehcb-app/
  // Set base to the repository name so assets resolve correctly.
  base: process.env.NODE_ENV === 'production' ? '/ehcb-app/' : '/',
  server: {
    open: true,
    host: true, // Host auf '0.0.0.0' setzen, um alle Netzwerkschnittstellen zu öffnen
    port: 5174, // Port auf 5174 für Konsistenz
    strictPort: false, // Falls 5174 besetzt ist, einen anderen Port verwenden
  },
  build: {
    outDir: 'dist',
    sourcemap: false, // Für Production
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          charts: ['chart.js', 'react-chartjs-2'],
          pdf: ['jspdf', 'html2canvas']
        }
      }
    }
  }
})
