import { defineConfig, loadEnv } from 'vite'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import tmj from './plugins/rollup-plugin-tmj'
import process from 'process'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default function ({ mode }) {
  const isProd = mode === 'production'
  const env = loadEnv(mode, process.cwd(), '')

  return defineConfig({
    plugins: [tmj()],
    base: env.BASE_URL,
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
    build: {
      rollupOptions: {
        treeshake: false,
      },
    },
    esbuild: {
      drop: isProd ? ['console', 'debugger'] : [],
    },
  })
}
