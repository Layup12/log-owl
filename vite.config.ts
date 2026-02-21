import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  base: './',
  server: {
    port: 5173
  },
  resolve: {
    alias: {
      // @contracts
      '@contracts': path.resolve(__dirname, './contracts'),
      // @main
      '@main': path.resolve(__dirname, './main'),
      '@main/app': path.resolve(__dirname, './main/app'),
      '@main/constants': path.resolve(__dirname, './main/constants'),
      '@main/db': path.resolve(__dirname, './main/db'),
      '@main/ipc': path.resolve(__dirname, './main/ipc'),
      '@main/lib': path.resolve(__dirname, './main/lib'),
      '@main/migrations': path.resolve(__dirname, './main/migrations'),
      '@main/repositories/*': path.resolve(__dirname, './main/repositories/*'),
      '@main/windowState': path.resolve(__dirname, './main/windowState'),
      // @renderer
      '@renderer': path.resolve(__dirname, './renderer'),
      '@renderer/api': path.resolve(__dirname, './renderer/api'),
      '@renderer/components': path.resolve(__dirname, './renderer/components'),
      '@renderer/context': path.resolve(__dirname, './renderer/context'),
      '@renderer/hooks': path.resolve(__dirname, './renderer/hooks'),
      '@renderer/shared/ui': path.resolve(__dirname, './renderer/shared/ui'),
      '@renderer/shared/lib': path.resolve(__dirname, './renderer/shared/lib'),
      '@renderer/shared/store': path.resolve(__dirname, './renderer/shared/store'),
      '@renderer/shared/types': path.resolve(__dirname, './renderer/shared/types')
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
})
