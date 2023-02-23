import { defineConfig } from 'vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import tmj from './plugins/rollup-plugin-tmj'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [tmj()],
  base: '/dq1-game/',
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
