import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
    server: {
    proxy: {
      "/api": {
        target: "https://www.wylov.com:8080",
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
