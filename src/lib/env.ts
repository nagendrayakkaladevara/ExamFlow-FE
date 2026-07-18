import { z } from 'zod'

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .url('VITE_API_BASE_URL must be a valid URL')
    .refine(
      (url) => {
        if (import.meta.env.PROD) {
          return url.startsWith('https://')
        }
        return true
      },
      { message: 'Production API base URL must use HTTPS' },
    ),
})

const parsed = envSchema.safeParse(import.meta.env)

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  throw new Error(`Invalid environment configuration:\n${message}`)
}

export const env = parsed.data
