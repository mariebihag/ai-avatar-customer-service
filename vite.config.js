import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  
  plugins: [react()],
  base: '/ai-avatar-customer-service/',
  build: {
    chunkSizeWarningLimit: 2000, // suppress warning only
  }
})