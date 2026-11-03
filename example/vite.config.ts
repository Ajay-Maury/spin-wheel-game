import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    // the demo imports the library source from the parent directory
    fs: { allow: ['..'] },
  },
})
