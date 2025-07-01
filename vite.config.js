import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Séparer les dépendances volumineuses
          'vendor-react': ['react', 'react-dom'],
          'vendor-motion': ['framer-motion'],
          'vendor-formspree': ['@formspree/react']
        }
      }
    },
    // Augmenter la limite d'avertissement pour les chunks
    chunkSizeWarningLimit: 1000
  }
})
