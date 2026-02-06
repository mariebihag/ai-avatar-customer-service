import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/ai-avatar-customer-service/',  // ← Add this (your repo name)
  build: {
    chunkSizeWarningLimit: 2000
    }
  })
