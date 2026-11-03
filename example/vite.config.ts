import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const fromHere = (p: string) => fileURLToPath(new URL(p, import.meta.url))

export default defineConfig({
  plugins: [
    react(),
  ],
  resolve: {
    // The library source lives outside this folder, so make it use this app's React
    alias: {
      react: fromHere('./node_modules/react'),
      'react-dom': fromHere('./node_modules/react-dom'),
    },
  },
  server: {
    // the demo imports the library source from the parent directory
    fs: { allow: ['..'] },
  },
})
