import path from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const defaultApiBaseUrl = 'https://exam-flow-be.vercel.app'
  const apiBaseUrl = env.VITE_API_BASE_URL ?? defaultApiBaseUrl

  if (mode === 'production') {
    const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(apiBaseUrl)
    if (!isLocalhost && !apiBaseUrl.startsWith('https://')) {
      throw new Error('Production VITE_API_BASE_URL must use HTTPS.')
    }
  }

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
  }
})
