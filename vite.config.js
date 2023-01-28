import { defineConfig } from 'vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
console.log(resolve(__dirname, './src/engine'))

export default defineConfig({
  resolve: {
    alias: {
      '@data': resolve(__dirname, './src/data'),
      '@engine': resolve(__dirname, './src/engine'),
      '@gameplay': resolve(__dirname, './src/gameplay'),
      '@assets': resolve(__dirname, './public/assets'),
    },
  },
  server: {
    host: '0.0.0.0',
  },
})
