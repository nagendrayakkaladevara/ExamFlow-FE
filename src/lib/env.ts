import { z } from 'zod'

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string({ error: 'VITE_API_BASE_URL is required' })
    .url('VITE_API_BASE_URL must be a valid URL')
    .refine(
      (url) => {
        if (!import.meta.env.PROD) {
          return true
        }
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(url)
        return isLocalhost || url.startsWith('https://')
      },
      { message: 'Production API base URL must use HTTPS' },
    ),
})

const parsed = envSchema.safeParse({ VITE_API_BASE_URL: apiBaseUrl })

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  throw new Error(`Invalid environment configuration:\n${message}`)
}

export const env = parsed.data
