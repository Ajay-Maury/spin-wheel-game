import { defineConfig } from 'vite'

// Plugin
import path from 'node:path'
import react from '@vitejs/plugin-react'
import dts from 'vite-plugin-dts'

import { resolve } from 'path'

export const relativeAlias: Record<string, string> = {
  Components: './src/Components',
}

export const resolveAlias = Object.entries(relativeAlias).reduce(
  (prev: Record<string, string>, [key, path]) => {
    prev[key] = resolve(import.meta.dirname, path)

    return prev
  },
  {}
)

export default defineConfig({
  plugins: [
    react(),
    dts({
      insertTypesEntry: true,
      outDir: 'dist',
      exclude: ['example'],
      entryRoot: 'src',
    }),
  ],
  resolve: {
    alias: resolveAlias,
    // the dev demo in example/ has its own node_modules; make it share this React
    dedupe: ['react', 'react-dom'],
  },
  build: {
    sourcemap: true,
    lib: {
      entry: path.resolve(import.meta.dirname, 'src/index.ts'),
      name: 'SpinWheelGame',
      formats: ['es', 'umd'],
      fileName: format => `spin-wheel-game.${format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'jsxRuntime',
        },
      },
    },
  },
})