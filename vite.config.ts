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
      '@': path.resolve(__dirname, './src'),
      '@api': path.resolve(__dirname, './src/api'),
      '@shared/ui': path.resolve(__dirname, './src/shared/ui'),
      '@shared/lib': path.resolve(__dirname, './src/shared/lib'),
      '@shared/store': path.resolve(__dirname, './src/shared/store'),
      '@components': path.resolve(__dirname, './src/components'),
      '@hooks': path.resolve(__dirname, './src/hooks'),
      '@context': path.resolve(__dirname, './src/context'),
    }
  },
  test: {
    globals: true,
    environment: 'node'
  }
})
