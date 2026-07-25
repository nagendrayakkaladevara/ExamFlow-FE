import { z } from 'zod'

const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL?.trim() ?? ''

const envSchema = z.object({
  VITE_API_BASE_URL: z
    .string()
    .optional()
    .refine(
      (url) => !url || /^https?:\/\//.test(url),
      { message: 'VITE_API_BASE_URL must be a valid URL when set' },
    )
    .refine(
      (url) => {
        if (!url || !import.meta.env.PROD) {
          return true
        }
        const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?\/?$/.test(url)
        return isLocalhost || url.startsWith('https://')
      },
      { message: 'Production API base URL must use HTTPS' },
    ),
})

const parsed = envSchema.safeParse({
  VITE_API_BASE_URL: rawApiBaseUrl || undefined,
})

if (!parsed.success) {
  const message = parsed.error.issues
    .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
    .join('\n')
  throw new Error(`Invalid environment configuration:\n${message}`)
}

export const env = {
  /** When unset, API requests use the current page origin (via dev/prod proxy). */
  VITE_API_BASE_URL: parsed.data.VITE_API_BASE_URL ?? '',
}
